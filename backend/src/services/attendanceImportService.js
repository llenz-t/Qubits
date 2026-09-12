'use strict';

/**
 * Daily attendance Excel/CSV import pipeline.
 *
 * Deliberately split into three pure-ish stages (parse -> validate/normalize
 * -> import) so the SAME `importNormalizedRows()` call can be reused by a
 * future adapter that pulls rows from the AttendEase API instead of an
 * uploaded spreadsheet: that adapter only needs to produce the same
 * normalized row shape and call importNormalizedRows() directly, skipping
 * parseWorkbook()/validateAndNormalizeRows() entirely. This is the "seam"
 * the daily manual upload sits behind until AttendEase exposes an API.
 */

const XLSX = require('xlsx');

const REQUIRED_HEADERS = ['RollNumber', 'ModuleCode', 'SessionType', 'Date', 'Status'];
const VALID_SESSION_TYPES = new Set(['LECTURE', 'TUTORIAL', 'WORKSHOP']);
const VALID_STATUSES = new Set(['PRESENT', 'ABSENT', 'EXCUSED']);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

class AttendanceImportError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AttendanceImportError';
    this.status = 400;
  }
}

/**
 * Parses an uploaded workbook buffer into an array of raw row objects from
 * its first sheet. Throws AttendanceImportError on a corrupt/unreadable file
 * or a workbook with no sheets - both are file-upload malformations we need
 * to surface clearly rather than letting SheetJS throw an opaque error.
 */
function parseWorkbook(buffer) {
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  } catch (err) {
    throw new AttendanceImportError('Could not read the uploaded file - it may be corrupted or not a valid Excel/CSV file.');
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new AttendanceImportError('The uploaded workbook has no sheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  // raw:true + cellDates:true (set on XLSX.read above) together return native JS
  // Date objects for date-typed cells regardless of how Excel happens to display
  // them (m/d/yy, dd-mmm-yyyy, ...). Using raw:false here would instead return the
  // cell's *display* string, which depends on that per-cell format and is not
  // reliably ISO - normalizeDateCell() below is what enforces the ISO output.
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });

  if (rows.length === 0) {
    throw new AttendanceImportError(`Sheet "${sheetName}" has no data rows.`);
  }

  return { sheetName, rows };
}

/**
 * Confirms every required header is present (case/whitespace-insensitively)
 * and returns a map from canonical header -> the actual header key used in
 * the parsed rows, so lookups below tolerate minor header variations without
 * silently accepting genuinely wrong files.
 */
function resolveHeaderMap(sampleRow) {
  const actualKeys = Object.keys(sampleRow);
  const normalize = (s) => s.trim().toLowerCase();
  const map = {};
  const missing = [];

  for (const required of REQUIRED_HEADERS) {
    const match = actualKeys.find((k) => normalize(k) === normalize(required));
    if (!match) {
      missing.push(required);
    } else {
      map[required] = match;
    }
  }

  if (missing.length > 0) {
    throw new AttendanceImportError(
      `Missing required column(s): ${missing.join(', ')}. Expected headers: ${REQUIRED_HEADERS.join(', ')}.`
    );
  }

  // Section is optional: for Tutorial/Workshop rows without one, the DB
  // layer falls back to the student's own enrolled section.
  const sectionKey = actualKeys.find((k) => normalize(k) === 'section');
  if (sectionKey) map.Section = sectionKey;

  return map;
}

function normalizeDateCell(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value || '').trim();
  if (ISO_DATE_RE.test(str)) {
    // Confirm it's a real calendar date (rejects e.g. 2026-02-30).
    const parsed = new Date(`${str}T00:00:00Z`);
    const [y, m, d] = str.split('-').map(Number);
    if (
      parsed.getUTCFullYear() === y &&
      parsed.getUTCMonth() + 1 === m &&
      parsed.getUTCDate() === d
    ) {
      return str;
    }
  }
  return null;
}

/**
 * Validates and normalizes every parsed row. Returns { validRows, errors }
 * where validRows are ready to send to importNormalizedRows() and errors are
 * human-readable, 1-indexed-against-the-spreadsheet strings such as
 * `Row 14: Invalid Session Type 'Lab'`.
 */
function validateAndNormalizeRows(rows) {
  const headerMap = resolveHeaderMap(rows[0]);
  const validRows = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const excelRowNumber = idx + 2; // +1 for 0-index, +1 for the header row
    const rollNumber = String(row[headerMap.RollNumber] || '').trim().toUpperCase();
    const moduleCode = String(row[headerMap.ModuleCode] || '').trim().toUpperCase();
    const sessionTypeRaw = String(row[headerMap.SessionType] || '').trim();
    const sessionType = sessionTypeRaw.toUpperCase();
    const statusRaw = String(row[headerMap.Status] || '').trim();
    const status = statusRaw.toUpperCase();
    const section = headerMap.Section ? String(row[headerMap.Section] || '').trim() : '';
    const date = normalizeDateCell(row[headerMap.Date]);

    if (!rollNumber) {
      errors.push(`Row ${excelRowNumber}: Missing RollNumber`);
      return;
    }
    if (!moduleCode) {
      errors.push(`Row ${excelRowNumber}: Missing ModuleCode`);
      return;
    }
    if (!VALID_SESSION_TYPES.has(sessionType)) {
      errors.push(`Row ${excelRowNumber}: Invalid Session Type '${sessionTypeRaw}'`);
      return;
    }
    if (!date) {
      errors.push(`Row ${excelRowNumber}: Invalid Date '${row[headerMap.Date]}' (expected ISO format YYYY-MM-DD)`);
      return;
    }
    if (!VALID_STATUSES.has(status)) {
      errors.push(`Row ${excelRowNumber}: Invalid Status '${statusRaw}' (expected PRESENT, ABSENT or EXCUSED)`);
      return;
    }

    validRows.push({
      row: excelRowNumber,
      rollNumber,
      moduleCode,
      sessionType,
      date,
      status,
      section: section || null,
    });
  });

  return { validRows, errors };
}

/**
 * Sends the normalized rows to Postgres in one round trip via the
 * fn_import_attendance_batch RPC (see database/02_functions.sql), which does
 * the actual student/module/session resolution and UPSERT transactionally
 * per row. This is the function a future AttendEase-API adapter can call
 * directly with its own normalized rows, bypassing the spreadsheet-specific
 * stages above entirely.
 */
async function importNormalizedRows(supabaseAdmin, validRows) {
  if (validRows.length === 0) {
    return { inserted: 0, updated: 0, errors: [] };
  }

  const { data, error } = await supabaseAdmin.rpc('fn_import_attendance_batch', {
    p_rows: validRows,
  });

  if (error) {
    throw new AttendanceImportError(`Database import failed: ${error.message}`);
  }

  const dbErrors = (data.errors || []).map((e) => `Row ${e.row}: ${e.message}`);
  return { inserted: data.inserted, updated: data.updated, errors: dbErrors };
}

/**
 * Top-level orchestration used by the /api/attendance/upload route.
 * Returns the granular audit payload the directive asks for:
 *   { totalRows, inserted, updated, errors: string[] }
 */
async function processAttendanceUpload(supabaseAdmin, buffer) {
  const { rows } = parseWorkbook(buffer);
  const { validRows, errors: validationErrors } = validateAndNormalizeRows(rows);
  const dbResult = await importNormalizedRows(supabaseAdmin, validRows);

  return {
    totalRows: rows.length,
    inserted: dbResult.inserted,
    updated: dbResult.updated,
    errors: [...validationErrors, ...dbResult.errors],
  };
}

module.exports = {
  AttendanceImportError,
  parseWorkbook,
  validateAndNormalizeRows,
  importNormalizedRows,
  processAttendanceUpload,
  REQUIRED_HEADERS,
};

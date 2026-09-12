'use strict';

const multer = require('multer');

const MAX_EXCEL_UPLOAD_BYTES = Number(process.env.MAX_EXCEL_UPLOAD_BYTES) || 10 * 1024 * 1024;
const MAX_PDF_UPLOAD_BYTES = Number(process.env.MAX_PDF_UPLOAD_BYTES) || 5 * 1024 * 1024;

const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const EXCEL_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/csv',
  'application/octet-stream', // some browsers/OSes send this for .xlsx - extension check backs it up
]);

function excelFileFilter(req, file, cb) {
  const ext = (file.originalname.match(/\.[^.]+$/) || [''])[0].toLowerCase();
  const extOk = EXCEL_EXTENSIONS.includes(ext);
  const mimeOk = EXCEL_MIME_TYPES.has(file.mimetype);
  if (!extOk) {
    return cb(new Error(`Unsupported file extension "${ext}". Expected .xlsx, .xls or .csv`));
  }
  if (!mimeOk) {
    // Extension already validated; some environments report a generic mimetype for
    // spreadsheet files, so we don't hard-fail on mimetype alone.
    return cb(null, true);
  }
  return cb(null, true);
}

function pdfFileFilter(req, file, cb) {
  const ext = (file.originalname.match(/\.[^.]+$/) || [''])[0].toLowerCase();
  if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
    return cb(new Error('Only .pdf files are accepted for proof of absence'));
  }
  return cb(null, true);
}

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_EXCEL_UPLOAD_BYTES, files: 1 },
  fileFilter: excelFileFilter,
});

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_UPLOAD_BYTES, files: 1 },
  fileFilter: pdfFileFilter,
});

module.exports = { uploadExcel, uploadPdf, MAX_EXCEL_UPLOAD_BYTES, MAX_PDF_UPLOAD_BYTES };

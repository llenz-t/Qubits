'use strict';

const express = require('express');
const { supabaseAdmin } = require('../config/supabaseClient');
const { uploadExcel } = require('../middleware/upload');
const { requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');
const { processAttendanceUpload } = require('../services/attendanceImportService');

const router = express.Router();

/**
 * POST /api/attendance/upload
 * multipart/form-data, field name "file". Admin only.
 * Returns { totalRows, inserted, updated, errors: string[] }.
 */
router.post('/attendance/upload', requireAdmin, uploadExcel.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (expected multipart field "file")' });
    }
    const report = await processAttendanceUpload(supabaseAdmin, req.file.buffer);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
});

/** POST /api/sessions/:sessionId/cancel  { reason } - admin only */
router.post('/sessions/:sessionId/cancel', requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'A cancellation reason is required' });
    }
    const { data, error } = await supabaseAdmin.rpc('fn_cancel_session', {
      p_session_id: req.params.sessionId,
      p_reason: reason,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json({ session: data });
  } catch (err) {
    return next(err);
  }
});

/** POST /api/sessions/:sessionId/uncancel - admin only */
router.post('/sessions/:sessionId/uncancel', requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('fn_uncancel_session', {
      p_session_id: req.params.sessionId,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json({ session: data });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/students/:studentId/dashboard - self or admin */
router.get('/students/:studentId/dashboard', requireSelfOrAdmin('studentId'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('fn_get_student_dashboard', {
      p_student_id: req.params.studentId,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
});

/** GET /api/students/:studentId/weekly-trend?moduleId=... - self or admin */
router.get('/students/:studentId/weekly-trend', requireSelfOrAdmin('studentId'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('fn_get_weekly_trend', {
      p_student_id: req.params.studentId,
      p_module_id: req.query.moduleId || null,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json(
      data.map((r) => ({ weekStart: r.week_start, attendanceRate: Number(r.attendance_rate) || 0 }))
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

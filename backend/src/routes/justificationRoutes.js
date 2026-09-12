'use strict';

const express = require('express');
const { supabaseAdmin } = require('../config/supabaseClient');
const { uploadPdf } = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { submitJustification, listPendingJustifications } = require('../services/justificationService');

const router = express.Router();

/**
 * POST /api/justifications  multipart/form-data: sessionId, reason, proof (PDF)
 * Server-mediated alternative to the frontend's direct-to-Supabase upload.
 * The caller must be a signed-in student; the justification is always filed
 * against their own student_id (never trusts a studentId from the client).
 */
router.post('/justifications', requireAuth, uploadPdf.single('proof'), async (req, res, next) => {
  try {
    if (!req.studentId) {
      return res.status(403).json({ error: 'Only students can submit absence justifications' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'A PDF proof file is required (field "proof")' });
    }
    const { sessionId, reason } = req.body || {};
    if (!sessionId || !reason) {
      return res.status(400).json({ error: 'sessionId and reason are required' });
    }

    const row = await submitJustification(supabaseAdmin, {
      studentId: req.studentId,
      sessionId,
      reason,
      pdfBuffer: req.file.buffer,
      pdfOriginalName: req.file.originalname,
    });

    return res.status(201).json(row);
  } catch (err) {
    return next(err);
  }
});

/** GET /api/justifications/pending - admin workbench feed */
router.get('/justifications/pending', requireAdmin, async (req, res, next) => {
  try {
    const rows = await listPendingJustifications(supabaseAdmin);
    return res.status(200).json(rows);
  } catch (err) {
    return next(err);
  }
});

/** POST /api/justifications/:id/approve  { notes? } - admin only */
router.post('/justifications/:id/approve', requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('fn_approve_justification', {
      p_justification_id: req.params.id,
      p_notes: req.body?.notes || null,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
});

/** POST /api/justifications/:id/reject  { notes? } - admin only */
router.post('/justifications/:id/reject', requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('fn_reject_justification', {
      p_justification_id: req.params.id,
      p_notes: req.body?.notes || null,
    });
    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

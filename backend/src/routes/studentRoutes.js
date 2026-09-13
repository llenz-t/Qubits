/**
 * Mounted at /api/students. Covers the student portal's name-search
 * "login", dashboard fetch, justification submit/list, and message
 * read/acknowledge. Each handler is a thin pass-through to a service
 * function — all real logic lives in services/.
 */
const express = require('express');
const { findStudentsByName, buildDashboard } = require('../services/studentService');
const { uploadJustification, getStudentJustifications } = require('../services/justificationService');
const { getStudentMessages, markAsRead } = require('../services/messageService');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/search', async (request, response, next) => {
  try { response.json(await findStudentsByName(request.query.name || '')); } catch (error) { next(error); }
});

router.get('/:studentId/dashboard', async (request, response, next) => {
  try { response.json(await buildDashboard(request.params.studentId)); } catch (error) { next(error); }
});

router.post('/:studentId/justifications', upload.single('file'), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'File is required' });
    if (!request.body.reason) return response.status(400).json({ error: 'Reason is required' });
    response.status(201).json(await uploadJustification(request.params.studentId, request.file, request.body.reason, request.body.occurrenceId));
  } catch (error) { next(error); }
});

router.get('/:studentId/justifications', async (request, response, next) => {
  try { response.json(await getStudentJustifications(request.params.studentId)); } catch (error) { next(error); }
});

router.get('/:studentId/messages', async (request, response, next) => {
  try { response.json(await getStudentMessages(request.params.studentId)); } catch (error) { next(error); }
});

router.patch('/:studentId/messages/:messageId/read', async (request, response, next) => {
  try {
    await markAsRead(request.params.messageId);
    response.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
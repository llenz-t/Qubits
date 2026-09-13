/**
 * Mounted at /api/parents. Parent "login" is a phone-number lookup, not
 * a password — /lookup finds the linked student and reuses the same
 * buildDashboard used by the student portal, merging in the parent's
 * own name/relation so the frontend gets one combined payload.
 */
const express = require('express');
const { buildDashboard } = require('../services/studentService');
const { findParentByPhone } = require('../services/parentService');
const { getStudentMessages } = require('../services/messageService');

const router = express.Router();

router.get('/lookup', async (request, response, next) => {
  try {
    if (!request.query.phone) return response.status(400).json({ error: 'Phone number is required' });
    const parent = await findParentByPhone(request.query.phone);
    if (!parent) return response.status(404).json({ error: 'Parent not found' });
    // Same dashboard shape the student sees, just reached via the parent's phone instead of a studentid.
    const dashboard = await buildDashboard(parent.studentid);
    response.json({ parent: { parentname: parent.parentname, relationtostudent: parent.relationtostudent }, ...dashboard });
  } catch (error) { next(error); }
});

router.get('/:studentId/messages', async (request, response, next) => {
  try {
    response.json(await getStudentMessages(request.params.studentId));
  } catch (error) { next(error); }
});

module.exports = router;

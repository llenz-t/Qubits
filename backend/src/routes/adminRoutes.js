/**
 * Mounted at /api/admin. Backs all five admin console tabs: student
 * roster + filters, course management + bulk-deduct, justification
 * review, events, and the absence-pool queue + notify endpoint.
 */
const express = require('express');
const { getStudentsList, getCoursesList, updateCourse, bulkDeductClasses } = require('../services/adminService');
const { listAdminJustifications, reviewJustification } = require('../services/justificationService');
const { listEvents, createEvent, deleteEvent } = require('../services/eventService');
const { getAbsencePool, sendAbsenceMessage } = require('../services/messageService');

const router = express.Router();

router.get('/students', async (request, response, next) => {
  try {
    response.json(await getStudentsList(request.query));
  } catch (error) { next(error); }
});

router.get('/courses', async (request, response, next) => {
  try {
    response.json(await getCoursesList());
  } catch (error) { next(error); }
});

router.patch('/courses/:offeringId', async (request, response, next) => {
  try {
    response.json(await updateCourse(request.params.offeringId, request.body));
  } catch (error) { next(error); }
});

router.post('/courses/bulk-deduct', async (request, response, next) => {
  try {
    response.json(await bulkDeductClasses(request.body));
  } catch (error) { next(error); }
});

router.get('/justifications', async (request, response, next) => {
  try {
    response.json(await listAdminJustifications(request.query.status));
  } catch (error) { next(error); }
});

router.patch('/justifications/:justificationId', async (request, response, next) => {
  try {
    response.json(await reviewJustification(request.params.justificationId, request.body));
  } catch (error) { next(error); }
});

router.get('/events', async (request, response, next) => {
  try {
    response.json(await listEvents());
  } catch (error) { next(error); }
});

router.post('/events', async (request, response, next) => {
  try {
    response.status(201).json(await createEvent(request.body));
  } catch (error) { next(error); }
});

router.delete('/events/:eventId', async (request, response, next) => {
  try {
    await deleteEvent(request.params.eventId);
    response.status(204).send();
  } catch (error) { next(error); }
});

router.get('/absence-pool', async (request, response, next) => {
  try {
    response.json(await getAbsencePool());
  } catch (error) { next(error); }
});

router.post('/absence-pool/send', async (request, response, next) => {
  try {
    response.status(201).json(await sendAbsenceMessage(request.body));
  } catch (error) { next(error); }
});

module.exports = router;

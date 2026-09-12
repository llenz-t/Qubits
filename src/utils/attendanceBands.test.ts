import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bandFromMetrics, buildAttendanceBandAlerts, BAND_SEVERITY } from './attendanceBands';

test('bandFromMetrics maps the existing policy flags to the right band', () => {
  assert.equal(
    bandFromMetrics({ isDebarredRisk: true, isCautionaryZone: false, isAAAScholarshipContender: false }),
    'DEBARRED'
  );
  assert.equal(
    bandFromMetrics({ isDebarredRisk: false, isCautionaryZone: true, isAAAScholarshipContender: false }),
    'CAUTIONARY'
  );
  assert.equal(
    bandFromMetrics({ isDebarredRisk: false, isCautionaryZone: false, isAAAScholarshipContender: true }),
    'AAA_CONTENDER'
  );
  assert.equal(
    bandFromMetrics({ isDebarredRisk: false, isCautionaryZone: false, isAAAScholarshipContender: false }),
    'STANDARD'
  );
});

test('band severity is ordered worst to best: DEBARRED > CAUTIONARY > STANDARD > AAA_CONTENDER', () => {
  assert.ok(BAND_SEVERITY.DEBARRED > BAND_SEVERITY.CAUTIONARY);
  assert.ok(BAND_SEVERITY.CAUTIONARY > BAND_SEVERITY.STANDARD);
  assert.ok(BAND_SEVERITY.STANDARD > BAND_SEVERITY.AAA_CONTENDER);
});

test('no alert when the band stays the same', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'STANDARD',
    newBand: 'STANDARD',
    newPercentage: 88,
  });
  assert.deepEqual(alerts, []);
});

test('no alert on improvement, even jumping multiple bands', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'DEBARRED',
    newBand: 'AAA_CONTENDER',
    newPercentage: 96,
  });
  assert.deepEqual(alerts, []);
});

test('dropping out of AAA scholarship contention alone does not warn (not a danger zone)', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'AAA_CONTENDER',
    newBand: 'STANDARD',
    newPercentage: 90,
  });
  assert.deepEqual(alerts, []);
});

test('dropping into Cautionary alerts the student and parent only', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'STANDARD',
    newBand: 'CAUTIONARY',
    newPercentage: 82,
  });
  assert.equal(alerts.length, 2);
  assert.deepEqual(alerts.map((a) => a.targetRole).sort(), ['PARENT', 'STUDENT']);
  assert.match(alerts.find((a) => a.targetRole === 'STUDENT')!.body, /82\.0%/);
});

test('dropping into Debarred alerts student, parent, and admin', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'CAUTIONARY',
    newBand: 'DEBARRED',
    newPercentage: 76.8,
  });
  assert.equal(alerts.length, 3);
  assert.deepEqual(alerts.map((a) => a.targetRole).sort(), ['ADMIN', 'PARENT', 'STUDENT']);
});

test('jumping straight from AAA contender to Debarred still fires the full Debarred set', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'AAA_CONTENDER',
    newBand: 'DEBARRED',
    newPercentage: 70,
  });
  assert.equal(alerts.length, 3);
});

test('wording is supportive, never blaming or punitive', () => {
  const alerts = buildAttendanceBandAlerts({
    studentName: 'Priya Thapa',
    rollNumber: 'NP01AI4A250009',
    oldBand: 'STANDARD',
    newBand: 'DEBARRED',
    newPercentage: 76,
  });
  for (const a of alerts) {
    assert.doesNotMatch(a.body, /fail|blame|punish|expel/i);
  }
});

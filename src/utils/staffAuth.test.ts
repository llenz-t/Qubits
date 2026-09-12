import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_STAFF_ACCOUNTS,
  normalizeStaffId,
  isValidStaffId,
  findStaffAccount,
} from './staffAuth';

test('there are at least two demo staff accounts to pick from', () => {
  assert.ok(DEMO_STAFF_ACCOUNTS.length >= 2);
  for (const acc of DEMO_STAFF_ACCOUNTS) {
    assert.ok(acc.staffId.length > 0);
    assert.ok(acc.name.length > 0);
    assert.ok(acc.role.length > 0);
  }
});

test('normalizeStaffId trims whitespace and upper-cases', () => {
  assert.equal(normalizeStaffId('  ssd-admin-01  '), 'SSD-ADMIN-01');
  assert.equal(normalizeStaffId('Ssd-Staff-07'), 'SSD-STAFF-07');
});

test('isValidStaffId accepts a known demo ID regardless of case or spacing', () => {
  const knownId = DEMO_STAFF_ACCOUNTS[0].staffId;
  assert.equal(isValidStaffId(knownId), true);
  assert.equal(isValidStaffId(knownId.toLowerCase()), true);
  assert.equal(isValidStaffId(`  ${knownId}  `), true);
});

test('isValidStaffId rejects unknown or empty IDs', () => {
  assert.equal(isValidStaffId('NOT-A-REAL-ID'), false);
  assert.equal(isValidStaffId(''), false);
  assert.equal(isValidStaffId('   '), false);
});

test('findStaffAccount returns the matching account details', () => {
  const known = DEMO_STAFF_ACCOUNTS[1];
  const found = findStaffAccount(known.staffId.toLowerCase());
  assert.deepEqual(found, known);
});

test('findStaffAccount returns undefined for an unknown ID', () => {
  assert.equal(findStaffAccount('GHOST-ID-99'), undefined);
});

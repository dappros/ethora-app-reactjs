// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inactiveDays, inactivityLevel } from '../../src/lib/appInactivity.ts';

const NOW = new Date('2026-10-21T14:30:00.000Z');

test('no date or an unreadable date means no activity yet', () => {
  assert.equal(inactiveDays(null, NOW), null);
  assert.equal(inactiveDays(undefined, NOW), null);
  assert.equal(inactiveDays('', NOW), null);
  assert.equal(inactiveDays('not-a-date', NOW), null);
});

test('activity on the current day is 0, whatever the time of day', () => {
  assert.equal(inactiveDays('2026-10-21T00:00:00.000Z', NOW), 0);
  assert.equal(inactiveDays('2026-10-21T23:59:59.000Z', NOW), 0);
  assert.equal(inactiveDays('2026-10-21T00:00:00.000Z', new Date('2026-10-21T00:00:01.000Z')), 0);
  assert.equal(inactiveDays('2026-10-21T00:00:00.000Z', new Date('2026-10-21T23:59:59.000Z')), 0);
});

test('counts whole UTC calendar days, across month and year ends', () => {
  assert.equal(inactiveDays('2026-10-20T00:00:00.000Z', NOW), 1);
  assert.equal(inactiveDays('2026-09-21T00:00:00.000Z', NOW), 30);
  assert.equal(inactiveDays('2026-07-23T00:00:00.000Z', NOW), 90);
  assert.equal(inactiveDays('2025-12-31T00:00:00.000Z', new Date('2026-01-02T05:00:00.000Z')), 2);
});

test('a date in the future (clock skew) counts as today', () => {
  assert.equal(inactiveDays('2026-10-25T00:00:00.000Z', NOW), 0);
});

test('colour buckets: neutral below 30, amber 30-89, red 90 and up', () => {
  assert.equal(inactivityLevel(null), 'none');
  assert.equal(inactivityLevel(0), 'recent');
  assert.equal(inactivityLevel(29), 'recent');
  assert.equal(inactivityLevel(30), 'warn');
  assert.equal(inactivityLevel(89), 'warn');
  assert.equal(inactivityLevel(90), 'danger');
  assert.equal(inactivityLevel(400), 'danger');
});

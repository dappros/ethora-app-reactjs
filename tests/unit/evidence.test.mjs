import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_EVIDENCE_FILTERS,
  caseCounts,
  evidenceFiltersFromParams,
  evidenceFiltersToParams,
  evidenceQueryString,
  exportFilename,
  formatBytes,
  parseDays,
  purgeConfirmed,
  retentionSettingKey,
  retentionState,
  retentionText,
} from '../../src/utils/evidence.ts';
import { evidence } from '../../src/i18n/translations/evidence.ts';

const t = (key) => evidence.en[key] ?? key;
const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse('2026-11-15T12:00:00Z');
const iso = (ms) => new Date(ms).toISOString();

test('retention badge text', () => {
  const text = (c) => retentionText(retentionState(c, now), t);
  assert.equal(text({ purgedAt: iso(now - DAY), hold: true, expiresAt: iso(now + DAY) }), 'Purged');
  assert.equal(text({ hold: true, expiresAt: null }), 'On hold');
  assert.equal(text({ expiresAt: iso(now + 30 * DAY) }), 'Expires in 30 days');
  // Part of a day left rounds up: never "Expires in 0 days".
  assert.equal(text({ expiresAt: iso(now + 2 * 60 * 60 * 1000) }), 'Expires in 1 day');
  assert.equal(text({ expiresAt: iso(now + DAY + 1) }), 'Expires in 2 days');
  assert.equal(text({ expiresAt: iso(now - 1000) }), 'Expired, purge pending');
  assert.equal(text({ expiresAt: null }), 'No expiry');
  assert.equal(text({ expiresAt: 'not a date' }), 'No expiry');
});

test('retention state marks the last week as soon', () => {
  assert.deepEqual(retentionState({ expiresAt: iso(now + 7 * DAY) }, now), { kind: 'expires', days: 7, soon: true });
  assert.deepEqual(retentionState({ expiresAt: iso(now + 8 * DAY) }, now), { kind: 'expires', days: 8, soon: false });
});

test('filters to the API query string', () => {
  assert.equal(evidenceQueryString(EMPTY_EVIDENCE_FILTERS), 'limit=25&offset=0');
  const f = {
    reason: 'deleted',
    mode: 'quarantine',
    status: 'expiring',
    appId: ' 646cc8dc ',
    userId: '',
    q: '  bob@example.com ',
    offset: 50,
  };
  const qs = new URLSearchParams(evidenceQueryString(f, 10));
  assert.deepEqual(Object.fromEntries(qs), {
    reason: 'deleted',
    mode: 'quarantine',
    status: 'expiring',
    appId: '646cc8dc',
    q: 'bob@example.com',
    limit: '10',
    offset: '50',
  });
  assert.equal(qs.has('userId'), false);
});

test('filters round trip through the page URL; unknown values are dropped', () => {
  const f = { ...EMPTY_EVIDENCE_FILTERS, reason: 'suspension', status: 'held', userId: 'u1', offset: 25 };
  assert.equal(evidenceFiltersToParams(f).toString(), 'reason=suspension&status=held&userId=u1&offset=25');
  assert.deepEqual(evidenceFiltersFromParams(evidenceFiltersToParams(f)), f);
  const junk = evidenceFiltersFromParams(new URLSearchParams('reason=spam&mode=burn&status=x&offset=-5'));
  assert.deepEqual(junk, EMPTY_EVIDENCE_FILTERS);
  assert.equal(evidenceFiltersToParams(EMPTY_EVIDENCE_FILTERS).toString(), '');
});

test('days and purge confirmation', () => {
  assert.equal(parseDays('30'), 30);
  assert.equal(parseDays(' 3650 '), 3650);
  assert.equal(parseDays('3651'), null);
  assert.equal(parseDays('0'), null);
  assert.equal(parseDays('1.5'), null);
  assert.equal(parseDays('-3'), null);
  assert.equal(parseDays(''), null);
  assert.equal(purgeConfirmed('DELETE', 'deleted'), true);
  assert.equal(purgeConfirmed(' Suspension ', 'suspension'), true);
  assert.equal(purgeConfirmed('delete', 'auto'), false);
  assert.equal(purgeConfirmed('', ''), false);
  assert.equal(retentionSettingKey('deleted'), 'TS_DELETED_CONTENT_RETENTION_DAYS');
  assert.equal(retentionSettingKey('auto'), 'TS_EVIDENCE_RETENTION_DAYS');
});

test('counts, sizes and export file names', () => {
  assert.deepEqual(caseCounts({ counts: { messages: 2, media: 1 } }), { messages: 2, media: 1 });
  assert.deepEqual(caseCounts({ messages: [{}, {}, {}], media: [] }), { messages: 3, media: 0 });
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(25 * 1024 * 1024), '25 MB');
  assert.equal(formatBytes(undefined), '');
  assert.equal(exportFilename('deleted:a_b@conference.x:123'), 'evidence-deleted_a_b_conference.x_123.zip');
  assert.equal(exportFilename('c1', 'attachment; filename="case-c1.zip"'), 'case-c1.zip');
  assert.equal(exportFilename('c1', "attachment; filename*=UTF-8''case%20c1.zip"), 'case c1.zip');
});

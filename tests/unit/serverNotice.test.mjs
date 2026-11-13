import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canCancelJob,
  fill,
  formatCountdown,
  isJobActive,
  isNoticeShown,
  noticeMessage,
  noticePollDelay,
} from '../../src/utils/serverNotice.ts';

const NOW = Date.parse('2026-11-13T23:00:00Z');
const iso = (offsetMs) => new Date(NOW + offsetMs).toISOString();
const notice = (over = {}) => ({ id: 'n1', kind: 'restart', startsAt: iso(5 * 60_000), expiresAt: iso(10 * 60_000), target: null, ...over });

test('countdown is mm:ss, rounds up, never negative', () => {
  assert.equal(formatCountdown(5 * 60_000), '05:00');
  assert.equal(formatCountdown(299_001), '05:00');
  assert.equal(formatCountdown(61_000), '01:01');
  assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(-5000), '00:00');
  assert.equal(formatCountdown(3600_000), '1:00:00');
});

test('a scheduled restart counts down, then says restarting', () => {
  assert.deepEqual(noticeMessage(notice(), NOW), { key: 'server.notice.restartIn', vars: { countdown: '05:00' } });
  assert.deepEqual(noticeMessage(notice(), NOW + 5 * 60_000), { key: 'server.notice.restarting', vars: {} });
});

test('an update names its target; a rollback reads the same; no target has its own text', () => {
  assert.deepEqual(noticeMessage(notice({ kind: 'update', target: '2610.80' }), NOW), {
    key: 'server.notice.updateIn',
    vars: { countdown: '05:00', target: '2610.80' },
  });
  assert.equal(noticeMessage(notice({ kind: 'rollback', target: '2610.73' }), NOW).key, 'server.notice.updateIn');
  assert.equal(noticeMessage(notice({ kind: 'update' }), NOW).key, 'server.notice.updateInNoTarget');
  assert.equal(noticeMessage(notice({ kind: 'update', startsAt: iso(-1000) }), NOW).key, 'server.notice.updating');
});

test('a notice hides once dismissed or expired', () => {
  assert.equal(isNoticeShown(notice(), NOW), true);
  assert.equal(isNoticeShown(notice(), NOW, ['n1']), false);
  assert.equal(isNoticeShown(notice(), NOW + 10 * 60_000), false);
  assert.equal(isNoticeShown(null, NOW), false);
});

test('polls faster while a notice exists', () => {
  assert.equal(noticePollDelay(null), 60_000);
  assert.equal(noticePollDelay(notice()), 10_000);
});

test('placeholders are filled, unknown ones kept', () => {
  assert.equal(fill('to {target} in {countdown} {x}', { target: '2610.80', countdown: '01:00' }), 'to 2610.80 in 01:00 {x}');
});

test('an update job can be cancelled only before the restart step', () => {
  assert.equal(canCancelJob({ state: 'scheduled', step: 'bundle' }), true);
  assert.equal(canCancelJob({ state: 'running', step: 'pull' }), true);
  assert.equal(canCancelJob({ state: 'running', step: 'waiting' }), true);
  assert.equal(canCancelJob({ state: 'running', step: 'restart' }), false);
  assert.equal(canCancelJob({ state: 'running', step: 'check' }), false);
  assert.equal(canCancelJob({ state: 'succeeded', step: 'done' }), false);
  assert.equal(canCancelJob(null), false);
  assert.equal(isJobActive({ state: 'running' }), true);
  assert.equal(isJobActive({ state: 'failed' }), false);
});

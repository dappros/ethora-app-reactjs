// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAppStats, readAppStatDeltas } from '../../src/lib/appStats.ts';

const NOW = new Date('2026-11-02T12:00:00.000Z');

const app = (_id, stats = {}) => ({
  _id,
  stats: { totalChats: 5, recentlyChats: 2, totalTokens: 100, recentlyTokens: 10, ...stats },
});

test('a delta raises both the total and the recent figure', () => {
  const [result] = applyAppStats([app('a')], { a: { chats: 3 } }, NOW);
  assert.equal(result.stats.totalChats, 8);
  assert.equal(result.stats.recentlyChats, 5);
});

test('AI tokens land on the keys the cards read, by the real amount', () => {
  const [result] = applyAppStats([app('a')], { a: { aitokens: 340 } }, NOW);
  assert.equal(result.stats.totalTokens, 440);
  assert.equal(result.stats.recentlyTokens, 350);
});

test('activity is stamped, including from stats the cards do not show', () => {
  const [result] = applyAppStats([app('a')], { a: { messages: 2 } }, NOW);
  assert.equal(result.stats.lastActivityAt, NOW.toISOString());
  assert.equal(Object.values(result.stats).some(Number.isNaN), false);
  assert.equal('totalMessages' in result.stats, false);
});

test('a missing counter starts from zero', () => {
  const [result] = applyAppStats([app('a')], { a: { files: 1 } }, NOW);
  assert.equal(result.stats.totalFiles, 1);
});

test('apps outside the event keep their identity', () => {
  const untouched = app('b');
  const [, result] = applyAppStats([app('a'), untouched], { a: { chats: 1 } }, NOW);
  assert.equal(result, untouched);
});

test('a non-numeric delta is ignored', () => {
  const [result] = applyAppStats([app('a')], { a: { chats: 'many' } }, NOW);
  assert.equal(result.stats.totalChats, 5);
});

test('only a payload carrying apps is accepted', () => {
  assert.deepEqual(readAppStatDeltas({ apps: { a: { chats: 1 } } }), { a: { chats: 1 } });
  assert.equal(readAppStatDeltas(null), null);
  assert.equal(readAppStatDeltas({}), null);
});

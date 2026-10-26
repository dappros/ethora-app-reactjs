// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collapseDiff, diffLines, diffStats } from '../../src/lib/flows/flowDiff.ts';

const types = (lines) => lines.map((l) => (l.type === 'same' ? ' ' : l.type === 'add' ? '+' : '-') + l.text);

test('identical text has no changes', () => {
  const d = diffLines('a\nb\n', 'a\nb\n');
  assert.deepEqual(types(d), [' a', ' b']);
  assert.deepEqual(diffStats(d), { added: 0, removed: 0 });
});

test('additions, removals and replacements land in the right place', () => {
  assert.deepEqual(types(diffLines('a\nc', 'a\nb\nc')), [' a', '+b', ' c']);
  assert.deepEqual(types(diffLines('a\nb\nc', 'a\nc')), [' a', '-b', ' c']);
  assert.deepEqual(types(diffLines('a\nb\nc', 'a\nX\nc')), [' a', '-b', '+X', ' c']);
});

test('an empty editor against a new script is all additions; the reverse is all removals', () => {
  const d = diffLines('', 'one\ntwo\n');
  assert.deepEqual(types(d), ['+one', '+two']);
  assert.deepEqual(diffStats(d), { added: 2, removed: 0 });
  assert.deepEqual(diffStats(diffLines('one\ntwo', '')), { added: 0, removed: 2 });
});

test('CRLF and a trailing newline do not show as changes', () => {
  assert.deepEqual(diffStats(diffLines('a\r\nb\r\n', 'a\nb')), { added: 0, removed: 0 });
});

test('moved blocks are reported as a removal plus an addition, not lost', () => {
  const d = diffLines('a\nb\nc\nd', 'c\nd\na\nb');
  const { added, removed } = diffStats(d);
  assert.equal(added, removed);
  assert.ok(added >= 2);
});

test('long unchanged stretches fold, keeping context around changes', () => {
  const before = Array.from({ length: 30 }, (_, i) => `l${i}`).join('\n');
  const after = before.replace('l15', 'CHANGED');
  const rows = collapseDiff(diffLines(before, after), 2);
  assert.deepEqual(rows[0], { type: 'skip', count: 13 });
  assert.deepEqual(rows.slice(1, 6).map((r) => r.type), ['same', 'same', 'del', 'add', 'same']);
  assert.deepEqual(rows[rows.length - 1], { type: 'skip', count: 12 });
});

test('a large unrelated pair degrades instead of hanging', () => {
  const a = Array.from({ length: 3000 }, (_, i) => `a${i}`).join('\n');
  const b = Array.from({ length: 3000 }, (_, i) => `b${i}`).join('\n');
  const t0 = Date.now();
  const d = diffLines(a, b);
  assert.deepEqual(diffStats(d), { added: 3000, removed: 3000 });
  assert.ok(Date.now() - t0 < 5000);
});

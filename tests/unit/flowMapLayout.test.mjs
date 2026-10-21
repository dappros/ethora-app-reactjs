// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARD_W, assignColumns, layoutFlowMap } from '../../src/lib/flows/flowMapLayout.ts';

const flow = (key, reach, steps = [], phrases = []) => ({ key, description: '', isStart: key === 'start', phrases, reach, steps });
const say = (index, buttons) => ({ index, kind: 'say', text: 'Hello', buttons });
const goto = (index, target, missing) => ({ index, kind: 'goto', goto: target, ...(missing ? { missing: true } : {}) });

const MAP = {
  partial: false,
  entry: 'start',
  flows: [
    flow('start', 'entry', [say(0, [{ label: 'Book', goto: 'booking' }, { label: 'Chat', end: true }])]),
    flow('booking', 'trigger', [{ index: 0, kind: 'ask', text: 'When?', id: 'when', type: 'date', required: true }, goto(1, 'thanks')], ['book']),
    flow('thanks', 'linked', [say(0), { index: 1, kind: 'end' }]),
    flow('orphan', 'intent', [say(0)]),
  ],
  edges: [
    { from: { flow: 'start', step: 0, button: 0 }, to: 'booking', via: 'button', label: 'Book' },
    { from: { flow: 'booking', step: 1 }, to: 'thanks', via: 'goto' },
  ],
  warnings: [],
};

test('columns follow hops from the opening menu; flows it does not lead to start in the first column', () => {
  const cols = assignColumns(MAP);
  assert.deepEqual([...cols.entries()], [['start', 0], ['booking', 1], ['thanks', 2], ['orphan', 0]]);
});

test('cards do not overlap in a column and edges leave the right row', () => {
  const l = layoutFlowMap(MAP);
  const byKey = Object.fromEntries(l.cards.map((c) => [c.key, c]));
  const col0 = l.cards.filter((c) => c.col === 0).sort((a, b) => a.y - b.y);
  assert.deepEqual(col0.map((c) => c.key), ['start', 'orphan']);
  for (let i = 1; i < col0.length; i++) assert.ok(col0[i].y >= col0[i - 1].y + col0[i - 1].h, 'stacked without overlap');
  assert.equal(byKey.booking.x, byKey.start.x + CARD_W + 96);
  assert.equal(byKey.thanks.x, byKey.booking.x + CARD_W + 96);

  const start = byKey.start;
  const buttonRow = start.rows.find((r) => r.button === 0);
  assert.equal(buttonRow.kind, 'button');
  const e0 = l.edges[0];
  assert.match(e0.path, new RegExp(`^M ${start.x + start.w} ${start.y + buttonRow.y + buttonRow.h / 2} `));
  assert.deepEqual(e0.end, { x: byKey.booking.x, y: byKey.booking.y + 15 });
  assert.equal(e0.back, false);
  assert.ok(l.width >= byKey.thanks.x + CARD_W);
  assert.ok(l.height >= Math.max(...l.cards.map((c) => c.y + c.h)));
});

test('a missing target is a short red stub, a loop back is marked back', () => {
  const map = {
    ...MAP,
    flows: [flow('start', 'entry', [say(0, [{ label: 'Go', goto: 'nowhere', missing: true }]), goto(1, 'start')])],
    edges: [
      { from: { flow: 'start', step: 0, button: 0 }, to: 'nowhere', via: 'button', label: 'Go', missing: true },
      { from: { flow: 'start', step: 1 }, to: 'start', via: 'goto' },
    ],
  };
  const l = layoutFlowMap(map);
  assert.equal(l.edges[0].missing, true);
  assert.match(l.edges[0].path, /^M [\d.]+ [\d.]+ L /);
  assert.equal(l.edges[1].back, true);
  const card = l.cards[0];
  assert.ok(l.width >= card.x + card.w + 56 + 100, 'room for the stub and the missing flow name');
});

test('an empty map lays out to nothing', () => {
  const l = layoutFlowMap({ partial: false, entry: null, flows: [], edges: [], warnings: [] });
  assert.deepEqual(l.cards, []);
  assert.equal(l.width, 0);
});

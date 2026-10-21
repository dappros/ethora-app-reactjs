// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Layout for the Flows tab's Map: pure geometry, no React, so it can be unit
// tested (tests/unit/flowMapLayout.test.mjs). FlowMapView.tsx renders what this
// returns: one card per flow (header + one row per step, buttons as rows of
// their own), columns by distance from the entry points, and a bezier path per
// button / goto edge from the row it leaves to the header of the flow it enters.

import type { FlowMapData, FlowMapFlow, FlowMapStep } from '../../http';

export const CARD_W = 264;
export const COL_GAP = 96;
export const ROW_GAP = 28;
export const PAD = 20;
export const HEADER_H = 30;
export const PHRASES_H = 18;
export const ROW_H = 24;
export const BUTTON_ROW_H = 22;

export type RowLayout = {
  // Index of the step this row belongs to; button rows repeat their step's index.
  step: number;
  // Set on the row of one button.
  button?: number;
  kind: 'say' | 'ask' | 'goto' | 'end' | 'button';
  y: number; // relative to the card top
  h: number;
  text: string;
  tag?: string; // small suffix: the `when` condition, the ask type...
  line?: number;
  end?: boolean; // a button that leaves the script
  missing?: boolean;
};

export type CardLayout = {
  key: string;
  flow: FlowMapFlow;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  headerH: number;
  rows: RowLayout[];
};

export type EdgeLayout = {
  id: string;
  from: string;
  to: string;
  via: 'button' | 'goto';
  label?: string;
  missing: boolean;
  // Cubic bezier path in map coordinates.
  path: string;
  // Where the arrow ends (for a missing target: where the red stub ends).
  end: { x: number; y: number };
  // The edge goes back to the same or an earlier column.
  back: boolean;
};

export type MapLayout = { width: number; height: number; cards: CardLayout[]; edges: EdgeLayout[] };

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function rowsOf(flow: FlowMapFlow, top: number): { rows: RowLayout[]; bottom: number } {
  const rows: RowLayout[] = [];
  let y = top;
  const push = (r: Omit<RowLayout, 'y'>) => {
    rows.push({ ...r, y });
    y += r.h;
  };
  for (const s of flow.steps as FlowMapStep[]) {
    const base = { step: s.index, line: s.line, tag: s.when ? `if ${s.when}` : undefined };
    if (s.kind === 'say') {
      push({ ...base, kind: 'say', h: ROW_H, text: clip(s.text || '', 46) });
      (s.buttons || []).forEach((b, bi) => {
        push({ step: s.index, line: s.line, button: bi, kind: 'button', h: BUTTON_ROW_H, text: clip(b.label, 34), end: b.end, missing: b.missing });
      });
    } else if (s.kind === 'ask') {
      push({ ...base, kind: 'ask', h: ROW_H, text: clip(s.text || '', 40), tag: s.when ? `if ${s.when}` : s.type });
    } else if (s.kind === 'goto') {
      push({ ...base, kind: 'goto', h: ROW_H, text: s.goto || '', missing: s.missing });
    } else {
      push({ ...base, kind: 'end', h: ROW_H, text: 'end' });
    }
  }
  return { rows, bottom: y };
}

// Column of each flow: how many hops from the opening menu. Flows the menu does
// not lead to start their own chain in the first column: first those with
// trigger phrases, then those only the agent can start.
export function assignColumns(map: FlowMapData): Map<string, number> {
  const col = new Map<string, number>();
  const out = new Map<string, string[]>();
  for (const e of map.edges) {
    if (e.missing) continue;
    out.set(e.from.flow, [...(out.get(e.from.flow) || []), e.to]);
  }
  const bfs = (sources: string[]) => {
    const queue: string[] = [];
    for (const s of sources) {
      if (!col.has(s)) {
        col.set(s, 0);
        queue.push(s);
      }
    }
    while (queue.length) {
      const cur = queue.shift() as string;
      for (const next of out.get(cur) || []) {
        if (!col.has(next)) {
          col.set(next, (col.get(cur) as number) + 1);
          queue.push(next);
        }
      }
    }
  };
  bfs(map.flows.filter((f) => f.reach === 'entry').map((f) => f.key));
  bfs(map.flows.filter((f) => f.reach === 'trigger').map((f) => f.key));
  bfs(map.flows.filter((f) => !col.has(f.key)).map((f) => f.key));
  return col;
}

export function layoutFlowMap(map: FlowMapData): MapLayout {
  const cols = assignColumns(map);
  const byCol = new Map<number, FlowMapFlow[]>();
  for (const f of map.flows) {
    const c = cols.get(f.key) ?? 0;
    byCol.set(c, [...(byCol.get(c) || []), f]);
  }
  const cards = new Map<string, CardLayout>();
  let height = 0;
  const colCount = byCol.size ? Math.max(...byCol.keys()) + 1 : 0;
  for (let c = 0; c < colCount; c++) {
    let y = PAD;
    for (const flow of byCol.get(c) || []) {
      const headerH = HEADER_H + (flow.phrases.length ? PHRASES_H : 0);
      const { rows, bottom } = rowsOf(flow, headerH + 4);
      const h = bottom + 8;
      cards.set(flow.key, { key: flow.key, flow, col: c, x: PAD + c * (CARD_W + COL_GAP), y, w: CARD_W, h, headerH, rows });
      y += h + ROW_GAP;
    }
    height = Math.max(height, y);
  }

  const edges: EdgeLayout[] = [];
  map.edges.forEach((e, i) => {
    const from = cards.get(e.from.flow);
    if (!from) return;
    const row = from.rows.find((r) => r.step === e.from.step && (e.from.button === undefined ? r.kind === 'goto' : r.button === e.from.button));
    const sx = from.x + from.w;
    const sy = from.y + (row ? row.y + row.h / 2 : from.headerH / 2);
    const id = `e${i}`;
    if (e.missing) {
      const ex = sx + 56;
      edges.push({ id, from: e.from.flow, to: e.to, via: e.via, label: e.label, missing: true, path: `M ${sx} ${sy} L ${ex} ${sy}`, end: { x: ex, y: sy }, back: false });
      return;
    }
    const to = cards.get(e.to);
    if (!to) return;
    const ex = to.x;
    const ey = to.y + HEADER_H / 2;
    const back = to.col <= from.col;
    let path: string;
    if (back) {
      // Loop out to the right, down or up past the cards, and back in from the left.
      const out = sx + 44;
      const into = ex - 44;
      path = `M ${sx} ${sy} C ${out} ${sy}, ${out} ${(sy + ey) / 2}, ${(out + into) / 2} ${(sy + ey) / 2} S ${into} ${ey}, ${ex} ${ey}`;
    } else {
      const dx = Math.max(40, (ex - sx) / 2);
      path = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
    }
    edges.push({ id, from: e.from.flow, to: e.to, via: e.via, label: e.label, missing: false, path, end: { x: ex, y: ey }, back });
  });

  // Room on the right for loops back and for the stub + name of a missing target.
  const room = edges.some((e) => e.missing) ? 230 : 70;
  const width = colCount ? PAD * 2 + colCount * CARD_W + (colCount - 1) * COL_GAP + room : 0;
  return { width, height: height + PAD, cards: [...cards.values()], edges };
}

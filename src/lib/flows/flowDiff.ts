// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Line diff for the Generate dialog: shows what applying a generated script
// would change in the editor. Pure (tests/unit/flowDiff.test.mjs).

export type DiffLine = { type: 'same' | 'add' | 'del'; text: string };
export type DiffRow = DiffLine | { type: 'skip'; count: number };

// Longest-common-subsequence diff by lines. Inputs are flows scripts (64 KB
// at most, a couple of thousand lines); beyond the cell budget it degrades to
// "everything replaced" rather than freezing the tab.
const MAX_CELLS = 6_000_000;

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before === '' ? [] : before.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const b = after === '' ? [] : after.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  // Trim the common head and tail first: scripts usually differ in the middle.
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
  const am = a.slice(head, a.length - tail);
  const bm = b.slice(head, b.length - tail);
  const out: DiffLine[] = a.slice(0, head).map((text) => ({ type: 'same' as const, text }));

  if (am.length * bm.length > MAX_CELLS) {
    out.push(...am.map((text) => ({ type: 'del' as const, text })), ...bm.map((text) => ({ type: 'add' as const, text })));
  } else {
    const n = am.length;
    const m = bm.length;
    const w = m + 1;
    const t = new Uint16Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        t[i * w + j] = am[i] === bm[j] ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (am[i] === bm[j]) {
        out.push({ type: 'same', text: am[i] });
        i++;
        j++;
      } else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) {
        out.push({ type: 'del', text: am[i++] });
      } else {
        out.push({ type: 'add', text: bm[j++] });
      }
    }
    while (i < n) out.push({ type: 'del', text: am[i++] });
    while (j < m) out.push({ type: 'add', text: bm[j++] });
  }
  out.push(...a.slice(a.length - tail).map((text) => ({ type: 'same' as const, text })));
  return out;
}

export function diffStats(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const l of lines) {
    if (l.type === 'add') added++;
    else if (l.type === 'del') removed++;
  }
  return { added, removed };
}

// Long unchanged stretches fold to "N unchanged lines", keeping `context`
// lines around every change.
export function collapseDiff(lines: DiffLine[], context = 2): DiffRow[] {
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((l, i) => {
    if (l.type === 'same') return;
    for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) keep[k] = true;
  });
  const rows: DiffRow[] = [];
  let skipped = 0;
  lines.forEach((l, i) => {
    if (keep[i]) {
      if (skipped) rows.push({ type: 'skip', count: skipped });
      skipped = 0;
      rows.push(l);
    } else {
      skipped++;
    }
  });
  if (skipped) rows.push({ type: 'skip', count: skipped });
  return rows;
}

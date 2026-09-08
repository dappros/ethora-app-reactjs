// Shared CSV emit + download helpers. Kept in one place so every export in
// the admin UI escapes and encodes identically.

// Escape with the standard double-double-quote rule: anything that contains
// a comma, quote, or newline gets wrapped in quotes with internal quotes
// doubled. Any spreadsheet that opens CSV will read it back correctly.
function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (s === '') return '';
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function downloadCsv(filename: string, rowsCsv: string[][]) {
  // BOM so Excel opens UTF-8 with the right encoding.
  const csv = '﻿' + rowsCsv.map((r) => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

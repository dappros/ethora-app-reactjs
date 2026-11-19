// The /try/ demo page's entry document may frame any https site; the rest of
// the admin panel keeps its frame-src list (vite-plugin-csp.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCspPolicy, tryPageHtml } from '../../vite-plugin-csp.ts';

const html = (policy) => `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"></head></html>`;
const frameSrc = (doc) => doc.match(/frame-src([^;"]*)/)[1].trim().split(/\s+/);

test('try.html adds https: to frame-src only', () => {
  const policy = buildCspPolicy({ VITE_API: 'https://api.example.com/v1' });
  const index = html(policy);
  const tryDoc = tryPageHtml(index);
  assert.ok(!frameSrc(index).includes('https:'));
  assert.ok(frameSrc(tryDoc).includes('https:'));
  assert.ok(frameSrc(tryDoc).includes("'self'"));
  // Nothing else changes.
  assert.equal(tryDoc.replace(' https:"', '"').replace(/(frame-src[^;"]*) https:/, '$1'), index);
  assert.ok(!frameSrc(tryDoc).includes('http:'));
});

test('try.html keeps the runtime-config placeholder for the image entrypoint', () => {
  const tryDoc = tryPageHtml(html(buildCspPolicy({ VITE_RUNTIME_CONFIG: 'true' })));
  assert.ok(tryDoc.includes('__ETHORA_CSP_ENV_ORIGINS__'));
});

test('tryPageHtml is idempotent and refuses a document without frame-src', () => {
  const once = tryPageHtml(html("default-src 'self'; frame-src 'self'"));
  assert.equal(tryPageHtml(once), once);
  assert.throws(() => tryPageHtml('<html></html>'));
});

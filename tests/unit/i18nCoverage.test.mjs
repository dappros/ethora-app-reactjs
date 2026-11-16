import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Every UI string in English must exist in every shipped language, with the
// same placeholders, and must not be left as the English text. All
// dictionaries were complete in fr and es on 16 Nov 2026; keep them so.

const LANGS = ['fr', 'es'];
const dir = new URL('../../src/i18n/translations/', import.meta.url);
const files = readdirSync(fileURLToPath(dir)).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
const dicts = Object.fromEntries(
  await Promise.all(files.map(async (f) => [f.replace(/\.ts$/, ''), Object.values(await import(new URL(f, dir)))[0]]))
);

// Values that are the same in English on purpose: the heartbeat schedule
// example (the ai-service parser reads English keywords) and words spelled
// the same in French.
const SAME_AS_ENGLISH_OK = new Set([
  'agentPanels.heartbeatSchedulePlaceholder',
  'evidence.counts.messages',
  'userSettingsAi.statusVia',
]);

const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(' ');
// An English sentence: two or more lowercase words of three letters or more,
// not a URL or a file path.
const looksLikeEnglishText = (s) => !/[/\\]/.test(s) && (String(s).match(/\b[a-z]{3,}\b/g) || []).length >= 2;

test('every dictionary has every English key in every language, placeholders intact', () => {
  for (const [name, d] of Object.entries(dicts)) {
    for (const lang of LANGS) {
      const missing = Object.keys(d.en).filter((k) => !(k in (d[lang] || {})));
      assert.deepEqual(missing, [], `${name}.ts: English keys missing in ${lang}`);
      for (const [k, v] of Object.entries(d[lang])) {
        assert.ok(k in d.en, `${name}.ts: ${lang} has ${k}, which English does not`);
        assert.equal(placeholders(v), placeholders(d.en[k]), `${name}.ts ${lang} ${k}: placeholders differ from English`);
      }
    }
  }
});

test('no translation is left as the English sentence', () => {
  const left = [];
  for (const [name, d] of Object.entries(dicts)) {
    for (const lang of LANGS) {
      for (const [k, v] of Object.entries(d[lang])) {
        if (v === d.en[k] && looksLikeEnglishText(v) && !SAME_AS_ENGLISH_OK.has(k)) left.push(`${name}.ts ${lang} ${k}: ${v}`);
      }
    }
  }
  assert.deepEqual(left, []);
});

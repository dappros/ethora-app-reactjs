import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Every UI string in English must exist in every shipped language. The
// onboarding screens (start screen, App Home, AI assistant tab,
// Conversations and Requests, Test Chats, welcome screen editor) are complete
// and must stay complete. Older areas still have untranslated keys: their
// counts below are ceilings that may only go down.

const LANGS = ['fr', 'es'];
const dir = new URL('../../src/i18n/translations/', import.meta.url);
const files = readdirSync(fileURLToPath(dir)).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
const dicts = Object.fromEntries(
  await Promise.all(files.map(async (f) => [f.replace(/\.ts$/, ''), Object.values(await import(new URL(f, dir)))[0]]))
);

// Files that must have every English key in every language.
const COMPLETE = ['onboarding', 'welcomeScreen', 'startProject'];
// Keys of the onboarding work that live in older files.
const ROUND_KEYS_ELSEWHERE = [
  'agentSettings.websiteWidgetOpen',
  'appSettings.infoAriaLabel',
  'appSettingsMobileApp.aiWidgetLinkText',
  'appSettingsWebApp.aiWidgetLinkText',
];
// Untranslated keys per older file and language (16 Nov 2026). Lower these
// when you translate; never raise them.
const KNOWN_GAPS = {
  adminCore: 72,
  aiWidget: 31,
  authFlows: 10,
  evidence: 164,
  serverSettings: 101,
  trustSafety: 311,
  tsHub: 211,
  userSettings: 6,
  userSuspension: 53,
};

const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(' ');
const missingIn = (d, lang) => Object.keys(d.en).filter((k) => !(k in (d[lang] || {})));

test('the onboarding dictionaries are complete in every language, placeholders intact', () => {
  for (const name of COMPLETE) {
    const d = dicts[name];
    assert.ok(d, `${name}.ts not found`);
    for (const lang of LANGS) {
      assert.deepEqual(missingIn(d, lang), [], `${name}.ts: English keys missing in ${lang}`);
      for (const [k, v] of Object.entries(d[lang])) {
        assert.ok(k in d.en, `${name}.ts: ${lang} has ${k}, which English does not`);
        assert.equal(placeholders(v), placeholders(d.en[k]), `${name}.ts ${lang} ${k}: placeholders differ from English`);
      }
    }
  }
});

test('onboarding keys in older files are translated, placeholders intact', () => {
  const merged = Object.fromEntries(['en', ...LANGS].map((l) => [l, Object.assign({}, ...Object.values(dicts).map((d) => d[l] || {}))]));
  for (const k of ROUND_KEYS_ELSEWHERE) {
    assert.ok(k in merged.en, `${k} is not in English`);
    for (const lang of LANGS) {
      assert.ok(k in merged[lang], `${k} missing in ${lang}`);
      assert.equal(placeholders(merged[lang][k]), placeholders(merged.en[k]), `${lang} ${k}: placeholders differ`);
    }
  }
});

test('no area gains untranslated keys', () => {
  for (const [name, d] of Object.entries(dicts)) {
    for (const lang of LANGS) {
      const n = missingIn(d, lang).length;
      const allowed = KNOWN_GAPS[name] ?? 0;
      assert.ok(n <= allowed, `${name}.ts: ${n} English keys missing in ${lang} (allowed ${allowed}). Translate the new keys in ${lang}.`);
    }
  }
});

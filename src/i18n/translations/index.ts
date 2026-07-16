import type { UiLanguageCode } from '../../constants/languageOptionsConstants';
import { adminCore } from './adminCore';
import { aiWidget } from './aiWidget';
import { appSettings1 } from './appSettings1';
import { appSettings2 } from './appSettings2';
import { authFlows } from './authFlows';
import { authShared } from './authShared';
import { common } from './common';
import { miscComponents } from './miscComponents';
import { miscPages } from './miscPages';
import { modalsA } from './modalsA';
import { modalsB } from './modalsB';
import { modalsC } from './modalsC';
import { settingsTutorial } from './settingsTutorial';
import { sharedComponents } from './sharedComponents';
import { userSettings } from './userSettings';

// Merges every per-area dictionary into one flat lookup table keyed by
// locale. Keys are globally unique and namespaced by component/page (e.g.
// 'newAppModal.title'), NOT by the file they live in - the split into files
// is purely so different areas of the app can be worked on independently.
//
// To add an area: create a sibling file with the same shape as common.ts
// (`{ en: {...}, fr: {...}, es: {...} } satisfies Record<UiLanguageCode,
// Record<string, string>>`), import it, and add it to `dictionaries` below.
//
// NOTE: a later dictionary silently overwrites an earlier one on key
// collision. Keep keys namespaced per component to avoid that; the i18n
// verification script checks for cross-file duplicates.
const dictionaries = [
  common,
  adminCore,
  aiWidget,
  appSettings1,
  appSettings2,
  authFlows,
  authShared,
  miscComponents,
  miscPages,
  modalsA,
  modalsB,
  modalsC,
  settingsTutorial,
  sharedComponents,
  userSettings,
] as const;

function mergeLocale(locale: UiLanguageCode): Record<string, string> {
  return Object.assign({}, ...dictionaries.map((d) => d[locale]));
}

export const translations: Record<UiLanguageCode, Record<string, string>> = {
  en: mergeLocale('en'),
  fr: mergeLocale('fr'),
  es: mergeLocale('es'),
};

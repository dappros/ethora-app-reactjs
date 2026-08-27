// The full catalogue of locales this bundle can actually render — every entry
// here has a dictionary in i18n/translations/. It is NOT the list a given
// install offers: that is an install-time decision (deploy.yml
// `chat.translates` -> AVAILABLE_LANGUAGES), delivered to the client in the
// `languages` block of every login / me response and applied by
// resolveAvailableLanguages() below.
//
// Adding a locale here without adding its dictionary makes the picker offer a
// language that renders in English — add both, or neither.
export const UI_LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en-CA' },
  { name: 'Français', id: 'fr-CA' },
  { name: 'Español', id: 'es-US' },
] as const;

export type UiLanguageOption = (typeof UI_LANGUAGE_OPTIONS)[number];
export type UiLocale = UiLanguageOption['id'];

export type UiLanguageCode = 'en' | 'fr' | 'es';

export function toBaseLanguage(locale: string | null | undefined): UiLanguageCode {
  const base = String(locale || '').split('-')[0].trim().toLowerCase();
  return base === 'fr' || base === 'es' ? base : 'en';
}

// Canonical BCP-47 casing, mirroring the backend's helpers/languages.js so a
// code that made a round trip through Mongo or a hand-edited deploy.yml still
// matches an entry in the catalogue.
export function canonicalizeLocale(tag: string | null | undefined): string {
  const trimmed = String(tag || '').trim();
  const [lang, region] = trimmed.split('-');
  if (lang && region) return `${lang.toLowerCase()}-${region.toUpperCase()}`;
  return trimmed.toLowerCase();
}

export function isUiLocale(code: string | null | undefined): code is UiLocale {
  const canonical = canonicalizeLocale(code);
  return UI_LANGUAGE_OPTIONS.some((l) => l.id === canonical);
}

// Narrow the catalogue to what this install offers.
//
// Codes the bundle has no dictionary for are dropped rather than shown: they
// would render entirely in English, which reads as a broken translation rather
// than a language choice.
//
// A ONE-entry result is a meaningful answer, not a degenerate one: a
// single-language install (deploy.yml `chat.translates` empty, so the API
// reports just its default) is how an operator asks for no language picker and
// no in-chat translation, and padding it back out would override that. Only a
// list we can make no sense of at all — empty, or entirely unknown codes —
// falls back to the whole catalogue, since that means the server told us
// nothing usable rather than telling us "one language".
export function resolveAvailableLanguages(
  codes: readonly string[] | null | undefined
): readonly UiLanguageOption[] {
  if (!codes || codes.length === 0) return UI_LANGUAGE_OPTIONS;
  const wanted = codes.map(canonicalizeLocale);
  const matched = UI_LANGUAGE_OPTIONS.filter((l) => wanted.includes(l.id));
  return matched.length > 0 ? matched : UI_LANGUAGE_OPTIONS;
}

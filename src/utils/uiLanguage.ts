import {
  UI_LANGUAGE_OPTIONS,
  UiLocale,
  canonicalizeLocale,
  isUiLocale,
  resolveAvailableLanguages,
  toBaseLanguage,
} from '../constants/languageOptionsConstants';

// Persisted UI-language preference. Suffixed `-538` to match this app's
// existing localStorage-key convention (token-538, chatAppId-538, lastPath).
// Stores the FULL region-qualified locale (e.g. 'fr-CA') - see
// languageOptionsConstants for why the region is carried around.
//
// Since the choice became part of the user profile this is no longer the
// source of truth - the server is (User.language, delivered on login / me).
// It survives as the pre-login and first-paint value: the login screen is
// translated too, and reading it synchronously avoids a flash of English
// before /me resolves.
const UI_LANGUAGE_LS_KEY = 'uiLanguage-538';

// Last-known install language list, cached so the pre-login screens offer the
// same set the server will confirm a moment later. Refreshed whenever
// get-config answers (see actions.ts actionGetConfig -> doSetAvailableLanguages).
const AVAILABLE_LANGUAGES_LS_KEY = 'availableLanguages-538';

// Last-known translation-server capability list (get-config's raw
// `translateLanguages`), cached for the same reason as the catalogue above:
// the chat surfaces build their config before get-config answers, and without
// a hint the translation gate would read "no translation server" for a beat on
// every reload and then flip the globe icon on.
//
// Unlike the catalogue this deliberately has NO fallback list. An empty result
// is a meaningful answer here - it IS "no translation server" - so inventing a
// default would recreate exactly the bug the gate exists to avoid.
const TRANSLATE_LANGUAGES_LS_KEY = 'translateLanguages-538';

const DEFAULT_LOCALE: UiLocale = 'en-CA';

export function getCachedTranslateLanguages(): readonly string[] {
  try {
    const raw = localStorage.getItem(TRANSLATE_LANGUAGES_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    }
  } catch {
    // absent / malformed / storage unavailable - treat as "not known yet",
    // which reads the same as "no translation server" until get-config lands.
  }
  return [];
}

export function setCachedTranslateLanguages(codes: readonly string[]): void {
  try {
    localStorage.setItem(TRANSLATE_LANGUAGES_LS_KEY, JSON.stringify(codes));
  } catch {
    // private mode / quota exceeded - non-fatal, just lose the first-paint hint.
  }
}

export function getCachedAvailableLanguages(): readonly UiLocale[] {
  try {
    const raw = localStorage.getItem(AVAILABLE_LANGUAGES_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return resolveAvailableLanguages(parsed.map(String)).map((l) => l.id);
      }
    }
  } catch {
    // absent / malformed / storage unavailable - fall through to the catalogue.
  }
  return UI_LANGUAGE_OPTIONS.map((l) => l.id);
}

export function setCachedAvailableLanguages(codes: readonly string[]): void {
  try {
    localStorage.setItem(AVAILABLE_LANGUAGES_LS_KEY, JSON.stringify(codes));
  } catch {
    // private mode / quota exceeded - non-fatal, just lose the pre-login hint.
  }
}

// Match the browser's language against the offered locales by BASE language,
// so a visitor on 'fr-FR' or plain 'fr' still lands on our 'fr-CA' option
// instead of falling back to English. Exact-tag matches win first.
function detectBrowserUiLanguage(offered: readonly UiLocale[]): UiLocale {
  const raw = (typeof navigator !== 'undefined' && navigator.language) || '';
  const canonical = canonicalizeLocale(raw);
  if (offered.includes(canonical as UiLocale)) {
    return canonical as UiLocale;
  }
  const base = toBaseLanguage(raw);
  const match = offered.find((id) => toBaseLanguage(id) === base);
  if (match) return match;
  return offered.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : offered[0];
}

// The value to render with before the server has spoken: the user's last
// explicit choice if they made one, otherwise browser-detected. Both are
// constrained to the languages this install last told us it offers, so a
// narrowed install list can't leave someone stuck on a dropped language.
//
// Also migrates legacy values: earlier builds persisted a bare base language
// ('fr'), so upgrade those to the matching region-qualified locale instead of
// silently resetting the user's choice to English.
export function getPreferredUiLanguage(): UiLocale {
  const offered = getCachedAvailableLanguages();
  try {
    const stored = localStorage.getItem(UI_LANGUAGE_LS_KEY);
    const canonical = canonicalizeLocale(stored);
    if (canonical && offered.includes(canonical as UiLocale)) {
      return canonical as UiLocale;
    }
    if (stored) {
      const base = toBaseLanguage(stored);
      const migrated = offered.find((id) => toBaseLanguage(id) === base);
      if (migrated) {
        return migrated;
      }
    }
  } catch {
    // private mode / storage unavailable - fall through to detection.
  }
  return detectBrowserUiLanguage(offered);
}

export function setPreferredUiLanguage(locale: UiLocale): void {
  try {
    localStorage.setItem(UI_LANGUAGE_LS_KEY, locale);
  } catch {
    // private mode / quota exceeded - non-fatal, just lose persistence.
  }
}

// Resolve what the app should display for a freshly-bootstrapped session:
// the user's stored profile choice when this install still offers it, else the
// install default, else what we were already showing. Mirrors the backend's
// resolveUserLanguage() so client and server agree on the effective language.
export function resolveSessionUiLanguage(
  userLanguage: string | null | undefined,
  installDefault: string | null | undefined,
  offered: readonly UiLocale[],
  current: UiLocale
): UiLocale {
  const chosen = canonicalizeLocale(userLanguage);
  if (isUiLocale(chosen) && offered.includes(chosen)) return chosen;

  const fallback = canonicalizeLocale(installDefault);
  if (isUiLocale(fallback) && offered.includes(fallback)) return fallback;

  return offered.includes(current) ? current : offered[0];
}

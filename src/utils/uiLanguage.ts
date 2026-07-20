import {
  UI_LANGUAGE_OPTIONS,
  UiLocale,
  toBaseLanguage,
} from '../constants/languageOptionsConstants';

// Persisted UI-language preference. Suffixed `-538` to match this app's
// existing localStorage-key convention (token-538, chatAppId-538, lastPath).
// Stores the FULL region-qualified locale (e.g. 'fr-CA') - see
// languageOptionsConstants for why the region is carried around.
const UI_LANGUAGE_LS_KEY = 'uiLanguage-538';

const SUPPORTED_LOCALES: readonly string[] = UI_LANGUAGE_OPTIONS.map(
  (l) => l.id
);

const DEFAULT_LOCALE: UiLocale = 'en-CA';

function isSupported(locale: string | null | undefined): locale is UiLocale {
  return !!locale && SUPPORTED_LOCALES.includes(locale);
}

// Match the browser's language against our supported locales by BASE language,
// so a visitor on 'fr-FR' or plain 'fr' still lands on our 'fr-CA' option
// instead of falling back to English. Exact-tag matches win first.
function detectBrowserUiLanguage(): UiLocale {
  const raw = (typeof navigator !== 'undefined' && navigator.language) || '';
  if (isSupported(raw)) {
    return raw;
  }
  const base = toBaseLanguage(raw);
  const match = UI_LANGUAGE_OPTIONS.find((l) => toBaseLanguage(l.id) === base);
  return match ? match.id : DEFAULT_LOCALE;
}

// The user's explicit choice (Profile language selector) if they've made one,
// otherwise browser-detected with an English fallback. Single source of truth
// for the store's initial `uiLanguage` (see store/appStore.ts).
//
// Also migrates legacy values: earlier builds persisted a bare base language
// ('fr'), so upgrade those to the matching region-qualified locale instead of
// silently resetting the user's choice to English.
export function getPreferredUiLanguage(): UiLocale {
  try {
    const stored = localStorage.getItem(UI_LANGUAGE_LS_KEY);
    if (isSupported(stored)) {
      return stored;
    }
    if (stored) {
      const base = toBaseLanguage(stored);
      const migrated = UI_LANGUAGE_OPTIONS.find(
        (l) => toBaseLanguage(l.id) === base
      );
      if (migrated) {
        return migrated.id;
      }
    }
  } catch {
    // private mode / storage unavailable - fall through to detection.
  }
  return detectBrowserUiLanguage();
}

export function setPreferredUiLanguage(locale: UiLocale): void {
  try {
    localStorage.setItem(UI_LANGUAGE_LS_KEY, locale);
  } catch {
    // private mode / quota exceeded - non-fatal, just lose persistence.
  }
}

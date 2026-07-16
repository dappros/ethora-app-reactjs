import {
  UI_LANGUAGE_OPTIONS,
  UiLanguageCode,
} from '../constants/languageOptionsConstants';

// Persisted UI-language preference for the chat-component's static captions
// (config.i18n.locale). Suffixed `-538` to match this app's existing
// localStorage-key convention (token-538, chatAppId-538, lastPath, ...).
const UI_LANGUAGE_LS_KEY = 'uiLanguage-538';

const SUPPORTED_CODES: readonly string[] = UI_LANGUAGE_OPTIONS.map(
  (l) => l.id
);

function isSupported(code: string | null | undefined): code is UiLanguageCode {
  return !!code && SUPPORTED_CODES.includes(code);
}

// Base-language match against navigator.language ("en-US" -> "en", "fr-CA"
// -> "fr"), falling back to English when the browser's language isn't one of
// the chat-component's built-in static-UI languages.
function detectBrowserUiLanguage(): UiLanguageCode {
  const raw = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  const base = raw.split('-')[0].trim().toLowerCase();
  return isSupported(base) ? base : 'en';
}

// The user's explicit choice (Profile language selector) if they've made
// one, otherwise browser-detected with an English fallback. This is the
// single source of truth both the selector and (eventually) chatBootstrap's
// outer-app -> chat-component wiring should read from.
export function getPreferredUiLanguage(): UiLanguageCode {
  try {
    const stored = localStorage.getItem(UI_LANGUAGE_LS_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    // private mode / storage unavailable - fall through to detection.
  }
  return detectBrowserUiLanguage();
}

export function setPreferredUiLanguage(code: UiLanguageCode): void {
  try {
    localStorage.setItem(UI_LANGUAGE_LS_KEY, code);
  } catch {
    // private mode / quota exceeded - non-fatal, just lose persistence.
  }
}

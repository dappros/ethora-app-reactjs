// Colour theme preference: 'light', 'dark', or 'system' (follow the OS /
// browser setting, live). Stored per device on purpose - unlike the UI
// language it is not part of the user profile, because people commonly want
// a dark phone and a light desktop. Suffixed `-538` like the other keys.
//
// The pre-paint snippet in index.html reads the same key and applies the
// same rules before the bundle loads, so a dark user never sees a white flash.
// Keep the two in sync.
export type UiTheme = 'light' | 'dark' | 'system';
export type ResolvedUiTheme = 'light' | 'dark';

export const UI_THEME_OPTIONS: readonly UiTheme[] = ['light', 'dark', 'system'];

const UI_THEME_LS_KEY = 'uiTheme-538';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isUiTheme(value: unknown): value is UiTheme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getPreferredUiTheme(): UiTheme {
  try {
    const stored = localStorage.getItem(UI_THEME_LS_KEY);
    if (isUiTheme(stored)) return stored;
  } catch {
    // private mode / storage unavailable - fall through to the default.
  }
  return 'system';
}

export function setPreferredUiTheme(theme: UiTheme): void {
  try {
    localStorage.setItem(UI_THEME_LS_KEY, theme);
  } catch {
    // private mode / quota exceeded - non-fatal, just lose persistence.
  }
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches
  );
}

export function resolveUiTheme(theme: UiTheme): ResolvedUiTheme {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

export function applyResolvedUiTheme(resolved: ResolvedUiTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

// Calls `onChange` whenever the OS switches between light and dark. Returns
// the unsubscribe function.
export function subscribeToSystemTheme(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

// "Come back here after you sign in." A join link for a scheduled call
// (/call/<slug>) is opened by people who are often not signed in yet. The login
// pages navigate by themselves once the session exists, so the path is parked
// here before the redirect to /login and picked up by whatever finishes the
// login (see navigateToUserPage and finishLogin).
//
// Only a narrow set of in-app paths may be parked: the value comes from the
// address bar, and a returned path is navigated to, so an arbitrary one would
// be an open redirect. Today that is the scheduled-call join link only.

const STORAGE_KEY = 'returnPath-538';
// A parked path older than this is stale (somebody abandoned the login and
// came back much later): drop it instead of throwing them into an old call.
const MAX_AGE_MS = 60 * 60 * 1000;

// /call/<slug> with an optional query string. The slug is the backend's
// url-safe random id (22+ characters).
const CALL_PATH = /^\/call\/[A-Za-z0-9_-]{22,128}\/?(\?[^#\s]*)?$/;

const AGENT_PATH = /^\/agent\/0x[0-9a-fA-F]{40}\/?(\?[^#\s]*)?$/;

/** True when `path` is one this module is willing to park and return to. */
export function isReturnablePath(path: unknown): path is string {
  return typeof path === 'string' && (CALL_PATH.test(path) || AGENT_PATH.test(path));
}

export function signedOutEntryPath(path: string): '/register' | '/login' {
  return AGENT_PATH.test(path) ? '/register' : '/login';
}

export function rememberReturnPath(path: string, now: number = Date.now()): boolean {
  if (!isReturnablePath(path)) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ path, at: now }));
    return true;
  } catch {
    return false;
  }
}

function read(now: number): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { path?: unknown; at?: unknown };
    const at = Number(parsed?.at);
    if (!isReturnablePath(parsed?.path) || !Number.isFinite(at) || now - at > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.path;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    return null;
  }
}

/** The parked path, left in place. */
export function peekReturnPath(now: number = Date.now()): string | null {
  return read(now);
}

/** The parked path, removed so it is used once. Null when there is none. */
export function consumeReturnPath(now: number = Date.now()): string | null {
  const path = read(now);
  if (path !== null) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }
  return path;
}

export function clearReturnPath(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

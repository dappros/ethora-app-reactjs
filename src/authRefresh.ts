import { actionLogout } from './actions';

export type RefreshErrorCode =
  | 'REFRESH_IN_PROGRESS'
  | 'REFRESH_TOKEN_ALREADY_ROTATED'
  | 'REFRESH_TOKEN_REUSE_DETECTED'
  | 'REFRESH_TOKEN_NOT_FOUND'
  // Synthesized client-side: the refresh endpoint answered 401/403 without
  // any machine-readable code — the token itself was rejected (expired,
  // revoked, or from a family the backend already killed).
  | 'REFRESH_UNAUTHORIZED';

export interface RefreshResult {
  token: string;
  refreshToken: string;
  wsToken: string;
  xmppPassword?: string;
  fileToken?: string;
}

export class RefreshFatalError extends Error {
  code: RefreshErrorCode;

  constructor(code: RefreshErrorCode, message?: string) {
    super(message || `Refresh failed: ${code}`);
    this.name = 'RefreshFatalError';
    this.code = code;
    Object.setPrototypeOf(this, RefreshFatalError.prototype);
  }
}

export const isRefreshFatalError = (
  error: unknown
): error is RefreshFatalError =>
  error instanceof RefreshFatalError ||
  (error as RefreshFatalError)?.name === 'RefreshFatalError';

const LEGACY_CREDENTIAL_KEYS = ['ethoraUser'];

export function purgeLegacyCredentialCopies(): void {
  try {
    for (const key of LEGACY_CREDENTIAL_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage disabled / private mode — nothing to purge.
  }
}

export const isTransientRefreshFailure = (error: unknown): boolean => {
  if (isRefreshFatalError(error)) return false;
  const url = (error as { config?: { url?: string } })?.config?.url;
  return url === REFRESH_ENDPOINT;
};

export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken-538';
export const TOKEN_STORAGE_KEY = 'token-538';

export const REFRESH_ENDPOINT = '/users/login/refresh';
const LOCK_NAME = 'ethora-auth-refresh';

const IN_PROGRESS_MAX_ATTEMPTS = 3;
const IN_PROGRESS_BASE_DELAY_MS = 300;
const IN_PROGRESS_JITTER_MS = 150;

const KNOWN_CODES: RefreshErrorCode[] = [
  'REFRESH_IN_PROGRESS',
  'REFRESH_TOKEN_ALREADY_ROTATED',
  'REFRESH_TOKEN_REUSE_DETECTED',
  'REFRESH_TOKEN_NOT_FOUND',
];

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const inProgressDelay = (attempt: number) =>
  IN_PROGRESS_BASE_DELAY_MS * attempt +
  Math.floor(Math.random() * IN_PROGRESS_JITTER_MS);

export const parseRefreshErrorCode = (
  error: unknown
): RefreshErrorCode | null => {
  const response = (error as { response?: { data?: unknown; headers?: Record<string, string> } })
    ?.response;
  if (!response) return null;

  const data = response.data as
    | {
        code?: string;
        error?: string | { code?: string };
        errors?: Array<{ code?: string }>;
        message?: string;
      }
    | undefined;

  const candidates = [
    data?.code,
    typeof data?.error === 'object' ? data?.error?.code : undefined,
    data?.errors?.[0]?.code,
    typeof data?.error === 'string' ? data.error : undefined,
    data?.message,
    response.headers?.['x-error-code'],
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const match = KNOWN_CODES.find((code) => candidate.includes(code));
    if (match) return match;
  }

  return null;
};

export const readStoredRefreshToken = (): string => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const readStoredToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

type TokenSink = (result: RefreshResult) => void;

let persistTokens: TokenSink = () => {};

export function setTokenSink(sink: TokenSink) {
  persistTokens = sink;
}

type PostFn = (
  url: string,
  body: null,
  config: { headers: Record<string, string> }
) => Promise<{
  data: {
    token: string;
    refreshToken: string;
    wsToken: string;
    xmppPassword?: string;
    fileToken?: string;
  };
}>;

let post: PostFn = () => Promise.reject(new Error('authRefresh transport not wired'));

export function setRefreshTransport(fn: PostFn) {
  post = fn;
}

const adoptStoredTokens = (): RefreshResult | null => {
  const refreshToken = readStoredRefreshToken();
  const token = readStoredToken();
  if (!refreshToken || !token) return null;

  const result: RefreshResult = { token, refreshToken, wsToken: '' };
  persistTokens(result);
  return result;
};

const requestRotation = async (refreshToken: string): Promise<RefreshResult> => {
  const response = await post(REFRESH_ENDPOINT, null, {
    headers: { Authorization: refreshToken },
  });

  const result: RefreshResult = {
    token: response?.data?.token || '',
    refreshToken: response?.data?.refreshToken || '',
    wsToken: response?.data?.wsToken || '',
    xmppPassword: response?.data?.xmppPassword,
    fileToken: response?.data?.fileToken,
  };

  if (!result.token || !result.refreshToken) {
    throw new Error('Refresh response did not contain both tokens');
  }

  persistTokens(result);
  return result;
};

const performRefresh = async (
  tokenBeforeLock: string
): Promise<RefreshResult> => {
  const currentAtEntry = readStoredRefreshToken();
  if (tokenBeforeLock && currentAtEntry && currentAtEntry !== tokenBeforeLock) {
    const adopted = adoptStoredTokens();
    if (adopted) return adopted;
  }

  for (let attempt = 1; attempt <= IN_PROGRESS_MAX_ATTEMPTS; attempt++) {
    const refreshToken = readStoredRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token is missing');
    }

    try {
      return await requestRotation(refreshToken);
    } catch (error) {
      const code = parseRefreshErrorCode(error);

      if (code === 'REFRESH_IN_PROGRESS') {
        if (attempt < IN_PROGRESS_MAX_ATTEMPTS) {
          await sleep(inProgressDelay(attempt));
          continue;
        }
        const adopted = adoptStoredTokens();
        if (adopted && adopted.refreshToken !== refreshToken) return adopted;
        throw error;
      }

      if (code === 'REFRESH_TOKEN_ALREADY_ROTATED') {
        const adopted = adoptStoredTokens();
        if (adopted && adopted.refreshToken !== refreshToken) return adopted;
        throw new RefreshFatalError(code);
      }

      if (
        code === 'REFRESH_TOKEN_REUSE_DETECTED' ||
        code === 'REFRESH_TOKEN_NOT_FOUND'
      ) {
        throw new RefreshFatalError(code);
      }

      // A 401/403 straight off the refresh endpoint with no recognised race
      // code means the refresh token itself was rejected (expired, rotated
      // away, or its family revoked) — older backends answer exactly this:
      // a plain 401 with no code. Treating it as transient is what produced
      // the endless /refresh 401 spam: the session was never declared dead,
      // so every subsequent 401 on any request re-triggered another doomed
      // refresh. It is fatal — log out and stop asking.
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        throw new RefreshFatalError('REFRESH_UNAUTHORIZED');
      }

      throw error;
    }
  }

  throw new Error('Refresh attempts exhausted');
};

type LockManagerLike = {
  request: <T>(name: string, callback: () => Promise<T>) => Promise<T>;
};

const getLockManager = (): LockManagerLike | null => {
  if (typeof navigator === 'undefined') return null;
  const locks = (navigator as Navigator & { locks?: LockManagerLike }).locks;
  return typeof locks?.request === 'function' ? locks : null;
};

const withLock = <T,>(callback: () => Promise<T>): Promise<T> => {
  const locks = getLockManager();
  if (!locks) return callback();
  return locks.request(LOCK_NAME, callback);
};

let inflight: Promise<RefreshResult> | null = null;

// Once a logout has started, no refresh may run and (crucially) no refresh
// result may be persisted. Without this, an in-flight rotation that resolves
// AFTER actionLogout() cleared localStorage writes token-538 back, the login
// page sees a token again, navigates into the app, gets a 401, logs out,
// reloads - an infinite login-screen flicker loop (each cycle remounts the
// auth screen and refires its /ping/version fetch).
let sessionKilled = false;

export function markSessionKilled(): void {
  sessionKilled = true;
}

export function isSessionKilled(): boolean {
  return sessionKilled;
}

export function refreshAuthTokens(): Promise<RefreshResult> {
  if (sessionKilled) {
    // Plain (non-fatal) error: callers must not react with another logout.
    return Promise.reject(new Error('Session is logged out'));
  }
  if (inflight) return inflight;

  const tokenBeforeLock = readStoredRefreshToken();

  inflight = withLock(() => performRefresh(tokenBeforeLock)).finally(() => {
    inflight = null;
  });

  return inflight;
}

export async function refreshWithLogoutOnFatal(): Promise<RefreshResult> {
  try {
    return await refreshAuthTokens();
  } catch (error) {
    if (isRefreshFatalError(error)) {
      console.error('[authRefresh] session is dead, logging out', error);
      actionLogout();
    } else {
      console.warn('[authRefresh] refresh failed, session kept', error);
    }
    throw error;
  }
}

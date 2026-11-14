// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Account suspension, client side. A suspended user's login and every
// authenticated API call answer 403 { code: 'USER_SUSPENDED', details:
// { suspension } }. The web app never retries such a call: login screens show
// the "Account suspended" panel in place of an error, and the axios
// interceptor (http.ts) ends a live session and sends the user to
// /account-suspended. The notice is kept in sessionStorage so that screen
// survives the full-page reload the logout does.
import type { NavigateFunction } from 'react-router-dom';
import type { ModelSuspensionNotice, SuspensionReasonCode } from '../models';

export const USER_SUSPENDED_CODE = 'USER_SUSPENDED';
export const ACCOUNT_SUSPENDED_PATH = '/account-suspended';
export const SIGNUP_BLOCKED_CODES = ['SIGNUP_EMAIL_DOMAIN_BLOCKED', 'SIGNUP_EMAIL_BLOCKED'];

export const SUSPENSION_REASON_CODES: SuspensionReasonCode[] = [
  'child_safety',
  'terms_violation',
  'spam',
  'security',
  'other',
];

export const SUSPENSION_MESSAGE_MAX = 500;
export const SUSPENSION_NOTE_MAX = 1000;

const STORAGE_KEY = 'ethora-account-suspended';

type ErrorLike = {
  response?: {
    status?: number;
    data?: { code?: string; details?: { suspension?: ModelSuspensionNotice | null } } | null;
  };
};

/** The suspension notice of a 403 USER_SUSPENDED refusal, else null. */
export function suspensionFromError(error: unknown): ModelSuspensionNotice | null {
  const response = (error as ErrorLike | null)?.response;
  if (!response || response.status !== 403) return null;
  const data = response.data;
  if (!data || typeof data !== 'object' || data.code !== USER_SUSPENDED_CODE) return null;
  const s = data.details?.suspension;
  return {
    reasonCode: s?.reasonCode ?? null,
    message: s?.message ?? null,
    suspendedAt: s?.suspendedAt ?? null,
    until: s?.until ?? null,
    supportContact: s?.supportContact ?? null,
  };
}

/**
 * For a login / sign-in error: when it is a USER_SUSPENDED refusal, hand the
 * notice to `onSuspended` (the sign-in card swaps itself for the panel) or,
 * without one, open the /account-suspended screen. Returns true when handled,
 * so the caller skips its generic error toast.
 */
export function showSuspendedLogin(
  error: unknown,
  navigate: NavigateFunction,
  onSuspended?: (notice: ModelSuspensionNotice) => void
): boolean {
  const notice = suspensionFromError(error);
  if (!notice) return false;
  if (onSuspended) {
    onSuspended(notice);
  } else {
    rememberSuspension(notice);
    navigate(ACCOUNT_SUSPENDED_PATH, { replace: true, state: { suspension: notice } });
  }
  return true;
}

/** True for the sign-up refusals caused by a blocked email or email domain. */
export function isSignupBlockedError(error: unknown): boolean {
  const response = (error as ErrorLike | null)?.response;
  return response?.status === 403 && SIGNUP_BLOCKED_CODES.includes(String(response.data?.code || ''));
}

export function rememberSuspension(notice: ModelSuspensionNotice): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notice));
  } catch {
    // Private mode / storage disabled: the screen then shows the generic text.
  }
}

export function readSuspension(): ModelSuspensionNotice | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ModelSuspensionNotice) : null;
  } catch {
    return null;
  }
}

export function clearSuspension(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Translation key of a reason code; unknown codes read as "Other". */
export function suspensionReasonKey(code?: string | null): string {
  const known = SUSPENSION_REASON_CODES.includes(code as SuspensionReasonCode);
  return `userSuspension.reason.${known ? code : 'other'}`;
}

/**
 * Link target for a support contact: mailto: when it contains '@', the URL
 * itself for http(s), https:// prepended to a bare host. Anything else (a
 * javascript: URL, say) gets no link and is shown as text.
 */
export function supportContactHref(contact?: string | null): string | null {
  const value = String(contact || '').trim();
  if (!value) return null;
  if (value.includes('@') && !/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    return `mailto:${value.replace(/^mailto:/i, '')}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return `https://${value}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Support contact as the app settings accept it: empty, an email, or an https URL. */
export function isValidSupportContact(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (EMAIL_RE.test(v)) return true;
  try {
    const url = new URL(v);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const LABEL = '(?:\\*|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
const DOMAIN_PATTERN_RE = new RegExp(`^${LABEL}(?:\\.${LABEL})+$`);

/**
 * Parses the "one pattern per line" text of the blocked sign-up domains
 * setting: trimmed, lower-cased, a leading "@" dropped, blank lines and
 * duplicates removed. `invalid` lists the lines that are not a domain pattern.
 */
export function parseBlockedDomains(text: string): { patterns: string[]; invalid: string[] } {
  const patterns: string[] = [];
  const invalid: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const v = line.trim().toLowerCase().replace(/^@/, '');
    if (!v) continue;
    if (!DOMAIN_PATTERN_RE.test(v)) {
      invalid.push(line.trim());
      continue;
    }
    if (!patterns.includes(v)) patterns.push(v);
  }
  return { patterns, invalid };
}

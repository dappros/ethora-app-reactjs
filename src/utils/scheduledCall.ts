// How the booking API's answer to "resolve a join link" maps to the screens of
// /call/:slug (the request itself is utils/resolveScheduledCall.ts). Shapes are the backend contract
// (GET /v1/chats/calls/scheduled/:slug): 404 unknown slug, 403
// { error: 'not-a-member' }, and a call whose status is `cancelled`.

export interface ScheduledCallLookup {
  scheduledCall: { slug: string; status: string; title?: string };
  chat: { name: string; title?: string; type?: string; jid: string };
}

export type CallJoinFailure = 'not-found' | 'not-a-member' | 'cancelled' | 'error';

export type CallJoinOutcome =
  | { ok: true; call: ScheduledCallLookup }
  | { ok: false; reason: CallJoinFailure };

// Same shape the chat component accepts: the backend's url-safe random id.
const SLUG_RE = /^[A-Za-z0-9_-]{22,128}$/;

export function isValidCallSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

/** Maps a failed lookup to the screen it gets. Anything unexpected is `error`. */
export function classifyLookupFailure(status: number | undefined): CallJoinFailure {
  if (status === 404) return 'not-found';
  if (status === 403) return 'not-a-member';
  return 'error';
}

/** Maps a successful lookup answer to an outcome (cancelled calls get their own screen). */
export function outcomeFromLookup(data: unknown): CallJoinOutcome {
  const call = data as Partial<ScheduledCallLookup> | null | undefined;
  if (
    !call ||
    typeof call.scheduledCall?.slug !== 'string' ||
    typeof call.chat?.jid !== 'string'
  ) {
    return { ok: false, reason: 'error' };
  }
  if (call.scheduledCall.status === 'cancelled') {
    return { ok: false, reason: 'cancelled' };
  }
  return { ok: true, call: call as ScheduledCallLookup };
}

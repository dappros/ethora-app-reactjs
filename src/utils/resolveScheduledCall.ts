import { http } from '../http';
import {
  CallJoinOutcome,
  classifyLookupFailure,
  isValidCallSlug,
  outcomeFromLookup,
} from './scheduledCall';

/**
 * GET /v1/chats/calls/scheduled/:slug for a join link. Never throws: every
 * failure is an outcome with the reason its screen needs.
 */
export async function resolveScheduledCall(slug: string): Promise<CallJoinOutcome> {
  if (!isValidCallSlug(slug)) return { ok: false, reason: 'not-found' };
  try {
    const { data } = await http.get(
      `/chats/calls/scheduled/${encodeURIComponent(slug)}`
    );
    return outcomeFromLookup(data);
  } catch (e) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    return { ok: false, reason: classifyLookupFailure(status) };
  }
}

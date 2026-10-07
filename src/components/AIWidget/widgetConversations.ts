// Widget conversations: response types and helpers shared by the AI Widget
// tab's Conversations history and Users > Visitors.
import { httpV2 } from '../../http';

// Server response shape — matches the listWidgetConversationsService
// envelope. Kept minimal (no shared types module yet); when more views
// consume it we can promote into src/models.ts.
export interface VisitorMetadata {
  userAgent: string;
  ip: string;
  country: string; // ISO-3166-1 alpha-2
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  // Page the chat was opened on (origin + path) and the latest one for a
  // returning visitor. Empty for visitors recorded before pages were.
  pageUrl?: string;
  lastPageUrl?: string;
  capturedAt: string | null;
}

export interface WidgetConversationRow {
  _id: string;
  name: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  visitor: {
    _id: string;
    uuid: string;
    xmppUsername: string;
    firstSeenAt: string;
    // null when the visitor row predates the metadata-capture rollout.
    metadata?: VisitorMetadata | null;
  } | null;
}

export interface WidgetConversationsResponse {
  results: WidgetConversationRow[];
  pagination?: { limit: number; offset: number; total: number };
  total?: number;
  limit?: number;
  offset?: number;
}

// Single message row from GET /v2/apps/:appId/chats/:chatId/messages.
export interface ChatMessageRow {
  id: string;
  originId: string | null;
  ts: number; // ms since epoch
  from: string; // bare JID of sender
  nick: string;
  body: string;
}

export interface ChatMessagesResponse {
  results: ChatMessageRow[];
  total: number;
  nextBefore: number | null;
  chat: { _id: string; name: string; type: string };
  mamUnavailable: boolean;
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch {
    return value;
  }
}

// Visitor display: prefer the uuid suffix (a short readable handle that
// stays stable per browser), falling back to the JID. Never show the full
// xmppUsername in the list — it's noisy and includes the appId prefix
// repeated everywhere.
export function formatVisitor(row: WidgetConversationRow): string {
  if (!row.visitor) return 'unknown visitor';
  const uuid = row.visitor.uuid;
  if (uuid && uuid.length >= 8) return `Visitor #${uuid.slice(0, 8)}`;
  return row.visitor.xmppUsername || 'unknown visitor';
}

// Tiny ISO-3166 → flag emoji helper. Skips IP-localhost / private
// ranges (where country is empty) without trying to be clever — emoji
// flags are a nice visual cue but never the only signal.
export function flagFor(country: string): string {
  if (!country || country.length !== 2) return '';
  const A = 0x1f1e6 - 'A'.charCodeAt(0);
  const cc = country.toUpperCase();
  return String.fromCodePoint(cc.charCodeAt(0) + A, cc.charCodeAt(1) + A);
}

// Deletes a conversation: its message history, then the room.
export async function deleteWidgetConversation(
  appId: string,
  row: WidgetConversationRow
): Promise<{ ok: boolean; error?: string }> {
  try {
    await httpV2.delete(`/apps/${appId}/chats/${row._id}/messages`);
  } catch (e: any) {
    // mamUnavailable on the install isn't fatal — keep going so the
    // chat row still gets removed.
    const code = e?.response?.data?.code;
    if (code !== 'MAM_NOT_CONFIGURED') {
      return { ok: false, error: e?.response?.data?.error || e?.message || 'history clear failed' };
    }
  }
  try {
    await httpV2.delete(`/apps/${appId}/chats`, { data: { name: row.name } });
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.error || e?.message || 'chat delete failed' };
  }
  return { ok: true };
}

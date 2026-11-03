// Server events for this page, delivered over the chat component's XMPP session
// as `<ethora-event xmlns="urn:ethora:events:1">` headlines (see
// services/xmpp.events.service on the API side). The chat component hands the
// host every inbound <message/> through eventHandlers.onXmppEvent, before it
// checks anything, so everything here starts out as untrusted input.
//
// An event is unacknowledged and unreplayable: a client that was reloading or
// briefly offline misses it silently. Merge what arrives and reconcile against
// the API.
import type { XmppMessageEvent } from '@ethora/chat-component';

const EVENT_XMLNS = 'urn:ethora:events:1';

export interface EthoraEvent {
  type: string;
  payload: unknown;
}

type RawEvent = { type: string; text: string };
type ParseEvent = (stanza: string) => RawEvent | null;

// The server sends these from a bare JID on the user's own domain. A client's
// `from` is stamped by the server with its resource, so no other user can pose
// as one, and rooms live on their own subdomain.
export function isServerEvent({ from, to, type }: XmppMessageEvent): boolean {
  if (type !== 'headline' || !from || !to) return false;
  if (from.includes('/') || !from.includes('@')) return false;
  const domain = (jid: string) => jid.split('/')[0].split('@').pop();
  return domain(from) === domain(to);
}

function parseWithDom(stanza: string): RawEvent | null {
  const root = new DOMParser().parseFromString(stanza, 'text/xml').documentElement;
  const event = Array.from(root.children).find(
    (el) => el.localName === 'ethora-event' && el.namespaceURI === EVENT_XMLNS
  );
  if (!event) return null;
  return { type: event.getAttribute('type') || '', text: event.textContent || '' };
}

export function readEthoraEvent(
  message: XmppMessageEvent,
  parse: ParseEvent = parseWithDom
): EthoraEvent | null {
  // Most stanzas are chat messages: skip the XML parser for those.
  if (!message.stanza?.includes(EVENT_XMLNS) || !isServerEvent(message)) return null;
  try {
    const raw = parse(message.stanza);
    if (!raw?.type) return null;
    return { type: raw.type, payload: raw.text ? JSON.parse(raw.text) : null };
  } catch {
    return null;
  }
}

type Listener = (event: EthoraEvent) => void;
const listeners = new Set<Listener>();

export function subscribeEthoraEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Goes in config.eventHandlers. The XMPP session outlives any one page, so the
// handler is fixed and pages subscribe to what it reads.
export function handleXmppEvent(message: XmppMessageEvent): void {
  const event = readEthoraEvent(message);
  if (event) listeners.forEach((listener) => listener(event));
}

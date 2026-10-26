// Keeps this browser's views of an App's chat component config in step.
//
// The server announces a change over XMPP to every online chat (the SDK's
// `onChatComponentConfigUpdated`). This module covers what that cannot: the
// admin who just saved (their chat is in another tab, or opens a moment later
// and would be served the public endpoint's 30 s cache) and the page that
// missed the push. It remembers the newest version each App was saved at, so
// a read can ask for exactly that (`&v=`) and step around the cache, and it
// tells the other tabs of this browser through a BroadcastChannel.

export interface ChatComponentConfigSaved {
  appId: string;
  version: string;
}

type Listener = (event: ChatComponentConfigSaved) => void;

const CHANNEL_NAME = 'ethora-chat-component-config';
const VERSION_RE = /^[A-Za-z0-9._-]{1,40}$/;

const known = new Map<string, string>();
const listeners = new Set<Listener>();
let channel: BroadcastChannel | null | undefined;

const isEvent = (value: unknown): value is ChatComponentConfigSaved => {
  const v = value as Partial<ChatComponentConfigSaved> | null;
  return (
    typeof v?.appId === 'string' &&
    v.appId.length > 0 &&
    v.appId.length <= 64 &&
    typeof v?.version === 'string' &&
    VERSION_RE.test(v.version)
  );
};

// Versions are save times in ms: the larger one is the newer.
const newer = (a: string, b: string | undefined): boolean => {
  if (b === undefined) return true;
  const x = Number(a);
  const y = Number(b);
  return Number.isFinite(x) && Number.isFinite(y) ? x >= y : true;
};

export function noteChatComponentConfigVersion(appId: string, version: string | undefined | null) {
  if (!appId || !version || !VERSION_RE.test(version)) return;
  if (newer(version, known.get(appId))) known.set(appId, version);
}

export function knownChatComponentConfigVersion(appId: string): string | undefined {
  return known.get(appId);
}

function notify(event: ChatComponentConfigSaved) {
  noteChatComponentConfigVersion(event.appId, event.version);
  for (const listener of Array.from(listeners)) {
    try {
      listener(event);
    } catch {
      // one bad listener must not stop the others
    }
  }
}

function openChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (message: MessageEvent) => {
        if (isEvent(message.data)) notify({ appId: message.data.appId, version: message.data.version });
      };
    }
  } catch {
    channel = null;
  }
  return channel;
}

/** Listen for saves made in this tab or any other tab of this browser. */
export function subscribeChatComponentConfigSaved(listener: Listener): () => void {
  openChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The admin saved a change: tell this tab's chats and the other tabs. */
export function announceChatComponentConfigSaved(event: ChatComponentConfigSaved) {
  if (!isEvent(event)) return;
  notify(event);
  try {
    openChannel()?.postMessage({ appId: event.appId, version: event.version });
  } catch {
    // a closed channel only costs the other tabs a live update
  }
}

/** Forget everything (tests). */
export function resetChatComponentConfigSync() {
  known.clear();
  listeners.clear();
  try {
    channel?.close();
  } catch {
    // ignore
  }
  channel = undefined;
}

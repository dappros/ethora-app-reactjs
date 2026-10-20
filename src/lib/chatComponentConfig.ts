// Chat component config an App stores in the admin's "Chat component" tab.
//
// Stored on the App (GET/PUT /v2/apps/:appId/chat-component/config) as a flat
// record: dotted IConfig path -> value, non-defaults only. The web chat reads
// it at load from GET /v2/chat-component/config and applies it on top of the
// config it already builds (createChatConfig), so an App with nothing saved
// behaves exactly as before. The key list and each key's license feature
// mirror ethora-backend modules/apps/chatComponentConfig.js, which is what
// validates a write; keep the two in step.

export type ChatConfigRecord = Record<string, string | boolean>;
export type ChatFeatureId = 'core' | 'ai' | 'b2b' | 'compliance';

// Feature of each key that needs more than core. Keys not listed are core.
export const CHAT_KEY_FEATURE: Record<string, ChatFeatureId> = {
  botMessageAutoScroll: 'ai',
  blockMessageSendingWhenProcessing: 'ai',
  'customTypingIndicator.enabled': 'ai',
  'customTypingIndicator.text': 'ai',
  'customTypingIndicator.position': 'ai',
  'translates.enabled': 'ai',
  'secondarySendButton.enabled': 'b2b',
  clearStoreBeforeInit: 'compliance',
};

export const featureOfKey = (key: string): ChatFeatureId => CHAT_KEY_FEATURE[key] ?? 'core';

export function hasChatFeature(features: string[] | undefined, feature: ChatFeatureId) {
  if (feature === 'core') return true;
  return Boolean(features?.includes('*') || features?.includes(feature));
}

// Sets `a.b.c = value` on a copy of base without losing sibling keys.
function setPath(target: Record<string, any>, path: string, value: unknown) {
  const parts = path.split('.');
  let node = target;
  parts.slice(0, -1).forEach((part) => {
    node[part] = { ...(node[part] || {}) };
    node = node[part];
  });
  node[parts[parts.length - 1]] = value;
}

// The chat config with the saved record applied on top.
export function applyChatComponentConfig<T extends object>(base: T, record: ChatConfigRecord | null | undefined): T {
  if (!record || !Object.keys(record).length) return base;
  const out: Record<string, any> = { ...(base as Record<string, any>) };
  for (const [key, value] of Object.entries(record)) setPath(out, key, value);
  return out as T;
}

export function sameChatConfig(a: ChatConfigRecord, b: ChatConfigRecord) {
  const ak = Object.keys(a);
  return ak.length === Object.keys(b).length && ak.every((k) => a[k] === b[k]);
}

// Drops keys set back to "unset" ('' for text and colors).
export function cleanChatConfig(record: ChatConfigRecord): ChatConfigRecord {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== '' && v !== undefined));
}

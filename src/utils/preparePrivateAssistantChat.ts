import { httpEnsureAssistantChat } from '../http';
import type { ModelApp, ModelCurrentUser } from '../models';

export function privateAssistantChatKey(app: ModelApp | null, user: ModelCurrentUser | null) {
  return app?.autoCreateAssistantChat && user?._id && app._id === user.appId
    ? `${app._id}:${user._id}` : '';
}

// Provider prefetch and the Chats page share the same request. Keeping it
// ahead of the first /chats/my avoids caching a list without the new room.
const prepared = new Map<string, Promise<void>>();
export function preparePrivateAssistantChat(key: string) {
  const pending = prepared.get(key);
  if (pending) return pending;
  const request = httpEnsureAssistantChat().then(() => undefined).catch((error: unknown) => {
    prepared.delete(key);
    console.warn('[Chat] Could not prepare the private assistant chat', error);
  });
  prepared.set(key, request);
  return request;
}

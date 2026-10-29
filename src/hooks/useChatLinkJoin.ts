import * as ChatSdk from '@ethora/chat-component';
import { useEffect, useRef, useState } from 'react';
import { env } from '../config/env';
import { httpGetMyChat } from '../http';

const LINK_PARAMS = ['chatId', 'qrChatId'];
const PARKED_CHAT_KEY = '@ethora/chat-component-qrChatId';
const RECHECK_DELAYS_MS = [1000, 2000, 3000, 4000];
const COMPONENT_SYNC_WINDOW_MS = 9000;
const ROOM_ACCESS_TIMEOUT_MS = 3000;

export type ChatLinkState = 'none' | 'checking' | 'open' | 'denied' | 'notFound';

type RoomAccess = 'open' | 'membersOnly' | 'notFound' | 'unknown';
type RoomAccessClient = {
  status?: string;
  getRoomAccessStanza?: (roomJID: string, timeoutMs?: number) => Promise<RoomAccess>;
};

const sdk = ChatSdk as unknown as { useXmppClient?: () => { client: RoomAccessClient | null } };
const useOptionalXmppClient = sdk.useXmppClient ?? (() => ({ client: null }));

export function linkedChatName(search: string): string | null {
  const params = new URLSearchParams(search);
  for (const name of LINK_PARAMS) {
    const value = params.get(name)?.trim();
    if (value) return value.split('@')[0] || null;
  }
  return null;
}

export function forgetParkedChatLink() {
  try {
    localStorage.removeItem(PARKED_CHAT_KEY);
  } catch {
    /* storage unavailable */
  }
}

function isMember(chatName: string): Promise<boolean | null> {
  return httpGetMyChat(chatName).then(
    () => true,
    (e) => (e?.response?.status === 404 ? false : null)
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useChatLinkJoin(chatName: string | null) {
  const [state, setState] = useState<ChatLinkState>(chatName ? 'checking' : 'none');
  const [remountKey, setRemountKey] = useState(0);
  const { client } = useOptionalXmppClient();
  const clientRef = useRef(client);
  clientRef.current = client;

  useEffect(() => {
    if (!chatName) {
      setState('none');
      return;
    }
    let cancelled = false;
    setState('checking');
    const roomJID = env.VITE_XMPP_SERVICE ? `${chatName}@${env.VITE_XMPP_SERVICE}` : '';
    let access: RoomAccess = 'unknown';

    const probeAccess = async (current: RoomAccess): Promise<RoomAccess> => {
      const c = clientRef.current;
      if (current !== 'unknown' || !roomJID || !c?.getRoomAccessStanza || c.status !== 'online') return current;
      return c.getRoomAccessStanza(roomJID, ROOM_ACCESS_TIMEOUT_MS).catch(() => 'unknown' as const);
    };

    (async () => {
      const first = await isMember(chatName);
      if (cancelled) return;
      if (first !== false) {
        setState('open');
        return;
      }
      const startedAt = Date.now();
      let inconclusive = false;
      access = await probeAccess(access);
      for (const delay of RECHECK_DELAYS_MS) {
        if (cancelled) return;
        if (access === 'notFound') return setState('notFound');
        if (access === 'membersOnly') return setState('denied');
        await wait(delay);
        if (cancelled) return;
        const member = await isMember(chatName);
        if (cancelled) return;
        if (member) {
          if (Date.now() - startedAt > COMPONENT_SYNC_WINDOW_MS) setRemountKey((n) => n + 1);
          setState('open');
          return;
        }
        if (member === null) inconclusive = true;
        access = await probeAccess(access);
      }
      if (cancelled) return;
      if (access === 'notFound') return setState('notFound');
      setState(inconclusive || access === 'open' ? 'open' : 'denied');
    })();

    return () => {
      cancelled = true;
    };
  }, [chatName]);

  return { state, remountKey };
}

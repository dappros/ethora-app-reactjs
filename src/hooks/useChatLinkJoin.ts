import * as ChatSdk from '@ethora/chat-component';
import { useEffect, useRef, useState } from 'react';
import { env } from '../config/env';
import { httpGetMyChat } from '../http';

const LINK_PARAMS = ['chatId', 'qrChatId'];
const PARKED_CHAT_KEY = '@ethora/chat-component-qrChatId';
const RECHECK_DELAYS_MS = [1000, 2000, 3000, 4000, 5000];
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

    const probeAccess = async (): Promise<RoomAccess> => {
      const c = clientRef.current;
      if (!roomJID || !c?.getRoomAccessStanza || c.status !== 'online') return 'unknown';
      return c.getRoomAccessStanza(roomJID, ROOM_ACCESS_TIMEOUT_MS).catch(() => 'unknown' as const);
    };

    (async () => {
      let inconclusive = false;
      for (const delay of [0, ...RECHECK_DELAYS_MS]) {
        if (delay) await wait(delay);
        if (cancelled) return;
        const member = await isMember(chatName);
        if (cancelled) return;
        if (member) {
          setState('open');
          return;
        }
        if (member === null) inconclusive = true;
      }
      if (inconclusive) return setState('open');
      const access = await probeAccess();
      if (cancelled) return;
      if (access === 'notFound') return setState('notFound');
      setState(access === 'membersOnly' ? 'denied' : 'open');
    })();

    return () => {
      cancelled = true;
    };
  }, [chatName]);

  return { state };
}

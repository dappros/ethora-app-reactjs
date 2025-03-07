import React from 'react';
import { httpTokens, refreshToken } from '../http';
import { useAppStore } from '../store/useAppStore';

export const VITE_APP_XMPP_SERVICE = import.meta.env.VITE_APP_XMPP_SERVICE;
export const VITE_XMPP_SERVICE = import.meta.env.VITE_XMPP_SERVICE;
export const VITE_XMPP_HOST = import.meta.env.VITE_XMPP_HOST;

import { ChatAppEmbeded } from '../../comp/dist/main';

export default function ChatPage() {
  const config = useAppStore((s) => s.currentApp);
  const { currentUser } = useAppStore((s) => s);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full abc">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Chats
        </div>
      </div>
      <div className="rounded-2xl bg-white px-0 overflow-hidden">
        <ChatAppEmbeded />
      </div>
    </div>
  );
}

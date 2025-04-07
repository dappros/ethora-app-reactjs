import { Chat } from '@ethora/chat-component';
import React from 'react';
import { httpTokens, refreshToken } from '../http';
import { useAppStore } from '../store/useAppStore';

export const VITE_APP_XMPP_SERVICE = import.meta.env.VITE_APP_XMPP_SERVICE;
export const VITE_XMPP_SERVICE = import.meta.env.VITE_XMPP_SERVICE;
export const VITE_XMPP_HOST = import.meta.env.VITE_XMPP_HOST;

interface ChatComponentProps {
  config: any;
  currentUser: any;
}

const MemoizedChat = React.memo(function ChatComponent({
  config,
  currentUser,
}: ChatComponentProps) {
  const handleChangeTokens = async () => {
    const { token, refreshToken: refresh } = await refreshToken();

    localStorage.setItem('refreshToken-538', refresh);
    localStorage.setItem('token-538', token);

    httpTokens.token = token;
    httpTokens.refreshToken = refresh;
  };

  return (
    <Chat
      config={{
        colors: {
          primary: config?.primaryColor || '#fff',
          secondary: config?.secondaryColor || '#141414',
        },
        baseUrl: 'https://dev.api.ethoradev.com/v1',
        newArch: true,
        qrUrl: 'https://ethora.dev.frontend.ethoradev.com/app/chat/?chatId=',
        xmppSettings: {
          devServer: VITE_APP_XMPP_SERVICE,
          host: VITE_XMPP_HOST,
          conference: VITE_XMPP_SERVICE,
        },
        // @ts-ignorex
        roomListStyles: {
          maxHeight: 'calc(100%)',
          height: 'calc(100%)',
          borderRadius: '16px 0px 0px 16px',
          border: 'none',
          padding: '16px',
          color: '#141414',
        },
        chatRoomStyles: {
          maxHeight: 'calc(100%)',
          height: 'calc(100%)',
          borderRadius: '0px 16px 16px 0px',
          color: '#141414',
        },
        userLogin: {
          enabled: true,
          user: currentUser,
        },
        disableRoomMenu: true,
        defaultRooms: config?.defaultRooms || [],
        refreshTokens: {
          refreshFunction: handleChangeTokens,
          enabled: true,
        },
        setRoomJidInPath: true,
      }}
    />
  );
});

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
        <MemoizedChat config={config} currentUser={currentUser} />
      </div>
    </div>
  );
}

import { Chat } from '@ethora/chat-component';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import React from 'react';
import { httpTokens, refreshToken } from '../http';
import { useAppStore } from '../store/useAppStore';

export const VITE_APP_XMPP_SERVICE = import.meta.env.VITE_APP_XMPP_SERVICE;
export const VITE_XMPP_SERVICE = import.meta.env.VITE_XMPP_SERVICE;
export const VITE_XMPP_HOST = import.meta.env.VITE_XMPP_HOST;
export const VITE_API = import.meta.env.VITE_API;

interface ChatComponentProps {
  config: any;
  currentUser: any;
}

const MemoizedChat = React.memo(function ChatComponent({
  config,
  currentUser,
}: ChatComponentProps) {
  const appToken = useAppStore((s) => s.currentApp?.appToken);

  const handleChangeTokens = async () => {
    const { token, refreshToken: refresh } = await refreshToken();

    localStorage.setItem('refreshToken-538', refresh);
    localStorage.setItem('token-538', token);

    httpTokens.token = token;
    httpTokens.refreshToken = refresh;
  };

  return (
    // @ts-ignore
    <Chat
      config={{
        colors: {
          primary: config?.primaryColor || '#fff',
          secondary: config?.secondaryColor || '#141414',
        },
        baseUrl: VITE_API ?? 'https://api.ethoradev.com/v1',
        // @ts-ignorex
        customAppToken: appToken,
        newArch: true,
        qrUrl: 'https://app.ethora.com/app/chat/?qrChatId=',
        xmppSettings: {
          devServer: VITE_APP_XMPP_SERVICE,
          host: VITE_XMPP_HOST,
          conference: VITE_XMPP_SERVICE,
          xmppPingOnSendEnabled: true,
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
          // @ts-ignore
          refreshFunction: handleChangeTokens,
          enabled: true,
        },
        setRoomJidInPath: true,
        enableRoomsRetry: { enabled: false, helperText: '' },
      }}
    />
  );
});

export default function ChatPage() {
  const config = useAppStore((s) => s.currentApp);
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const apps = useAppStore((s) => s.apps);

  const { currentUser } = useAppStore((s) => s);

  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;
  const isDemoDomain = allowedDomains.includes(currentDomain);
  const isBaseApp = Boolean(config?.isBaseApp);
  const hasOtherApps = Array.isArray(apps)
    ? apps.some((app) => app && app._id !== config?._id && !app.isBaseApp)
    : false;
  const showBaseAppContextBanner = Boolean(
    isAdmin && isBaseApp && (isDemoDomain || hasOtherApps)
  );

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full abc">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Chats
        </div>
        {showBaseAppContextBanner && (
          <div className="flex flex-col items-center bg-yellow-100 px-4 py-2 text-sm border">
            {isDemoDomain ? (
              <p>This is a demo server</p>
            ) : (
              <p>This is the Base App context</p>
            )}
            <p className="flex items-center gap-2">
              <span>
                {isDemoDomain
                  ? 'To test your own App, go to "Admin"'
                  : 'To switch context, go to "Admin"'}
              </span>
              <ArrowRightAltIcon /> <span>your App </span>
              <ArrowRightAltIcon /> <span>"Publish"</span>
            </p>
          </div>
        )}
        <div />
      </div>
      <div className="rounded-2xl bg-white px-0 overflow-hidden">
        <MemoizedChat config={config} currentUser={currentUser} />
      </div>
    </div>
  );
}

import { Chat, XmppProvider } from '@ethora/chat-component';
import Session from 'supertokens-web-js/recipe/session';
import type { ComponentProps, CSSProperties } from 'react';
import type { ModelApp } from '../models';

type XmppProviderConfig = NonNullable<ComponentProps<typeof XmppProvider>['config']>;
type ChatConfig = NonNullable<ComponentProps<typeof Chat>['config']>;

const DEFAULT_QR_URL = 'https://app.chat.ethora.com/app/chat/?qrChatId=';

const roomListStyles: CSSProperties = {
  maxHeight: 'calc(100%)',
  height: 'calc(100%)',
  borderRadius: '16px 0px 0px 16px',
  border: 'none',
  padding: '16px',
  color: '#141414',
};

const chatRoomStyles: CSSProperties = {
  maxHeight: 'calc(100%)',
  height: 'calc(100%)',
  borderRadius: '0px 16px 16px 0px',
  color: '#141414',
};

interface BuildEthoraBaseChatConfigProps {
  chat_token?: string | null;
}

export const buildEthoraBaseChatConfig = ({
  chat_token,
}: BuildEthoraBaseChatConfigProps): XmppProviderConfig => {
  return {
    baseUrl: import.meta.env.VITE_API,
    xmppSettings: {
      devServer: import.meta.env.VITE_APP_XMPP_SERVICE,
      host: import.meta.env.VITE_XMPP_HOST,
      conference: import.meta.env.VITE_XMPP_SERVICE,
    },
    jwtLogin: {
      enabled: true,
      token: chat_token ?? '',
    },
    refreshTokens: {
      enabled: true,
      refreshFunction: async () => {
        try {
          const refreshed = await Session.attemptRefreshingSession();

          if (!refreshed) return null;

          const tokenPayload = await Session.getAccessTokenPayloadSecurely();
          const nextChatToken = tokenPayload?.chat_user_jwt_token;

          if (!nextChatToken || typeof nextChatToken !== 'string') return null;

          return {
            accessToken: nextChatToken,
          };
        } catch {
          return null;
        }
      },
    },
    initBeforeLoad: true,
  };
};

export const chatBootstrapConfig: XmppProviderConfig =
  buildEthoraBaseChatConfig({
    chat_token: null,
  });

interface CreateChatConfigOptions {
  app: ModelApp | null;
  chatToken?: string | null;
}

export function createChatConfig({
  app,
  chatToken,
}: CreateChatConfigOptions): ChatConfig {
  return {
    ...buildEthoraBaseChatConfig({
      chat_token: chatToken,
    }),
    customAppToken: app?.appToken,
    colors: {
      primary: app?.primaryColor || '#fff',
      secondary: '#141414',
    },
    qrUrl: DEFAULT_QR_URL,
    roomListStyles,
    chatRoomStyles,
    disableRoomMenu: true,
    defaultRooms: app?.defaultRooms || [],
    setRoomJidInPath: true,
    enableRoomsRetry: { enabled: false, helperText: '' },
    newArch: true,
  };
}

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
  // Tenant-Owner override (Option A): when an admin uses the App Switcher
  // to test chats inside one of their owned apps, the chat-component is
  // rebuilt with these app-X-scoped credentials instead of the admin's
  // own base-app identity. The override carries:
  //   - the *target* app's appToken (so HTTP calls scope correctly)
  //   - a chat-JWT signed with the target app's signing context (so XMPP
  //     binds the prefix-compliant owner JID and mod_ethora accepts MUC
  //     joins)
  //   - a `refreshFunction` that re-mints the owner JWT against the same
  //     /v2/apps/:appId/owner-session endpoint, so the chat session can
  //     extend past the 1h JWT lifetime without the admin re-clicking.
  ownerOverride?: {
    appToken: string;
    chatToken: string;
    refreshFunction: () => Promise<{ accessToken: string; refreshToken?: string } | null>;
  };
}

export function createChatConfig({
  app,
  chatToken,
  ownerOverride,
}: CreateChatConfigOptions): ChatConfig {
  // When we're in owner-session mode we have to override BOTH the chat
  // token (XMPP identity) AND the refreshFunction; the default refresh
  // calls SuperTokens which doesn't know about the owner user. Failing to
  // override the refresh would result in the chat-component silently
  // logging the owner out after ~1h with no recovery path.
  const baseConfig = buildEthoraBaseChatConfig({
    chat_token: ownerOverride?.chatToken ?? chatToken,
  });

  if (ownerOverride) {
    baseConfig.refreshTokens = {
      enabled: true,
      refreshFunction: ownerOverride.refreshFunction,
    };
  }

  return {
    ...baseConfig,
    customAppToken: ownerOverride?.appToken ?? app?.appToken,
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

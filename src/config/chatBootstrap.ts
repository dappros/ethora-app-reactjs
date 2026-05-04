import { Chat, XmppProvider } from '@ethora/chat-component';
import Session from 'supertokens-web-js/recipe/session';
import type { ComponentProps, CSSProperties } from 'react';
import type { ModelApp, ModelCurrentUser, ModelOwnerSession } from '../models';

type XmppProviderConfig = NonNullable<ComponentProps<typeof XmppProvider>['config']>;
type ChatConfig = NonNullable<ComponentProps<typeof Chat>['config']>;

// Shape the chat-component's `userLogin.user` actually consumes. We strip our
// frontend's internal-only fields and keep the chat-relevant ones plus
// firstName/lastName so the chat-component can render the avatar/handle for
// outgoing messages without hitting the API again.
type ChatUserLoginUser = NonNullable<NonNullable<ChatConfig['userLogin']>['user']>;

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
    // initBeforeLoad MUST be false because main.tsx mounts <XmppProvider/>
    // with no config (commit c1d9469 removed XmppProviderBridge). When this
    // is true, useChatWrapperInit waits for providerBootstrapStatus to
    // become 'ready', but the unconfigured parent XmppProvider's effect
    // bails on `if (!config?.initBeforeLoad) { setStatus('idle'); return }`
    // and never fires runInitBeforeLoad - so the spinner is stuck on
    // "Connecting..." forever. Falling back to false routes through the
    // legacy useChatWrapperInit path that calls initializeClient itself
    // using the userLogin.user xmpp creds, which is what was working
    // before the commit.
    initBeforeLoad: false,
  };
};

export const chatBootstrapConfig: XmppProviderConfig =
  buildEthoraBaseChatConfig({
    chat_token: null,
  });

interface CreateChatConfigOptions {
  app: ModelApp | null;
  chatToken?: string | null;
  // Caller-provided user shape used for the chat-component's userLogin path.
  // When this is non-null AND carries xmppUsername+xmppPassword, the
  // chat-component skips the legacy `loginViaJwt` round-trip (which hits
  // /v1/users/client and requires a `type: 'client'` JWT, NOT the
  // `type: 'user'` token loginWithEmail issues - see auth.mw.ts:421+).
  //
  // For email-login QA/prod deployments this is what makes chat work at
  // all: the upstream switch to jwtLogin-only in chatBootstrap broke this
  // path because no producer mints `type: 'client'` JWTs. Falling back to
  // userLogin (driven straight by xmppUsername+xmppPassword from the
  // loginWithEmail response) sidesteps the broken exchange entirely.
  // SuperTokens-based deployments still work because they typically don't
  // have xmppUsername populated, and we only enable userLogin below when
  // both XMPP fields are non-empty.
  currentUser?: ModelCurrentUser | null;
  // Tenant-Owner override (Option A): when an admin uses the App Switcher
  // to test chats inside one of their owned apps, the chat-component is
  // rebuilt with these app-X-scoped credentials instead of the admin's
  // own base-app identity. We hand the chat-component BOTH:
  //   - userLogin.user: { xmppUsername, xmppPassword, ... } - direct
  //     XMPP bind for the owner gateway (works regardless of /v1/users/client
  //     state)
  //   - jwtLogin.token: chat JWT signed with the target app's signing
  //     context (kept for forward-compat with deployments that prefer JWT
  //     auth and have a fixed /v1/users/client; chat-component checks
  //     userLogin first anyway)
  // plus the target appToken and a refreshFunction that re-hits
  // /v2/apps/:appId/owner-session so the session extends past the 1h JWT
  // lifetime without the admin re-clicking.
  ownerOverride?: {
    appToken: string;
    chatToken: string;
    ownerSession: ModelOwnerSession;
    refreshFunction: () => Promise<{ accessToken: string; refreshToken?: string } | null>;
  };
}

// Build the userLogin.user payload for chat-component. Returns null when
// either input lacks the XMPP credentials needed for direct bind, signaling
// the caller to omit userLogin so the chat-component falls back to whatever
// other auth modes are configured.
function makeChatUserLogin(user: {
  _id?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  description?: string;
  walletAddress?: string;
  xmppUsername?: string;
  xmppPassword?: string;
  defaultWallet?: { walletAddress: string };
  token?: string;
  refreshToken?: string;
} | null | undefined): ChatUserLoginUser | null {
  if (!user) return null;
  const xmppUsername = user.xmppUsername || '';
  const xmppPassword = user.xmppPassword || '';
  if (!xmppUsername || !xmppPassword) return null;
  // Cast to ChatUserLoginUser: we provide the load-bearing fields the
  // chat-component reads (xmpp creds, name, profile image, wallet, HTTP
  // tokens) and rely on the component's own defaults for any optional
  // fields it expects.
  //
  // `token` is load-bearing for the chat-component's `/chats/my` HTTP
  // call (rooms.api.ts -> getRooms reads `chatSettingStore.user.token`
  // and uses it verbatim as the Authorization header). Without it,
  // every room-list refresh 401s and the response interceptor's refresh
  // path runs in a loop until it bails.
  return {
    xmppUsername,
    xmppPassword,
    token: user.token || '',
    refreshToken: user.refreshToken || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    profileImage: user.profileImage || '',
    description: user.description || '',
    walletAddress:
      user.walletAddress ||
      user.defaultWallet?.walletAddress ||
      '',
    defaultWallet: user.defaultWallet || { walletAddress: '' },
  } as ChatUserLoginUser;
}

export function createChatConfig({
  app,
  chatToken,
  currentUser,
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

  // Pick the user shape we'll feed userLogin.user. In owner-session mode
  // this MUST be the gateway owner (xmppUsername="${appId}_owner-..."),
  // otherwise chat-component would XMPP-bind as the base-app admin and
  // mod_ethora would reject the join into the child app's rooms. In
  // base-app mode this is the regular signed-in user; we keep it here so
  // chat-component takes the fast path and doesn't try to exchange the
  // (broken-on-this-deployment) jwtLogin.token via /v1/users/client.
  const userLoginPayload = ownerOverride
    ? makeChatUserLogin({
        ...ownerOverride.ownerSession.owner,
        // Mirror the wallet shape the chat-component expects.
        walletAddress: ownerOverride.ownerSession.owner.defaultWallet?.walletAddress || '',
        // Owner-session HTTP calls (e.g. /chats/my) need the chat JWT we
        // minted for the gateway user, NOT the admin's outer token.
        // Without this, every room-list refresh 401s because the owner
        // user object on its own carries no token.
        token: ownerOverride.ownerSession.chatTokens?.accessToken || '',
        refreshToken: ownerOverride.ownerSession.chatTokens?.refreshToken || '',
      })
    : makeChatUserLogin(currentUser);

  // Only add userLogin to the config when we have a usable payload. If we
  // unconditionally set `userLogin.enabled = true` with a null user, the
  // chat-component still treats it as an explicit login mode and skips
  // its own default-login fallback - which on SuperTokens-driven
  // deployments would prevent the jwtLogin path from running.
  if (userLoginPayload) {
    (baseConfig as ChatConfig).userLogin = {
      enabled: true,
      user: userLoginPayload,
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

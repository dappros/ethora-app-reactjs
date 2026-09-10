import { Chat, XmppProvider } from '@ethora/chat-component';
import Session from 'supertokens-web-js/recipe/session';
import { refreshWithLogoutOnFatal } from '../authRefresh';
import { phCapture } from '../posthog';
import type { ComponentProps, CSSProperties } from 'react';
import type { ModelApp, ModelCurrentUser, ModelOwnerSession } from '../models';
import { getCachedTranslateLanguages } from '../utils/uiLanguage';
type XmppProviderConfig = NonNullable<ComponentProps<typeof XmppProvider>['config']>;
type ChatConfig = NonNullable<ComponentProps<typeof Chat>['config']>;

// Shape the chat-component's `userLogin.user` actually consumes. We strip our
// frontend's internal-only fields and keep the chat-relevant ones plus
// firstName/lastName so the chat-component can render the avatar/handle for
// outgoing messages without hitting the API again.
type ChatUserLoginUser = NonNullable<NonNullable<ChatConfig['userLogin']>['user']>;

// QR deep-link base for "scan to open chat". Taken from env so each
// deployment (prod / QA / self-host) points at its own web host; falls back to
// the prod host when VITE_QR_URL is unset so existing builds are unaffected.
const DEFAULT_QR_URL =
  import.meta.env.VITE_QR_URL || 'https://app.chat.ethora.com/app/chat/?qrChatId=';

// Video/audio calls (LiveKit). Gated by VITE_VIDEO_CALLS_ENABLED, which the
// deploy system renders from features.video_calls in deploy.yml. The
// chat-component only surfaces call UI when enabled; livekitUrl points at the
// LiveKit server for the instance (VITE_LIVEKIT_URL).
const videoCallsConfig: NonNullable<ChatConfig['videoCalls']> = {
  enabled: import.meta.env.VITE_VIDEO_CALLS_ENABLED === 'true',
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL || '',
  allowedRoomTypes: ['private'],
  enableAudioCalls: true,
  startWithMicOn: true,
};
const webNotificationsConfig: NonNullable<ChatConfig['pushNotifications']> = {
  enabled: true,
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  permissionBanner: {
    enabled: true,
    showWhenBlocked: true,
  },
};
// Domain-gated push config shared by the app. Consumed by the
// chat-component's usePushNotifications hook (mounted in App so the
// permission prompt fires right after login, not only on the Chats page).
export function buildPushNotificationsConfig(): {
  enabled: boolean;
  softAsk: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
} {
  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;
  const pushEnabledByDomain = allowedDomains.includes(currentDomain);

  if (!pushEnabledByDomain) {
    return { enabled: false, softAsk: false };
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const hasFirebaseConfig = Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );

  if (!hasFirebaseConfig) {
    return { enabled: false, softAsk: false };
  }

  return { enabled: true, softAsk: false, firebaseConfig };
}

const browserLocale: string =
  (typeof navigator !== 'undefined' && navigator.language) || 'en';

// Resolve one effective locale, falling back to raw browser detection so
// deployments that never populate a choice keep working exactly as before.
//
// Two separate choices flow through here - see `appTranslate` / `chatTranslate`
// on the options interfaces below. Both come from the store (uiLanguage /
// chatLanguage); callers must pass their OWN reactive reads (see main.tsx /
// Chat.tsx) - this is a plain function, not a hook, so it can't subscribe to
// the store itself.
function resolveLocale(locale?: string | null): string {
  return locale || browserLocale;
}

// The two language inputs the chat-component takes, resolved from the app's
// two independent choices.
//
// `appTranslate` (store's uiLanguage, backend's user.appLanguage) drives
// `config.i18n.locale` - the component's static captions. It is narrowed to
// base language internally (i18n/strings.ts), and only en/fr/es/pt/ht/zh have
// built-in tables; anything else renders English captions.
//
// `chatTranslate` (store's chatLanguage, backend's user.chatLanguage) drives
// `config.translates.readerLocale` - what incoming messages are translated
// INTO, and the source language declared on this reader's own outgoing
// messages (the component syncs readerLocale into its langSource; see
// useChatWrapperInit). Any BCP-47 tag is valid here: translating INTO a
// language does not require the interface to render in it.
//
// `chatTranslate` unset means "follow the app language" - the same null the
// Profile chat-language row shows as `chatLanguageFollowingApp`.
interface ChatLanguageInputs {
  appTranslate?: string | null;
  chatTranslate?: string | null;
}

function resolveLanguageConfig({ appTranslate, chatTranslate }: ChatLanguageInputs) {
  const appLocale = resolveLocale(appTranslate);
  return {
    appLocale,
    chatLocale: resolveLocale(chatTranslate ?? appTranslate),
  };
}

type TranslatesConfig = NonNullable<ChatConfig['translates']>;

// In-chat message translation is gated on the RAW capability list from
// GET /apps/get-config (store's translateLanguages): the languages the
// separately-installed translation server can actually translate into. Empty
// means there is no translation server, and `enabled: false` is the
// chat-component's documented host switch (config.model.ts) - it turns off the
// globe picker in the header, the auto-translated bubbles, and the per-message
// Translate action in one go.
//
// Deliberately NOT the store's availableLanguages, which is what this used to
// read. That list is the raw one run through resolveAvailableLanguages, which
// falls back to the whole bundled catalogue when it can make no sense of the
// input - correct for the interface picker (something must render), wrong
// here: it turned "no translation server" into three offered languages and so
// into `enabled: true`, showing a translation UI that could never produce a
// translation. The Profile chat-language row already gated on the raw list, so
// the two now agree instead of disagreeing in exactly the unconfigured case.
//
// One language is enough to enable: translating several source languages INTO
// a single target is a real install, and the reader's own target comes from
// `readerLocale`, not from this list. Only zero means "cannot translate".
function buildTranslatesConfig(
  translateLanguages: readonly string[],
  extra: Omit<Partial<TranslatesConfig>, 'enabled'> = {}
): TranslatesConfig {
  if (translateLanguages.length === 0) {
    return { enabled: false };
  }
  return { mode: 'auto', ...extra, enabled: true };
}

const getRoomListStyles = () =>
  ({
    maxHeight: 'calc(100%)',
    height: 'calc(100%)',
    borderRadius: '16px 0px 0px 16px',
    border: 'none',
    padding: '16px',
    paddingTop: '0px',
    color: '#141414',
  }) satisfies CSSProperties;

const chatRoomStyles = {
  maxHeight: 'calc(100%)',
  height: 'calc(100%)',
  borderRadius: '0px 16px 16px 0px',
  color: '#141414',
} satisfies CSSProperties;

// The app-wide provider (main.tsx) takes the same two language inputs as the
// Chats page: it is mounted above the router, so in-app notification toasts
// and any chat surface outside /chat read ITS config, and leaving it on raw
// browser detection made those disagree with the page the user was looking at.
// Safe to re-supply on change: the provider's XMPP init effect deps are the
// connection fields only (xmppProvider.tsx), so a language switch re-dispatches
// the config without reconnecting.
interface BuildEthoraBaseChatConfigProps extends ChatLanguageInputs {
  chat_token?: string | null;
  currentUser?: ModelCurrentUser | null;
  primaryColor?: string | null;
  // What the install's translation server can translate into (store's
  // translateLanguages, from GET /apps/get-config). Drives whether message
  // translation is enabled at all - see buildTranslatesConfig. Callers must
  // pass their OWN reactive `useAppStore((s) => s.translateLanguages)` read and
  // include it in their useMemo deps (see main.tsx) - this is a plain function,
  // not a hook. Omitted, we fall back to the last list the server told us
  // about, which is empty until the first get-config of the install.
  translateLanguages?: readonly string[] | null;
}

export const buildEthoraBaseChatConfig = ({
  chat_token,
  currentUser,
  primaryColor,
  translateLanguages,
  appTranslate,
  chatTranslate,
}: BuildEthoraBaseChatConfigProps): XmppProviderConfig => {
  const { appLocale, chatLocale } = resolveLanguageConfig({
    appTranslate,
    chatTranslate,
  });
  const offeredTranslations =
    translateLanguages ?? getCachedTranslateLanguages();
  const userLoginPayload = makeChatUserLogin(currentUser);
  const baseUrl = import.meta.env.VITE_API.split("/v1")[0];
  const config: XmppProviderConfig = {
    baseUrl: baseUrl,
    appId: currentUser?.appId || '',
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

          if (refreshed) {
            const tokenPayload = await Session.getAccessTokenPayloadSecurely();
            const nextChatToken = tokenPayload?.chat_user_jwt_token;

            if (nextChatToken && typeof nextChatToken === 'string') {
              return { accessToken: nextChatToken };
            }
          }
        } catch {
          // SuperTokens isn't configured on every deployment — fall through
          // to the Ethora refresh below.
        }

        try {
          // Logout-on-fatal matters here: if this silently returned null on
          // a dead refresh token, the chat-component would log ITSELF out,
          // then re-login from the same stale config.userLogin.user and
          // retry — while the dashboard session stayed "alive" and kept
          // feeding it dead credentials. A fatal verdict must end the
          // dashboard session too.
          const rotated = await refreshWithLogoutOnFatal();
          return {
            accessToken: rotated.token,
            xmppPassword: rotated.xmppPassword,
            fileToken: rotated.fileToken,
          };
        } catch {
          return null;
        }
      },
    },
    // initBeforeLoad runs the chat-component's own bootstrap (resolve
    // user -> XMPP bind -> connect WS -> fetch private store -> preload
    // history) before <Chat/> mounts, so unread counts are correct on
    // first render. We only enable it once we have a userLogin payload
    // with xmpp creds; without those, NB() falls back to the broken
    // /v1/users/client jwt-exchange path on email-login deployments.
    initBeforeLoad: Boolean(userLoginPayload),
    videoCalls: videoCallsConfig,
    // In-app message notifications (toasts). Enabled here, on the app-wide
    // XmppProvider (mounted above the router in main.tsx), so they fire on
    // any page - not only while the Chats page is open.
    inAppNotifications: {
      enabled: true,
      showInContext: true,
    },
    pushNotifications: webNotificationsConfig,
    // Static UI localization + dynamic message translation, from the two
    // independent choices (see ChatLanguageInputs).
    i18n: { locale: appLocale },
    translates: buildTranslatesConfig(offeredTranslations, {
      readerLocale: chatLocale,
    }),
    colors: {
      primary: primaryColor || '#0052CD',
      secondary: '#141414',
    },
  };
  if (userLoginPayload) {
    (config as ChatConfig).userLogin = {
      enabled: true,
      user: userLoginPayload,
    };
  }
  return config;
};

export const chatBootstrapConfig: XmppProviderConfig =
  buildEthoraBaseChatConfig({
    chat_token: null,
  });

interface CreateChatConfigOptions extends ChatLanguageInputs {
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
    refreshFunction: () => Promise<{
      accessToken: string;
      refreshToken?: string;
      xmppPassword?: string;
      fileToken?: string;
    } | null>;
  };
  // Reactive mobile-viewport flag (from useIsMobileView). Drives the
  // room-list top padding so it updates on resize, not just at load.
  isMobileView?: boolean;
  // What the install's translation server can translate into (store's
  // translateLanguages). Gates in-chat message translation - see
  // buildTranslatesConfig. Same reactivity caveat as the language inputs: pass
  // a live `useAppStore((s) => s.translateLanguages)` read and list it in the
  // useMemo deps (see Chat.tsx).
  translateLanguages?: readonly string[] | null;
}

// Build the userLogin.user payload for chat-component. Returns null when
// either input lacks the XMPP credentials needed for direct bind, signaling
// the caller to omit userLogin so the chat-component falls back to whatever
// other auth modes are configured.
function makeChatUserLogin(user: {
  _id?: string;
  appId?: string;
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
  fileToken?: string;
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
    // Signs secure-files.* URLs at render time (appendFileToken). Empty
    // here means every /v2/files/secure image loads unsigned and 403s.
    fileToken: user.fileToken || '',
    appId: user.appId || '',
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
  appTranslate,
  chatTranslate,
  translateLanguages,
  // isMobileView: kept in the options contract (Chat.tsx still passes it)
  // but no longer read here - getRoomListStyles() dropped its
  // mobile-conditional padding upstream. Not destructured to a local so
  // it doesn't trip noUnusedLocals.
}: CreateChatConfigOptions): ChatConfig {
  // When we're in owner-session mode we have to override BOTH the chat
  // token (XMPP identity) AND the refreshFunction; the default refresh
  // calls SuperTokens which doesn't know about the owner user. Failing to
  // override the refresh would result in the chat-component silently
  // logging the owner out after ~1h with no recovery path.
  const offeredTranslations =
    translateLanguages ?? getCachedTranslateLanguages();
  const { appLocale, chatLocale } = resolveLanguageConfig({
    appTranslate,
    chatTranslate,
  });
  const baseConfig = buildEthoraBaseChatConfig({
    chat_token: ownerOverride?.chatToken ?? chatToken,
    translateLanguages,
    appTranslate,
    chatTranslate,
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
      primary: app?.primaryColor || '#0052CD',
      secondary: '#141414',
    },
    qrUrl: DEFAULT_QR_URL,
    roomListStyles: getRoomListStyles(),
    chatRoomStyles,
    chatHeaderSettings: {
      disableMenu: true,
      disableCreate: app?.allowUsersToCreateRooms === false,
    },
    defaultRooms: app?.defaultRooms || [],
    eventHandlers: {
      onMessageSent: ({ roomJID, messageType, metadata }) => {
        // The chat component reports the MIME type as metadata.fileType - it
        // never sets metadata.mimetype - so reading that key classified every
        // upload as 'file'. fileData is the File itself, kept as a fallback.
        const meta = metadata as
          | { fileType?: string; fileData?: { type?: string } }
          | undefined;
        const mimetype = String(meta?.fileType || meta?.fileData?.type || '');
        phCapture('chat_message_sent', {
          room_id: roomJID,
          message_type:
            messageType === 'media'
              ? mimetype.startsWith('image')
                ? 'image'
                : 'file'
              : 'text',
        });
      },
    },
    setRoomJidInPath: true,
    enableRoomsRetry: { enabled: false, helperText: '' },
    inAppNotifications: {
      enabled: true,
      showInContext: true,
      position: {
        horizontal: 'left',
        vertical: 'bottom',
        offset: {
          left: 20,
          bottom: 20,
        },
      },
    },
    pushNotifications: webNotificationsConfig,
    i18n: { locale: appLocale },
    translates: buildTranslatesConfig(offeredTranslations, {
      readerLocale: chatLocale,
      showLanguageSelector: true,
      showLanguageList: false,
    }),
  };
}

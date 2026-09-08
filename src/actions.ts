import { markSessionKilled, refreshWithLogoutOnFatal } from './authRefresh';
import {
  getExportCsv,
  httpCreateNewApp,
  httpDeleteManyUsers,
  httpGetApps,
  httpGetConfig,
  httpGetUsers,
  httpPostFile,
  httpUploadFirebaseServiceAccount,
  httpDeleteFirebaseServiceAccount,
  httpUploadApnsKey,
  httpDeleteApnsKey,
  ApnsKeyUpload,
  httpResetPasswords,
  httpTokens,
  httpUpdateApp,
  httpUpdateUser,
  httpUpdateUserLanguages,
  // Phase 1 (Agents)
  httpListAgents,
  httpGetAgent,
  httpCreateAgent,
  httpUpdateAgent,
  httpDeleteAgent,
  httpCloneAgent,
  httpSetAgentVisibility,
  httpUpdateAgentSoul,
  httpInviteAgentToChat,
  httpListBotInstances,
  httpSetBotInstanceStatus,
  httpGetOwnerSession,
} from './http';
import {
  UiLocale,
  canonicalizeLocale,
  resolveAvailableLanguages,
} from './constants/languageOptionsConstants';
import { ModelApp, ModelCurrentUser, ModelOwnerSession, OrderByType } from './models';
import { phCapture, phIdentify, phReset } from './posthog';
import { useAppStore } from './store/useAppStore';
import { getFirebaseConfigFromString } from './utils/getFbConfig';
import { sleep } from './utils/sleep';
import { resolveSessionUiLanguage } from './utils/uiLanguage';

const getState = useAppStore.getState;

export async function actionGetConfig(domainName?: string) {
  const state = getState();
  const response = await httpGetConfig(domainName);
  const result = response?.data?.result;

  if (!result) {
    throw new Error(
      `App config response is missing result for domainName=${domainName || '<origin>'}`
    );
  }

  const app: ModelApp = {
    afterLoginPage: result.afterLoginPage,
    appToken: result.appToken,
    bundleId: result.bundleId,
    coinName: result.coinName,
    coinSymbol: result.coinSymbol,
    createdAt: result.createdAt,
    creatorId: result.creatorId,
    defaultAccessAssetsOpen: result.defaultAccessAssetsOpen,
    defaultAccessProfileOpen: result.defaultAccessProfileOpen,
    defaultRooms: result.defaultRooms,
    displayName: result.displayName,
    domainName: result.domainName,
    isAllowedNewAppCreate: result.isAllowedNewAppCreate,
    isBaseApp: result.isBaseApp,
    logoImage: result.logoImage,
    sublogoImage: result.sublogoImage,
    appTagline: result.appTagline,
    signonOptions: result.signonOptions,
    stats: result.stats,
    systemChatAccount: result.systemChatAccount,
    _id: result._id,
    usersCanFree: result.usersCanFree,
    updatedAt: result.updatedAt,
    primaryColor: result.primaryColor,
    parentAppId: result.parentAppId,
    availableMenuItems: result.availableMenuItems,
    googleServicesJson: result.googleServicesJson,
    googleServiceInfoPlist: result.googleServiceInfoPlist,
    firebaseConfigParsed: getFirebaseConfigFromString(
      result.firebaseWebConfigString
    ),
    appSecret: '',
    allowUsersToCreateRooms: result.allowUsersToCreateRooms,
    // Apps created before the backend gained this field send nothing; absent
    // means registration is allowed.
    userRegistrationDisabled: result.userRegistrationDisabled ?? false,
    aiBot: result.aiBot,
  };

  // Install-wide, not part of ModelApp: what the separately-deployed
  // translation server can translate into. Absent on an API that predates the
  // field, which reads the same as "no translation server" - the chat language
  // picker stays hidden either way.
  const translateLanguages: string[] = Array.isArray(result.translateLanguages)
    ? result.translateLanguages
    : [];
  state.doSetTranslateLanguages(translateLanguages);
  // get-config is now the ONLY place a language list arrives - the session
  // bootstrap stopped carrying a `languages` block. The same list feeds both
  // pickers with different narrowings: the interface can only offer locales the
  // bundle ships dictionaries for (resolveAvailableLanguages drops the rest,
  // since an unbundled one would render in English), while the chat picker
  // offers the list whole, because translating INTO a language does not require
  // the UI to render in it.
  state.doSetAvailableLanguages(
    resolveAvailableLanguages(translateLanguages).map((l) => l.id)
  );

  await sleep(1000);
  httpTokens.appJwt = result.appToken;
  state.doSetCurrentApp(app);
}

// Adopt the install's language catalogue and the user's stored choice from a
// session-bootstrap payload (login / me). Both the list and the choice are
// server-owned; this is the one place a response turns into store state, so
// login and page-reload can't drift apart.
//
// Deliberately writes through doSetUiLanguage (local only) rather than
// actionSetUiLanguage: the value came FROM the server, echoing it back would
// be a pointless write on every page load.
interface SessionLanguagePayload {
  user?: { appLanguage?: string | null; chatLanguage?: string | null };
}

function applySessionLanguages(data: SessionLanguagePayload) {
  const state = getState();

  // The offered list is no longer in this payload - the API stopped sending a
  // `languages` block, and get-config is the single source. Read what
  // actionGetConfig already put in the store rather than re-deriving it here.
  const offered = state.availableLanguages;

  const next = resolveSessionUiLanguage(
    data?.user?.appLanguage,
    // No install default arrives any more either; resolveSessionUiLanguage
    // falls through to the current value, then to the first offered locale.
    null,
    offered,
    state.uiLanguage
  );
  if (next !== state.uiLanguage) {
    state.doSetUiLanguage(next);
  }

  // Chat language is adopted verbatim rather than defaulted: null means "never
  // chosen", which callers read as "follow the app language" - the same rule
  // the backend's resolveUserChatLanguage() applies.
  //
  // Not narrowed against `offered`: that is the bundle-renderable subset, and
  // the chat language is validated against the full translation-server list
  // instead. Narrowing here would silently discard a legitimate choice - a user
  // translating into a language the UI does not render in. Only the canonical
  // form is enforced; the Profile picker checks it against what the translator
  // actually supports.
  const storedChat = canonicalizeLocale(data?.user?.chatLanguage);
  state.doSetChatLanguage(storedChat || null);
}

// User-initiated language change: apply it locally first so the UI switches
// instantly, then persist it to the profile. A failed write is surfaced by the
// caller - the local choice is kept either way, so a flaky network degrades to
// the old localStorage-only behaviour rather than silently reverting the UI.
export async function actionSetUiLanguage(language: UiLocale) {
  const state = getState();
  state.doSetUiLanguage(language);

  const currentUser = state.currentUser;
  if (!currentUser) return;

  await httpUpdateUserLanguages({ appLanguage: language });
  state.doUpdateUser({ appLanguage: language });
}

// The chat-message translation language. Unlike the UI language there is
// nothing to apply locally first - no caption re-renders on this - so the
// store is updated only once the write lands, and a failed write leaves the
// previous value in place for the caller to report.
export async function actionSetChatLanguage(language: string) {
  const state = getState();

  const currentUser = state.currentUser;
  if (!currentUser) return;

  await httpUpdateUserLanguages({ chatLanguage: language });
  state.doSetChatLanguage(language);
  state.doUpdateUser({ chatLanguage: language });
}

export async function actionAfterLogin(data: any) {
  const state = getState();

  httpTokens.token = data.token;
  httpTokens.refreshToken = data.refreshToken;

  // Safely handle defaultWallet - it might be missing or undefined
  const walletAddress = data.user?.defaultWallet?.walletAddress || '';

  const user: ModelCurrentUser = {
    _id: data.user._id,
    appId: data.user.appId,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email || '',
    homeScreen: data.user.homeScreen,
    isAgreeWithTerms: data.user.isAgreeWithTerms,
    isAssetsOpen: data.user.isAssetsOpen,
    isProfileOpen: data.user.isProfileOpen,
    refreshToken: data.refreshToken,
    token: data.token,
    wsToken: data.wsToken || '',
    fileToken: data.fileToken || '',
    xmppPassword: data.user.xmppPassword,
    walletAddress: walletAddress,
    profileImage: data.user.profileImage,
    description: data.user.description,
    defaultWallet: {
      walletAddress: walletAddress,
    },
    xmppUsername: data.user.xmppUsername,
    appLanguage: data.user.appLanguage ?? '',
    chatLanguage: data.user.chatLanguage ?? '',
  };

  if (data.user.isSuperAdmin) {
    user.isSuperAdmin = data.user.isSuperAdmin;
  }

  // Every auth path funnels through here - fresh logins (email / google /
  // facebook / metamask), signup, and the session restore in useTrackUrl -
  // so this single identify covers both "login" and "refresh with a valid
  // token" without extra call sites.
  phIdentify(data.user._id, {
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    created_at: data.user.createdAt,
  });

  state.doSetUser(user);
  applySessionLanguages(data);
  // await actionBootsrap()
}

export async function actionRefreshUserFromLocalStorage(
  user: ModelCurrentUser
) {
  const state = getState();

  await refreshWithLogoutOnFatal();

  state.doSetUser(user);

}

export async function actionBootsrap() {
  const state = getState();
  const {
    data: { apps },
  } = await httpGetApps({});
  state.doSetApps(apps);
}

// Load every app the current admin owns (no pagination), into the
// dedicated `ownedApps` slot. Used by the Chats App Switcher dropdown,
// which must always show every owned app regardless of which page of
// AdminApps was last visited.
//
// The default `apps` slot is intentionally not touched: AdminApps
// paginates writes to it (limit=10 + offset) and we don't want the
// dropdown to clobber that view.
//
// 200 is well above the practical tenant size for this product but low
// enough that we won't accidentally pull half the database if the API
// ignores the limit. Bump if you ever see a tenant hit it.
export async function actionLoadOwnedApps() {
  const state = getState();
  const {
    data: { apps },
  } = await httpGetApps({ limit: 200, offset: 0, order: 'asc', orderBy: 'displayName' });
  state.doSetOwnedApps(apps);
}

export async function actionCreateApp(displayName: string) {
  const state = getState();
  const { data } = await httpCreateNewApp(displayName);
  state.doAddApp(data.app);

  return data.app;
}

export async function actionPostFile(file: File) {
  return httpPostFile(file);
}

export async function actionGetUsers(
  appId: string,
  limit: number = 10,
  offset: number = 0,
  orderBy: OrderByType = 'lastName',
  order: 'asc' | 'desc' = 'asc',
  lifecycle?: { status?: 'archived'; includeArchived?: boolean }
) {
  return httpGetUsers(appId, limit, offset, orderBy, order, lifecycle);
}

export async function actionDeleteManyUsers(
  appId: string,
  usersIdList: Array<string>
) {
  return httpDeleteManyUsers(appId, usersIdList);
}

export async function actionResetPasswords(
  appId: string,
  usersIdList: Array<string>
) {
  return httpResetPasswords(appId, usersIdList);
}

export async function actionUpdateApp(appId: string, options: any) {
  const response = await httpUpdateApp(appId, options);
  const state = getState();
  state.doUpdateApp(response.data.result);
}

function setFirebaseServiceAccountFlag(appId: string, uploaded: boolean) {
  const state = getState();
  const app = state.apps.find((el) => el._id === appId);

  if (app) {
    state.doUpdateApp({ ...app, firebaseServiceAccountUploaded: uploaded });
  }
}

export async function actionUploadFirebaseServiceAccount(
  appId: string,
  file: File
) {
  await httpUploadFirebaseServiceAccount(appId, file);
  setFirebaseServiceAccountFlag(appId, true);
}

export async function actionDeleteFirebaseServiceAccount(appId: string) {
  await httpDeleteFirebaseServiceAccount(appId);
  setFirebaseServiceAccountFlag(appId, false);
}

function setApnsKeyFlag(appId: string, uploaded: boolean) {
  const state = getState();
  const app = state.apps.find((el) => el._id === appId);

  if (app) {
    state.doUpdateApp({ ...app, apnsKeyUploaded: uploaded });
  }
}

export async function actionUploadApnsKey(appId: string, input: ApnsKeyUpload) {
  await httpUploadApnsKey(appId, input);
  setApnsKeyFlag(appId, true);
}

export async function actionDeleteApnsKey(appId: string) {
  await httpDeleteApnsKey(appId);
  setApnsKeyFlag(appId, false);
}

export async function actionUpdateUser(fd: FormData) {
  const {
    data: { user },
  } = await httpUpdateUser(fd);
  phCapture('profile_updated', {
    fields_changed: [...new Set(fd.keys())],
  });
  const state = getState();
  state.doUpdateUser({
    firstName: user.firstName,
    lastName: user.lastName,
    description: user.description,
    profileImage: user.profileImage,
    isAssetsOpen: user.isAssetsOpen,
    isProfileOpen: user.isProfileOpen,
    appLanguage: user.appLanguage ?? '',
    chatLanguage: user.chatLanguage ?? '',
  });
  return {
    profileImage: user.profileImage,
  };
}

let logoutStarted = false;

export function actionLogout() {
  if (logoutStarted) return null;
  logoutStarted = true;
  markSessionKilled();
  phReset();
  localStorage.clear();
  window.location.replace('/login');
  return null;
}

export const actionGetCsvFile = async (appId: string): Promise<any> => {
  try {
    const result = await getExportCsv(appId);

    return result;
  } catch (e) {
    console.error(e);
  }
};


export async function actionListAgents(params?: { visibility?: 'public' | 'mine' | 'all'; appId?: string }) {
  const resp = await httpListAgents(params);
  const items = resp.data?.items || [];
  const state = getState();
  state.doSetAgents(items);
  return items;
}

export async function actionCreateAgent(body: any) {
  const resp = await httpCreateAgent(body);
  const agent = resp.data?.agent;
  if (agent) {
    const state = getState();
    state.doUpsertAgent(agent);
    state.doSelectAgent(agent.id);
  }
  return agent;
}

export async function actionUpdateAgent(idOrAddress: string, body: any) {
  const resp = await httpUpdateAgent(idOrAddress, body);
  const agent = resp.data?.agent;
  if (agent) {
    getState().doUpsertAgent(agent);
  }
  return agent;
}

export async function actionDeleteAgent(idOrAddress: string) {
  await httpDeleteAgent(idOrAddress);
  getState().doRemoveAgent(idOrAddress);
}

export async function actionCloneAgent(idOrAddress: string, body?: any) {
  const resp = await httpCloneAgent(idOrAddress, body);
  const agent = resp.data?.agent;
  if (agent) {
    getState().doUpsertAgent(agent);
  }
  return agent;
}

export async function actionSetAgentVisibility(idOrAddress: string, visibility: 'private' | 'unlisted' | 'public') {
  const resp = await httpSetAgentVisibility(idOrAddress, visibility);
  const agent = resp.data?.agent;
  if (agent) getState().doUpsertAgent(agent);
  return agent;
}

export async function actionUpdateAgentSoul(idOrAddress: string, body: { soulMd?: string; append?: string }) {
  const resp = await httpUpdateAgentSoul(idOrAddress, body);
  const agent = resp.data?.agent;
  if (agent) getState().doUpsertAgent(agent);
  return agent;
}

export async function actionInviteAgentToChat(idOrAddress: string, body: { appId?: string; chatId?: string; chatJid?: string }) {
  const resp = await httpInviteAgentToChat(idOrAddress, body);
  return resp.data;
}

export async function actionListBotInstances(params?: { appId?: string; agentId?: string }) {
  const resp = await httpListBotInstances(params);
  const items = resp.data?.items || [];
  getState().doSetBotInstances(items);
  return items;
}

export async function actionSetBotInstanceStatus(id: string, status: 'on' | 'off') {
  const resp = await httpSetBotInstanceStatus(id, status);
  // The list can be small; refresh it to keep UI consistent.
  return resp.data?.botInstance;
}

export async function actionGetAgent(idOrAddress: string) {
  const resp = await httpGetAgent(idOrAddress);
  const agent = resp.data?.agent;
  if (agent) getState().doUpsertAgent(agent);
  return agent;
}

// ---------------------------------------------------------------------------
// Tenant-Owner App Switcher (Option A): switch the Chats page context to one
// of the admin's owned apps. The admin's outer auth (cookies + token-538) is
// untouched; we only swap the chat-component's per-app credentials.
// ---------------------------------------------------------------------------

// In-flight de-dup map keyed by appId. Multiple call sites can race to
// switch into the same app: AdminApp's "Chats" tab onClick fires the
// switch eagerly so the request is in flight while React Router navigates,
// and Chat.tsx's hydration useEffect *also* fires it on mount when it
// sees a persisted chatAppId without a matching ownerSession yet. Without
// de-dup, both calls reach the backend and both pass the
// (admin, app) findOne -> both create a Mongo gateway row -> one of the
// two registerXmppuser calls hits ejabberd's already_registered branch,
// surfacing as a 502 toast even though the other call succeeded.
//
// The per-key Promise lives only for the duration of one round-trip.
const inFlightOwnerSessions = new Map<string, Promise<ModelOwnerSession | null>>();

// Switch to a specific app: lazily provision (or re-mint) the owner-session
// for that app and store it. Pass `null` to revert to the base-app end-user
// identity. Returns the freshly-stored session, or null if we cleared it.
//
// Contract: this is the *only* place chatAppId and ownerSession should be
// mutated together. Components that just need to react to a switch should
// subscribe to those slots in the store.
export async function actionSwitchChatApp(
  appId: string | null
): Promise<ModelOwnerSession | null> {
  const state = getState();

  // Force the chat-component's parent <XmppProvider/> to disconnect its
  // current XmppClient and clear it from context. Without this step the
  // provider is a singleton at the app root and its `client` state
  // survives MemoizedChat's key-driven remount; useChatWrapperInit then
  // sees an existing client and reuses it (chat-component's
  // useChatWrapperInit.ts:411-412 unconditionally `setClient(client)`
  // without checking whether the JID matches the new user). The reused
  // client is bound to the previous app's user, so its room presence
  // stanzas hit mod_ethora's prefix check and get rejected with
  // "wrong app name" -> presence_timeout -> the new context can't enter
  // any rooms or create new ones.
  //
  // The chat-component already listens for `ethora-xmpp-logout` to do
  // exactly this disconnect+reset (xmppProvider.tsx:374). Reusing that
  // event keeps the cleanup logic in one place.
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('ethora-xmpp-logout'));
    } catch {
      // Older browsers / non-window envs - non-fatal.
    }
  }

  if (!appId) {
    // Revert to base-app user. We keep the localStorage entry cleared so
    // the next boot starts fresh.
    state.doSetChatAppId(null);
    state.doSetOwnerSession(null);
    return null;
  }

  // Optimistic: persist the chosen app immediately so a refresh during the
  // round-trip still lands the user back on the right context.
  state.doSetChatAppId(appId);

  const existing = inFlightOwnerSessions.get(appId);
  if (existing) return existing;

  const promise = (async () => {
    // The owner-session response shape is `{appId, appToken, chatTokens, owner, created}`.
    // We trust the server contract (validated by the v2 envelope mw) and let
    // any axios error bubble so the caller (Chat.tsx) can render an error
    // banner instead of silently rendering an empty chat.
    const resp = await httpGetOwnerSession(appId);
    const data = resp.data || {};
    if (!data.owner || !data.chatTokens?.accessToken) {
      throw new Error('owner-session response missing required fields');
    }

    const session: ModelOwnerSession = {
      appId: data.appId,
      appToken: data.appToken,
      chatTokens: data.chatTokens,
      owner: data.owner,
    };
    getState().doSetOwnerSession(session);
    return session;
  })();

  inFlightOwnerSessions.set(appId, promise);
  try {
    return await promise;
  } finally {
    // Clear regardless of outcome so retries after failure aren't
    // permanently joined to a rejected promise.
    inFlightOwnerSessions.delete(appId);
  }
}

// Re-mint the chat tokens for the *currently-selected* app. Used by the
// chat-component's `refreshFunction` when its access token is about to
// expire. No-op if there's no active owner session (we fall through to the
// regular refresh path).
export async function actionRefreshOwnerSession(): Promise<ModelOwnerSession | null> {
  const state = getState();
  if (!state.chatAppId || !state.ownerSession) return null;

  // Same endpoint, same idempotent contract. The server fetches the
  // existing owner row (no new provisioning side-effects) and returns a
  // fresh JWT pair. We replace `ownerSession` so any component reading it
  // picks up the new tokens on next render.
  return actionSwitchChatApp(state.chatAppId);
}

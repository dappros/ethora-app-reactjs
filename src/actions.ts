import { localStorageConstants } from './constants/localStorageConstants';
import {
  getExportCsv,
  httpCreateNewApp,
  httpDeleteManyUsers,
  httpGetApps,
  httpGetConfig,
  httpGetUsers,
  httpPostFile,
  httpResetPasswords,
  httpTokens,
  httpUpdateApp,
  httpUpdateUser,
  refreshToken,
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
import { ModelApp, ModelCurrentUser, ModelOwnerSession, OrderByType } from './models';
import { useAppStore } from './store/useAppStore';
import { getFirebaseConfigFromString } from './utils/getFbConfig';
import { sleep } from './utils/sleep';

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
    aiBot: result.aiBot,
  };

  await sleep(1000);
  httpTokens.appJwt = result.appToken;
  state.doSetCurrentApp(app);
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
    homeScreen: data.user.homeScreen,
    isAgreeWithTerms: data.user.isAgreeWithTerms,
    isAssetsOpen: data.user.isAssetsOpen,
    isProfileOpen: data.user.isProfileOpen,
    lastName: data.user.lastName,
    refreshToken: data.refreshToken,
    token: data.token,
    wsToken: data.wsToken || '',
    xmppPassword: data.user.xmppPassword,
    walletAddress: walletAddress,
    profileImage: data.user.profileImage,
    description: data.user.description,
    defaultWallet: {
      walletAddress: walletAddress,
    },
    xmppUsername: data.user.xmppUsername,
  };

  if (data.user.isSuperAdmin) {
    user.isSuperAdmin = data.user.isSuperAdmin;
  }

  state.doSetUser(user);
  // await actionBootsrap()
}

export async function actionRefreshUserFromLocalStorage(
  user: ModelCurrentUser
) {
  const state = getState();

  const refreshed = await refreshToken();

  httpTokens.token = refreshed.token;
  httpTokens.wsToken = refreshed.wsToken;
  httpTokens.refreshToken = refreshed.refreshToken;

  const localStorageUser: ModelCurrentUser = {
    _id: user._id,
    appId: user.appId,
    firstName: user.firstName,
    homeScreen: user.homeScreen,
    isAgreeWithTerms: false,
    isAssetsOpen: false,
    isProfileOpen: false,
    lastName: user.lastName,
    refreshToken: refreshed.refreshToken,
    token: refreshed.token,
    wsToken: refreshed.wsToken,
    xmppPassword: user.xmppPassword,
    walletAddress: user.defaultWallet.walletAddress,
    profileImage: user.profileImage,
    description: user.description,
    defaultWallet: {
      walletAddress: user.defaultWallet.walletAddress,
    },
    xmppUsername: user.xmppUsername,
  };

  if (user.isSuperAdmin) {
    localStorageUser.isSuperAdmin = user.isSuperAdmin;
  }

  state.doSetUser(user);
  localStorage.setItem(localStorageConstants.ETHORA_USER, JSON.stringify(user));
  // await actionBootsrap()
}

export async function actionBootsrap() {
  const state = getState();
  const {
    data: { apps },
  } = await httpGetApps({});
  state.doSetApps(apps);
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
  order: 'asc' | 'desc' = 'asc'
) {
  return httpGetUsers(appId, limit, offset, orderBy, order);
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

export async function actionUpdateUser(fd: FormData) {
  const {
    data: { user },
  } = await httpUpdateUser(fd);
  const state = getState();
  state.doUpdateUser({
    firstName: user.firstName,
    lastName: user.lastName,
    description: user.description,
    profileImage: user.profileImage,
    isAssetsOpen: user.isAssetsOpen,
    isProfileOpen: user.isProfileOpen,
  });
  return {
    profileImage: user.profileImage,
  };
}

export function actionLogout() {
  localStorage.clear();
  window.location.pathname = '/login';
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

// ---------------------------------------------------------------------------
// Phase 1 (Agents): actions for the new AI Bots admin tab.
// ---------------------------------------------------------------------------

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

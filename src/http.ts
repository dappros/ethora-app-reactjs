import axios, { AxiosInstance } from 'axios';
import { actionLogout } from './actions';
import { ModelUserACL, OrderByType } from './models';

export const httpTokens = {
  appJwt: '',
  _token: localStorage.getItem('token-538') || '',
  _wsToken: '',
  _refreshToken: localStorage.getItem('refreshToken-538') || '',
  set refreshToken(token: string) {
    localStorage.setItem('refreshToken-538', token);
    this._refreshToken = token;
  },
  get refreshToken() {
    return this._refreshToken;
  },
  set token(newToken: string) {
    localStorage.setItem('token-538', newToken);
    this._token = newToken;
  },
  get token() {
    return this._token;
  },
  set wsToken(wsToken: string) {
    this._wsToken = wsToken;
  }
};

// Use relative URLs in development to leverage Vite proxy, full URLs in production
const getBaseURL = (envVar: string | undefined, defaultPath: string) => {
  if (import.meta.env.DEV) {
    // In development, use relative URLs to go through Vite proxy
    return defaultPath;
  }
  // In production, use the full URL from env
  return envVar || defaultPath;
};

export const http = axios.create({
  baseURL: getBaseURL(import.meta.env.VITE_API, '/v1'),
  timeout: 30000, // 30 seconds timeout
});

export const httpV2 = axios.create({
  baseURL: getBaseURL(import.meta.env.VITE_API_V2, '/v2'),
  timeout: 30000, // 30 seconds timeout
});

// v2 client that authenticates as "app" (appJwt) and does NOT do user refresh/logout flows.
export const httpV2App = axios.create({
  baseURL: getBaseURL(import.meta.env.VITE_API_V2, '/v2'),
  timeout: 30000,
});

function getAppJwt(): string {
  let appJwt = httpTokens.appJwt;
  if (!appJwt && typeof window !== 'undefined' && (window as any).useAppStore) {
    const appToken = (window as any).useAppStore.getState()?.currentApp?.appToken;
    if (appToken) {
      appJwt = appToken;
      httpTokens.appJwt = appToken;
    }
  }
  return appJwt || '';
}

function getCurrentAppId(): string {
  if (typeof window !== 'undefined' && (window as any).useAppStore) {
    const currentApp = (window as any).useAppStore.getState()?.currentApp;
    return currentApp?._id || currentApp?.appId || '';
  }
  return '';
}

const AUTH_WHITELIST: Array<string | RegExp> = [
  '/apps/get-config', // App config doesn't require user auth
  '/users/login-with-email',
  '/users/login',
  /^\/users\/checkEmail\//,
  '/users/sign-up-with-email',
  '/v2/users/sign-up-with-email', // V2 signup endpoint
  '/users/sign-up-resend-email',
  '/users/forgot',
  '/users/reset',
];

function isWhitelisted(url: string | undefined, method?: string) {
  if (!url) return false;
  if (url === '/users' && method && method.toLowerCase() === 'post') {
    return true;
  }
  return AUTH_WHITELIST.some((rule) => {
    if (typeof rule === 'string') {
      return url === rule;
    }
    return (rule as RegExp).test(url);
  });
}

function shouldInjectAppIdInBody(url: string | undefined, method?: string) {
  if (!url) return false;
  const m = (method || 'get').toLowerCase();
  if (url === '/users' && m === 'post') return true;
  if (url === '/users/login' && m === 'post') return true;
  if (url === '/users/login-with-email' && m === 'post') return true;
  if (url === '/users/sign-up-with-email' && m === 'post') return true;
  if (url === '/users/sign-up-resend-email' && m === 'post') return true;
  if (url === '/users/forgot' && m === 'post') return true;
  return false;
}

function shouldInjectAppIdInQuery(url: string | undefined, method?: string) {
  if (!url) return false;
  const m = (method || 'get').toLowerCase();
  return m === 'get' && /^\/users\/checkEmail\//.test(url);
}

function attachAuthInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    if (config.url === '/users/login/refresh') {
      return config;
    }

    if (isWhitelisted(config.url, config.method)) {
      config.headers = config.headers || {};
      const appId = getCurrentAppId();

      if (shouldInjectAppIdInBody(config.url, config.method)) {
        const body =
          config.data && typeof config.data === 'object' && !(config.data instanceof FormData)
            ? config.data
            : {};
        if (!(body as any).appId && appId) {
          (body as any).appId = appId;
        }
        config.data = body;
      }

      if (shouldInjectAppIdInQuery(config.url, config.method)) {
        const params = config.params && typeof config.params === 'object' ? config.params : {};
        if (!(params as any).appId && appId) {
          (params as any).appId = appId;
        }
        config.params = params;
      }

      // Keep legacy appJwt auth for backward compatibility during migration.
      let appJwt = httpTokens.appJwt;
      if (!appJwt && typeof window !== 'undefined' && (window as any).useAppStore) {
        const appToken = (window as any).useAppStore.getState()?.currentApp?.appToken;
        if (appToken) {
          appJwt = appToken;
          httpTokens.appJwt = appToken; // Cache it for next time
        }
      }
      
      if (appJwt) {
        (config.headers as any).Authorization = appJwt;
      }

      if (!appId && !appJwt) {
        console.warn('App context is not set. Public auth bootstrap requests should include appId; legacy appJwt fallback is also unavailable.');
      }
      return config;
    }

    config.headers = config.headers || {};
    (config.headers as any).Authorization = httpTokens.token;
    return config;
  }, null);

  client.interceptors.response.use(null, async (error) => {
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }
    const request = error.config;
    const url = request.url;

    if (
      url === '/users/login/refresh' ||
      url === '/users/login-with-email' ||
      url === '/users/login'
    ) {
      return Promise.reject(error);
    }

    try {
      await refreshToken();
      return client(request);
    } catch (err) {
      return Promise.reject(err);
    }
  });
}

attachAuthInterceptors(http);
attachAuthInterceptors(httpV2);

// App-auth for certain admin actions (do NOT refresh/logout user on 401 here).
httpV2App.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  (config.headers as any).Authorization = getAppJwt();
  return config;
}, null);

export const refreshToken = async () => {
  try {
    const response = await http.post('/users/login/refresh', null, {
      headers: {
        Authorization: httpTokens.refreshToken,
      },
    });
    const { token, refreshToken, wsToken } = response.data;
    httpTokens.token = token;
    httpTokens.refreshToken = refreshToken;
    httpTokens.wsToken = wsToken;

    return httpTokens;
  } catch (error) {
    actionLogout();
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export async function singin() {
  return new Promise((resolve, _reject) => {
    setTimeout(() => resolve(true), 2000);
  });
}

export function httpGetConfig(domainName?: string) {
  let path = '/apps/get-config';
  if (domainName) {
    path += `?domainName=${domainName}`;
  }

  return http.get(path);
}

export function httpLoginWithEmail(email: string, password: string) {
  return http.post('/users/login-with-email', { email, password });
}

export function httpLogout() {
  return http.post('/users/logout');
}

export function httpGetOneUser() {
  return http.get('/users/me');
}

export function httpGetOneUserWallet(wallet: string) {
  return http.get(`/users/profile/${wallet}`);
}

export function httpCreateNewApp(displayName: string) {
  return http.post(`/apps`, { displayName });
}

export interface GetAppsPaginator {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  orderBy?: OrderByType;
}
export function httpGetApps({
  limit = 10,
  offset = 0,
  order = 'asc',
  orderBy = 'displayName',
}: GetAppsPaginator) {
  return http.get(
    `/apps?limit=${limit}&offset=${offset}&order=${order}&orderBy=${orderBy}`
  );
}

export function httpGetApp(id: string) {
  return http.get(`/apps/${id}`);
}

export function httpUpdateApp(appId: string, options: any) {
  return http.put(`/apps/${appId}`, {
    ...options,
  });
}

export function httpGetGraphStatistic(
  appId: string,
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return http.get(`/apps/graph-statistic/${appId}?${params}`);
}

export function httpWithAuth(startDate: string, endDate: string) {
  return http.get(
    `/analysis/apis-csv?startDate=${startDate}&endDate=${endDate}`
  );
}

export function httpPostFile(file: File) {
  let fd = new FormData();
  fd.append('files', file);
  return http.post('/files', fd);
}

export function httpGetUsers(
  appId: string,
  limit: number = 10,
  offset: number = 0,
  orderBy: OrderByType = 'lastName',
  order: 'asc' | 'desc' = 'asc',
  // Lifecycle filter, wired in ethora-backend 2607+:
  //   status='archived' -> only archived users (restore screen)
  //   includeArchived=true -> active + archived
  //   default -> active only (current behavior)
  lifecycle?: { status?: 'archived'; includeArchived?: boolean }
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    orderBy,
    order,
  });
  if (lifecycle?.status) params.set('status', lifecycle.status);
  if (lifecycle?.includeArchived) params.set('includeArchived', 'true');
  return http.get(`/users/${appId}?${params.toString()}`);
}

export function httpDeleteManyUsers(appId: string, usersIdList: Array<string>) {
  return http.post(`/users/delete-many-with-app-id/${appId}`, { usersIdList });
}

export function httpResetPasswords(appId: string, usersIdList: Array<string>) {
  return http.post(`/users/reset-passwords-with-app-id/${appId}`, {
    usersIdList,
  });
}

export function httpCraeteUser(
  appId: string,
  {
    email,
    firstName,
    lastName,
  }: { email: string; firstName: string; lastName: string }
) {
  return http.post(`/users/create-with-app-id/${appId}`, {
    email,
    firstName,
    lastName,
  });
}

export function httpUpdateOneUser(appId: string, userId: string, options: any) {
  return http.put(`/users/${appId}/${userId}`, {
    ...options,
  });
}

export function httpTagsSet(
  appId: string,
  {
    usersIdList,
    tagsList,
  }: { usersIdList: Array<string>; tagsList: Array<string> }
) {
  return http.post(`/users/tags-set/${appId}`, {
    usersIdList,
    tagsList,
  });
}

export function httpUpdateAcl(
  appId: string,
  userId: string,
  acl: ModelUserACL
) {
  const _acl = JSON.parse(JSON.stringify(acl));

  delete _acl.createdAt;
  delete _acl.appId;
  delete _acl.userId;
  delete _acl._id;
  delete _acl.__v;
  delete _acl.updatedAt;
  delete _acl.application.appCreate.disabled;
  delete _acl.application.appPush.disabled;
  delete _acl.application.appSettings.disabled;
  delete _acl.application.appStats.disabled;
  delete _acl.application.appTokens.disabled;
  delete _acl.network.netStats.disabled;

  return http.put(`/users/acl/${appId}/${userId}`, {
    ..._acl,
  });
}

export const httpCheckEmailExist = (email: string) => {
  return http.get(`/users/checkEmail/${email}`, {
    params: {
      appId: getCurrentAppId(),
    },
  });
};

export const httpRegisterSocial = (
  idToken: string,
  accessToken: string,
  authToken: string,
  loginType: string,
  signUpPlan?: string,
  utm?: string,
) => {
  return http.post('/users', {
    appId: getCurrentAppId(),
    idToken,
    accessToken,
    loginType,
    authToken: authToken,
    signupPlan: signUpPlan,
    utm,
  });
};

export const httpLoginSocial = (
  idToken: string,
  accessToken: string,
  loginType: string,
  authToken: string = 'authToken'
) => {
  return http.post(`/users/login`, {
    appId: getCurrentAppId(),
    idToken,
    accessToken,
    loginType,
    authToken,
  });
};

export function registerSignature(
  walletAddress: string,
  signature: string,
  message: string,
  firstName: string,
  lastName: string,
  utm?: string,
) {
  return http.post('/users',
    {
      appId: getCurrentAppId(),
      loginType: 'signature',
      walletAddress,
      signature,
      msg: message,
      firstName,
      lastName,
      utm,
    }
    // { headers: { Authorization: accessToken } }
  );
}

export function loginSignature(
  walletAddress: string,
  signature: string,
  message: string
) {
  return http.post('/users/login', {
    appId: getCurrentAppId(),
    loginType: 'signature',
    walletAddress,
    signature,
    msg: message,
  });
}

export const httpRegisterWithEmail = (
  email: string,
  firstName: string,
  lastName: string,
  utm?: string,
  signUpPlan?: string
) => {
  const body = signUpPlan
    ? {
        appId: getCurrentAppId(),
        email,
        firstName,
        lastName,
        signupPlan: signUpPlan,
        utm,
      }
    : {
        appId: getCurrentAppId(),
        email,
        firstName,
        lastName,
        utm,
      };
  return http.post('/users/sign-up-with-email', body);
};

export const httpRegisterWithEmailV2 = (
  email: string,
  password: string,
  cfToken: string,
  firstName: string,
  lastName: string,
  utm?: string,
  signUpPlan?: string
) => {
  const body = signUpPlan
    ? {
        appId: getCurrentAppId(),
        email,
        password,
        cfToken,
        firstName,
        lastName,
        signupPlan: signUpPlan,
        utm,
      }
    : {
        appId: getCurrentAppId(),
        email,
        password,
        cfToken,
        firstName,
        lastName,
        utm,
      };
  return httpV2.post('/users/sign-up-with-email', body);
};

export async function httpResendLink(email: string) {
  return await http.post('/users/sign-up-resend-email', {
    appId: getCurrentAppId(),
    email,
  });
}

export async function httpPostForgotPassword(email: string) {
  return await http.post('/users/forgot', {
    appId: getCurrentAppId(),
    email,
  });
}

export async function httpResetPassword(token: string, password: string) {
  return await http.post('/users/reset', {
    token,
    password,
  });
}

export function httpUpdateUser(fd: FormData) {
  return http.put('/users', fd);
}

export function getPublicProfile(walletAddress: string, token: string = '') {
  if (token) {
    return http.get(`/users/profile/${walletAddress}/${token}`);
  } else {
    return http.get(`/users/profile/${walletAddress}`);
  }
}

export function getDocuments(walletAddress: string) {
  return http.get(`/docs/${walletAddress}`);
}

export async function postDocument(documentName: string, file: File) {
  const filePostResutlt = await httpPostFile(file);
  const fileLocation = filePostResutlt.data.results[0].location;
  return http.post('/docs', { documentName, files: [fileLocation] });
}

export function deleteDocuments(id: string) {
  return http.delete(`/docs/${id}`);
}

export async function applyReferalCode(id: string) {
  return http.post('/referral', { referrerId: id });
}

export function createSharedLink(data: any) {
  return http.post('/shareLink/', data);
}

export function getSharedLinks() {
  return http.get('/shareLink/');
}

export function deleteSharedLink(token: string) {
  return http.delete(`/shareLink/${token}`);
}

export function updateMe(data: any) {
  return http.put('/users', data);
}

export function getShareDoc(token: string) {
  return http.get(`/docs/share/${token}`);
}

export function getExportMyData() {
  return http.get('/users/exportData', { responseType: 'arraybuffer' });
}

export function getExportCsv(id: string) {
  return http.get(`/users/export/${id}`, { responseType: 'arraybuffer' });
}

export function getExportAppsCsv() {
  return http.get(`/apps/stat-csv`, { responseType: 'arraybuffer' });
}

export function deleteMe() {
  return http.delete('/users');
}

export function setPermanentPassword(tempPassword: string, password: string) {
  return http.post('/users/set-permanent-password-with-temp-password', {
    tempPassword,
    password,
  });
}

export function createAppChat(appId: string, title: string, pinned: boolean) {
  return http.post(`/apps/create-app-chat/${appId}`, {
    title,
    pinned,
  });
}

export function getDefaultRooms(appId: string) {
  return http.get(`/apps/get-default-rooms/app-id/${appId}`);
}

export function deleteApp(appId: string) {
  return http.delete(`/apps/${appId}`);
}

export function deleteDefaultRooms(appId: string, chatJid: string) {
  return http.delete(`/apps/delete-app-chat/${appId}`, {
    data: {
      chatJid,
    },
  });
}

// v2 chats broadcast (async job)
export function httpBroadcastChatsV2(payload: {
  text: string;
  allRooms?: boolean;
  chatNames?: string[];
  chatIds?: string[];
  metadata?: any;
  dryRun?: boolean;
}) {
  return httpV2App.post('/chats/broadcast', payload);
}

export function httpGetBroadcastChatsJobV2(jobId: string) {
  return httpV2App.get(`/chats/broadcast/${jobId}`);
}

export const sendHSFormData = async (
  appId: string,
  formId: string,
  hubspotData: any
) => {
  await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${appId}/${formId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubspotData),
    }
  );
};


export function setSourcesSiteCrawl(appId: string, url: string, followLink: boolean) {
  return http.post(`/sources/site-crawl/${appId}`, {
    url,
    followLink
  });
}

export function setSourcesSiteCrawlReindex(appId: string, urlId: string) {
  return http.post(`/sources/site-crawl-reindex/${appId}`, {
    urlId
  });
}

export function deleteSourcesSiteCrawl(appId: string, url: string) {
  return http.delete(`/sources/site-crawl/url/${appId}`, {
    data: {
      url
    }
  });
}

export function deleteSourcesSiteCrawlV2(appId: string, urls: string[]) {
  return http.delete(`/sources/site-crawl-v2/url/${appId}`, {
    data: {
      urls
    }
  });
}

export function setSourcesSiteFiles(appId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  return http.post(`/sources/docs/${appId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function setSourcesSiteFilesDelete(appId: string, fileId: string) {  
  return http.delete(`/sources/docs/${appId}/${fileId}`, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// ---------------------------------------------------------------------------
// Phase 1 (Agents): Agents and BotInstances HTTP wrappers.
// All endpoints live under /v2 so the user JWT auth path applies automatically.
// ---------------------------------------------------------------------------

export function httpListAgents(params?: { visibility?: 'public' | 'mine' | 'all'; appId?: string; limit?: number; offset?: number }) {
  return httpV2.get('/agents', { params });
}

export function httpGetAgent(idOrAddress: string) {
  return httpV2.get(`/agents/${encodeURIComponent(idOrAddress)}`);
}

export function httpCreateAgent(body: any) {
  return httpV2.post('/agents', body);
}

export function httpUpdateAgent(idOrAddress: string, body: any) {
  return httpV2.put(`/agents/${encodeURIComponent(idOrAddress)}`, body);
}

export function httpDeleteAgent(idOrAddress: string) {
  return httpV2.delete(`/agents/${encodeURIComponent(idOrAddress)}`);
}

export function httpCloneAgent(idOrAddress: string, body?: any) {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/clone`, body || {});
}

export function httpSetAgentVisibility(idOrAddress: string, visibility: 'private' | 'unlisted' | 'public') {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/visibility`, { visibility });
}

export function httpUpdateAgentSoul(idOrAddress: string, body: { soulMd?: string; append?: string }) {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/soul`, body);
}

export function httpInviteAgentToChat(idOrAddress: string, body: { appId?: string; chatId?: string; chatJid?: string }) {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/invite-to-chat`, body);
}

export function httpListBotInstances(params?: { appId?: string; agentId?: string; chatJid?: string }) {
  return httpV2.get('/bot-instances', { params });
}

// Remove a BotInstance from a single chat (does NOT stop the bot or destroy the
// instance). Used by the admin Chats "remove bot from this room" button.
export function httpLeaveChatAgentBotInstance(idOrAddress: string, botInstanceId: string, chatJid: string) {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/bot-instances/${encodeURIComponent(botInstanceId)}/leave-chat`, { chatJid });
}

// Convenience: list every BotInstance of an Agent (across all Apps it has been deployed
// in), enriched with the App display name. Used by the global Agents UI's Chats Index tab.
export function httpListAgentBotInstances(idOrAddress: string) {
  return httpV2.get(`/agents/${encodeURIComponent(idOrAddress)}/bot-instances`);
}

// Diagnostics for one BotInstance: ai-service's in-memory state (online?, joined rooms,
// last error), persisted bot row, and the last few conversation rows. Used by the
// Chats Index tab's "Status" expand and chat history preview.
export function httpDiagAgentBotInstance(idOrAddress: string, botInstanceId: string) {
  return httpV2.get(`/agents/${encodeURIComponent(idOrAddress)}/bot-instances/${encodeURIComponent(botInstanceId)}/diag`);
}

// Send a test system-message into one specific room (when `roomJid` is provided) or
// every room a specific BotInstance is in (when omitted). Returns per-room success/
// failure so the UI can render a quick confirmation.
export function httpTestMessageAgentBotInstance(idOrAddress: string, botInstanceId: string, text?: string, roomJid?: string) {
  return httpV2.post(`/agents/${encodeURIComponent(idOrAddress)}/bot-instances/${encodeURIComponent(botInstanceId)}/test-message`, { text, roomJid });
}

// List indexed Web Index sources for an App. Returns rows with { id, originUrl, url, mdByteSize, tags }.
// Used by the agent's Web Index tab to show the URL list (not just total bytes).
export function httpListSiteSourcesV2(appId?: string) {
  if (appId) return httpV2.get(`/apps/${appId}/sources/site-crawl`);
  return httpV2.get('/sources/site-crawl');
}

// NB: despite the name, the backend expects an array of SiteSource document
// _ids (24-hex ObjectIds), not URL strings. Joi rejects URL strings with a
// 422 VALIDATION_ERROR, which is why an earlier 'pass row.url' call from
// AgentPanels silently failed. Use the row.id from listSiteSources.
export function httpDeleteSiteSourceV2Url(appId: string, siteSourceId: string) {
  return httpV2.delete(`/apps/${appId}/sources/site-crawl-v2/url`, { data: { ids: [siteSourceId] } });
}

export function httpReindexSiteSourceV2(appId: string, urlId: string) {
  return httpV2.post(`/apps/${appId}/sources/site-crawl-reindex`, { urlId });
}

export function httpGetBotInstance(id: string) {
  return httpV2.get(`/bot-instances/${id}`);
}

export function httpSetBotInstanceStatus(id: string, status: 'on' | 'off') {
  return httpV2.post(`/bot-instances/${id}/status`, { status });
}

// Per-Agent source ingestion. These reuse the same endpoints as the per-App calls but
// pass an explicit agentId so docs land in the agent's RAG namespace.
export function httpAgentSiteCrawl(appId: string, agentId: string, url: string, followLink: boolean) {
  return httpV2.post(`/apps/${appId}/sources/site-crawl`, { url, followLink, agentId });
}

export function httpAgentDocsUpload(appId: string, agentId: string, files: File[]) {
  const formData = new FormData();
  // NB: multer in Express parses fields in order, and certain configurations
  // only populate req.body from fields that arrive BEFORE the file stream.
  // Append agentId first so the backend's docsUpload controller can read it.
  formData.append('agentId', agentId);
  files.forEach((file) => { formData.append('files', file); });
  return httpV2.post(`/apps/${appId}/sources/docs`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// List uploaded doc sources for an App (ordered by createdAt, newest first
// per the repo). Used by the Agents > Knowledge panel to confirm uploads
// landed and to surface a delete affordance.
export function httpListDocSourcesV2(appId: string) {
  return httpV2.get(`/apps/${appId}/sources/docs`);
}

export function httpDeleteDocSourceV2(appId: string, docId: string) {
  return httpV2.delete(`/apps/${appId}/sources/docs/${docId}`);
}

// Tenant-Owner gateway session (Option A): provision-or-fetch the per-app
// shadow user the calling admin uses to drive the chat-component against
// `appId`. Idempotent server-side: repeated calls return the same owner row
// but always re-mint a fresh chat-token (so the frontend can call this on
// switch and on token expiry without bookkeeping).
export function httpGetOwnerSession(appId: string) {
  return httpV2.post(`/apps/${appId}/owner-session`, {});
}

// ---------------------------------------------------------------------------
// Soft-delete (archive/restore) + hard-delete (cascade purge) + export/import
// ---------------------------------------------------------------------------
// Apps:

// List apps with the new lifecycle filters. Defaults to active apps.
//   status='archived' -> Restore screen
//   includeArchived=true -> All apps
export function httpGetAppsWithStatus(opts: {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  orderBy?: OrderByType;
  includeArchived?: boolean;
  status?: 'archived';
}) {
  const params = new URLSearchParams();
  if (opts.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts.offset !== undefined) params.set('offset', String(opts.offset));
  if (opts.order) params.set('order', opts.order);
  if (opts.orderBy) params.set('orderBy', opts.orderBy);
  if (opts.includeArchived) params.set('includeArchived', 'true');
  if (opts.status) params.set('status', opts.status);
  return http.get(`/apps?${params.toString()}`);
}

// Archive (soft-delete) an app. Hits the v1 admin endpoint (default mode=soft).
export function httpArchiveApp(appId: string, reason?: string) {
  const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return http.delete(`/apps/${appId}${qs}`);
}

// Hard-delete: enqueue a cascade purge job. Returns 202 with jobId.
export function httpHardDeleteApp(appId: string, reason?: string) {
  const params = new URLSearchParams({ mode: 'hard' });
  if (reason) params.set('reason', reason);
  return http.delete(`/apps/${appId}?${params.toString()}`);
}

// Restore (un-archive) an app.
export function httpRestoreApp(appId: string) {
  return http.post(`/apps/${appId}/restore`, {});
}

// Poll a purge job started by httpHardDeleteApp.
export function httpGetPurgeAppJob(jobId: string) {
  return httpV2.get(`/apps/purge-jobs/${encodeURIComponent(jobId)}`);
}

// Export an App bundle. Returns a Blob the caller can save.
// `format='zip'` returns application/zip; default is JSON.
export function httpExportApp(appId: string, opts: { format?: 'json' | 'zip'; include?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.format) params.set('format', opts.format);
  if (opts.include) params.set('include', opts.include);
  return httpV2.get(`/apps/${appId}/export?${params.toString()}`, { responseType: 'blob' });
}

// Import an App from a bundle. Accepts a File (JSON or zip) or a parsed
// JSON object. Server creates a new App under the calling tenant.
export function httpImportApp(input: File | object, domainNameOverride?: string) {
  if (input instanceof File) {
    const fd = new FormData();
    fd.append('bundle', input);
    if (domainNameOverride) fd.append('domainNameOverride', domainNameOverride);
    return httpV2.post('/apps/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  const url = domainNameOverride
    ? `/apps/import?domainNameOverride=${encodeURIComponent(domainNameOverride)}`
    : '/apps/import';
  return httpV2.post(url, input);
}

// Users: archive / restore / hard-delete.
// The v1 batch endpoints already default to soft-archive in the new backend;
// pass mode=hard to opt into the cascade purge.
export function httpArchiveUsers(appId: string, usersIdList: string[], reason?: string) {
  const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return http.post(`/users/delete-many-with-app-id/${appId}${qs}`, { usersIdList });
}

export function httpHardDeleteUsers(appId: string, usersIdList: string[], reason?: string) {
  const params = new URLSearchParams({ mode: 'hard' });
  if (reason) params.set('reason', reason);
  return http.post(`/users/delete-many-with-app-id/${appId}?${params.toString()}`, { usersIdList });
}

export function httpRestoreUser(appId: string, userId: string) {
  return httpV2.post(`/apps/${appId}/users/${userId}/restore`, {});
}

// Agents: export / import.
export function httpExportAgent(idOrAddress: string, format: 'json' | 'zip' = 'json') {
  return httpV2.get(`/agents/${encodeURIComponent(idOrAddress)}/export?format=${format}`, { responseType: 'blob' });
}

export function httpImportAgent(input: File | object, ownerAppId?: string) {
  if (input instanceof File) {
    const fd = new FormData();
    fd.append('bundle', input);
    if (ownerAppId) fd.append('ownerAppId', ownerAppId);
    return httpV2.post('/agents/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  const url = ownerAppId ? `/agents/import?ownerAppId=${encodeURIComponent(ownerAppId)}` : '/agents/import';
  return httpV2.post(url, input);
}

// Tiny helper for the hard-delete confirm modal: returns the total number
// of chat rooms in an app. We hit the v2 chats list endpoint with limit=1
// so the response is small but `total` reflects the full set.
export function httpGetAppChatRoomsCount(appId: string) {
  return httpV2.get(`/apps/${appId}/chats`, { params: { limit: 1, offset: 0 } });
}

// Browser helper: save a Blob as a file. Used by export buttons to trigger
// a download from the JSON/zip response without opening a new tab.
export function saveBlobAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

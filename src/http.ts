import axios from 'axios';
import { actionLogout } from './actions';
import { ModelUserACL, OrderByType } from './models';

export const httpTokens = {
  appJwt: '',
  _token: localStorage.getItem('token-538') || '',
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
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API,
});

http.interceptors.request.use((config) => {
  if (config.url === '/users/login/refresh') {
    return config;
  }

  if (
    config.url === '/users/login-with-email' ||
    config.url === '/users/login' ||
    (config.url === '/users' && config.method === 'post') ||
    config.url?.startsWith('/users/checkEmail/') ||
    config.url === '/users/sign-up-with-email' ||
    config.url === '/users/resendLink' ||
    config.url === '/users/forgot' ||
    config.url === '/users/reset'
  ) {
    config.headers.Authorization = httpTokens.appJwt;

    return config;
  }

  config.headers.Authorization = httpTokens.token;

  return config;
}, null);

http.interceptors.response.use(null, async (error) => {
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
    return http(request);
  } catch (error) {
    return Promise.reject(error);
  }
});

export const refreshToken = async () => {
  try {
    const response = await http.post('/users/login/refresh', null, {
      headers: {
        Authorization: httpTokens.refreshToken,
      },
    });
    const { token, refreshToken } = response.data;
    httpTokens.token = token;
    httpTokens.refreshToken = refreshToken;

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

export function httpLogingWithEmail(email: string, password: string) {
  return http.post('/users/login-with-email', { email, password });
}

export function httpGetOneUser() {
  return http.get('/users/me');
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
  order: 'asc' | 'desc' = 'asc'
) {
  return http.get(
    `/users/${appId}?limit=${limit}&offset=${offset}&orderBy=${orderBy}&order=${order}`
  );
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
  let _acl = JSON.parse(JSON.stringify(acl));

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
  return http.get(`/users/checkEmail/${email}`);
};

export const httpRegisterSocial = (
  idToken: string,
  accessToken: string,
  authToken: string,
  loginType: string,
  signUpPlan?: string
) => {
  return http.post(`/users`, {
    idToken,
    accessToken,
    loginType,
    authToken: authToken,
    signupPlan: signUpPlan,
  });
};

export const httpLoginSocial = (
  idToken: string,
  accessToken: string,
  loginType: string,
  authToken: string = 'authToken'
) => {
  return http.post(`/users/login`, {
    idToken,
    accessToken,
    loginType,
    authToken,
  });
};

export const httpRegisterWithEmail = (
  email: string,
  firstName: string,
  lastName: string,
  signUpPlan?: string
) => {
  const body = signUpPlan
    ? {
        email,
        firstName,
        lastName,
        signupPlan: signUpPlan,
      }
    : {
        email,
        firstName,
        lastName,
      };
  return http.post('/users/sign-up-with-email', body);
};

export async function httpResendLink(email: string) {
  return await http.post('/users/resendLink', {
    email,
  });
}

export async function httpPostForgotPassword(email: string) {
  return await http.post('/users/forgot', {
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

export function deleteDefaultRooms(appId: string, chatJid: string) {
  return http.delete(`/apps/delete-app-chat/${appId}`, {
    data: {
      chatJid,
    },
  });
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

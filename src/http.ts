import axios from 'axios';
import { ModelUserACL } from './models';

export const httpTokens = {
  appJwt: '',
  token: '',
  refreshToken: '',
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
      headers: { Authorization: httpTokens.refreshToken },
    });
    console.log('+++++++++ ', response.data);
    const { token, refreshToken } = response.data;
    httpTokens.token = token;
    httpTokens.refreshToken = refreshToken;
    return httpTokens;
  } catch (error) {
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

export function httpCreateNewApp(displayName: string) {
  return http.post(`/apps`, { displayName });
}

export interface GetAppsPaginator {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  orderBy?:
    | 'displayName'
    | 'totalRegistered'
    | 'totalSessions'
    | 'totalApiCalls'
    | 'totalFiles'
    | 'totalTransactions'
    | 'createdAt';
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

export function httpUpdateApp(appId: string, options: any) {
  return http.put(`/apps/${appId}`, {
    ...options,
  });
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
  orderBy: 'email' | 'createdAt' | 'firstName' | 'lastName' = 'lastName',
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

export async function httpResetPassword(password: string) {
  return await http.post('/users/reset', {
    password,
  });
}

export function httpUpdateUser(fd: FormData) {
  return http.put('/users', fd);
}

export function getPublicProfile(walletAddress: string, token: string = '') {
  return http.get(`/users/profile/${walletAddress}/${token}`);
}

export function getDocuments(walletAddress: string) {
  return http.get(`/docs/${walletAddress}`);
}

export async function postDocument(documentName: string, file: File) {
  const filePostResutlt = await httpPostFile(file);
  const fileLocation = filePostResutlt.data.results[0].location;
  return http.post('/docs', { documentName, files: [fileLocation] });
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

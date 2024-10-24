import { localStorageConstants } from "./constants/localStorageConstants";
import {
  httpGetConfig,
  httpTokens,
  httpCreateNewApp,
  httpGetApps,
  httpPostFile,
  httpGetUsers,
  httpDeleteManyUsers,
  httpResetPasswords,
  httpUpdateApp,
  httpUpdateUser,
  refreshToken,
} from "./http";
import { ModelApp, ModelCurrentUser } from "./models";
import { useAppStore } from "./store/useAppStore";
import { getFirebaseConfigFromString } from "./utils/getFbConfig";
import { sleep } from "./utils/sleep";

const getState = useAppStore.getState;

export async function actionGetConfig(domainName?: string) {
  const state = getState();
  const {
    data: { result },
  } = await httpGetConfig(domainName);

  let app: ModelApp = {
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
  };

  await sleep(1000);
  httpTokens.appJwt = result.appToken;
  state.doSetCurrentApp(app);
}

export async function actionAfterLogin(data: any) {
  const state = getState();

  httpTokens.token = data.token;
  httpTokens.refreshToken = data.refreshToken;

  const user: ModelCurrentUser = {
    appId: data.user.appId,
    firstName: data.user.firstName,
    homeScreen: data.user.homeScreen,
    isAgreeWithTerms: false,
    isAssetsOpen: false,
    isProfileOpen: false,
    lastName: data.user.lastName,
    refreshToken: data.refreshToken,
    token: data.token,
    xmppPassword: data.user.xmppPassword,
    walletAddress: data.user.defaultWallet.walletAddress,
    profileImage: data.user.profileImage,
    description: data.user.description,
    defaultWallet: {
      walletAddress: data.user.defaultWallet.walletAddress,
    },
  };

  if (data.user.isSuperAdmin) {
    user.isSuperAdmin = data.user.isSuperAdmin;
  }

  state.doSetUser(user);
  localStorage.setItem(localStorageConstants.ETHORA_USER, JSON.stringify(user));
  // await actionBootsrap()
}

export async function actionRefreshUserFromLocalStorage(
  user: ModelCurrentUser
) {
  const state = getState();

  const refreshed = await refreshToken();

  httpTokens.token = refreshed.token;
  httpTokens.refreshToken = refreshed.refreshToken;

  const localStorageUser: ModelCurrentUser = {
    appId: user.appId,
    firstName: user.firstName,
    homeScreen: user.homeScreen,
    isAgreeWithTerms: false,
    isAssetsOpen: false,
    isProfileOpen: false,
    lastName: user.lastName,
    refreshToken: refreshed.refreshToken,
    token: refreshed.token,
    xmppPassword: user.xmppPassword,
    walletAddress: user.defaultWallet.walletAddress,
    profileImage: user.profileImage,
    description: user.description,
    defaultWallet: {
      walletAddress: user.defaultWallet.walletAddress,
    },
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
  console.log(apps.length);
  state.doSetApps(apps);
}

export async function actionCreateApp(displayName: string) {
  const state = getState();
  const { data } = await httpCreateNewApp(displayName);
  state.doAddApp(data.app);
}

export async function actionPostFile(file: File) {
  return httpPostFile(file);
}

export async function actionGetUsers(
  appId: string,
  limit: number = 10,
  offset: number = 0,
  orderBy: "email" | "createdAt" | "firstName" | "lastName" = "lastName",
  order: "asc" | "desc" = "asc"
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
  console.log("actionUpdateApp");
  let response = await httpUpdateApp(appId, options);
  const state = getState();
  state.doUpdateApp(response.data.result);
}

export async function actionUpdateUser(fd: FormData) {
  let {
    data: { user },
  } = await httpUpdateUser(fd);
  let state = getState();
  state.doUpdateUser({
    firstName: user.firstName,
    lastName: user.lastName,
    description: user.description,
    profileImage: user.profileImage,
  });
  return {
    profileImage: user.profileImage,
  };
}

export function actionLogout() {
  return null;
}

export interface ModelCurrentUser {
  _id: string;
  appId: string;
  firstName: string;
  lastName: string;
  homeScreen: string;
  isAgreeWithTerms: boolean;
  isAssetsOpen: boolean;
  isProfileOpen: boolean;
  token: string;
  refreshToken: string;
  walletAddress: string;
  xmppPassword: string;
  xmppUsername: string;
  profileImage: string;
  description: string;
  defaultWallet: {
    walletAddress: string;
  };
  isSuperAdmin?: {
    read: boolean;
    write: boolean;
  };
}

export interface ModelCurrentApp {
  appToken: string;
  coinName: string;
  displayName: string;
  domainName: string;
}

export interface ModelAppDefaulRooom {
  jid: string;
  pinned: boolean;
  title: string;
  creator: string;
  chatId: string;
}

export interface SiteLinks {
  createdAt: string;
  id: string;
  url: string;
  mdByteSize: number;
  md: string;
}

export interface ModelAIbot {
    userId: string;
    chatId: string;
    status: "on" | "off";
    greetingMessage: string;
    trigger: string;
    prompt: string;
    siteLinks: Array<string>;
    siteUrlsV2: Array<SiteLinks>;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      isBot: boolean;
    }
    chat: {
      _id: string;
      name: string;
      title: string;
      description: string;
      type: string;
      picture: string;
    }
  }

export interface ModelApp {
  appToken: string;
  bundleId: string;
  coinName: string;
  coinSymbol: string;
  createdAt: string;
  creatorId: string;
  defaultAccessAssetsOpen: boolean;
  defaultAccessProfileOpen: boolean;
  defaultRooms: Array<ModelAppDefaulRooom>;
  displayName: string;
  domainName: string;
  isAllowedNewAppCreate: boolean;
  isBaseApp: boolean;
  parentAppId: string;
  primaryColor: string;
  signonOptions: Array<string>;
  logoImage: string;
  sublogoImage: string;
  appTagline: string;
  firebaseWebConfigString?: string;
  firebaseConfigParsed?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };

  stats: {
    recentlyApiCalls: number;
    recentlyFiles: number;
    recentlyIssuance: number;
    recentlyRegistered: number;
    recentlySessions: number;
    recentlyTransactions: number;
    totalApiCalls: number;
    totalFiles: number;
    totalIssuance: number;
    totalRegistered: number;
    totalSessions: number;
    totalTransactions: number;
    totalChats: number;
    recentlyChats: number;
  };
  systemChatAccount: {
    jid: string;
  };
  updatedAt: string;
  usersCanFree: boolean;
  _id: string;
  afterLoginPage: string;
  availableMenuItems: {
    chats: boolean;
    profile: boolean;
    settings: boolean;
  };
  googleServicesJson: string;
  googleServiceInfoPlist: string;
  appSecret: string;
  allowUsersToCreateRooms: boolean;
  aiBot: ModelAIbot;
}

export interface ModelUserACL {
  appId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  application: {
    appCreate: {
      create: boolean;
    };
    appPush: {
      create: boolean;
      read: boolean;
      update: boolean;
      admin: boolean;
    };
    appSettings: {
      admin: boolean;
      read: boolean;
      update: boolean;
    };
    appStats: {
      admin: boolean;
      read: boolean;
    };
    appTokens: {
      admin: boolean;
      create: boolean;
      read: boolean;
      update: boolean;
    };
    appUsers: {
      admin: boolean;
      create: boolean;
      delete: boolean;
      read: boolean;
      update: boolean;
    };
  };
  network: {
    netStats: {
      read: boolean;
    };
  };
}

export interface ModelAppUser {
  _id: string;
  appId: string;
  acl: ModelUserACL;
  authMethod: string;
  createdAt: string;
  defaultWallet: {
    walletAddress: string;
  };
  email: string;
  firstName: string;
  lastName: string;
  homeScreen: string;
  isAgreeWithTerms: boolean;
  isAssetsOpen: boolean;
  isProfileOpen: boolean;
  lastSeen: string;
  profileImage: string;
  tags: Array<string>;
  updatedAt: string;
}

export interface ModelState {
  inited: boolean;
  currentUser: ModelCurrentUser | null;
  currentApp: ModelApp | null;
  apps: Array<ModelApp>;
}

export type OrderByType =
  | 'createdAt'
  | 'displayName'
  | 'totalRegistered'
  | 'totalSessions'
  | 'totalApiCalls'
  | 'totalFiles'
  | 'totalTransactions'
  | 'lastName'
  | 'email'
  | 'firstName';

export type Iso639_1Codes = 'en' | 'es' | 'pt' | 'ht' | 'zh';

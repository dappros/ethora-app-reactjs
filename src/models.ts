export interface ModelCurrentUser {
  _id: string;
  appId: string;
  firstName: string;
  lastName: string;
  email?: string;
  homeScreen: string;
  isAgreeWithTerms: boolean;
  isAssetsOpen: boolean;
  isProfileOpen: boolean;
  token: string;
  refreshToken: string;
  wsToken: string;
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
  updatedAt?: string;
  id: string;
  url: string;
  mdByteSize: number;
  md: string;
}

export interface Files {
  createdAt: string;
  id: string;
  md: string;
  mdByteSize: number;
  url: string;
  file?: File;
}

export interface ModelAIbot {
    userId: string;
    chatId: string;
    status: "on" | "off";
    greetingMessage: string;
    isRAG: boolean;
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
    files: Array<Files>;
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

  // Lifecycle status (server-side soft-delete: see ethora-backend 2607+).
  // Undefined on old apps still in the DB - render as 'active'.
  status?: 'active' | 'archived' | 'deleting' | 'deleted';
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;

  stats: {
    recentlyApiCalls: number;
    recentlyFiles: number;
    recentlyIssuance: number;
    recentlyRegistered: number;
    recentlySessions: number;
    recentlyTokens: number;
    recentlyTransactions: number;
    totalApiCalls: number;
    totalFiles: number;
    totalIssuance: number;
    totalRegistered: number;
    totalSessions: number;
    totalTransactions: number;
    totalChats: number;
    totalTokens: number;
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
  // Per-app default identity stamped on broadcast announcements when the
  // /v2/chats/broadcast caller doesn't supply `sender` in the request body.
  // Without this the chat-component renders broadcasts as "Deleted User".
  // Configured via the Chats tab; see ethora-backend models/apps.js for the
  // full resolution chain.
  broadcastSender?: {
    name?: string;
    photoUrl?: string;
  };
  aiBot: ModelAIbot;
}

export interface ModelAiWidgetValues {
  displayName: string;
  avatar: string;
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
  // Lifecycle status (server-side soft-delete: see ethora-backend 2607+).
  // Undefined on old users still in the DB - render as 'active'.
  status?: 'active' | 'archived' | 'deleting' | 'deleted';
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}

// Phase 1 (Agents): first-class AI Agent and per-App BotInstance projections returned by /v2/agents and /v2/bot-instances.
export interface ModelAgent {
  id: string;
  address: string;
  ownerId: string;
  ownerAppId: string | null;
  // New (Phase 1 global Agents UI): origin app display name + BotInstances count, used to
  // disambiguate agents that share the same displayName.
  originAppId?: string | null;
  originAppName?: string | null;
  botInstancesCount?: number | null;
  displayName: string;
  avatarUrl: string;
  bio: string;
  prompt: string;
  llmProvider: string;
  llmModel: string;
  embeddingModel: string;
  contextSize: number;
  responseMode: 'always' | 'mentioned' | 'smart' | 'probability';
  responseProbability: number;
  cooldownSec: number;
  greetingMessage: string;
  isRAG: boolean;
  ragTags: string[];
  soulMd: string;
  soulMdUpdatedAt: string | null;
  soulMdUpdatedBy: string;
  heartbeat: { enabled: boolean; schedule: string; prompt: string };
  visibility: 'private' | 'unlisted' | 'public';
  totalSiteSourceSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModelBotInstance {
  id: string;
  agentId: string;
  appId: string;
  userId: string;
  xmppUsername: string;
  status: 'on' | 'off';
  joinedRooms: string[];
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tenant-Owner gateway session (Option A): the chat-layer credentials the
// admin uses to drive the chat-component against a child app they own.
// Minted on demand by `POST /v2/apps/:appId/owner-session`. This shape is
// intentionally narrow - no email/wallet/etc. - because the gateway User
// is purely a JID provider for mod_ethora's prefix check.
export interface ModelOwnerSession {
  appId: string;
  appToken: string;
  // chat-component `jwtLogin.token` payload. Signed with the *target* app's
  // signing context, carries `${appId}_owner-<adminId>` as the owner JID.
  chatTokens: {
    accessToken: string;
    refreshToken: string;
    wsToken: string;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    defaultWallet: { walletAddress: string };
    xmppUsername: string;
    xmppPassword: string;
    isTenantOwner: true;
  };
}

export interface ModelState {
  inited: boolean;
  currentUser: ModelCurrentUser | null;
  currentApp: ModelApp | null;
  apps: Array<ModelApp>;
  aiWidgetValues: ModelAiWidgetValues;
  agents: Array<ModelAgent>;
  botInstances: Array<ModelBotInstance>;
  selectedAgentId: string | null;
  // Which owned app the admin is currently viewing chats for. Persisted to
  // localStorage (`chatAppId-538`) so re-entering the Chats tab restores the
  // most-recent context. `null` means "no owner session yet, fall back to
  // the base-app end-user identity in currentUser" (legacy behaviour).
  chatAppId: string | null;
  // Lazily-fetched owner-session payload for the currently-selected
  // chatAppId. Null when the admin is operating as their plain base-app
  // user (i.e. before they ever open the App Switcher).
  ownerSession: ModelOwnerSession | null;
  // Full list of apps owned by the current admin, used by the Chats App
  // Switcher dropdown. Kept separate from `apps` because that one is
  // paginated by the AdminApps page (limit=10 by default), and the
  // dropdown should always show every owned app regardless of which
  // page the admin happened to last visit.
  ownedApps: Array<ModelApp>;
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

export type Iso639_1Codes = 'en' | 'es' | 'pt' | 'ht' | 'fr' | 'zh';

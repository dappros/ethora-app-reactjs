import type { UiLocale } from './constants/languageOptionsConstants';
import type { UiTheme } from './utils/uiTheme';

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
  // The language the interface is rendered in, as a BCP-47 tag, or '' when the
  // user has never picked one (the app then follows the install default).
  // Server-owned: written through PUT /users, read back on login and /me.
  // Named `language` before the split into app / chat preferences.
  appLanguage?: string;
  // The language the user wants incoming chat messages translated into. Same
  // shape and lifecycle as appLanguage; '' means "follow appLanguage" rather
  // than the install default.
  chatLanguage?: string;
  token: string;
  refreshToken: string;
  fileToken: string;
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

export type AppMilestoneKind =
  | 'app_created'
  | 'agent_created'
  | 'knowledge_added'
  | 'agent_tested'
  | 'widget_installed'
  | 'widget_visitor'
  | 'widget_answered_visitor';

export interface AppMilestone {
  firstAt: string | null;
  lastAt: string | null;
  count: number;
  meta?: Record<string, unknown>;
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
  // Start-screen goal (website | sdk | messenger | selfHost); App Home follows it.
  onboardingGoal?: 'website' | 'sdk' | 'messenger' | 'selfHost';
  // Server-side onboarding progress (GET /v1/apps/:id), App Home checklist.
  milestones?: Partial<Record<AppMilestoneKind, AppMilestone>>;
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
    // ISO start-of-day of the latest day with any activity; null = never.
    lastActivityAt?: string | null;
    // Monthly active users: distinct accounts that logged in, refreshed a
    // session or wrote a message in the last 30 days. null when the server
    // could not compute it; absent on backends that predate it.
    activeUsers30d?: number | null;
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
  firebaseServiceAccountUploaded?: boolean;
  apnsKeyUploaded?: boolean;
  appSecret: string;
  allowUsersToCreateRooms: boolean;
  // Self-service registration switch (ethora-backend 2609+). Negative on
  // purpose: App documents that predate the field come back without it, and
  // absent must mean "registration allowed". actions.ts coerces the absent
  // case to `false`, so everything downstream sees a real boolean and every
  // consumer is a plain truthy check - do NOT invert it into a positive alias.
  // The single inversion lives at the admin checkbox in AppSettings.
  userRegistrationDisabled: boolean;
  // Admins/owners of this app are told at login to enrol in MFA
  // (login response `mfaEnrolmentRequired`). Absent on older apps = off.
  requireMfaForAdmins: boolean;
  // Per-app opt-in for end-to-end encrypted (OMEMO 2) 1:1 chats, set by the
  // app owner in App Settings > Chats. This is only the INNER gate: the
  // install-wide VITE_E2EE_ENABLED (deploy.yml `features.e2ee`) is the outer
  // one, and the chat-component is handed `e2ee.enabled` only when both are
  // on - see config/chatBootstrap.ts. Absent on older apps, and on an API that
  // predates the field; actions.ts coerces that to `false`, which is also the
  // platform default, so everything downstream is a plain truthy check.
  e2eeEnabled: boolean;
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
  // Shown to suspended users of this app (email address or https URL).
  // Empty falls back server-side to the parent app's value, then the install
  // default.
  supportContact?: string;
  // Sign-ups (email, first-time social sign-in) whose email domain matches
  // one of these patterns are refused with 403 SIGNUP_EMAIL_DOMAIN_BLOCKED.
  // `example.org` also matches its subdomains; `*` matches one DNS label.
  // Applies to this app only, not its child apps.
  signupBlockedEmailDomains?: string[];
  // Trust & Safety overrides; each can only make the install policy stricter.
  // Absent / null keys follow the install value.
  trustSafety?: TrustSafetyOverrides | null;
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
  // Public MFA status only (secrets never leave the server). Absent on
  // backends that predate MFA.
  mfa?: { enabled: boolean; enabledAt?: string | null; backupCodesRemaining?: number };
  mfaEnabled?: boolean;
  // Derived server-side from the ACL row, the app owner and the platform
  // super-admin flags. Absent on older backends.
  role?: 'superadmin' | 'owner' | 'admin' | 'member';
  isSuperAdmin?: { read?: boolean; write?: boolean };
  description?: string;
  // Account suspension (separate from archive: the account and its data stay
  // as they are, only login and API access are refused). null / absent = not
  // suspended.
  suspension?: ModelUserSuspension | null;
  // Self-declared age (Trust & Safety). Absent / null = not declared.
  age?: ModelUserAge | null;
}

export type SuspensionReasonCode = 'child_safety' | 'terms_violation' | 'spam' | 'security' | 'other';
export type SuspensionScope = 'app' | 'tenant';

// Admin view of a suspension, as carried on user objects in the users list.
export interface ModelUserSuspension {
  reasonCode: SuspensionReasonCode | string;
  message?: string | null;
  internalNote?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
  // Access level that set it; lifting it needs at least the same level.
  suspendedByRole?: 'member' | 'admin' | 'owner' | 'superadmin' | null;
  until?: string | null;
  scope?: SuspensionScope | null;
  // What happened to the account's content (older APIs omit it).
  content?: SuspensionContent | null;
}

// What a suspended user is told: `details.suspension` of a 403 USER_SUSPENDED.
export interface ModelSuspensionNotice {
  reasonCode?: SuspensionReasonCode | string | null;
  message?: string | null;
  suspendedAt?: string | null;
  until?: string | null;
  supportContact?: string | null;
}

export interface SuspendUserBody {
  reasonCode: SuspensionReasonCode;
  message?: string;
  internalNote?: string;
  scope?: SuspensionScope;
  until?: string;
  // Content options; the API defaults each to 'keep'.
  messagesMode?: SuspensionContentMode;
  mediaMode?: SuspensionContentMode;
  nameMode?: SuspensionNameMode;
}

export type SuspensionContentMode = 'keep' | 'hide' | 'delete' | 'quarantine';
export type SuspensionNameMode = 'keep' | 'suspended';
export interface SuspensionContent {
  messagesMode?: SuspensionContentMode;
  mediaMode?: SuspensionContentMode;
  nameMode?: SuspensionNameMode;
}

// ---- Trust & Safety (docs/TRUST_AND_SAFETY.md) ----

export type TsImageAction = 'allow' | 'blur' | 'hold' | 'block';
export type TsTextAction = 'allow' | 'flag' | 'blur' | 'hide';
export type TsProfile = 'business' | 'education' | 'community' | 'adult' | 'custom';
// Image policy level (section 12). `custom` is an install choice only.
export type TsImageLevel = 'custom' | 'off' | 'relaxed' | 'standard' | 'strict';

// App.trustSafety: per-App overrides, stricter only.
export interface TrustSafetyOverrides {
  // A named level; applies only when stricter than the install level.
  imageLevel?: Exclude<TsImageLevel, 'custom'> | null;
  imageNudityAction?: TsImageAction | null;
  imageNudityThreshold?: number | null;
  textToxicityAction?: TsTextAction | null;
  textToxicityThreshold?: number | null;
  textSevereAction?: TsTextAction | null;
  textSevereThreshold?: number | null;
  piiAction?: TsTextAction | null;
  phiAction?: TsTextAction | null;
  phiThreshold?: number | null;
}

// The install policy (and the effective one, install tightened by the App).
export interface TrustSafetyPolicy {
  enabled: boolean;
  profile?: TsProfile | string;
  // Older APIs omit the image level fields.
  imageLevel?: TsImageLevel;
  // Install only: the percent thresholds of the named levels.
  imageExplicitNudenet?: number;
  imageExplicitFalconsai?: number;
  imageRevealingFlag?: number;
  imageRevealingBlur?: number;
  imageNudityAction: TsImageAction;
  imageNudityThreshold: number;
  ageGate: boolean;
  textToxicityAction: TsTextAction;
  textToxicityThreshold: number;
  textSevereAction: TsTextAction;
  textSevereThreshold: number;
  piiAction: TsTextAction;
  piiTypes?: string[];
  phiAction: TsTextAction;
  phiThreshold: number;
  evidenceRetentionDays?: number;
}

// GET /v2/apps/:appId/trust-safety. `install` and `app` only for admins.
export interface AppTrustSafetyInfo {
  enabled: boolean;
  ageGate: boolean;
  imageNudityAction: TsImageAction;
  // The effective image level (admins; older APIs omit it).
  imageLevel?: TsImageLevel;
  install?: TrustSafetyPolicy;
  app?: TrustSafetyOverrides | null;
  effective?: TrustSafetyPolicy;
  // Whether the moderation service answers (optional; older APIs omit it).
  service?: { configured?: boolean; ok?: boolean | null; models?: Record<string, string> | null } | null;
}

// User.age as the users list carries it.
export interface ModelUserAge {
  birthYear?: number | null;
  isAdult?: boolean | null;
  declaredAt?: string | null;
  source?: 'self' | 'admin' | null;
}

// GET / PUT /v2/users/me/age.
export interface MyAge {
  birthYear: number | null;
  isAdult: boolean | null;
  declaredAt: string | null;
  canDeclareAdult: boolean;
}

export type ModerationItemKind = 'message' | 'media';
export type ModerationItemStatus = 'open' | 'approved' | 'removed' | 'dismissed';
export type ModerationAction = 'dismiss' | 'approve' | 'blur' | 'hide' | 'delete' | 'restore';

// The moderation result of a media file (File.moderation; on quarantine
// case media also kept on the evidence row). `score` and `signals` in
// percent, `labels[].score` 0..1 (NudeNet body-part labels); `description`
// is a neutral AI caption of the visible content (section 14), when one was
// made.
export interface MediaModeration {
  status?: string | null;
  category?: string | null;
  score?: number | null;
  labels?: Array<{ label: string; score?: number | null }> | null;
  signals?: { nudenet?: number | null; falconsai?: number | null; adamcodd?: number | null } | null;
  description?: string | null;
  describedAt?: string | null;
  descriptionModel?: string | null;
}

// One row of GET /v2/apps/:appId/moderation/items.
export interface ModerationItem {
  _id: string;
  id?: string;
  appId: string;
  kind: ModerationItemKind;
  // Media outside a chat (section 17): 'profile' | 'upload' | 'chat-media'.
  surface?: string | null;
  room?: string | null;
  // Room title, when the API resolves it.
  roomTitle?: string | null;
  stanzaId?: string | null;
  originId?: string | null;
  fileId?: string | null;
  senderUserId?: string | null;
  // Sender details, when the API resolves them.
  sender?: { _id?: string; firstName?: string; lastName?: string; email?: string; profileImage?: string } | null;
  category?: string | null;
  scores?: Record<string, number | string | string[] | null> | null;
  // What was applied automatically: flag | blur | hold | hide | block.
  action?: string | null;
  status: ModerationItemStatus;
  text?: string | null;
  source?: 'auto' | 'moderator' | 'report' | null;
  // Media items: the (server-side blurred) preview and file details.
  previewUrl?: string | null;
  file?: {
    locationPreview?: string | null;
    location?: string | null;
    mimetype?: string | null;
    originalname?: string | null;
    // File.moderation; `signals` = NudeNet / Falconsai / AdamCodd in percent (null = not run).
    moderation?: MediaModeration | null;
  } | null;
  // Category `custom`: the rule that matched (name kept on the item).
  ruleName?: string | null;
  rule?: { _id?: string; name?: string } | null;
  createdAt: string;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
}

export interface ModerationItemsResponse {
  items: ModerationItem[];
  total?: number;
  limit?: number;
  offset?: number;
}

// Trust & Safety evidence review, superadmins (docs/TRUST_AND_SAFETY.md
// section 11). A case groups the moderation_evidence rows of one deleted or
// moderated message, or of one suspension.
export type EvidenceReason = 'deleted' | 'auto' | 'moderator' | 'suspension';
export type EvidenceMode = 'hide' | 'quarantine';
export type EvidenceStatusFilter = 'active' | 'held' | 'expiring';
export type EvidenceReportTarget = 'ncmec' | 'law_enforcement' | 'hr' | 'internal' | 'other';

export interface EvidencePerson {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface EvidenceReport {
  target: EvidenceReportTarget | string;
  reference?: string | null;
  note?: string | null;
  // A user id, or the user when the API resolves it.
  by?: string | EvidencePerson | null;
  at?: string | null;
}

export interface EvidenceMessage {
  evidenceId: string;
  stanzaId?: string | null;
  sentAt?: string | null;
  text?: string | null;
  // The sender's JID or name, or the user when the API resolves it.
  sender?: string | EvidencePerson | null;
}

export interface EvidenceMedia {
  evidenceId: string;
  fileId?: string | null;
  mimetype?: string | null;
  size?: number | null;
  sha256?: string | null;
  md5?: string | null;
  hasPreview?: boolean;
  originalName?: string | null;
  purgedAt?: string | null;
  available?: boolean;
  // The file's moderation result; null when no check ran.
  moderation?: MediaModeration | null;
}

// A reviewer who opened the case or one of its media files.
export interface EvidenceView {
  userId: string;
  email?: string | null;
  kind?: 'case' | 'media' | string;
  at: string;
}

export interface EvidenceCase {
  caseId: string;
  reason: EvidenceReason | string;
  mode?: EvidenceMode | string | null;
  appId?: string | null;
  appName?: string | null;
  room?: string | null;
  roomTitle?: string | null;
  stanzaIds?: string[];
  user?: EvidencePerson | null;
  createdAt?: string | null;
  expiresAt?: string | null;
  hold?: boolean;
  holdSetBy?: string | EvidencePerson | null;
  holdSetAt?: string | null;
  purgedAt?: string | null;
  // The list may leave out the rows themselves and send only the counts.
  messages?: EvidenceMessage[];
  media?: EvidenceMedia[];
  reports?: EvidenceReport[];
  // The last 20 views of the case and its media, newest first.
  viewedBy?: EvidenceView[];
  counts?: { messages?: number; media?: number };
}

export interface EvidenceCasesResponse {
  items: EvidenceCase[];
  total?: number;
  limit?: number;
  offset?: number;
}

export type EvidenceCaseAction =
  | { action: 'extend'; days: number }
  | { action: 'hold' }
  | { action: 'release_hold'; days?: number }
  | { action: 'purge' }
  | { action: 'report'; target: EvidenceReportTarget; reference?: string; note?: string };

// ---- T&S hub (docs/TRUST_AND_SAFETY.md section 13), superadmins ----

// GET /v2/admin/trust-safety/overview.
export interface TsOverview {
  enabled: boolean;
  profile?: TsProfile | string | null;
  imageLevel?: TsImageLevel | string | null;
  service?: {
    configured?: boolean;
    ok?: boolean | null;
    // Loaded models: a name -> version map or a list of names.
    models?: Record<string, string | boolean | null> | string[] | null;
  } | null;
  counts?: {
    quarantineCases?: number;
    quarantineExpiringSoon?: number;
    quarantineOnHold?: number;
    moderationOpen?: number;
    suspendedUsers?: number;
    rules?: number;
    // Active sign-up IP blocks (section 15).
    ipBlocks?: number;
  } | null;
}

export type EvidenceBulkAction = 'purge' | 'extend' | 'hold' | 'release_hold';

export interface EvidenceBulkBody {
  caseIds: string[];
  action: EvidenceBulkAction;
  days?: number;
}

export interface EvidenceBulkResponse {
  ok: boolean;
  results: Array<{ caseId: string; ok: boolean; code?: string | null; error?: string | null }>;
}

// GET /v2/admin/trust-safety/moderation-items: the per-App item plus its App.
export interface TsHubModerationItem extends ModerationItem {
  appName?: string | null;
}

// GET /v2/admin/trust-safety/suspended-users.
export interface TsSuspendedUser {
  _id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  appId: string;
  appName?: string | null;
  suspension: ModelUserSuspension;
  // Present when the API sends them; used to hide actions the server refuses.
  role?: 'superadmin' | 'owner' | 'admin' | 'member' | null;
  isSuperAdmin?: { read?: boolean; write?: boolean } | null;
}

export interface TsSuspendedUsersResponse {
  items: TsSuspendedUser[];
  total?: number;
}

// Custom rules (collection ts_rules, install-wide).
export type TsRuleKind = 'words' | 'regex';
export type TsRuleAction = 'flag' | 'blur' | 'hide';

export interface TsRule {
  _id: string;
  name: string;
  enabled: boolean;
  kind: TsRuleKind;
  patterns: string[];
  wholeWords?: boolean;
  caseSensitive?: boolean;
  action: TsRuleAction;
  category?: 'custom';
  // Empty = all Apps.
  appIds: string[];
  createdBy?: string | null;
  updatedAt?: string | null;
}

export interface TsRulesResponse {
  items: TsRule[];
  total?: number;
}

// One matching rule of POST /v2/admin/trust-safety/rules/test (the draft
// rule of the dialog has `draft: true`). Field names vary by API version;
// utils/tsHub.ts normalizeRuleTest() reads them.
export interface TsRuleTestMatch {
  ruleId?: string;
  _id?: string;
  id?: string;
  name?: string;
  action?: string;
  matched?: string[];
  terms?: string[];
  draft?: boolean;
}

// GET /v2/admin/trust-safety/blocked-domains.
export interface TsBlockedDomainsResponse {
  items: Array<{ appId: string; appName?: string | null; patterns: string[] }>;
}

// Sign-up IP blocks (docs/TRUST_AND_SAFETY.md section 15), collection
// signup_ip_blocks. `cidr` is normalised (a single address is /32 or /128),
// `appId` null = every App, `until` null = permanent.
export interface TsIpBlock {
  _id: string;
  cidr: string;
  appId?: string | null;
  appName?: string | null;
  until?: string | null;
  reason?: string | null;
  sourceUserId?: string | null;
  sourceEmail?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  hits?: number;
  lastHitAt?: string | null;
  active?: boolean;
}

export interface TsIpBlocksResponse {
  items: TsIpBlock[];
  total?: number;
}

// POST /v2/admin/trust-safety/ip-blocks. `ip` is an address or a CIDR;
// no `appId` = every App, no `days` = permanent.
export interface TsIpBlockBody {
  ip: string;
  appId?: string;
  days?: number;
  reason?: string;
  sourceUserId?: string;
}

// GET /v2/admin/trust-safety/users/:userId/ips.
export interface TsUserIpOtherAccount {
  _id: string;
  email?: string | null;
  appId?: string | null;
  suspended?: boolean;
}

export interface TsUserIp {
  ip: string;
  firstSeen?: string | null;
  lastSeen?: string | null;
  count?: number;
  sources?: Array<'registration' | 'session' | string>;
  blocked?: TsIpBlock | null;
  otherAccounts?: TsUserIpOtherAccount[];
}

export interface TsUserIpsResponse {
  items: TsUserIp[];
}

// One row of the results array returned by suspend / unsuspend (single and
// bulk). Bulk per-user failures come back as status 'error' with code/error.
export interface SuspensionResultItem {
  userId: string;
  appId?: string;
  email?: string;
  status: 'suspended' | 'already_suspended' | 'unsuspended' | 'not_suspended' | 'error';
  code?: string;
  error?: string;
}

export interface SuspensionResponse {
  ok: boolean;
  results: SuspensionResultItem[];
  suspension?: ModelUserSuspension;
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
  // 'on' (default): business facts only from the instructions and knowledge;
  // links not in them are removed. 'off' for persona agents. Absent from
  // older APIs, which means 'on'.
  grounding?: 'on' | 'off';
  // Directory categories, a fixed list (lib/agentCategories.ts).
  categories?: string[];
  soulMd: string;
  soulMdUpdatedAt: string | null;
  soulMdUpdatedBy: string;
  heartbeat: { enabled: boolean; schedule: string; prompt: string };
  // Flows: the operator's YAML script and its compiled form (read-only here).
  flowsYaml: string;
  flows: unknown[];
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
  roomSettings?: Array<{ roomJid: string; responseMode: ModelAgent['responseMode'] }>;
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
    fileToken?: string;
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
  // App-wide UI language (not just the chat panel). Constrained to
  // UI_LANGUAGE_OPTIONS (en/fr/es - see constants/languageOptionsConstants.ts).
  // Kept in the store (not read straight from localStorage on every render)
  // so switching it re-renders every subscribed component immediately.
  // Initialized from utils/uiLanguage.ts (last-known choice, else browser
  // detection) and replaced by the user's server-stored choice as soon as a
  // session bootstraps.
  uiLanguage: UiLocale;
  // Colour theme choice ('light' | 'dark' | 'system'). Per device, never sent
  // to the server - see utils/uiTheme.ts.
  uiTheme: UiTheme;
  // Languages the INTERFACE works in: get-config's translateLanguages narrowed
  // to what the bundle can render (see constants/languageOptionsConstants.ts
  // resolveAvailableLanguages, which falls back to the whole catalogue when the
  // raw list is empty or unrecognisable - right for a picker, wrong for the
  // translation gate). Seeded from the localStorage cache so the pre-login
  // screens have a list.
  availableLanguages: UiLocale[];
  // The language the user wants incoming chat messages translated into.
  //
  // Unlike uiLanguage this is NOT seeded from localStorage: nothing renders in
  // it before a session exists, so there is no flash to avoid, and the server
  // is the only source of truth. `null` means "not chosen" - callers should
  // read it as "follow uiLanguage", matching the backend's
  // resolveUserChatLanguage().
  //
  // A plain string rather than UiLocale: the translation server can support
  // languages this bundle has no dictionary for, and picking one of those as a
  // translation target is legitimate (see translateLanguages below).
  chatLanguage: string | null;
  // What the install's translation server can translate into, from the
  // `translateLanguages` field of GET /apps/get-config. Install-wide, not
  // per-app.
  //
  // Distinct from availableLanguages above: that is the set of languages the
  // INTERFACE works in, this is a separate deployment's capability list, and
  // the two may legitimately differ in both directions. An empty array means
  // no translation server is configured - the chat language picker is hidden
  // entirely in that case.
  translateLanguages: string[];
}

export type OrderByType =
  | 'createdAt'
  | 'displayName'
  | 'totalRegistered'
  | 'totalSessions'
  | 'totalApiCalls'
  | 'totalFiles'
  | 'totalTransactions'
  | 'totalChats'
  | 'totalTokens'
  | 'lastActivityAt'
  | 'lastName'
  | 'email'
  | 'firstName'
  | 'authMethod'
  | 'mfaEnabled'
  | 'tags'
  | 'role';

export type Iso639_1Codes = 'en' | 'es' | 'pt' | 'ht' | 'fr' | 'zh';

// License state of the whole install (GET /v2/license). Mirrors the backend
// LicenseStatus schema; the key string itself is never sent to the browser.
// Server settings page (GET /v2/server-settings, super admins).
export interface ServerSetting {
  key: string;
  group: string;
  kind: 'live' | 'restart';
  scope: 'api' | 'jobs' | 'ai';
  type: 'boolean' | 'integer' | 'string' | 'secret' | 'cron' | 'choice';
  // The allowed values of a 'choice' setting.
  options?: string[];
  value: string; // effective value; secrets masked
  source: 'panel' | 'env' | 'default';
  envValue: string | null;
  default: string;
  updatedAt: string | null;
  updatedBy: string | null;
  restartPending: boolean;
  // Page tab and whether the group sits under "Advanced"; older APIs omit both.
  tab?: ServerSettingsTab;
  advanced?: boolean;
}
export type ServerSettingsTab = 'api' | 'chats' | 'users' | 'safety' | 'ai' | 'email' | 'system';
// Read-only health of the install (GET /v2/server-settings/status, super admins).
export interface ServerStatus {
  version: { build: string | null; commit: string | null; line: string | null; installKind: string | null };
  update: {
    checked: boolean;
    latest: string | null;
    available: boolean;
    command: string | null;
    reason?: string | null;
    // The in-place updater of a compose install (older APIs omit it).
    updater?: { available: boolean };
  };
  services: Array<{ key: string; label: string; ok: boolean | null; detail?: string | null }>;
  disk: { totalBytes: number; freeBytes: number } | null;
  certificates: Array<{ host: string; validTo: string | null; daysLeft: number | null; error?: string | null }>;
  license: { state: string | null; tier: string | null; lastContactAt: string | null; lastContactStatus: string | null };
  checkedAt: string;
  // How long the server and each part have been up (older APIs omit it).
  uptime?: {
    serverSeconds: number | null;
    processes: Partial<Record<RestartScope, string | null>>;
    services: Partial<Record<'mongo' | 'redis' | 'xmpp', number | null>>;
  };
  // The last restart asked from the admin panel, and what still waits for one.
  restart?: {
    lastRequest: { id: string; at: string; by?: string | null; scopes: RestartScope[]; notBefore?: string | null } | null;
    pendingScopes: RestartScope[];
  };
}
// The processes the admin panel can restart (POST /v2/server-settings/restart).
export type RestartScope = 'api' | 'jobs' | 'ai';
export interface RestartRequestResponse {
  id: string;
  scopes: RestartScope[];
  at: string;
  // A scheduled restart (delaySeconds > 0) acts from this time on.
  notBefore?: string | null;
}

// The maintenance notice every user sees (GET /v2/server-notice, public).
export interface ServerNotice {
  id: string;
  kind: 'restart' | 'update' | 'rollback';
  startsAt: string;
  expiresAt: string;
  target: string | null;
  downtimeSeconds?: number;
}
export interface ServerNoticeResponse {
  notice: ServerNotice | null;
}

// The compose bundle's updater (its status as GET /v2/server-settings/update returns it).
export type UpdaterStepName = 'bundle' | 'configure' | 'pull' | 'waiting' | 'restart' | 'check' | 'done';
export type UpdaterStepState = 'pending' | 'running' | 'done' | 'skipped' | 'failed';
export interface UpdaterJob {
  id: string;
  action: 'update' | 'rollback';
  target: string;
  from: string | null;
  state: 'scheduled' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  step: UpdaterStepName | null;
  steps: Array<{ name: UpdaterStepName; state: UpdaterStepState }>;
  notBefore: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  log: string[];
}
export interface UpdaterStatus {
  ok: boolean;
  line: string | null;
  tag: string | null;
  running: string | null;
  previous: string | null;
  bundle?: { commit: string | null; git: boolean };
  job: UpdaterJob | null;
}
export interface ServerUpdateInfo {
  available: boolean;
  reason: null | 'not_configured' | 'unreachable';
  current: string | null;
  latest: string | null;
  command: string | null;
  updater: UpdaterStatus | null;
}

// An Enterprise module as the API sees it: installed = its service is part of
// this install (null: the API cannot tell), running = it answered just now.
export interface ServerModule {
  key: 'ai' | 'push' | 'playground' | 'mcp' | 'uptime' | 'moderation';
  tab: ServerSettingsTab;
  installed: boolean | null;
  running: boolean | null;
  licensed: boolean;
  enableCommand: string | null;
  // Public page of the module (playground, MCP connector, uptime dashboard).
  url?: string | null;
  // The page has a sign-in the super admin can reveal (uptime's basic auth):
  // GET /v2/server-settings/modules/:key/credentials.
  hasCredentials?: boolean;
}
export interface ServerSettingsResponse {
  settings: ServerSetting[];
  processes: Record<string, string | null>;
  // How the server was installed; older APIs omit it.
  installKind?: 'compose' | 'host';
  tabs?: ServerSettingsTab[];
  groups?: Array<{ key: string; tab: ServerSettingsTab }>;
  modules?: ServerModule[];
  info?: { installKind?: 'compose' | 'host'; translateUrl: string | null; e2eeInstall: boolean; apiDocsUrl?: string | null };
}

export type LicenseState = 'licensed' | 'grace' | 'unlicensed';
// Edition the install runs as. core = Ethora Core, unregistered (no key).
export type LicenseTier = 'core' | 'core-registered' | 'trial' | 'enterprise';

export interface LicenseStatus {
  state: LicenseState;
  reason:
    | 'ok'
    | 'no_key'
    | 'malformed'
    | 'invalid_signature'
    | 'domain_mismatch'
    | 'not_yet_valid'
    | 'expired'
    | 'call_home_overdue';
  source: 'env' | 'stored' | 'none';
  checkedAt: string;
  installedAt: string;
  graceEndsAt: string | null;
  instanceId: string;
  hosts: string[];
  features: string[];
  tier: LicenseTier;
  // Per-server caps of the edition; null = unlimited.
  limits: { apps: number | null; users: number | null };
  // Current counts next to the caps (GET /v2/license only).
  usage?: { apps: { used: number | null; limit: number | null }; users: { used: number | null; limit: number | null } };
  restrictions: { createApps: boolean; createUsers: boolean; adminPanel: boolean };
  license: {
    lid: string;
    customer: string;
    domain: string;
    tier: string;
    issuedAt: string | null;
    expiresAt: string;
    features: string[];
    limits: Record<string, number>;
    offline: boolean;
  } | null;
  keyError: { reason: string; mismatchedHosts: string[] } | null;
  // Pull credential for the private Enterprise module images (Docker Hub),
  // issued per customer by the license server; super admins only.
  registry?: { username: string; token: string; updatedAt: string | null } | null;
  // How the server was installed; older APIs omit it (treat as 'host').
  installKind?: 'compose' | 'host';
  // Features the server's admin turned off for users (Server settings);
  // older APIs omit it, which means nothing is turned off.
  operator?: { aiAgents: boolean; e2eeAllowed: boolean };
  callHome: {
    enabled: boolean;
    serverConfigured: boolean;
    lastAt: string | null;
    lastStatus: string | null;
  };
  serverTime: string;
}

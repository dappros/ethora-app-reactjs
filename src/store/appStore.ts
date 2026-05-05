import { StateCreator } from 'zustand';
import {
  ModelAgent,
  ModelAiWidgetValues,
  ModelApp,
  ModelBotInstance,
  ModelCurrentUser,
  ModelOwnerSession,
  ModelState,
} from '../models';

// localStorage key for the most-recently-selected Chats app context.
// Suffixed `-538` to match the existing `token-538` convention used
// elsewhere in this app, so all of our keys are easily greppable.
const CHAT_APP_ID_LS_KEY = 'chatAppId-538';

function readPersistedChatAppId(): string | null {
  try {
    const v = localStorage.getItem(CHAT_APP_ID_LS_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function persistChatAppId(appId: string | null) {
  try {
    if (appId) {
      localStorage.setItem(CHAT_APP_ID_LS_KEY, appId);
    } else {
      localStorage.removeItem(CHAT_APP_ID_LS_KEY);
    }
  } catch {
    // private mode / quota exceeded - non-fatal, just lose persistence.
  }
}

type ImmerStateCreator<T> = StateCreator<
  T,
  [['zustand/immer', never], never],
  [],
  T
>;

export interface AppSliceInterface extends ModelState {
  doSetUser: (user: ModelCurrentUser) => void;
  doSetCurrentApp: (app: ModelApp) => void;
  doAddApp: (app: ModelApp) => void;
  doSetApp: (apps: ModelApp) => void;
  doSetApps: (apps: Array<ModelApp>) => void;
  doUpdateApp: (app: ModelApp) => void;
  doUpdateUser: (userFieldsForUpdate: Record<string, string | boolean>) => void;
  doClearState: () => void;
  doSetAiValues: (app: ModelAiWidgetValues) => void;
  // Phase 1 (Agents): in-memory agent + bot-instance lists for the AI Bots admin tab.
  doSetAgents: (agents: Array<ModelAgent>) => void;
  doUpsertAgent: (agent: ModelAgent) => void;
  doRemoveAgent: (id: string) => void;
  doSetBotInstances: (instances: Array<ModelBotInstance>) => void;
  doSelectAgent: (id: string | null) => void;
  // Tenant-Owner App Switcher (Option A). `doSetOwnerSession` is the
  // primary mutator, called by `actionSwitchChatApp` after the
  // `/v2/apps/:appId/owner-session` round-trip. Setting `null` reverts to
  // the base-app end-user identity (used on logout / "use my user" reset).
  doSetChatAppId: (appId: string | null) => void;
  doSetOwnerSession: (session: ModelOwnerSession | null) => void;
  doSetOwnedApps: (apps: Array<ModelApp>) => void;
}

export const createAppSlice: ImmerStateCreator<AppSliceInterface> = (
  set,
) => ({
  inited: false,
  currentUser: null,
  currentApp: null,
  apps: [],
  aiWidgetValues: {
    displayName: '',
    avatar: '',
  },
  // Phase 1 (Agents): default to empty lists; populated by actionListAgents on mount of AIBots page.
  agents: [],
  botInstances: [],
  selectedAgentId: null,
  // Hydrate `chatAppId` from localStorage on first store creation so that
  // re-opening the app picks up where the admin left off. The owner-session
  // itself is never persisted (it contains short-lived credentials); it
  // gets re-fetched lazily by Chat.tsx on mount when `chatAppId` is set.
  chatAppId: readPersistedChatAppId(),
  ownerSession: null,
  ownedApps: [],
  doSetUser: (user: ModelCurrentUser | null) => {
    set((s) => {
      s.currentUser = user;
    });
  },
  doClearState: () => {
    set((s) => {
      s.currentUser = null;
    });
  },
  doUpdateUser: (userFieldsForUpdate: any) => {
    set((s) => {
      if (s.currentUser) {
        s.currentUser.firstName = userFieldsForUpdate.firstName;
        s.currentUser.lastName = userFieldsForUpdate.lastName;
        s.currentUser.description = userFieldsForUpdate.description;
        s.currentUser.profileImage = userFieldsForUpdate.profileImage;
        s.currentUser.isAssetsOpen = userFieldsForUpdate.isAssetsOpen;
        s.currentUser.isProfileOpen = userFieldsForUpdate.isProfileOpen;
      }
    });
  },
  doSetCurrentApp: (app: ModelApp | null) => {
    set((s) => {
      s.currentApp = app;
    });
  },
  doAddApp: (app) => {
    set((s) => {
      const newApps = s.apps.concat([app]);
      s.apps = newApps;
    });
  },
  doSetApps: (apps) => {
    set((s) => {
      s.apps = apps;
    });
  },
  doSetApp: (app) => {
    set((s) => {
      if(s.apps.some((ap) => ap._id === app._id)) {
        s.apps = s.apps.map((ap) => ap._id === app._id ? app : ap);
      }
      s.apps = [...s.apps, app];
    });
  },
  doUpdateApp: (app) => {
    set((s) => {
      const newApps = s.apps.concat([]);
      const index = newApps.findIndex((el) => el._id === app._id);

      if (index !== -1) {
        newApps[index] = app;
      }

      if (s.currentApp?._id === app._id) {
        s.currentApp = app;
      }

      s.apps = newApps;
    });
  },
  doSetAiValues: (values) => {
    set((s) => {
      if(!values) return;

      const {avatar, displayName} = values;

      if (JSON.stringify(s.aiWidgetValues) === JSON.stringify(values)) return;

        s.aiWidgetValues.avatar = avatar;
        s.aiWidgetValues.displayName = displayName;
    });
  },
  doSetAgents: (agents) => {
    set((s) => {
      s.agents = agents;
    });
  },
  doUpsertAgent: (agent) => {
    set((s) => {
      const idx = s.agents.findIndex((a) => a.id === agent.id);
      if (idx >= 0) {
        s.agents[idx] = agent;
      } else {
        s.agents.push(agent);
      }
    });
  },
  doRemoveAgent: (id) => {
    set((s) => {
      s.agents = s.agents.filter((a) => a.id !== id);
      if (s.selectedAgentId === id) s.selectedAgentId = null;
    });
  },
  doSetBotInstances: (instances) => {
    set((s) => {
      s.botInstances = instances;
    });
  },
  doSelectAgent: (id) => {
    set((s) => {
      s.selectedAgentId = id;
    });
  },
  doSetChatAppId: (appId) => {
    // Persist eagerly so a hard reload restores the choice. Note we do NOT
    // clear `ownerSession` here - the caller (actionSwitchChatApp) is in
    // charge of pairing chatAppId with a freshly-minted session because
    // it has the API client.
    persistChatAppId(appId);
    set((s) => {
      s.chatAppId = appId;
    });
  },
  doSetOwnerSession: (session) => {
    set((s) => {
      s.ownerSession = session;
    });
  },
  doSetOwnedApps: (apps) => {
    set((s) => {
      s.ownedApps = apps;
    });
  },
});

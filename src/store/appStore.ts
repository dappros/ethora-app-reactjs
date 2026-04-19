import { StateCreator } from 'zustand';
import { ModelAgent, ModelAiWidgetValues, ModelApp, ModelBotInstance, ModelCurrentUser, ModelState } from '../models';

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
});

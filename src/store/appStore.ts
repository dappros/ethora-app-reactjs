import { StateCreator } from 'zustand';
import {
  Iso639_1Codes,
  ModelApp,
  ModelCurrentUser,
  ModelState,
} from '../models';

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
  doUpdateUser: (userFieldsForUpdate: any) => void;
  doSetLangSource: (langSource: Iso639_1Codes) => void;
  doClearState: () => void;
}

export const createAppSlice: ImmerStateCreator<AppSliceInterface> = (
  set,
  _
) => ({
  inited: false,
  currentUser: null,
  currentApp: null,
  apps: [],
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
      let newApps = s.apps.concat([app]);
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
      if (s.apps.some((ap) => ap._id === app._id)) {
        return;
      }
      s.apps = [...s.apps, app];
    });
  },
  doUpdateApp: (app) => {
    set((s) => {
      let newApps = s.apps.concat([]);
      let index = newApps.findIndex((el) => el._id === app._id);

      if (index !== -1) {
        newApps[index] = app;
      }

      if (s.currentApp?._id === app._id) {
        s.currentApp = app;
      }

      console.log('doUpdateApp newApps ', newApps);
      s.apps = newApps;
    });
  },
  doSetLangSource: (langSource: Iso639_1Codes) => {
    set((state) => {
      if (state.currentUser) {
        state.currentUser.langSource = langSource;
      }
    });
  },
});

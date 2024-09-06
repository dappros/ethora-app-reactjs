import { StateCreator } from "zustand";
import { ModelApp, ModelCurrentApp, ModelCurrentUser, ModelState } from "../models";

type ImmerStateCreator<T> = StateCreator<
  T,
  [["zustand/immer", never], never],
  [],
  T
>;

export interface AppSliceInterface extends ModelState {
  doSetUser: (user: ModelCurrentUser) => void
  doSetCurrentApp: (app: ModelCurrentApp) => void
  doAddApp: (app: ModelApp) => void
  doSetApps: (apps: Array<ModelApp>) => void
}

export const createAppSlice: ImmerStateCreator<
  AppSliceInterface
> = (set, get) => ({
  inited: false,
  currentUser: null,
  currentApp: null,
  apps: [],
  doSetUser: (user: ModelCurrentUser | null) => {
    set((s) => {
      s.currentUser = user
    })
  },
  doSetCurrentApp: (app: ModelCurrentApp | null) => {
    set((s) => {
      s.currentApp = app
    })
  },
  doAddApp: (app) => {
    set((s) => {
      let newApps = s.apps.concat([app])
      s.apps = newApps
    })
  },
  doSetApps: (apps) => {
    set((s) => {
      s.apps = apps
    })
  }
});

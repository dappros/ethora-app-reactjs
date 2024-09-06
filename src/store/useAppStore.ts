import create from "zustand";
import { immer } from 'zustand/middleware/immer'
import { createAppSlice, AppSliceInterface } from "./appStore";

export const useAppStore = create(immer<AppSliceInterface>(
  (...a) => ({...createAppSlice(...a)})
))

declare global {
  interface Window {
    useAppStore?: any;
  }
}

window.useAppStore = useAppStore
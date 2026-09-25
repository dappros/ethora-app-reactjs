// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// One /ping/version request per page load, shared by the auth-screen build
// footer and the admin edition footer.
import { env } from '../config/env';

export type BackendVersionInfo = {
  version: string | null;
  build: {
    version: string | null;
    commit: string | null;
    branch?: string | null;
    time: string | null;
  };
};

let backendVersionPromise: Promise<BackendVersionInfo | null> | null = null;

export function fetchBackendVersionOnce(): Promise<BackendVersionInfo | null> {
  if (!backendVersionPromise) {
    const apiBase = (env.VITE_API as string | undefined) || '/v1';
    const url = apiBase.replace(/\/+$/, '') + '/ping/version';
    backendVersionPromise = fetch(url, { credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return backendVersionPromise;
}

// Where the AI widget bundle lives, for both the admin preview and the embed
// snippet handed to operators.
//
// In a PRODUCTION build the bundle that ships with the app always wins.
//
// The env vars are still read, but only as a fallback, and only for an
// explicitly self-hosted copy. That ordering is the whole point: on QA
// VITE_WIDGET_URL said https://widget.chat-qa.ethora.com/assistant2604.js, an
// April build on a static host with a separate deploy nobody re-ran, and
// because the env won, the product followed a string that no longer described
// anything real. What ships now is whatever commit package-lock.json pins,
// copied into public/widget/ by `prebuild`. An env left over on some server
// cannot override it.
//
// `npm run dev` is the exception, and only there: pointing VITE_WIDGET_URL at
// the widget's own Vite dev server (http://localhost:5173/src/main.tsx) is how
// unreleased widget changes get tested without a build, and that has to keep
// working. A dev server is not a deploy, so nothing can rot this way.

import { BUNDLED_WIDGET_PATH } from '../generated/bundledWidget';

const fromEnv = (): string =>
  (import.meta.env.VITE_WIDGET_VERSIONED_URL as string | undefined) ||
  (import.meta.env.VITE_WIDGET_URL as string | undefined) ||
  '';

export function resolveWidgetUrl(): string {
  if (import.meta.env.DEV) {
    const dev = fromEnv();
    if (dev) return dev;
  }
  if (BUNDLED_WIDGET_PATH) {
    // Absolute, not root-relative: this string is pasted into the operator's
    // own site, where a leading "/" would resolve against THEIR origin.
    return typeof window === 'undefined'
      ? BUNDLED_WIDGET_PATH
      : new URL(BUNDLED_WIDGET_PATH, window.location.origin).href;
  }
  // Only reachable if the bundle is missing, i.e. prebuild never ran.
  return fromEnv();
}

// Where the AI widget bundle lives, for both the admin preview and the embed
// snippet handed to operators.
//
// Resolution order, most specific first:
//
//   1. VITE_WIDGET_VERSIONED_URL - an explicit, immutable URL. First, not
//      last: while VITE_WIDGET_URL took precedence the versioned value could
//      never win when both were set, and browsers happily served a cached 3 MB
//      bundle after a deploy, which reads exactly like "the fix did not work".
//   2. VITE_WIDGET_URL - local development against the widget's own Vite dev
//      server, e.g. http://localhost:5173/src/main.tsx, so unreleased widget
//      changes show up without a build.
//   3. The copy shipped with this app. This is the default and needs no env
//      at all: `prebuild` copies @ethora/ai-chat-widget's bundle into
//      public/widget/, so the version is pinned by package-lock.json and
//      deployed by the same deploy that ships the admin.
//
// (3) is what stops the class of bug that produced assistant2604.js: an env
// string on one host pointing at a bundle deployed by a different pipeline,
// with nothing anywhere to notice the two had drifted apart.

import { BUNDLED_WIDGET_PATH } from '../generated/bundledWidget';

export function resolveWidgetUrl(): string {
  const explicit =
    (import.meta.env.VITE_WIDGET_VERSIONED_URL as string | undefined) ||
    (import.meta.env.VITE_WIDGET_URL as string | undefined) ||
    '';
  if (explicit) return explicit;
  // Absolute, not root-relative: this string is pasted into the operator's own
  // site, where a leading "/" would resolve against THEIR origin.
  if (typeof window === 'undefined') return BUNDLED_WIDGET_PATH;
  return new URL(BUNDLED_WIDGET_PATH, window.location.origin).href;
}

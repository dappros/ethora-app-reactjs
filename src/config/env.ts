// Runtime-first configuration.
//
// Every VITE_* value the app reads goes through `env` instead of
// `import.meta.env`. Vite still inlines the build-time value, but a
// `/config.js` script loaded before the app (see index.html) can override
// any key at runtime through `window.__ETHORA_CONFIG__`. That is what lets
// one prebuilt frontend image serve every install: the container entrypoint
// writes config.js from its environment, and source-mode builds keep
// working unchanged because public/config.js ships an empty object.
//
// Rules:
//   - keys are listed statically below; Vite only replaces static
//     `import.meta.env.VITE_X` accesses, a dynamic lookup would never work
//   - an empty runtime string does not override the build value, so an
//     entrypoint can pass every VITE_* it knows without blanking defaults
//   - values are resolved once at module load; config.js is a classic
//     synchronous script in <head>, so it has run by then

const BUILD_TIME = {
  VITE_API: import.meta.env.VITE_API,
  VITE_API_V2: import.meta.env.VITE_API_V2,
  VITE_ROOT_DOMAIN: import.meta.env.VITE_ROOT_DOMAIN,
  VITE_HOSTED_APPS_ROOT_DOMAIN: import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN,
  VITE_DOMAIN_NAME: import.meta.env.VITE_DOMAIN_NAME,
  VITE_PLATFORM_NAME: import.meta.env.VITE_PLATFORM_NAME,
  VITE_APP_ALLOWED_DOMAINS: import.meta.env.VITE_APP_ALLOWED_DOMAINS,
  VITE_APP_XMPP_SERVICE: import.meta.env.VITE_APP_XMPP_SERVICE,
  VITE_APP_CENTRIFUGE_SERVICE: import.meta.env.VITE_APP_CENTRIFUGE_SERVICE,
  VITE_XMPP_SERVICE: import.meta.env.VITE_XMPP_SERVICE,
  VITE_XMPP_HOST: import.meta.env.VITE_XMPP_HOST,
  VITE_WIDGET_URL: import.meta.env.VITE_WIDGET_URL,
  VITE_WIDGET_VERSIONED_URL: import.meta.env.VITE_WIDGET_VERSIONED_URL,
  VITE_QR_URL: import.meta.env.VITE_QR_URL,
  VITE_AI_FEATURE_ENABLED: import.meta.env.VITE_AI_FEATURE_ENABLED,
  VITE_VIDEO_CALLS_ENABLED: import.meta.env.VITE_VIDEO_CALLS_ENABLED,
  VITE_LIVEKIT_URL: import.meta.env.VITE_LIVEKIT_URL,
  VITE_SITE_KEY: import.meta.env.VITE_SITE_KEY,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  VITE_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  VITE_GA_ID: import.meta.env.VITE_GA_ID,
  VITE_CLARITY_ID: import.meta.env.VITE_CLARITY_ID,
  VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
  VITE_HUBSPOT_ENABLED: import.meta.env.VITE_HUBSPOT_ENABLED,
  VITE_HUBSPOT_PORTAL_ID: import.meta.env.VITE_HUBSPOT_PORTAL_ID,
  VITE_HUBSPOT_FORM_ID_SIGNUP: import.meta.env.VITE_HUBSPOT_FORM_ID_SIGNUP,
  VITE_HUBSPOT_FORM_ID_TUTORIAL: import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL,
  VITE_MCP_PUBLIC_URL: import.meta.env.VITE_MCP_PUBLIC_URL,
  VITE_BUILD_VERSION: import.meta.env.VITE_BUILD_VERSION,
  VITE_BUILD_BRANCH: import.meta.env.VITE_BUILD_BRANCH,
  VITE_BUILD_COMMIT: import.meta.env.VITE_BUILD_COMMIT,
} as const;

export type EnvKey = keyof typeof BUILD_TIME;

export type RuntimeConfig = Partial<Record<EnvKey, string>>;

declare global {
  interface Window {
    __ETHORA_CONFIG__?: RuntimeConfig;
  }
}

function runtimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') return {};
  const cfg = window.__ETHORA_CONFIG__;
  return cfg && typeof cfg === 'object' ? cfg : {};
}

// Typed as `string` to match what `import.meta.env.VITE_X` was for the
// untyped keys before this module existed (Vite types them as `any`); a key
// that is unset in both places is `undefined` at runtime, exactly as before.
function resolve(): Record<EnvKey, string> {
  const rt = runtimeConfig();
  const out = {} as Record<EnvKey, string>;
  (Object.keys(BUILD_TIME) as EnvKey[]).forEach((key) => {
    const runtime = rt[key];
    out[key] =
      typeof runtime === 'string' && runtime !== ''
        ? runtime
        : (BUILD_TIME[key] as string);
  });
  return out;
}

export const env: Readonly<Record<EnvKey, string>> = Object.freeze(resolve());

/** True when at least one value came from /config.js rather than the build. */
export function hasRuntimeConfig(): boolean {
  return Object.keys(runtimeConfig()).length > 0;
}

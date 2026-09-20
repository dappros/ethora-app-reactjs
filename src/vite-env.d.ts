/// <reference types="vite/client" />

// Build-time values only. Application code reads configuration through
// src/config/env.ts (`env.VITE_X`), never `import.meta.env` directly, so a
// prebuilt bundle can be reconfigured at runtime via /config.js.
interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_POSTHOG_KEY: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_APP_XMPP_SERVICE: string;
  readonly VITE_XMPP_HOST: string;
  readonly VITE_XMPP_SERVICE: string;
  readonly VITE_MCP_PUBLIC_URL?: string;
  readonly VITE_RUNTIME_CONFIG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

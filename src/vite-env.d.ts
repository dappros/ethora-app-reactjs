/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_APP_XMPP_SERVICE: string;
  readonly VITE_XMPP_HOST: string;
  readonly VITE_XMPP_SERVICE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

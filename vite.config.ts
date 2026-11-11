import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import { cspPlugin } from './vite-plugin-csp';
import { wellKnownPlugin } from './vite-plugin-well-known';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8080';
  // Use a built sibling SDK locally when the App and chat changes ship together.
  const localChatSdk = env.ETHORA_LOCAL_CHAT_SDK ? resolve(env.ETHORA_LOCAL_CHAT_SDK) : null;
  return ({
  // cspPlugin is build-only (see vite-plugin-csp.ts) — the dev server
  // keeps working exactly as before.
  plugins: [react(), cspPlugin(env), wellKnownPlugin(env)],
  resolve: localChatSdk ? {
    alias: [{ find: /^@ethora\/chat-component$/, replacement: resolve(localChatSdk, 'dist/main.js') }],
    dedupe: ['react', 'react-dom'],
  } : undefined,
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or "modern"
      },
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production to avoid warnings
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress source map warnings
        if (warning.code === 'SOURCEMAP_ERROR' || warning.message?.includes('source map')) {
          return;
        }
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    // Suppress source map warnings for dependencies
    esbuildOptions: {
      target: 'es2020',
    },
    // Exclude buffer from pre-bundling to avoid externalization warning
    exclude: ['buffer'],
  },
  // Suppress console warnings in development
  logLevel: 'warn',
  // Handle global for browser compatibility
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  // Suppress source map warnings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  server: {
    fs: localChatSdk ? { allow: [searchForWorkspaceRoot(process.cwd()), localChatSdk] } : undefined,
    // Suppress source map warnings in dev mode
    hmr: {
      overlay: false, // Disable error overlay for cleaner console
    },
    // Proxy API requests to backend to avoid CORS issues
    proxy: {
      '/v1': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        timeout: 30000, // 30 seconds timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        },
      },
      '/v2': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        timeout: 30000, // 30 seconds timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        },
      },
    },
  },
  });
});
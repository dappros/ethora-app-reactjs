import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8080';
  return ({
  plugins: [react()],
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

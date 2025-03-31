import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['ethora-favicon.png', 'logo.png'],
      manifest: {
        name: 'Ethora App',
        short_name: 'Ethora',
        description: 'Ethora Progressive Web App',
        theme_color: '#ffffff',
        start_url: '/',
        id: '/',
        scope: '/',
        icons: [
          {
            src: 'ethora-favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'Opengraph-ethora-app.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Homescreen of Ethora App'
          },
          {
            src: 'Opengraph-ethora-app.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Ethora App on mobile'
          }
        ],
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        background_color: '#ffffff',
        categories: ['social', 'communication'],
        prefer_related_applications: false,
        orientation: 'any'
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});

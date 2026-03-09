import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker filename and scope
      filename: 'sw.js',
      // Cache the app shell and all static assets for offline use
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // The service worker file itself must not be cached by the browser;
        // nginx is configured to send Cache-Control: no-store for sw.js.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      // Web App Manifest — controls how the app appears when installed
      manifest: {
        name: 'Civic OS',
        short_name: 'CivicOS',
        description: 'A civic engagement platform for proposals, voting, and community governance.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        orientation: 'any',
        scope: '/',
        lang: 'en',
        categories: ['government', 'productivity', 'social'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            url: '/',
            description: 'Platform overview and activity feed',
          },
          {
            name: 'Proposals',
            url: '/proposals',
            description: 'Submit and track civic proposals',
          },
          {
            name: 'Voting',
            url: '/voting',
            description: 'Cast votes on open polls',
          },
        ],
      },
    }),
  ],
  envDir: '../',
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: [
      {
        find: 'declarations',
        replacement: fileURLToPath(new URL('../src/declarations', import.meta.url))
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    },
    host: '127.0.0.1'
  }
});

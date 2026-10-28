import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// Dev needs Vite's refresh preamble and websocket. Production has neither.
const productionCsp =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self'";

export default defineConfig({
  base: '/Glowmory/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Glowmory',
        short_name: 'Glowmory',
        description: "Good days don't go. They glow.",
        theme_color: '#FFE5D4',
        background_color: '#8E7CC3',
        display: 'standalone',
        icons: [
          {
            src: 'assets/glowmory-tab.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,woff,png}'],
        cleanupOutdatedCaches: true,
      },
    }),
    {
      name: 'production-security-policy',
      apply: 'build',
      transformIndexHtml() {
        return [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: productionCsp,
            },
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  ],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
  build: { sourcemap: false },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});

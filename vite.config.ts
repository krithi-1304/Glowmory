import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Dev needs Vite's refresh preamble and websocket. Production has neither.
const productionCsp =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self'";

export default defineConfig({
  plugins: [
    react(),
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

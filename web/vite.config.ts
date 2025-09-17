// vite.config.ts
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

// Allow only these parents to embed the app (adjust as needed)
const CSP = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
  "frame-ancestors 'self' http://127.0.0.1:5173 http://localhost:5173 http://127.0.0.1:5177 http://localhost:5177",
].join('; ');

function cspFrameAncestors(): Plugin {
  return {
    name: 'csp-frame-ancestors',
    configureServer(server) {
      server.middlewares.use((_, res, next) => {
        res.setHeader('Content-Security-Policy', CSP);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_, res, next) => {
        res.setHeader('Content-Security-Policy', CSP);
        next();
      });
    },
  };
}

export default defineConfig({
  appType: 'spa',
  plugins: [react(), cspFrameAncestors()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: '/', // change to '/forge' if you prefer
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
  },
});

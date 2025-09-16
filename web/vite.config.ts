// Note: Node's `URL` is a global in ESM, but we explicitly import it from "node:url"
// to make casing/usage clear across environments.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // you're already running from /web — keep the app as a SPA
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      // Clean, robust alias to /web/src
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: '/', // change to '/forge' if you want Forge to auto-open
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] }, // allow repo root
  },
})

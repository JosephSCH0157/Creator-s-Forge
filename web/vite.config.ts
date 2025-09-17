// vite.config.ts
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Adjust to the exact parents that may embed your app:
const CSP = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
  "frame-ancestors 'self' http://127.0.0.1:5173 http://localhost:5173 http://127.0.0.1:5177 http://localhost:5177",
].join('; ');

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: '/',
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    headers: { 'Content-Security-Policy': CSP }, // ✅ dev header
  },
  preview: {
    headers: { 'Content-Security-Policy': CSP }, // ✅ vite preview header
  },
});

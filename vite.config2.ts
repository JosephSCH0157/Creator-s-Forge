// vite.config.ts (root)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ESM-safe __dirname / __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute helpers rooted at repo root
const r = (...p: string[]) => resolve(__dirname, ...p);

export default defineConfig({
  // Serve the SPA from /web (where your index.html lives)
  root: r('web'),

  plugins: [react()],

  resolve: {
    alias: {
      // Use "@/..." anywhere to refer to files under web/src
      '@': r('web', 'src'),
    },
  },

  // Ensure /public assets resolve from web/public
  publicDir: r('web', 'public'),

  server: {
    host: true,
    port: 5173,
    open: '/forge', // start on your splash
    // proxy: { '/api': { target: 'http://localhost:5177', changeOrigin: true, secure: false } },
  },

  build: {
    outDir: r('dist'),    // write build to /dist at repo root
    emptyOutDir: true,    // clear dist before build
  },

  // Optional: preview settings for `vite preview`
  preview: {
    port: 5174,
    open: true,
  },
});

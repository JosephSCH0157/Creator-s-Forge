// vite.config.ts (at repo root)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'web'),               // <-- serve from web/
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'web/src'),        // <-- alias to web/src
    },
  },
  server: {
    host: true,
    port: 5173,
    open: '/forge',                                   // optional: open splash
    proxy: {
      '/api': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),          // output to /dist at repo root
    emptyOutDir: true,
  },
})

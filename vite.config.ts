import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'web'),                 // serve from /web
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'web/src'),         // @ -> web/src
    },
  },
  publicDir: path.resolve(__dirname, 'web/public'),     // ensure /public assets load
  server: {
    host: true,
    port: 5173,
    open: '/forge',                                     // optional: open splash
    proxy: {
      '/api': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),            // build to /dist at root
    emptyOutDir: true,
  },
})

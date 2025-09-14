// vite.config.ts (at repo root)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'web/src'),
    },
  },
  publicDir: path.resolve(__dirname, 'web/public'),
  server: {
    host: true,
    port: 5173,
    open: '/forge', // optional: land on splash
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})

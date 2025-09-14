import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const r = (...p: string[]) => resolve(__dirname, ...p);

export default defineConfig({
  root: r('web'),
  plugins: [react()],
  resolve: { alias: { '@': r('web','src') } },
  publicDir: r('web','public'),
  server: { host: true, port: 5173, open: '/forge' },
  build: { outDir: r('dist'), emptyOutDir: true },
});

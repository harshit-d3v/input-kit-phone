import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@input-kit/phone': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
});

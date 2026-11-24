import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@input-kit/phone/flags',
        replacement: path.resolve(__dirname, '../../src/flags.tsx'),
      },
      {
        find: '@input-kit/phone/validation',
        replacement: path.resolve(__dirname, '../../src/validation.ts'),
      },
      {
        find: '@input-kit/phone',
        replacement: path.resolve(__dirname, '../../src/index.ts'),
      },
    ],
  },
});

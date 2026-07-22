import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // Ship readable output: consumers' bundlers minify anyway, and unminified
  // code gives usable stack traces in issue reports.
  minify: false,
  treeshake: true,
  external: ['react', 'react-dom'],
});

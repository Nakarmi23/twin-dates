import { defineConfig } from 'tsup';
import type { Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  config: 'tsconfig.json',
  clean: true,
  format: ['esm', 'cjs', 'iife'],
  minify: options.watch ? false : 'terser',
  dts: true,
  treeshake: 'recommended',
  globalName: 'BikramSambat',
  ...options,
}));

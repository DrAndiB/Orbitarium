import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync, readFileSync } from 'node:fs';

// Personal progress history: seed.local.md (git-ignored) locally, or the SEED_PROGRESS secret in CI.
const seed = existsSync('seed.local.md') ? readFileSync('seed.local.md', 'utf8') : (process.env.SEED_PROGRESS ?? '');

// Two build modes:
//  - default: normal multi-file build into dist/ (used by the Android app via Capacitor)
//  - single:  one self-contained HTML file in dist-single/ (used for the browser preview)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  define: { __SEED_PROGRESS__: JSON.stringify(seed) },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
    chunkSizeWarningLimit: 2000,
    target: 'es2020',
  },
}));

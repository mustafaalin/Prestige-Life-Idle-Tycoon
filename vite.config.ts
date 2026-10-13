import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** v2 draws edge to edge and pads with safe-area insets (src/game/mobile.css); v1 keeps its viewport. */
function viewportFitCover(): Plugin {
  return {
    name: 'v2-viewport-fit-cover',
    transformIndexHtml: (html) => html.replace(/(<meta name="viewport" content="[^"]*)"/, '$1, viewport-fit=cover"'),
  };
}

/** Folders under public/assets that only v1 uses (~27 MB); they stay in the repo until v1 is removed (plan 2.11). */
const V1_ONLY_ASSETS = [
  'audio/music',
  'businesses/large',
  'businesses/small',
  'houses',
  'investments',
  'jobs/manager',
  'jobs/specialist',
  'jobs/workers',
  'outfits',
];

/** Keeps v1's pictures out of the v2 build, so they are not shipped inside the app. */
function dropV1Assets(): Plugin {
  let outDir = 'dist';
  return {
    name: 'v2-drop-v1-assets',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const folder of V1_ONLY_ASSETS) rmSync(resolve(outDir, 'assets', folder), { recursive: true, force: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isV2 = loadEnv(mode, process.cwd(), 'VITE_').VITE_GAME_V2 === 'true';
  return {
    plugins: [react(), ...(isV2 ? [viewportFitCover(), dropV1Assets()] : [])],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});

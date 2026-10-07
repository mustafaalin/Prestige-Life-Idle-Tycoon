import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** v2 draws edge to edge and pads with safe-area insets (src/game/mobile.css); v1 keeps its viewport. */
function viewportFitCover(): Plugin {
  return {
    name: 'v2-viewport-fit-cover',
    transformIndexHtml: (html) => html.replace(/(<meta name="viewport" content="[^"]*)"/, '$1, viewport-fit=cover"'),
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isV2 = loadEnv(mode, process.cwd(), 'VITE_').VITE_GAME_V2 === 'true';
  return {
    plugins: [react(), ...(isV2 ? [viewportFitCover()] : [])],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});

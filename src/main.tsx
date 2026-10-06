import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// v2 rebuild lives side by side with v1 until it replaces it (docs/rebuild-plan.md).
// Only the chosen root is loaded, so v1 code never runs in a v2 build and vice versa.
const loadRoot = import.meta.env.VITE_GAME_V2 === 'true' ? () => import('./game/AppV2') : () => import('./App');

loadRoot().then(({ default: Root }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Root />
    </StrictMode>
  );
});

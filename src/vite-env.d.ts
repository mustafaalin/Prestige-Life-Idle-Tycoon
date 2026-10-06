/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' mounts the v2 game (src/game/AppV2) instead of v1. */
  readonly VITE_GAME_V2?: string;
  /** 'true' shows the v2 developer menu outside `npm run dev` (playtest builds). */
  readonly VITE_DEV_MENU?: string;
}

// The portrait column the game is drawn in (AppV2, mobile.css .v2-stage). Overlays are portalled
// into it, not into <body>, so they stay inside the column on wide screens.

export const STAGE_ID = 'v2-stage';

export function portalRoot(): HTMLElement {
  return document.getElementById(STAGE_ID) ?? document.body;
}

/** A point measured on the screen (getBoundingClientRect), in the column's own coordinates. */
export function toStage(x: number, y: number): { x: number; y: number } {
  const rect = document.getElementById(STAGE_ID)?.getBoundingClientRect();
  return rect ? { x: x - rect.left, y: y - rect.top } : { x, y };
}

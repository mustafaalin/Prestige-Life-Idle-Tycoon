// The home scene's money mechanics (story-v2.md §4, discussion-notes §9). Checked by `npm run sim`.

/** Bottles and cans in the alley: each one collected pays tapValue (a few seconds of income). */
export const COLLECT_MAX_ON_SCREEN = 4;
/** A new item appears this often while fewer than the max are out, so collecting tops out near 1 / this per second. */
export const COLLECT_SPAWN_SECONDS = 2.5;

/** Now and then Şans brings something he found (a wallet); tapping him in time pays a bonus. */
export const FETCH_MIN_SECONDS = 300;
export const FETCH_MAX_SECONDS = 600;
/** How long Şans waits with the find before giving up. */
export const FETCH_WINDOW_SECONDS = 12;
/** The find is worth this many bottles (≈ a minute of income). */
export const FETCH_BOTTLES = 15;

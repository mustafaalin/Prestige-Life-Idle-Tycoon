// The home scene's money mechanics (story-v2.md §4, discussion-notes §9). Checked by `npm run sim`.

/** Bottles and cans in the alley: each one collected pays BOTTLE_VALUE_BY_CLASS (economy/manual.ts tapValue). */
export const COLLECT_MAX_ON_SCREEN = 4;
/** A new item appears this often while fewer than the max are out, so collecting tops out near 1 / this per second. */
export const COLLECT_SPAWN_SECONDS = 2.5;
/** Nothing lies on the ground from this class on (Middle Class): the hero no longer bends down for money (2026-10-12). */
export const COLLECT_END_CLASS = 3;

/** Now and then Şans brings something he found (a wallet); tapping him in time pays a bonus. */
export const FETCH_MIN_SECONDS = 300;
export const FETCH_MAX_SECONDS = 600;
/**
 * Until the first manager is hired Şans comes much more often (decided 2026-10-13): those minutes
 * have little else to do, and nothing earns on its own yet.
 */
export const FETCH_EARLY_MIN_SECONDS = 90;
export const FETCH_EARLY_MAX_SECONDS = 150;
/**
 * What one bottle or can pays by class (Street, Day Laborer, Working Class: coins), decided 2026-10-20
 * (docs/game-design-v2.md §4.7): fixed, so collecting matters early and fades as income grows. A
 * Flower Stand run pays ~12 bottles.
 */
export const BOTTLE_VALUE_BY_CLASS = [2, 3, 5];
/** The find is worth this many bottles... */
export const FETCH_BOTTLES = 15;
/** ...plus this many seconds of income, so it still counts once the ground is empty. */
export const FETCH_INCOME_SECONDS = 30;

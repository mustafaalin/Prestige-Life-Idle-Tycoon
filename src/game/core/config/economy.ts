// Global economy knobs. Every value here is checked by `npm run sim` against the pacing targets
// in docs/game-design-v2.md §5.

/** Share of a business's full output an active player gets by tapping it without a manager. */
export const ACTIVE_UNMANAGED_EFFICIENCY = 0.6;

/**
 * Offline: share of idle income earned while away. 20% since the economy rebuild (decided 2026-10-21,
 * user; was 50%): time away earns money but never ages the hero, and at 50% three quarters of all
 * money came from it, so the realistic calendar ran four times too fast (docs/economy-rebuild.md §2).
 */
export const OFFLINE_RATE = 0.2;
/**
 * How many hours of away time count, by wealth class (Street → Richest). Starts short so a first
 * return after a few minutes of play doesn't skip a whole class, and grows as you climb (like
 * Egg, Inc.'s silos). Decision 2026-10-08, game-design §4.6; 1 hour at most since 2026-10-21 (was 2).
 */
export const OFFLINE_CAP_HOURS_BY_CLASS = [1 / 6, 0.25, 0.5, 0.5, 1, 1, 1, 1];
/** The longest cap (the late game). */
export const OFFLINE_CAP_HOURS = Math.max(...OFFLINE_CAP_HOURS_BY_CLASS);

/** Legacy points a generation leaves = floor(LEGACY_SCALE × (its earnings / LEGACY_BASE) ^ LEGACY_EXPONENT). */
export const LEGACY_SCALE = 10;
export const LEGACY_BASE = 1e6;
/** Cube root: doubling a generation's points takes 8× its earnings, which keeps resets from snowballing. */
export const LEGACY_EXPONENT = 1 / 3;

export const STARTING_CASH = 0;

/**
 * The gift that closes a class ceremony and the life moments told by age (date, wedding, birth;
 * decided 2026-10-14): this many seconds of the income while playing (managers, salary, rent and the
 * businesses run by hand; the top bar shows only what runs by itself). A rewarded ad doubles it
 * (config/ads.ts AD_STORY_GIFT_MULTIPLIER). 30 minutes was asked for, but the first classes come
 * minutes apart and it pulled Millionaire and Billionaire before their targets. At 10 minutes (and at 7
 * or 8) Multibillionaire comes 11 minutes of play earlier, in day 7's last session instead of day 8's first.
 */
export const STORY_GIFT_SECONDS = 10 * 60;
/**
 * Ceremonies from this class on close with the gift: none for Day Laborer (2026-10-14), it comes in the
 * first session, before ads open, and paid for the first manager at once.
 */
export const STORY_GIFT_FROM_CLASS = 2;

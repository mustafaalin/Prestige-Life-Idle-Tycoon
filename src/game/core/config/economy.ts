// Global economy knobs. Every value here is checked by `npm run sim` against the pacing targets
// in docs/game-design-v2.md §5.

/** Owned-unit counts where a business's profit doubles. */
export const PROFIT_MILESTONES = [25, 50, 75];
export const PROFIT_MILESTONE_FACTOR = 2;

/** Share of a business's full output an active player gets by tapping it without a manager. */
export const ACTIVE_UNMANAGED_EFFICIENCY = 0.6;

/**
 * Money per collected bottle = TAP_BASE + TAP_INCOME_SECONDS × active income per second. A bottle is
 * worth several seconds of income so collecting is worth the effort (2026-10-08); bottles are capped
 * by how fast they appear (config/scene.ts), so tapping can't replace the economy.
 */
export const TAP_BASE = 2;
export const TAP_INCOME_SECONDS = 2.5;

/** Offline: share of idle income earned while away. */
export const OFFLINE_RATE = 0.5;
/**
 * How many hours of away time count, by wealth class (Street → Richest). Starts short so a first
 * return after a few minutes of play doesn't skip a whole class, and grows as you climb (like
 * Egg, Inc.'s silos). Decision 2026-10-08, game-design §4.6.
 */
export const OFFLINE_CAP_HOURS_BY_CLASS = [1 / 6, 0.25, 0.5, 1, 2, 2, 2, 2];
/** The longest cap (the late game). */
export const OFFLINE_CAP_HOURS = Math.max(...OFFLINE_CAP_HOURS_BY_CLASS);

/** Legacy points = floor(LEGACY_SCALE × (totalEarnings / LEGACY_BASE) ^ LEGACY_EXPONENT). */
export const LEGACY_SCALE = 10;
export const LEGACY_BASE = 1e6;
/** Cube root: doubling the family legacy takes 8× the lifetime earnings, which keeps resets from snowballing. */
export const LEGACY_EXPONENT = 1 / 3;
/** Income bonus per legacy point (0.02 = +2%). */
export const LEGACY_BONUS_PER_POINT = 0.01;

export const STARTING_CASH = 0;

/**
 * The gift that closes a class ceremony and the life moments told by age (date, wedding, birth;
 * decided 2026-10-14): this many seconds of the income the top bar shows. A rewarded ad doubles it
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

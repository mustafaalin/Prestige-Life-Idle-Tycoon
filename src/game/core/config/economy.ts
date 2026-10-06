// Global economy knobs. Every value here is checked by `npm run sim` against the pacing targets
// in docs/game-design-v2.md §5.

/** Owned-unit counts where a business's profit doubles. */
export const PROFIT_MILESTONES = [10, 25, 50, 100, 200, 300];
export const PROFIT_MILESTONE_FACTOR = 2;

/** Share of a business's full output an active player gets by tapping it without a manager. */
export const ACTIVE_UNMANAGED_EFFICIENCY = 0.6;

/** Money per tap = TAP_BASE + TAP_INCOME_SECONDS × active income per second. */
export const TAP_BASE = 1;
export const TAP_INCOME_SECONDS = 0.05;

/** Offline: share of idle income earned while away, and how many hours it can pile up. */
export const OFFLINE_RATE = 0.5;
export const OFFLINE_CAP_HOURS = 2;

/** Legacy points = floor(LEGACY_SCALE × (totalEarnings / LEGACY_BASE) ^ LEGACY_EXPONENT). */
export const LEGACY_SCALE = 10;
export const LEGACY_BASE = 1e6;
/** Cube root: doubling the family legacy takes 8× the lifetime earnings, which keeps resets from snowballing. */
export const LEGACY_EXPONENT = 1 / 3;
/** Income bonus per legacy point (0.02 = +2%). */
export const LEGACY_BONUS_PER_POINT = 0.01;

export const STARTING_CASH = 0;

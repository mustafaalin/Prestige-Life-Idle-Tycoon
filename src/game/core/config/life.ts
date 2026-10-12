// The hero's life clock (docs/game-design-v2.md §4.9). Age moves only while the game is open;
// time away earns money but never ages the hero. At the end of life the hero retires and the heir takes over.

/** Age the hero (and every heir) starts at. */
export const START_AGE = 17;
/**
 * Age at which the hero retires and hands the family over to the heir (2026-10-11; was 97). The heir is
 * a grandchild born when the hero is 63, so the handover finds them at START_AGE.
 */
export const RETIREMENT_AGE = 80;
/**
 * Seconds of play per in-game month: 1 minute ≈ 3 weeks, so 16 minutes = 1 year (2026-10-09; was
 * 1 minute = 1 month). Slower ageing lets the classes spread over more days while the hero is still
 * in his fifties at the last ceremony.
 */
export const SECONDS_PER_MONTH = 80;
export const SECONDS_PER_YEAR = SECONDS_PER_MONTH * 12;
/** Seconds of play in a whole life (63 years ≈ 17 hours). */
export const LIFE_SECONDS = (RETIREMENT_AGE - START_AGE) * SECONDS_PER_YEAR;

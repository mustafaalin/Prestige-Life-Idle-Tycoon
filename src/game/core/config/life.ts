// The hero's life clock (docs/game-design-v2.md §4.9). Age moves only while the game is open;
// time away earns money but never ages the hero. At the end of life the hero retires and the heir takes over.

/** Age the hero (and every heir) starts at. */
export const START_AGE = 17;
/** Age at which the hero retires and hands the family over to the heir. */
export const RETIREMENT_AGE = 97;
/** Seconds of play per in-game month: 1 minute = 1 month, so 12 minutes = 1 year. */
export const SECONDS_PER_MONTH = 60;
export const SECONDS_PER_YEAR = SECONDS_PER_MONTH * 12;
/** Seconds of play in a whole life (80 years ≈ 16 hours). */
export const LIFE_SECONDS = (RETIREMENT_AGE - START_AGE) * SECONDS_PER_YEAR;

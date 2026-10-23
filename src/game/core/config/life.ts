// The hero's life clock (docs/game-design-v2.md §4.9). Age moves while the game is open, and a little
// while it is closed (AWAY_AGE_RATE). At the end of life the hero retires and the heir takes over.

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
/** From this age the first hero looks like a grandfather on the scene and in the story (story-v2.md §6). */
export const GRANDPA_AGE = 60;
/**
 * From the top class on, age runs this many times faster (2026-10-16, discussion-notes.md §3.5): once
 * there is no class left to reach, the hero gets to 80 in about 2 hours of play instead of 7–14, so
 * the wait for the hand-over stays short. The hero is ~51 at the last ceremony.
 */
export const TOP_CLASS_AGE_SPEED = 4;
/**
 * Time away ages the hero a little (2026-10-23, user): this share of the time away, counting at most
 * AWAY_AGE_CAP_HOURS of each absence. Someone who plays 2–3 minutes every few days earns most of their
 * money away (offline, the daily reward, Old Ray's deals) and was a Millionaire at 20, a Billionaire at
 * 32; each return now adds ~3 minutes of life (about 2 months): 23 and 48 (npm run sim -- --rare). The
 * engaged player's breaks add some 3 minutes a day (Billionaire at 70, target ≤ 72).
 */
export const AWAY_AGE_RATE = 0.002;
export const AWAY_AGE_CAP_HOURS = 24;

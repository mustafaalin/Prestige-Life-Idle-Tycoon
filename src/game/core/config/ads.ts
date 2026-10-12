// Rewarded ads (docs/monetization-v2.md §4, decided 2026-10-08). Every ad is the player's own choice
// and every reward is a slice of income, so an ad speeds the game up without replacing it.
// Rules: runtime/adRewards.ts. Checked by `npm run sim` (the "engaged + ads" profile).

/** Şans's find: the ad pays the card this many times over. */
export const AD_FIND_MULTIPLIER = 2;
/**
 * Offline earnings: the ad adds 30% to the card. Not ×2: most of the money in a life comes from these
 * cards (87% in the simulator), so doubling them nearly halved the game (2026-10-13).
 */
export const AD_OFFLINE_MULTIPLIER = 1.3;
/** The offline card offers its ad only after this long away. */
export const AD_OFFLINE_MIN_SECONDS = 10 * 60;

/** The income boost: all earnings ×2 for an hour of real time (it also runs while away)... */
export const BOOST_FACTOR = 2;
export const BOOST_SECONDS = 60 * 60;
/** ...stacking up to four hours, at most six ads a day. */
export const BOOST_MAX_SECONDS = 4 * 60 * 60;
export const BOOSTS_PER_DAY = 6;

/** "A little help": this much automatic income, offered only when what is missing is no more than that. */
export const HELP_INCOME_SECONDS = 15 * 60;
export const HELPS_PER_DAY = 5;

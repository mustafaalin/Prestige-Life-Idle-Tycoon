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

/**
 * "A little help" pays what is missing for the purchase, offered only when that is no more than 10% of
 * its price and no more than 5 minutes of automatic income (the share alone reached 40 minutes on late
 * promotions and managers). It used to pay 15 minutes of income whenever that covered the gap, which
 * left most of it in the wallet and sped the game up too much (2026-10-14).
 */
export const HELP_MAX_SHARE = 0.1;
export const HELP_MAX_INCOME_SECONDS = 5 * 60;
export const HELPS_PER_DAY = 5;

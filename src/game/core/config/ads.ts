// Rewarded ads (docs/monetization-v2.md §4, decided 2026-10-08; many more places 2026-10-21). Every ad
// is the player's own choice, behind a button where the player already is: never a pop-up, never forced.
// Every reward is a slice of income or of time, so ads speed the game up (a player who watches them
// gets on 40–50% faster, decided 2026-10-21) without replacing it. Rules: runtime/adRewards.ts.
// Checked by `npm run sim` (the "engaged + ads" profile).

/** Every place an ad can be watched. Analytics and the save count by these ids: never rename one. */
export type AdPlacement =
  | 'offline_x2'
  | 'find_x2'
  | 'income_boost'
  | 'dream_help'
  | 'story_gift_x2'
  | 'daily_x2'
  | 'course_rush'
  | 'experience_rush'
  | 'invest_rush'
  | 'invest_special'
  | 'temp_manager'
  | 'business_campaign'
  | 'quest_x3'
  | 'event_bonus'
  | 'grown_bonus'
  | 'diploma_gift'
  | 'first_salary'
  | 'call_sans'
  | 'coin_rain'
  | 'opportunity'
  | 'dev_test';

export interface AdPlacementDef {
  /** Ads a calendar day at this place (left out: no daily limit; the place itself limits it). */
  perDay?: number;
  /** Seconds between two ads at this place. */
  cooldownSeconds?: number;
}

/**
 * The limits of each place. A place that appears once per thing (a card, a course, a job) needs none:
 * the thing is the limit. One table, so a new place is one line here and one reward in adRewards.ts.
 */
export const AD_PLACEMENTS: Record<AdPlacement, AdPlacementDef> = {
  offline_x2: {},
  find_x2: {},
  income_boost: { perDay: 6 },
  dream_help: { perDay: 12 },
  story_gift_x2: {},
  daily_x2: {},
  course_rush: { perDay: 6 },
  experience_rush: { perDay: 3 },
  invest_rush: {},
  invest_special: { perDay: 2 },
  temp_manager: { perDay: 4 },
  business_campaign: { perDay: 3 },
  quest_x3: { perDay: 10 },
  event_bonus: { perDay: 10 },
  grown_bonus: {},
  diploma_gift: {},
  first_salary: {},
  call_sans: { perDay: 5, cooldownSeconds: 10 * 60 },
  coin_rain: { perDay: 3, cooldownSeconds: 15 * 60 },
  opportunity: { perDay: 8 },
  dev_test: {},
};

/** Şans's find: the ad pays the card this many times over. */
export const AD_FIND_MULTIPLIER = 2;
/**
 * Offline earnings: the ad adds 30% to the card. Not ×2: most of the money in a life comes from these
 * cards (87% in the simulator), so doubling them nearly halved the game (2026-10-13).
 */
export const AD_OFFLINE_MULTIPLIER = 1.3;
/** The gift that closes a ceremony or a life moment: the ad pays it this many times over (2026-10-14). */
export const AD_STORY_GIFT_MULTIPLIER = 2;
/** The offline card offers its ad after any absence long enough to bring the card (2026-10-21: was 10 minutes). */
export const AD_OFFLINE_MIN_SECONDS = 0;

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

// ── Places added 2026-10-21 (the economy rebuild made waiting the thing to sell) ──

/** A course: one ad takes this share of its length off (at least a month), at most twice per course. */
export const COURSE_RUSH_SHARE = 0.25;
export const COURSE_RUSH_PER_COURSE = 2;
/** The job held: one ad adds this many months of experience. */
export const EXPERIENCE_RUSH_MONTHS = 3;
/** A running deal: one ad halves the time left, once per deal. */
export const INVEST_RUSH_SHARE = 0.5;
/** A business without a manager runs by itself this long (real time, while the game is open). */
export const TEMP_MANAGER_SECONDS = 15 * 60;
/** One business earns this many times over for this long (real time, while the game is open). */
export const CAMPAIGN_FACTOR = 2;
export const CAMPAIGN_SECONDS = 15 * 60;
/** A goal's reward: the ad pays it this many times in all. */
export const QUEST_AD_MULTIPLIER = 3;
/** An answered event card: the ad pays the result again, or takes a loss back and pays the safe answer. */
export const EVENT_AD_MULTIPLIER = 2;
/**
 * Gifts an ad brings on a card that has none of its own ("has grown", a diploma): this many seconds of
 * income, about a month and a half (10 minutes gave $18K for a $300 first-aid course).
 */
export const AD_GIFT_SECONDS = 2 * 60;
/** A new job: the ad pays this many months of its salary as a welcome bonus. */
export const FIRST_SALARY_MONTHS = 1;
/** Coins rain on the ground (Street to Working Class): this long, this much faster, each worth this much more.
 * Twice as fast since 2026-10-21 (user: it should pour), every spot on the ground can hold a piece. */
export const COIN_RAIN_SECONDS = 30;
export const COIN_RAIN_SPAWN_FACTOR = 8;
export const COIN_RAIN_VALUE_FACTOR = 3;
/** The opportunity balloon floats by now and then; its ad pays this many seconds of income. */
export const OPPORTUNITY_SECONDS = 60;
export const OPPORTUNITY_MIN_GAP_SECONDS = 6 * 60;
export const OPPORTUNITY_MAX_GAP_SECONDS = 10 * 60;
/** How long the balloon stays on screen. */
export const OPPORTUNITY_WINDOW_SECONDS = 20;

import { GRANDPA_AGE } from './life';
import { COLLECT_END_CLASS } from './scene';

// Event cards (game-design §4.7): from Middle Class on, when nothing lies on the ground any more,
// someone the hero knows calls now and then with a small opportunity. Most calls have two answers: the
// safe one pays a sure amount, the bold one pays a lot more or costs a little, at odds shown on the
// card (EventKind has the other two kinds). No branches, no lasting effects. Who speaks and with which face: ui/events/eventScript.ts; text in
// i18n `events.cards.<id>`. Checked by `npm run sim`.

/**
 * The kinds of call: a safe and a bold answer (the bold one can cost money), a thank-you with a small
 * gift and no choice, or two equal options that only add flavour and pay the same (2026-10-21, user).
 */
export type EventKind = 'choice' | 'thanks' | 'pick';

export interface EventCardDef {
  id: string;
  /** A manager's card: it only comes once this business has its manager... */
  businessId?: string;
  /** ...and has reached this look (0 stand, 1 shop, 2 store), so the story grows with the business. */
  stage?: number;
  /** The card waits for this wealth class (the caller enters the story with its ceremony). */
  fromClass?: number;
  /** Left out: 'choice'. */
  kind?: EventKind;
  /** The card stops coming at this age of the hero (the caller has grown old, or the story moved on). */
  untilAge?: number;
}

/**
 * Old Ray and Mrs. Nora are not seen in person once the hero is a grandfather (story-v2.md §6): the
 * 70 moment speaks of Old Ray in the past tense. Their cards, and those about Defne's grandmother, stop.
 */
const OLD_FRIENDS_UNTIL = GRANDPA_AGE;
/** Mrs. Nora's "Defne keeps talking about you" belongs before the wedding (story §4c, 28). */
const BEFORE_WEDDING = 28;
/** The cousin's own wedding. */
const COUSIN_WEDDING_UNTIL = 45;

/**
 * Three cards a manager, one per look of the business (2026-10-21, user: more variety, in order with
 * the business), and a few from people the hero knows. Old Ray's and Mr. Bryce's cards are theirs as
 * managers. Who speaks: ui/events/eventScript.ts.
 */
export const EVENT_CARDS: EventCardDef[] = [
  // flower-stand
  { id: 'wedding', businessId: 'flower-stand', untilAge: OLD_FRIENDS_UNTIL },
  { id: 'roses', businessId: 'flower-stand', stage: 1, untilAge: OLD_FRIENDS_UNTIL },
  { id: 'lobby', businessId: 'flower-stand', stage: 2, untilAge: OLD_FRIENDS_UNTIL },
  // coffee-cart
  { id: 'festival', businessId: 'coffee-cart' },
  { id: 'dessert', businessId: 'coffee-cart', stage: 1, kind: 'pick' },
  { id: 'roaster', businessId: 'coffee-cart', stage: 2 },
  // bakery
  { id: 'bun', businessId: 'bakery' },
  { id: 'nightshift', businessId: 'bakery', stage: 1, kind: 'thanks' },
  { id: 'tiers', businessId: 'bakery', stage: 2 },
  // car-wash
  { id: 'film', businessId: 'car-wash' },
  { id: 'tunnelsong', businessId: 'car-wash', stage: 1, kind: 'pick' },
  { id: 'buses', businessId: 'car-wash', stage: 2 },
  // mini-market
  { id: 'neighbor', businessId: 'mini-market' },
  { id: 'tab', businessId: 'mini-market', stage: 1, kind: 'thanks' },
  { id: 'villages', businessId: 'mini-market', stage: 2 },
  // restaurant
  { id: 'critic', businessId: 'restaurant' },
  { id: 'soup', businessId: 'restaurant', stage: 1, kind: 'pick' },
  { id: 'franchise', businessId: 'restaurant', stage: 2 },
  // beauty-salon
  { id: 'celebrity', businessId: 'beauty-salon' },
  { id: 'brides', businessId: 'beauty-salon', stage: 1 },
  { id: 'nevinhair', businessId: 'beauty-salon', stage: 2, kind: 'thanks', untilAge: OLD_FRIENDS_UNTIL },
  // real-estate-office
  { id: 'flat', businessId: 'real-estate-office' },
  { id: 'listing', businessId: 'real-estate-office', stage: 1, kind: 'pick' },
  { id: 'tower', businessId: 'real-estate-office', stage: 2 },
  // logistics-warehouse
  { id: 'ducks', businessId: 'logistics-warehouse' },
  { id: 'rush', businessId: 'logistics-warehouse', stage: 1 },
  { id: 'drones', businessId: 'logistics-warehouse', stage: 2 },
  // construction
  { id: 'schoolroof', businessId: 'construction', kind: 'thanks' },
  { id: 'tender', businessId: 'construction', stage: 1 },
  { id: 'stadium', businessId: 'construction', stage: 2 },
  // factory
  { id: 'solar', businessId: 'factory' },
  { id: 'staffbus', businessId: 'factory', stage: 1, kind: 'pick' },
  { id: 'export', businessId: 'factory', stage: 2 },
  // hotel
  { id: 'cake', businessId: 'hotel', fromClass: 5 },
  { id: 'waiters', businessId: 'hotel', stage: 1, kind: 'thanks' },
  { id: 'stage', businessId: 'hotel', stage: 2 },
  // media
  { id: 'liveradio', businessId: 'media' },
  { id: 'series', businessId: 'media', stage: 1 },
  { id: 'documentary', businessId: 'media', stage: 2, kind: 'pick' },
  // tech-startup
  { id: 'dogapp', businessId: 'tech-startup' },
  { id: 'robot', businessId: 'tech-startup', stage: 1, kind: 'pick' },
  { id: 'ipo', businessId: 'tech-startup', stage: 2 },
  // People the hero knows: Nevin Hanım, Defne, the cousin.
  { id: 'fair', untilAge: OLD_FRIENDS_UNTIL },
  { id: 'coin' },
  { id: 'nevincookies', kind: 'thanks', untilAge: BEFORE_WEDDING },
  { id: 'nevingarden', kind: 'pick', untilAge: OLD_FRIENDS_UNTIL },
  { id: 'library' },
  { id: 'album', kind: 'pick', untilAge: OLD_FRIENDS_UNTIL },
  { id: 'birthday', kind: 'thanks', untilAge: OLD_FRIENDS_UNTIL },
  { id: 'cousincar', kind: 'pick', untilAge: COUSIN_WEDDING_UNTIL },
];

/** Cards start where collecting ends. */
export const EVENT_START_CLASS = COLLECT_END_CLASS;

/** The first call of a session comes soon, so a short session still gets one... */
export const EVENT_FIRST_MIN_SECONDS = 60;
export const EVENT_FIRST_MAX_SECONDS = 90;
/** ...and after an answered card the next one takes this long. */
export const EVENT_MIN_SECONDS = 240;
export const EVENT_MAX_SECONDS = 360;

/** What each outcome pays, in seconds of active income; a bold answer that fails costs money (never
 * below zero cash). The bold answer pays only a little more on average (55 s against 45), so always
 * answering bold is not the obvious play (2026-10-12). Since 2026-10-15 a failure loses 20 s instead of
 * paying 10 s (user: the risk should be real): with losses felt about twice as much as gains, the
 * bold answer still feels like the safe one (45 s), so the choice stays open. */
export const EVENT_REWARD_SECONDS = { safe: 45, win: 130, lose: -20 };
/** The bold answer works out this often (shown on the card). */
export const EVENT_BOLD_CHANCE = 0.5;

export type EventOutcome = keyof typeof EVENT_REWARD_SECONDS;

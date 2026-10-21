import { COLLECT_END_CLASS } from './scene';

// Event cards (game-design §4.7): from Middle Class on, when nothing lies on the ground any more,
// someone the hero knows calls now and then with a small opportunity. Two answers: the safe one pays
// a sure amount, the bold one pays a lot more or costs a little, at odds shown on the card. No
// branches, no lasting effects. Who speaks and with which face: ui/events/eventScript.ts; text in
// i18n `events.cards.<id>`. Checked by `npm run sim`.

export interface EventCardDef {
  id: string;
  /** A manager's card: it only comes once this business has its manager. */
  businessId?: string;
  /** The card waits for this wealth class (the caller enters the story with its ceremony). */
  fromClass?: number;
}

export const EVENT_CARDS: EventCardDef[] = [
  { id: 'wedding' },
  { id: 'fair' },
  { id: 'coin' },
  { id: 'festival', businessId: 'coffee-cart' },
  { id: 'bun', businessId: 'bakery' },
  { id: 'film', businessId: 'car-wash' },
  { id: 'neighbor', businessId: 'mini-market' },
  { id: 'celebrity', businessId: 'beauty-salon' },
  { id: 'ducks', businessId: 'logistics-warehouse' },
  // Mr. Bryce works for the hero after the Billionaire ceremony.
  { id: 'cake', fromClass: 5 },
];

/** Cards start where collecting ends. */
export const EVENT_START_CLASS = COLLECT_END_CLASS;

/** The first call of a session comes soon, so a short session still gets one... */
export const EVENT_FIRST_MIN_SECONDS = 60;
export const EVENT_FIRST_MAX_SECONDS = 90;
/** ...and after an answered card the next one takes this long. */
export const EVENT_MIN_SECONDS = 240;
export const EVENT_MAX_SECONDS = 360;

/** Calls a day at most: with ten cards more made the same callers ring again and again (2026-10-21).
 * The cards are dealt like a deck (runtime/eventDeck.ts). */
export const EVENT_DAILY_MAX = 6;

/** What each outcome pays, in seconds of active income; a bold answer that fails costs money (never
 * below zero cash). The bold answer pays only a little more on average (55 s against 45), so always
 * answering bold is not the obvious play (2026-10-12). Since 2026-10-15 a failure loses 20 s instead of
 * paying 10 s (user: the risk should be real): with losses felt about twice as much as gains, the
 * bold answer still feels like the safe one (45 s), so the choice stays open. */
export const EVENT_REWARD_SECONDS = { safe: 45, win: 130, lose: -20 };
/** The bold answer works out this often (shown on the card). */
export const EVENT_BOLD_CHANCE = 0.5;

export type EventOutcome = keyof typeof EVENT_REWARD_SECONDS;

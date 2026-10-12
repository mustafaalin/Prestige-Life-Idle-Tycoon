import { COLLECT_END_CLASS } from './scene';

// Event cards (game-design §4.7): from Middle Class on, when nothing lies on the ground any more,
// someone the hero knows calls now and then with a small opportunity. Two answers: the safe one pays
// a sure amount, the bold one pays more or next to nothing, at odds shown on the card. No branches,
// no lasting effects, no penalties. Who speaks and with which face: ui/events/eventScript.ts; text in
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

/** What each outcome pays, in seconds of active income. The bold answer pays only a little more on
 * average (55 s against 45), so always answering bold is not the obvious play (2026-10-12). */
export const EVENT_REWARD_SECONDS = { safe: 45, win: 100, lose: 10 };
/** The bold answer works out this often (shown on the card). */
export const EVENT_BOLD_CHANCE = 0.5;

export type EventOutcome = keyof typeof EVENT_REWARD_SECONDS;

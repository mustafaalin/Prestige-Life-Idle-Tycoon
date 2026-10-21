import { LIFE_SECONDS, SECONDS_PER_MONTH, SECONDS_PER_YEAR, START_AGE, TOP_CLASS_AGE_SPEED } from './config/life';
import { WEALTH_CLASSES } from './config/classes';
import { CONTENT } from './config/content';
import { STORY_GIFT_SECONDS } from './config/economy';
import {
  EVENT_BOLD_CHANCE,
  EVENT_CARDS,
  EVENT_REWARD_SECONDS,
  EVENT_START_CLASS,
  type EventCardDef,
  type EventOutcome,
} from './config/events';
import { RICH_LIST_ANCHORS, RICH_LIST_ENTRY, RICH_RIVALS } from './config/richList';
import { businessDef, businessStage } from './economy/business';
import { autoIncomePerSecond, incomePerSecond } from './economy/income';
import { heirloomEffect, legacyMultiplier } from './economy/legacy';
import type { GameStateV2, QuestDef } from './types';

// Game rules that read the economy: goals, story gifts, the daily reward, event cards, the life
// clock, wealth classes and the Rich List. The economy itself lives in core/economy/ (businesses,
// income sources, multipliers, legacy, money by hand); it is re-exported here so screens have one import.

export * from './economy/business';
export * from './economy/career';
export * from './economy/income';
export * from './economy/legacy';
export * from './economy/manual';
export * from './economy/multipliers';

/** What claiming a goal pays: a little early on, then a slice of income. */
export function questReward(state: GameStateV2, quest: QuestDef) {
  return Math.max(
    quest.rewardMin * legacyMultiplier(state),
    incomePerSecond(state, 'active') * quest.rewardSeconds,
  );
}

/** The gift that closes a ceremony or a life moment (config/economy.ts STORY_GIFT_SECONDS). */
export function storyGift(state: GameStateV2) {
  return incomePerSecond(state, 'active') * STORY_GIFT_SECONDS * (1 + heirloomEffect(state, 'album'));
}

/** The daily reward: `months` of the monthly income the top bar shows (config/daily.ts). */
export function dailyReward(state: GameStateV2, months: number) {
  return autoIncomePerSecond(state) * SECONDS_PER_MONTH * months;
}

// ── Event cards (config/events.ts) ───────────────────────────────────────────

/**
 * The cards that can come now. `classIndex` is the class the player has seen: in the first life a
 * class counts once its ceremony has played, so nobody calls before the story introduced them.
 */
export function eventCardsFor(state: GameStateV2, classIndex = state.classIndex): EventCardDef[] {
  if (classIndex < EVENT_START_CLASS) return [];
  return EVENT_CARDS.filter((card) => {
    if (classIndex < (card.fromClass ?? 0)) return false;
    if (card.businessId === undefined) return true;
    const business = state.businesses[card.businessId];
    const def = businessDef(card.businessId);
    return business?.managed === true && def !== undefined && businessStage(def, business.level) >= (card.stage ?? 0);
  });
}

/** What an outcome pays (negative: what a failed bold answer costs, before the zero-cash floor). */
export function eventReward(state: GameStateV2, outcome: EventOutcome) {
  return incomePerSecond(state, 'active') * EVENT_REWARD_SECONDS[outcome];
}

/**
 * What a call pays on average among the cards that can come now (the simulator's player): half the
 * choices safe and half bold; a thank-you or a pick between two equal options pays the safe amount.
 */
export function eventAverageReward(state: GameStateV2) {
  const cards = eventCardsFor(state);
  if (cards.length === 0) return 0;
  const bold =
    EVENT_BOLD_CHANCE * EVENT_REWARD_SECONDS.win + (1 - EVENT_BOLD_CHANCE) * EVENT_REWARD_SECONDS.lose;
  const choice = (EVENT_REWARD_SECONDS.safe + bold) / 2;
  const seconds = cards.reduce((sum, card) => sum + ((card.kind ?? 'choice') === 'choice' ? choice : EVENT_REWARD_SECONDS.safe), 0);
  return (incomePerSecond(state, 'active') * seconds) / cards.length;
}

// ── Life clock ────────────────────────────────────────────────────────────────

/** The hero's age in whole years and months. */
export function heroAge(state: GameStateV2) {
  const months = START_AGE * 12 + Math.floor(state.lifeSeconds / SECONDS_PER_MONTH);
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** Whole years of life left (rounded up, so it reads 0 only when life is over). */
export function yearsLeft(state: GameStateV2) {
  return Math.max(0, Math.ceil((LIFE_SECONDS - state.lifeSeconds) / SECONDS_PER_YEAR));
}

export function isLifeOver(state: GameStateV2) {
  return state.lifeSeconds >= LIFE_SECONDS;
}

/**
 * The life is over and the hand-over waits: the retirement panel, nothing else moves. Only with the
 * hand-over switched on (config/content.ts); at launch the hero stays at 80 and the game goes on.
 */
export function awaitsHandover(state: GameStateV2) {
  return CONTENT.handover && isLifeOver(state);
}

/** How many seconds of life one second of play is: faster once the top class is reached. */
export function ageSpeed(state: GameStateV2) {
  return state.classIndex === WEALTH_CLASSES.length - 1 ? TOP_CLASS_AGE_SPEED : 1;
}

// ── Wealth class and legacy ───────────────────────────────────────────────────

/**
 * Share of the way to the next wealth class (0–1), for progress bars. The square root evens it out:
 * income keeps growing, so a straight share sat near 0% for minutes and then rushed to the end.
 */
export function classProgress(state: GameStateV2) {
  const current = WEALTH_CLASSES[state.classIndex];
  const next = WEALTH_CLASSES[state.classIndex + 1];
  if (!next) return 1;
  const share = (state.generationEarnings - current.threshold) / (next.threshold - current.threshold);
  return Math.sqrt(Math.min(1, Math.max(0, share)));
}

export function classIndexFor(generationEarnings: number) {
  let index = 0;
  WEALTH_CLASSES.forEach((wealthClass, candidate) => {
    if (generationEarnings >= wealthClass.threshold) index = candidate;
  });
  return index;
}

// ── Rich List ─────────────────────────────────────────────────────────────────

/**
 * A rival's fortune as the list shows it. The top one does not let go: once the hero gets close he
 * stays just ahead, so first place comes with $1T and the Richest Person Alive ceremony, not before.
 */
export function rivalFortune(rivalIndex: number, generationEarnings: number) {
  const rival = RICH_RIVALS[rivalIndex];
  if (rivalIndex !== 0) return rival.fortune;
  const top = WEALTH_CLASSES[WEALTH_CLASSES.length - 1].threshold;
  return Math.max(rival.fortune, Math.min(generationEarnings * 1.02, top));
}

/** The hero's place on the Rich List, or null below it. Earnings never fall, so neither does the place. */
export function richListRank(generationEarnings: number): number | null {
  if (generationEarnings < RICH_LIST_ENTRY) return null;
  const top20 = RICH_LIST_ANCHORS[RICH_LIST_ANCHORS.length - 1];
  if (generationEarnings >= top20[0]) {
    const top = WEALTH_CLASSES[WEALTH_CLASSES.length - 1].threshold;
    if (generationEarnings >= top) return 1;
    return 1 + RICH_RIVALS.filter((_, index) => rivalFortune(index, generationEarnings) > generationEarnings).length;
  }
  const upper = RICH_LIST_ANCHORS.findIndex(([earnings]) => earnings > generationEarnings);
  const [lowEarnings, lowRank] = RICH_LIST_ANCHORS[upper - 1];
  const [highEarnings, highRank] = RICH_LIST_ANCHORS[upper];
  const share = Math.log(generationEarnings / lowEarnings) / Math.log(highEarnings / lowEarnings);
  const rank = Math.exp(Math.log(lowRank) + share * (Math.log(highRank) - Math.log(lowRank)));
  // The named top 20 starts with the Multibillionaire class.
  return Math.max(top20[1] + 1, Math.round(rank));
}

export type RichListTarget =
  | { kind: 'entry'; gap: number }
  | { kind: 'place'; rank: number; gap: number }
  | { kind: 'rival'; rivalIndex: number; gap: number }
  | { kind: 'top' };

/** What the hero climbs toward next on the Rich List, and how much more has to be earned for it. */
export function richListTarget(generationEarnings: number): RichListTarget {
  const rank = richListRank(generationEarnings);
  if (rank === null) return { kind: 'entry', gap: RICH_LIST_ENTRY - generationEarnings };
  if (rank === 1) return { kind: 'top' };
  if (rank <= RICH_RIVALS.length + 1) {
    const rivalIndex = rank - 2;
    // The top rival is passed at $1T, however close his shown fortune is.
    const goal =
      rivalIndex === 0 ? WEALTH_CLASSES[WEALTH_CLASSES.length - 1].threshold : RICH_RIVALS[rivalIndex].fortune;
    return { kind: 'rival', rivalIndex, gap: Math.max(0, goal - generationEarnings) };
  }
  const [earnings, place] = RICH_LIST_ANCHORS.find(([, anchorRank]) => anchorRank < rank)!;
  return { kind: 'place', rank: place, gap: earnings - generationEarnings };
}

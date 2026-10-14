import { LIFE_SECONDS, SECONDS_PER_MONTH, SECONDS_PER_YEAR, START_AGE } from './config/life';
import { BUSINESSES } from './config/businesses';
import { CAREERS } from './config/careers';
import { WEALTH_CLASSES } from './config/classes';
import {
  ACTIVE_UNMANAGED_EFFICIENCY,
  LEGACY_BASE,
  LEGACY_BONUS_PER_POINT,
  LEGACY_EXPONENT,
  LEGACY_SCALE,
  OFFLINE_CAP_HOURS_BY_CLASS,
  OFFLINE_RATE,
  PROFIT_MILESTONES,
  PROFIT_MILESTONE_FACTOR,
  STORY_GIFT_SECONDS,
  TAP_BASE,
  TAP_INCOME_SECONDS,
} from './config/economy';
import {
  EVENT_BOLD_CHANCE,
  EVENT_CARDS,
  EVENT_REWARD_SECONDS,
  EVENT_START_CLASS,
  type EventCardDef,
  type EventOutcome,
} from './config/events';
import {
  COLLECT_END_CLASS,
  FETCH_BOTTLES,
  FETCH_EARLY_MAX_SECONDS,
  FETCH_EARLY_MIN_SECONDS,
  FETCH_MAX_SECONDS,
  FETCH_MIN_SECONDS,
} from './config/scene';
import { HOUSES, OWNER_HOME_BONUS } from './config/housing';
import { COLLARS, LIFESTYLE_ITEMS, type CollarDef } from './config/lifestyle';
import { RICH_LIST_ANCHORS, RICH_LIST_ENTRY, RICH_RIVALS } from './config/richList';
import { UPGRADES } from './config/upgrades';
import type { BusinessDef, GameStateV2, IncomeMode, QuestDef } from './types';

const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));
const HOUSE_BY_ID = new Map(HOUSES.map((house) => [house.id, house]));
const UPGRADE_BY_ID = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

// ── Business costs ────────────────────────────────────────────────────────────

export function unitCost(def: BusinessDef, owned: number) {
  return def.baseCost * def.costGrowth ** owned;
}

/** Total price of buying `count` units when `owned` are already owned (geometric series). */
export function costForUnits(def: BusinessDef, owned: number, count: number) {
  if (count <= 0) return 0;
  const g = def.costGrowth;
  return (unitCost(def, owned) * (g ** count - 1)) / (g - 1);
}

/** How many units the player can buy right now with `cash`. */
export function maxAffordableUnits(def: BusinessDef, owned: number, cash: number) {
  const g = def.costGrowth;
  const first = unitCost(def, owned);
  if (cash < first) return 0;
  return Math.floor(Math.log((cash * (g - 1)) / first + 1) / Math.log(g));
}

// ── Milestones ────────────────────────────────────────────────────────────────

export function milestoneMultiplier(owned: number) {
  let reached = 0;
  for (const threshold of PROFIT_MILESTONES) {
    if (owned >= threshold) reached += 1;
  }
  return PROFIT_MILESTONE_FACTOR ** reached;
}

export function nextMilestone(owned: number): number | null {
  return PROFIT_MILESTONES.find((threshold) => threshold > owned) ?? null;
}

// ── Upgrades ──────────────────────────────────────────────────────────────────

/** Product of the bought upgrades of one business (1 when none). */
export function upgradeMultiplier(state: GameStateV2, businessId: string) {
  let multiplier = 1;
  for (const id of state.upgrades) {
    const upgrade = UPGRADE_BY_ID.get(id);
    if (upgrade?.businessId === businessId) multiplier *= upgrade.multiplier;
  }
  return multiplier;
}

// ── Income ────────────────────────────────────────────────────────────────────

/** Income per second of one business line at 100% uptime, before global multipliers. */
export function businessBaseIncomePerSecond(def: BusinessDef, owned: number) {
  if (owned <= 0) return 0;
  return (def.baseRevenue * owned * milestoneMultiplier(owned)) / def.cycleSeconds;
}

export function careerBonus(state: GameStateV2) {
  let bonus = 0;
  for (let index = 0; index <= state.careerIndex && index < CAREERS.length; index += 1) {
    bonus += CAREERS[index].incomeBonus;
  }
  return bonus;
}

/** Bonus from the house you live in: its tier, plus the owner's extra if it is yours. */
export function homeBonus(state: GameStateV2) {
  const house = HOUSE_BY_ID.get(state.home);
  if (!house) return 0;
  return house.homeBonus + (state.homesOwned.includes(house.id) ? OWNER_HOME_BONUS : 0);
}

/** The collar Şans wears in a class (null: still the rope). */
export function collarAt(classIndex: number): CollarDef | null {
  return COLLARS.filter((collar) => collar.fromClass <= classIndex).pop() ?? null;
}

/** Status = your home, Şans's collar and every owned vehicle, outfit and luxury toy. */
export function statusBonus(state: GameStateV2) {
  let bonus = homeBonus(state) + (collarAt(state.classIndex)?.statusBonus ?? 0);
  for (const id of state.lifestyleOwned) {
    bonus += LIFESTYLE_BY_ID.get(id)?.statusBonus ?? 0;
  }
  return bonus;
}

export function legacyMultiplier(legacyPoints: number) {
  return 1 + legacyPoints * LEGACY_BONUS_PER_POINT;
}

/** Everything that scales all income: career, status items, family legacy and Şans's paid accessories. */
export function globalMultiplier(state: GameStateV2) {
  return (
    (1 + careerBonus(state)) * (1 + statusBonus(state)) * legacyMultiplier(state.legacyPoints) * state.accessoryMultiplier
  );
}

export function salaryPerSecond(state: GameStateV2) {
  return state.careerIndex >= 0 ? CAREERS[state.careerIndex].salaryPerSecond : 0;
}

/** Base rent per second from owned houses you do not live in (before global multipliers). */
export function rentPerSecond(state: GameStateV2) {
  let rent = 0;
  for (const id of state.homesOwned) {
    if (id !== state.home) rent += HOUSE_BY_ID.get(id)?.rentPerSecond ?? 0;
  }
  return rent;
}

/** Income paid every second, online and offline: salary plus rent (before global multipliers). */
export function steadyIncomePerSecond(state: GameStateV2) {
  return salaryPerSecond(state) + rentPerSecond(state);
}

/** Share of a business's output the player gets in the given mode. */
export function uptime(managed: boolean, mode: IncomeMode) {
  if (managed) return 1;
  return mode === 'active' ? ACTIVE_UNMANAGED_EFFICIENCY : 0;
}

/** Income per second excluding taps. 'idle' counts only managers, salary and rent (offline, app closed). */
export function incomePerSecond(state: GameStateV2, mode: IncomeMode) {
  let base = steadyIncomePerSecond(state);
  for (const def of BUSINESSES) {
    const business = state.businesses[def.id];
    if (!business || business.owned <= 0) continue;
    base +=
      businessBaseIncomePerSecond(def, business.owned) *
      upgradeMultiplier(state, def.id) *
      uptime(business.managed, mode);
  }
  return base * globalMultiplier(state);
}

/** Money a business line pays each time one of its production cycles completes. */
export function cycleRevenue(state: GameStateV2, def: BusinessDef) {
  const owned = state.businesses[def.id]?.owned ?? 0;
  if (owned <= 0) return 0;
  return (
    def.baseRevenue * owned * milestoneMultiplier(owned) * upgradeMultiplier(state, def.id) * globalMultiplier(state)
  );
}

/** What claiming a goal pays: a little early on, then a slice of income. */
export function questReward(state: GameStateV2, quest: QuestDef) {
  return Math.max(
    quest.rewardMin * legacyMultiplier(state.legacyPoints),
    incomePerSecond(state, 'active') * quest.rewardSeconds,
  );
}

/** Hours of away time that count toward offline earnings at the current wealth class. */
export function offlineCapHours(state: GameStateV2) {
  return OFFLINE_CAP_HOURS_BY_CLASS[Math.min(state.classIndex, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
}

/** Money earned while the app was closed: idle income at OFFLINE_RATE, up to the class's cap. */
export function offlineEarnings(state: GameStateV2, awaySeconds: number, capHours = offlineCapHours(state)) {
  const seconds = Math.min(Math.max(0, awaySeconds), capHours * 3600);
  return incomePerSecond(state, 'idle') * seconds * OFFLINE_RATE;
}

/**
 * Income that arrives without the player doing anything: managed businesses, salary and rent.
 * Screens show this one; 'active' income assumes the player keeps tapping unmanaged businesses.
 */
export function autoIncomePerSecond(state: GameStateV2) {
  return incomePerSecond(state, 'idle');
}

/** The gift that closes a ceremony or a life moment (config/economy.ts STORY_GIFT_SECONDS). */
export function storyGift(state: GameStateV2) {
  return incomePerSecond(state, 'active') * STORY_GIFT_SECONDS;
}

export function tapValue(state: GameStateV2) {
  return TAP_BASE * legacyMultiplier(state.legacyPoints) + incomePerSecond(state, 'active') * TAP_INCOME_SECONDS;
}

/** Whether there is still something on the ground to collect (config/scene.ts). */
export function canCollect(state: GameStateV2) {
  return state.classIndex < COLLECT_END_CLASS;
}

/** What Şans's find pays when the player catches it (config/scene.ts). */
export function fetchReward(state: GameStateV2) {
  return FETCH_BOTTLES * tapValue(state);
}

/** How long Şans stays away between finds: much shorter until the first manager is hired (config/scene.ts). */
export function fetchSeconds(state: GameStateV2) {
  const early = !Object.values(state.businesses).some((business) => business.managed);
  return early
    ? { min: FETCH_EARLY_MIN_SECONDS, max: FETCH_EARLY_MAX_SECONDS }
    : { min: FETCH_MIN_SECONDS, max: FETCH_MAX_SECONDS };
}

// ── Event cards (config/events.ts) ───────────────────────────────────────────

/**
 * The cards that can come now. `classIndex` is the class the player has seen: in the first life a
 * class counts once its ceremony has played, so nobody calls before the story introduced them.
 */
export function eventCardsFor(state: GameStateV2, classIndex = state.classIndex): EventCardDef[] {
  if (classIndex < EVENT_START_CLASS) return [];
  return EVENT_CARDS.filter(
    (card) =>
      classIndex >= (card.fromClass ?? 0) &&
      (card.businessId === undefined || state.businesses[card.businessId]?.managed === true),
  );
}

export function eventReward(state: GameStateV2, outcome: EventOutcome) {
  return incomePerSecond(state, 'active') * EVENT_REWARD_SECONDS[outcome];
}

/** What a card pays on average when half the answers are safe and half bold (the simulator's player). */
export function eventAverageReward(state: GameStateV2) {
  const bold =
    EVENT_BOLD_CHANCE * EVENT_REWARD_SECONDS.win + (1 - EVENT_BOLD_CHANCE) * EVENT_REWARD_SECONDS.lose;
  return (incomePerSecond(state, 'active') * (EVENT_REWARD_SECONDS.safe + bold)) / 2;
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

/** Legacy points a family has earned in total, from earnings across all generations. */
export function legacyPointsFor(totalEarnings: number) {
  if (totalEarnings <= 0) return 0;
  return Math.floor(LEGACY_SCALE * (totalEarnings / LEGACY_BASE) ** LEGACY_EXPONENT);
}

/**
 * Points gained by retiring now. Based on all-time earnings minus points already held, so
 * retiring again and again early gives little; each generation must out-earn the family history.
 */
export function pendingLegacyPoints(state: GameStateV2) {
  return Math.max(0, legacyPointsFor(state.totalEarnings) - state.legacyPoints);
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

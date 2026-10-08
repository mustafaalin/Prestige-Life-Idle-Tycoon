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
  TAP_BASE,
  TAP_INCOME_SECONDS,
} from './config/economy';
import { FETCH_BOTTLES } from './config/scene';
import { HOUSES } from './config/housing';
import { LIFESTYLE_ITEMS } from './config/lifestyle';
import type { BusinessDef, GameStateV2, IncomeMode } from './types';

const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));
const HOUSE_BY_ID = new Map(HOUSES.map((house) => [house.id, house]));

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

/** Bonus from the house you live in (by its tier), whether rented or owned. */
export function homeBonus(state: GameStateV2) {
  return HOUSE_BY_ID.get(state.home)?.homeBonus ?? 0;
}

/** Status = your home plus every owned vehicle, outfit and luxury toy. */
export function statusBonus(state: GameStateV2) {
  let bonus = homeBonus(state);
  for (const id of state.lifestyleOwned) {
    bonus += LIFESTYLE_BY_ID.get(id)?.statusBonus ?? 0;
  }
  return bonus;
}

export function legacyMultiplier(legacyPoints: number) {
  return 1 + legacyPoints * LEGACY_BONUS_PER_POINT;
}

/** Everything that scales all income: career, status items and family legacy. */
export function globalMultiplier(state: GameStateV2) {
  return (1 + careerBonus(state)) * (1 + statusBonus(state)) * legacyMultiplier(state.legacyPoints);
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
    base += businessBaseIncomePerSecond(def, business.owned) * uptime(business.managed, mode);
  }
  return base * globalMultiplier(state);
}

/** Money a business line pays each time one of its production cycles completes. */
export function cycleRevenue(state: GameStateV2, def: BusinessDef) {
  const owned = state.businesses[def.id]?.owned ?? 0;
  if (owned <= 0) return 0;
  return def.baseRevenue * owned * milestoneMultiplier(owned) * globalMultiplier(state);
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

export function tapValue(state: GameStateV2) {
  return TAP_BASE * legacyMultiplier(state.legacyPoints) + incomePerSecond(state, 'active') * TAP_INCOME_SECONDS;
}

/** What Şans's find pays when the player catches it (config/scene.ts). */
export function fetchReward(state: GameStateV2) {
  return FETCH_BOTTLES * tapValue(state);
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

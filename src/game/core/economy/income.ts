import { BUSINESSES } from '../config/businesses';
import { CAREERS } from '../config/careers';
import { ACTIVE_UNMANAGED_EFFICIENCY, OFFLINE_CAP_HOURS_BY_CLASS, OFFLINE_RATE } from '../config/economy';
import { HOUSES } from '../config/housing';
import type { BusinessDef, GameStateV2, IncomeMode } from '../types';
import { baseBusinessIncomePerSecond, baseRunRevenue, businessState, isOpened } from './business';
import { legacyMultiplier } from './legacy';
import { careerBonus, collarAt, globalMultiplier, homeBonus, statusBonus } from './multipliers';

// Where income comes from (docs/economy-rebuild.md §7). Each source says what it pays per second
// before the global multiplier; totals, offline earnings and the income breakdown all add up the same
// list, so a new source (investments, a pension...) is one more entry and nothing else changes.

const HOUSE_BY_ID = new Map(HOUSES.map((house) => [house.id, house]));

export interface IncomeSource {
  id: 'businesses' | 'salary' | 'rent';
  /** Per second before the global multiplier. 'idle' is what keeps coming with the app closed. */
  perSecond(state: GameStateV2, mode: IncomeMode): number;
}

/** Share of a business's output the player gets in the given mode. */
export function uptime(managed: boolean, mode: IncomeMode) {
  if (managed) return 1;
  return mode === 'active' ? ACTIVE_UNMANAGED_EFFICIENCY : 0;
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

/** Businesses: run by hand they earn only while played (a share, for the simulator); managed ones always. */
function businessesPerSecond(state: GameStateV2, mode: IncomeMode) {
  let total = 0;
  for (const def of BUSINESSES) {
    const business = businessState(state, def.id);
    total += baseBusinessIncomePerSecond(def, business) * uptime(business.managed, mode);
  }
  return total;
}

export const INCOME_SOURCES: readonly IncomeSource[] = [
  { id: 'businesses', perSecond: businessesPerSecond },
  { id: 'salary', perSecond: salaryPerSecond },
  { id: 'rent', perSecond: rentPerSecond },
];

/** Income paid every second, online and offline: salary plus rent (before global multipliers). */
export function steadyIncomePerSecond(state: GameStateV2) {
  return salaryPerSecond(state) + rentPerSecond(state);
}

/** Income per second excluding taps. 'idle' counts only managers, salary and rent (offline, app closed). */
export function incomePerSecond(state: GameStateV2, mode: IncomeMode) {
  const base = INCOME_SOURCES.reduce((sum, source) => sum + source.perSecond(state, mode), 0);
  return base * globalMultiplier(state);
}

/**
 * Income that arrives without the player doing anything: managed businesses, salary and rent.
 * Screens show this one; 'active' income assumes the player keeps tapping unmanaged businesses.
 */
export function autoIncomePerSecond(state: GameStateV2) {
  return incomePerSecond(state, 'idle');
}

/** Money a business line pays each time one of its runs completes, every location and multiplier included. */
export function cycleRevenue(state: GameStateV2, def: BusinessDef) {
  return baseRunRevenue(def, businessState(state, def.id)) * globalMultiplier(state);
}

/**
 * Where the auto income comes from (the top bar's income breakdown). The sources are per second after
 * every multiplier, so they add up to autoIncomePerSecond; the bonuses are fractions (0.1 = +10%).
 * `unmanaged`: some opened business has no manager, so it earns only while the player plays.
 */
export function incomeBreakdown(state: GameStateV2) {
  const multiplier = globalMultiplier(state);
  const sources = Object.fromEntries(
    INCOME_SOURCES.map((source) => [source.id, source.perSecond(state, 'idle') * multiplier]),
  ) as Record<IncomeSource['id'], number>;
  const unmanaged = BUSINESSES.some((def) => {
    const business = businessState(state, def.id);
    return isOpened(business) && !business.managed;
  });
  const home = homeBonus(state);
  const collar = collarAt(state.classIndex)?.statusBonus ?? 0;
  return {
    ...sources,
    career: careerBonus(state),
    home,
    collar,
    items: statusBonus(state) - home - collar,
    legacy: legacyMultiplier(state) - 1,
    accessory: state.accessoryMultiplier - 1,
    unmanaged,
  };
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

import { BUSINESSES } from './config/businesses';
import { CAREERS } from './config/careers';
import { STARTING_CASH } from './config/economy';
import { HOUSES, STARTING_HOME_ID } from './config/housing';
import { LIFE_SECONDS } from './config/life';
import { LIFESTYLE_ITEMS, STARTING_LIFESTYLE_IDS } from './config/lifestyle';
import { classIndexFor, costForUnits, isLifeOver, pendingLegacyPoints } from './formulas';
import type { BusinessState, GameStateV2, HouseDef, LifestyleDef, LifestyleKind } from './types';

// Pure state transitions. Every action returns a new state, or null when it is not allowed.

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));
const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));
const HOUSE_INDEX = new Map(HOUSES.map((house, index) => [house.id, index]));

function emptyBusinesses(): Record<string, BusinessState> {
  return Object.fromEntries(BUSINESSES.map((def) => [def.id, { owned: 0, managed: false }]));
}

export function createInitialState(
  family: Pick<GameStateV2, 'generation' | 'legacyPoints' | 'totalEarnings'> = {
    generation: 1,
    legacyPoints: 0,
    totalEarnings: 0,
  }
): GameStateV2 {
  return {
    version: 2,
    cash: STARTING_CASH,
    generationEarnings: 0,
    totalEarnings: family.totalEarnings,
    generation: family.generation,
    legacyPoints: family.legacyPoints,
    businesses: emptyBusinesses(),
    careerIndex: -1,
    lifestyleOwned: [...STARTING_LIFESTYLE_IDS],
    home: STARTING_HOME_ID,
    homesOwned: [],
    classIndex: 0,
    lifeSeconds: 0,
  };
}

/** Ages the hero by `seconds` of play; stops at the end of life. */
export function live(state: GameStateV2, seconds: number): GameStateV2 {
  if (seconds <= 0 || state.lifeSeconds >= LIFE_SECONDS) return state;
  return { ...state, lifeSeconds: Math.min(LIFE_SECONDS, state.lifeSeconds + seconds) };
}

/** Adds earned money. Earned money counts toward wealth class and legacy; spending never removes it. */
export function earn(state: GameStateV2, amount: number): GameStateV2 {
  if (amount <= 0) return state;
  const generationEarnings = state.generationEarnings + amount;
  return {
    ...state,
    cash: state.cash + amount,
    generationEarnings,
    totalEarnings: state.totalEarnings + amount,
    classIndex: Math.max(state.classIndex, classIndexFor(generationEarnings)),
  };
}

function spend(state: GameStateV2, cost: number): GameStateV2 | null {
  if (cost > state.cash) return null;
  return { ...state, cash: state.cash - cost };
}

export function buyBusinessUnits(state: GameStateV2, businessId: string, count: number): GameStateV2 | null {
  const def = BUSINESS_BY_ID.get(businessId);
  if (!def || count <= 0) return null;
  const current = state.businesses[businessId];
  const paid = spend(state, costForUnits(def, current.owned, count));
  if (!paid) return null;
  return {
    ...paid,
    businesses: { ...paid.businesses, [businessId]: { ...current, owned: current.owned + count } },
  };
}

export function hireManager(state: GameStateV2, businessId: string): GameStateV2 | null {
  const def = BUSINESS_BY_ID.get(businessId);
  const current = state.businesses[businessId];
  if (!def || current.managed || current.owned <= 0) return null;
  const paid = spend(state, def.managerCost);
  if (!paid) return null;
  return {
    ...paid,
    businesses: { ...paid.businesses, [businessId]: { ...current, managed: true } },
  };
}

export function nextCareer(state: GameStateV2) {
  return CAREERS[state.careerIndex + 1] ?? null;
}

export function promote(state: GameStateV2): GameStateV2 | null {
  const career = nextCareer(state);
  if (!career) return null;
  const paid = spend(state, career.cost);
  if (!paid) return null;
  return { ...paid, careerIndex: state.careerIndex + 1 };
}

export const LIFESTYLE_KINDS: LifestyleKind[] = ['vehicle', 'outfit', 'toy'];

/** The next item of a kind to dream about: the cheapest one not owned yet. Items are bought in order. */
export function nextLifestyle(state: GameStateV2, kind: LifestyleKind): LifestyleDef | null {
  return LIFESTYLE_ITEMS.find((item) => item.kind === kind && !state.lifestyleOwned.includes(item.id)) ?? null;
}

/** The best owned item of a kind (the one shown in the scene), or null if none. */
export function bestOwnedLifestyle(state: GameStateV2, kind: LifestyleKind): LifestyleDef | null {
  let best: LifestyleDef | null = null;
  for (const item of LIFESTYLE_ITEMS) {
    if (item.kind === kind && state.lifestyleOwned.includes(item.id)) best = item;
  }
  return best;
}

/** Whether the next status item of any kind can be bought right now. */
export function canBuyAnyLifestyle(state: GameStateV2) {
  return LIFESTYLE_KINDS.some((kind) => {
    const next = nextLifestyle(state, kind);
    return next !== null && state.cash >= next.cost;
  });
}

/** Whether the shop has something to do right now: a status item or moving up to the next home. */
export function canBuyAnythingInShop(state: GameStateV2) {
  return canBuyAnyLifestyle(state) || canMoveUp(state);
}

export function buyLifestyle(state: GameStateV2, itemId: string): GameStateV2 | null {
  const item = LIFESTYLE_BY_ID.get(itemId);
  if (!item || state.lifestyleOwned.includes(itemId)) return null;
  const paid = spend(state, item.cost);
  if (!paid) return null;
  return { ...paid, lifestyleOwned: [...paid.lifestyleOwned, itemId] };
}

// ── Homes: rent → buy → rent out (config/housing.ts) ─────────────────────────

export function houseIndex(houseId: string) {
  return HOUSE_INDEX.get(houseId) ?? 0;
}

export function currentHome(state: GameStateV2): HouseDef {
  return HOUSES[houseIndex(state.home)];
}

/** The house one tier above where you live: the next home to dream about. */
export function nextHome(state: GameStateV2): HouseDef | null {
  return HOUSES[houseIndex(state.home) + 1] ?? null;
}

export function ownsHouse(state: GameStateV2, houseId: string) {
  return state.homesOwned.includes(houseId);
}

/** Living in someone else's house (the street tent does not count). */
export function isRenting(state: GameStateV2) {
  return !ownsHouse(state, state.home) && currentHome(state).moveInCost > 0;
}

/**
 * Price to buy a house right now, or null if it cannot be bought: rent-only, already owned, or
 * above the next home. Buying the house you rent counts the move-in fee you paid.
 */
export function housePrice(state: GameStateV2, house: HouseDef): number | null {
  if (house.buyCost === null || ownsHouse(state, house.id)) return null;
  if (houseIndex(house.id) > houseIndex(state.home) + 1) return null;
  return house.id === state.home ? house.buyCost - house.moveInCost : house.buyCost;
}

/** Whether the next home can be reached right now (rent it, or move in for free if owned). */
export function canMoveUp(state: GameStateV2) {
  const next = nextHome(state);
  return next !== null && (ownsHouse(state, next.id) || state.cash >= next.moveInCost);
}

/** Rent the next home and move in. Only one rented home at a time: the old lease simply ends. */
export function rentHome(state: GameStateV2, houseId: string): GameStateV2 | null {
  const next = nextHome(state);
  if (!next || next.id !== houseId || ownsHouse(state, houseId)) return null;
  const paid = spend(state, next.moveInCost);
  if (!paid) return null;
  return { ...paid, home: houseId };
}

/** Buy a house. Buying the next home also moves you in; a house below where you live is rented out. */
export function buyHome(state: GameStateV2, houseId: string): GameStateV2 | null {
  const house = HOUSES[houseIndex(houseId)];
  if (house.id !== houseId) return null;
  const price = housePrice(state, house);
  if (price === null) return null;
  const paid = spend(state, price);
  if (!paid) return null;
  const movesIn = houseIndex(houseId) > houseIndex(state.home);
  return { ...paid, homesOwned: [...paid.homesOwned, houseId], home: movesIn ? houseId : paid.home };
}

/** Move into a house you own, for free. A home you leave keeps paying rent if you own it. */
export function moveHome(state: GameStateV2, houseId: string): GameStateV2 | null {
  if (houseId === state.home || !ownsHouse(state, houseId)) return null;
  return { ...state, home: houseId };
}

/** Retirement comes only at the end of life (no early hand-over; game-design-v2 §4.9). */
export function canRetire(state: GameStateV2) {
  return isLifeOver(state);
}

/** Retire: the heir inherits the family legacy and starts a new life from the street. */
export function retire(state: GameStateV2): GameStateV2 | null {
  if (!canRetire(state)) return null;
  return createInitialState({
    generation: state.generation + 1,
    legacyPoints: state.legacyPoints + pendingLegacyPoints(state),
    totalEarnings: state.totalEarnings,
  });
}

import { BUSINESSES } from './config/businesses';
import { CAREERS } from './config/careers';
import { RETIREMENT_CLASS_INDEX } from './config/classes';
import { STARTING_CASH } from './config/economy';
import { LIFESTYLE_ITEMS, STARTING_LIFESTYLE_IDS } from './config/lifestyle';
import { classIndexFor, costForUnits, pendingLegacyPoints } from './formulas';
import type { BusinessState, GameStateV2, LifestyleDef, LifestyleKind } from './types';

// Pure state transitions. Every action returns a new state, or null when it is not allowed.

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));
const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));

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
    classIndex: 0,
  };
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

export const LIFESTYLE_KINDS: LifestyleKind[] = ['house', 'vehicle', 'outfit', 'toy'];

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

/** Whether the next item of any kind can be bought right now. */
export function canBuyAnyLifestyle(state: GameStateV2) {
  return LIFESTYLE_KINDS.some((kind) => {
    const next = nextLifestyle(state, kind);
    return next !== null && state.cash >= next.cost;
  });
}

export function buyLifestyle(state: GameStateV2, itemId: string): GameStateV2 | null {
  const item = LIFESTYLE_BY_ID.get(itemId);
  if (!item || state.lifestyleOwned.includes(itemId)) return null;
  const paid = spend(state, item.cost);
  if (!paid) return null;
  return { ...paid, lifestyleOwned: [...paid.lifestyleOwned, itemId] };
}

export function canRetire(state: GameStateV2) {
  return state.classIndex >= RETIREMENT_CLASS_INDEX && pendingLegacyPoints(state) > 0;
}

/** Retire: the child inherits the family legacy and starts a new life from the street. */
export function retire(state: GameStateV2): GameStateV2 | null {
  if (!canRetire(state)) return null;
  return createInitialState({
    generation: state.generation + 1,
    legacyPoints: state.legacyPoints + pendingLegacyPoints(state),
    totalEarnings: state.totalEarnings,
  });
}

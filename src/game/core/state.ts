import { BUSINESSES } from './config/businesses';
import { CAREERS } from './config/careers';
import { STARTING_CASH } from './config/economy';
import { HOUSES, STARTING_HOME_ID } from './config/housing';
import { LIFE_SECONDS } from './config/life';
import { LIFESTYLE_ITEMS, STARTING_LIFESTYLE_IDS } from './config/lifestyle';
import { ACTIVE_QUESTS, GENERATED_QUEST_SECONDS, QUESTS } from './config/quests';
import { UPGRADES } from './config/upgrades';
import { classIndexFor, costForUnits, isLifeOver, nextMilestone, pendingLegacyPoints, questReward } from './formulas';
import type { BusinessState, GameStateV2, HouseDef, LifestyleDef, LifestyleKind, QuestDef, QuestGoal, UpgradeDef } from './types';

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
    upgrades: [],
    questsDone: [],
    bottles: 0,
    finds: 0,
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

// ── Business upgrades (config/upgrades.ts) ───────────────────────────────────

const UPGRADE_BY_ID = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

/** The next upgrade of a business not bought yet (they come in order), or null when all are bought. */
export function nextUpgrade(state: GameStateV2, businessId: string): UpgradeDef | null {
  return UPGRADES.find((upgrade) => upgrade.businessId === businessId && !state.upgrades.includes(upgrade.id)) ?? null;
}

export function canBuyUpgrade(state: GameStateV2, upgrade: UpgradeDef) {
  return (
    nextUpgrade(state, upgrade.businessId)?.id === upgrade.id &&
    state.businesses[upgrade.businessId].owned >= upgrade.requiredOwned
  );
}

export function buyUpgrade(state: GameStateV2, upgradeId: string): GameStateV2 | null {
  const upgrade = UPGRADE_BY_ID.get(upgradeId);
  if (!upgrade || !canBuyUpgrade(state, upgrade)) return null;
  const paid = spend(state, upgrade.cost);
  if (!paid) return null;
  return { ...paid, upgrades: [...paid.upgrades, upgradeId] };
}

// ── Goals (config/quests.ts) ─────────────────────────────────────────────────

/** How far a goal is: current and target counts (done when current >= target). */
export function questProgress(state: GameStateV2, goal: QuestGoal): { current: number; target: number } {
  switch (goal.type) {
    case 'collect':
      return { current: state.bottles, target: goal.count };
    case 'find':
      return { current: state.finds, target: goal.count };
    case 'units':
      return { current: state.businesses[goal.businessId]?.owned ?? 0, target: goal.count };
    case 'manager':
      return { current: state.businesses[goal.businessId]?.managed ? 1 : 0, target: 1 };
    case 'upgrade':
      return { current: state.upgrades.includes(goal.upgradeId) ? 1 : 0, target: 1 };
    case 'career':
      return { current: state.careerIndex + 1, target: goal.index + 1 };
    case 'home':
      return { current: houseIndex(state.home), target: goal.index };
    case 'class':
      return { current: state.classIndex, target: goal.index };
    case 'vehicle':
      return {
        // Bought vehicles only: the free starting wheelbarrow doesn't count.
        current: state.lifestyleOwned.filter(
          (id) => LIFESTYLE_BY_ID.get(id)?.kind === 'vehicle' && !STARTING_LIFESTYLE_IDS.includes(id),
        ).length,
        target: goal.count,
      };
  }
}

export function isQuestComplete(state: GameStateV2, quest: QuestDef) {
  const { current, target } = questProgress(state, quest.goal);
  return current >= target;
}

/**
 * Goals on screen: the next written ones, then generated "take a business to its next milestone"
 * goals so there is always something to aim for.
 */
export function activeQuests(state: GameStateV2): QuestDef[] {
  const list = QUESTS.filter((quest) => !state.questsDone.includes(quest.id)).slice(0, ACTIVE_QUESTS);
  if (list.length >= ACTIVE_QUESTS) return list;
  const generated: { quest: QuestDef; cost: number }[] = [];
  for (const def of BUSINESSES) {
    const { owned } = state.businesses[def.id];
    const target = owned > 0 ? nextMilestone(owned) : null;
    if (target === null) continue;
    const id = `units:${def.id}:${target}`;
    if (state.questsDone.includes(id) || list.some((quest) => quest.id === id)) continue;
    generated.push({
      quest: {
        id,
        goal: { type: 'units', businessId: def.id, count: target },
        rewardSeconds: GENERATED_QUEST_SECONDS,
        rewardMin: 0,
      },
      cost: costForUnits(def, owned, target - owned),
    });
  }
  generated.sort((a, b) => a.cost - b.cost);
  return [...list, ...generated.map((entry) => entry.quest)].slice(0, ACTIVE_QUESTS);
}

/** Claims a finished goal on screen and pays its reward (counts as earned money). */
export function claimQuest(state: GameStateV2, questId: string): GameStateV2 | null {
  const quest = activeQuests(state).find((candidate) => candidate.id === questId);
  if (!quest || !isQuestComplete(state, quest)) return null;
  const paid = earn(state, questReward(state, quest));
  return { ...paid, questsDone: [...paid.questsDone, questId] };
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

import { BUSINESSES, CLASS_MANAGER_GIFT } from './config/businesses';
import { CAREERS, careerDef } from './config/careers';
import { CONTENT } from './config/content';
import { courseDef } from './config/courses';
import { SECONDS_PER_MONTH } from './config/life';
import { STARTING_CASH } from './config/economy';
import { FIRST_OWNED_HOME_CLASS, HOUSES, RENT_ONLY_COUNT, STARTING_HOME_ID } from './config/housing';
import { AWAY_AGE_CAP_HOURS, AWAY_AGE_RATE, LIFE_SECONDS } from './config/life';
import { CLASS_OUTFIT_FLOOR, LIFESTYLE_ITEMS, OUTFITS, STARTING_LIFESTYLE_IDS, VEHICLES } from './config/lifestyle';
import { ACTIVE_QUESTS, GENERATED_BRANCH_GOALS, GENERATED_LEVEL_GOALS, QUESTS } from './config/quests';
import { COLLECT_END_CLASS } from './config/scene';
import { WEALTH_CLASSES } from './config/classes';
import { heirloomDef } from './config/heirlooms';
import {
  ageSpeed,
  canTakeCareer,
  hasWorked,
  branchCapAt,
  branchCost,
  businessDef,
  businessState,
  canOpenBranch,
  canOpenBusiness,
  classIndexFor,
  emptyBusiness,
  isOpened,
  nextLevel,
  heirloomCap,
  heirloomLevel,
  heirloomPrice,
  isLifeOver,
  jamCash,
  legacyAvailable,
  managerCost,
  pendingLegacyPoints,
  questReward,
} from './formulas';
import { allMet, unmet } from './requirements';
import type { BusinessDef, BusinessState, GameStateV2, HouseDef, LifestyleDef, LifestyleKind, QuestDef, QuestGoal, Requirement } from './types';

// Pure state transitions. Every action returns a new state, or null when it is not allowed.

const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));
const HOUSE_INDEX = new Map(HOUSES.map((house, index) => [house.id, index]));

function emptyBusinesses(): Record<string, BusinessState> {
  return Object.fromEntries(BUSINESSES.map((def) => [def.id, emptyBusiness()]));
}

export function createInitialState(
  family: Pick<GameStateV2, 'generation' | 'legacyPoints' | 'totalEarnings' | 'accessoryMultiplier' | 'heirlooms'> = {
    generation: 1,
    legacyPoints: 0,
    totalEarnings: 0,
    accessoryMultiplier: 1,
    heirlooms: {},
  }
): GameStateV2 {
  return {
    version: 2,
    // Mom's plum jam: the heir starts with some cash.
    cash: STARTING_CASH + jamCash(family.heirlooms.jam ?? 0),
    generationEarnings: 0,
    totalEarnings: family.totalEarnings,
    generation: family.generation,
    legacyPoints: family.legacyPoints,
    businesses: emptyBusinesses(),
    careerId: null,
    jobSeconds: {},
    coursesDone: [],
    course: null,
    lifestyleOwned: [...STARTING_LIFESTYLE_IDS],
    home: STARTING_HOME_ID,
    homesOwned: [],
    classIndex: 0,
    lifeSeconds: 0,
    questsDone: [],
    bottles: 0,
    finds: 0,
    accessoryMultiplier: family.accessoryMultiplier,
    heirlooms: { ...family.heirlooms },
  };
}

/**
 * Ages the hero by `seconds` of play (faster at the top class, formulas.ts ageSpeed); age stops at the
 * end of life. At launch the hero stays on at 80 (config/content.ts), so experience and a running course
 * go on there: otherwise the houses, cars and jobs that ask for a career row would stay locked for good.
 */
export function live(state: GameStateV2, seconds: number): GameStateV2 {
  if (seconds <= 0 || (CONTENT.handover && state.lifeSeconds >= LIFE_SECONDS)) return state;
  const lived = seconds * ageSpeed(state);
  return studied({
    ...state,
    lifeSeconds: Math.min(LIFE_SECONDS, state.lifeSeconds + lived),
    // Experience runs with age: months in a job are months of the hero's life.
    jobSeconds: state.careerId === null ? state.jobSeconds : { ...state.jobSeconds, [state.careerId]: (state.jobSeconds[state.careerId] ?? 0) + lived },
    course: state.course ? { ...state.course, seconds: state.course.seconds + lived } : null,
  });
}

/** Time away ages the hero a little (config/life.ts AWAY_AGE_RATE); experience and a course run with it. */
export function liveAway(state: GameStateV2, awaySeconds: number): GameStateV2 {
  return live(state, Math.min(Math.max(0, awaySeconds), AWAY_AGE_CAP_HOURS * 3600) * AWAY_AGE_RATE);
}

/** A course whose months are done is finished. */
function studied(state: GameStateV2): GameStateV2 {
  const running = state.course ? courseDef(state.course.id) : undefined;
  if (!state.course || !running || state.course.seconds < running.months * SECONDS_PER_MONTH) return state;
  return { ...state, course: null, coursesDone: [...state.coursesDone, running.id] };
}

/** Adds earned money. Earned money counts toward wealth class and legacy; spending never removes it. */
export function earn(state: GameStateV2, amount: number): GameStateV2 {
  if (amount <= 0) return state;
  const generationEarnings = state.generationEarnings + amount;
  const classIndex = Math.max(state.classIndex, classIndexFor(generationEarnings));
  const next = {
    ...state,
    cash: state.cash + amount,
    generationEarnings,
    totalEarnings: state.totalEarnings + amount,
    classIndex,
  };
  return classIndex === state.classIndex ? next : applyClassUp(next, state.classIndex);
}

/**
 * A class-up moves the hero one home up, rented and free, whatever home that is (2026-10-21, user: a
 * ceremony that jumped to its story's home skipped homes and opened several vehicles at once). The
 * Millionaire ceremony ("this time I bought myself a home") makes the home it moves to the hero's own:
 * the next one, or the first one that can be bought, with the vehicles of any home it skips.
 */
export function applyClassUp(state: GameStateV2, fromClass: number): GameStateV2 {
  let next = state;
  for (let classIndex = fromClass + 1; classIndex <= state.classIndex; classIndex += 1) next = classMove(next, classIndex);
  return applyClassFloors(next);
}

function classMove(state: GameStateV2, classIndex: number): GameStateV2 {
  const at = houseIndex(state.home);
  if (classIndex !== FIRST_OWNED_HOME_CLASS) {
    return at + 1 < HOUSES.length ? { ...state, home: HOUSES[at + 1].id } : state;
  }
  const target = Math.min(HOUSES.length - 1, Math.max(at + 1, RENT_ONLY_COUNT));
  const home = HOUSES[target];
  const skipped = VEHICLES.filter(
    (vehicle) => (vehicle.home ?? 0) > at && (vehicle.home ?? 0) < target && !state.lifestyleOwned.includes(vehicle.id),
  ).map((vehicle) => vehicle.id);
  return {
    ...state,
    home: home.id,
    homesOwned: home.buyCost === null || state.homesOwned.includes(home.id) ? state.homesOwned : [...state.homesOwned, home.id],
    lifestyleOwned: [...state.lifestyleOwned, ...skipped],
  };
}

/**
 * What a class always comes with, given again on load if missing: the class's outfit and the ones
 * before it (CLASS_OUTFIT_FLOOR), and from Billionaire on the first Hotel Chain and its manager
 * (CLASS_MANAGER_GIFT). Whoever bought ahead keeps what they have.
 */
export function applyClassFloors(state: GameStateV2): GameStateV2 {
  const outfitFloor = CLASS_OUTFIT_FLOOR[Math.min(state.classIndex, CLASS_OUTFIT_FLOOR.length - 1)];
  const missing = OUTFITS.slice(0, outfitFloor + 1)
    .map((outfit) => outfit.id)
    .filter((id) => !state.lifestyleOwned.includes(id));
  const hotel = businessState(state, CLASS_MANAGER_GIFT.businessId);
  const hired = state.classIndex >= CLASS_MANAGER_GIFT.classIndex && !hotel.managed;
  if (missing.length === 0 && !hired) return state;
  return {
    ...state,
    businesses: hired
      ? { ...state.businesses, [CLASS_MANAGER_GIFT.businessId]: { ...hotel, level: Math.max(1, hotel.level), managed: true } }
      : state.businesses,
    lifestyleOwned: [...state.lifestyleOwned, ...missing],
  };
}

function spend(state: GameStateV2, cost: number): GameStateV2 | null {
  if (cost > state.cash) return null;
  return { ...state, cash: state.cash - cost };
}

function withBusiness(state: GameStateV2, businessId: string, business: BusinessState): GameStateV2 {
  return { ...state, businesses: { ...state.businesses, [businessId]: business } };
}

/**
 * Buys the next level of a business; at level 0 this opens it (docs/game-design-v2.md §4.3). Opening
 * waits for the line's conditions (its class); later levels only cost money.
 */
export function levelUpBusiness(state: GameStateV2, businessId: string): GameStateV2 | null {
  const def = businessDef(businessId);
  if (!def) return null;
  const business = businessState(state, businessId);
  const level = nextLevel(def, business);
  if (!level || (!isOpened(business) && !canOpenBusiness(state, def))) return null;
  const paid = spend(state, level.cost);
  if (!paid) return null;
  return withBusiness(paid, businessId, { ...business, level: business.level + 1 });
}

/** Opens one more branch: only at the last level, up to what the class allows. */
export function openBranch(state: GameStateV2, businessId: string): GameStateV2 | null {
  const def = businessDef(businessId);
  if (!def || !canOpenBranch(state, def)) return null;
  const business = businessState(state, businessId);
  const paid = spend(state, branchCost(def, business.branches));
  if (!paid) return null;
  return withBusiness(paid, businessId, { ...business, branches: business.branches + 1 });
}

export function hireManager(state: GameStateV2, businessId: string): GameStateV2 | null {
  const def = businessDef(businessId);
  const business = businessState(state, businessId);
  if (!def || business.managed || !isOpened(business)) return null;
  const paid = spend(state, managerCost(state, def));
  if (!paid) return null;
  return withBusiness(paid, businessId, { ...business, managed: true });
}

/**
 * Whether the businesses screen has something the money buys right now: a line to open, a level, a
 * manager or a branch (the bottom menu's "!", 2026-10-23, user).
 */
export function canBuyAnythingInBusinesses(state: GameStateV2) {
  return BUSINESSES.some(
    (def) => levelUpBusiness(state, def.id) !== null || hireManager(state, def.id) !== null || openBranch(state, def.id) !== null,
  );
}

/** Takes a job whose conditions are met (no fee). Months worked in the old one stay (its mastery). */
export function takeCareer(state: GameStateV2, careerId: string): GameStateV2 | null {
  const career = careerDef(careerId);
  if (!career || !canTakeCareer(state, career)) return null;
  return { ...state, careerId };
}

/** Starts a course: paid up front, one at a time. */
export function startCourse(state: GameStateV2, courseId: string): GameStateV2 | null {
  const course = courseDef(courseId);
  if (!course || state.course !== null || state.coursesDone.includes(courseId) || !allMet(state, course.requires)) return null;
  const paid = spend(state, course.cost);
  if (!paid) return null;
  return { ...paid, course: { id: courseId, seconds: 0 } };
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

// Homes and vehicles climb together (config/lifestyle.ts): a vehicle opens in its home, and the last
// vehicle a home opens is needed to move on. A class ceremony's free move (applyClassUp) is the
// one way to get ahead of the vehicles; they are caught up in order afterwards.

/** The home a status item waits for, or null when where you live is enough. */
export function lifestyleNeedsHome(state: GameStateV2, item: LifestyleDef): HouseDef | null {
  return item.home !== undefined && item.home > houseIndex(state.home) ? HOUSES[item.home] : null;
}

/** The wealth class an item opens in when you are below it (outfits), or null. */
export function lifestyleNeedsClass(state: GameStateV2, item: LifestyleDef): number | null {
  return item.minClass !== undefined && item.minClass > state.classIndex ? item.minClass : null;
}

/** The career an item asks for and the player lacks (vehicles: a job row, config/housing.ts careerAsk). */
export function lifestyleNeedsCareer(state: GameStateV2, item: LifestyleDef): Requirement[] {
  return unmet(state, item.requires ?? []);
}

/** Whether something other than money keeps an item from being bought: its home, its class or its career. */
export function lifestyleLocked(state: GameStateV2, item: LifestyleDef) {
  return lifestyleNeedsHome(state, item) !== null || lifestyleNeedsClass(state, item) !== null || lifestyleNeedsCareer(state, item).length > 0;
}

/** What the next home asks for besides money and vehicles (a job row), none when it is open to you. */
export function homeNeedsCareer(state: GameStateV2, house: HouseDef): Requirement[] {
  return unmet(state, house.requires);
}

/**
 * The next vehicle to buy before you can move up from where you live, or null: every vehicle opened
 * here or in a home below must be owned. A ceremony moves the hero without his vehicles catching
 * up, so there can be several; this is the first of them.
 */
export function moveUpNeedsVehicle(state: GameStateV2): LifestyleDef | null {
  const home = houseIndex(state.home);
  return (
    VEHICLES.find((vehicle) => (vehicle.home ?? 0) <= home && !state.lifestyleOwned.includes(vehicle.id)) ?? null
  );
}

/** The best owned vehicle the home you live in has room for (the one parked out front), or null. */
export function parkedVehicle(state: GameStateV2): LifestyleDef | null {
  const home = houseIndex(state.home);
  let best: LifestyleDef | null = null;
  for (const vehicle of VEHICLES) {
    if ((vehicle.home ?? 0) <= home && state.lifestyleOwned.includes(vehicle.id)) best = vehicle;
  }
  return best;
}

/** Whether the next item of a kind can be bought right now. */
export function canBuyNextLifestyle(state: GameStateV2, kind: LifestyleKind) {
  const next = nextLifestyle(state, kind);
  return next !== null && state.cash >= next.cost && !lifestyleLocked(state, next);
}

/** Whether the next status item of any kind can be bought right now. */
export function canBuyAnyLifestyle(state: GameStateV2) {
  return LIFESTYLE_KINDS.some((kind) => canBuyNextLifestyle(state, kind));
}

/** Whether the shop has something to do right now: a status item or moving up to the next home. */
export function canBuyAnythingInShop(state: GameStateV2) {
  return canBuyAnyLifestyle(state) || canMoveUp(state);
}

export function buyLifestyle(state: GameStateV2, itemId: string): GameStateV2 | null {
  const item = LIFESTYLE_BY_ID.get(itemId);
  if (!item || state.lifestyleOwned.includes(itemId) || lifestyleLocked(state, item)) return null;
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
 * Price to buy a house right now, or null if it cannot be bought: rent-only, already owned, above
 * the next home, or the next home while a vehicle is still missing. Buying the house you rent counts
 * the move-in fee you paid.
 */
export function housePrice(state: GameStateV2, house: HouseDef): number | null {
  if (house.buyCost === null || ownsHouse(state, house.id)) return null;
  const stepsUp = houseIndex(house.id) - houseIndex(state.home);
  if (stepsUp > 1 || (stepsUp === 1 && (moveUpNeedsVehicle(state) || homeNeedsCareer(state, house).length > 0))) return null;
  return house.id === state.home ? house.buyCost - house.moveInCost : house.buyCost;
}

/** Whether the next home can be reached right now (rent it, or move in for free if owned). */
export function canMoveUp(state: GameStateV2) {
  const next = nextHome(state);
  if (!next) return false;
  return (
    ownsHouse(state, next.id) ||
    (state.cash >= next.moveInCost && !moveUpNeedsVehicle(state) && homeNeedsCareer(state, next).length === 0)
  );
}

/** Rent the next home and move in. Only one rented home at a time: the old lease simply ends. */
export function rentHome(state: GameStateV2, houseId: string): GameStateV2 | null {
  const next = nextHome(state);
  if (!next || next.id !== houseId || ownsHouse(state, houseId) || moveUpNeedsVehicle(state) || homeNeedsCareer(state, next).length > 0) {
    return null;
  }
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

/**
 * Move up into a house you own, for free. There is no moving back down: every home has its own
 * vehicles out front, and a house you left stays rented out.
 */
export function moveHome(state: GameStateV2, houseId: string): GameStateV2 | null {
  if (houseIndex(houseId) <= houseIndex(state.home) || !ownsHouse(state, houseId)) return null;
  return { ...state, home: houseId };
}

// ── Goals (config/quests.ts) ─────────────────────────────────────────────────

/** How far a goal is: current and target counts (done when current >= target). */
export function questProgress(state: GameStateV2, goal: QuestGoal): { current: number; target: number } {
  switch (goal.type) {
    case 'collect':
      // Once nothing lies on the ground (Middle Class on) the goal counts as done, or it would hold its
      // place for the rest of the life.
      return { current: state.classIndex >= COLLECT_END_CLASS ? goal.count : state.bottles, target: goal.count };
    case 'find':
      return { current: state.finds, target: goal.count };
    case 'level':
      return { current: businessState(state, goal.businessId).level, target: goal.level };
    case 'branches':
      return { current: businessState(state, goal.businessId).branches, target: goal.count };
    case 'manager':
      return { current: businessState(state, goal.businessId).managed ? 1 : 0, target: 1 };
    case 'job': {
      // Any job in that row of the tree or higher counts: the tree has many ways up (2026-10-21).
      const level = careerDef(goal.careerId)?.level ?? 1;
      const reached = CAREERS.some((career) => career.level >= level && hasWorked(state, career.id));
      return { current: reached ? 1 : 0, target: 1 };
    }
    case 'home':
      return { current: houseIndex(state.home), target: goal.index };
    case 'class':
      return { current: state.classIndex, target: goal.index };
    case 'vehicle':
      return {
        current: state.lifestyleOwned.filter((id) => LIFESTYLE_BY_ID.get(id)?.kind === 'vehicle').length,
        target: goal.count,
      };
  }
}

export function isQuestComplete(state: GameStateV2, quest: QuestDef) {
  const { current, target } = questProgress(state, quest.goal);
  return current >= target;
}

/** Business goals the written list already pays for (milestone key → written goal id); no generated goal repeats them. */
const WRITTEN_GOALS = new Map(
  QUESTS.flatMap((quest): [string, string][] => {
    const goal = quest.goal;
    if (goal.type === 'level') return [[`level:${goal.businessId}:${goal.level}`, quest.id]];
    if (goal.type === 'branches') return [[`branches:${goal.businessId}:${goal.count}`, quest.id]];
    return [];
  }),
);

/** Money still needed to take a business from where it is to a level (0 once there). */
function costToLevel(def: BusinessDef, business: BusinessState, level: number) {
  return def.levels.slice(business.level, level).reduce((sum, step) => sum + step.cost, 0);
}

/** Money still needed for a branch count (0 once there). */
function costToBranches(def: BusinessDef, business: BusinessState, count: number) {
  let cost = 0;
  for (let branch = business.branches; branch < count; branch += 1) cost += branchCost(def, branch);
  return cost;
}

interface Rung {
  quest: QuestDef;
  /** Money still needed (0: reached). */
  cost: number;
  /** The class allows it now (branch counts above the class's cap do not). */
  allowed: boolean;
}

/**
 * The goal a ladder of milestones shows, past the last one claimed (written or generated): the highest
 * one already reached, so a player who raced ahead claims once instead of a pile of equal rewards, else
 * the next one if the class allows it. Milestones the written list pays for are left to it.
 */
function ladderGoal(state: GameStateV2, rungs: Rung[]): Rung | null {
  const claimed = (id: string) => state.questsDone.includes(id) || state.questsDone.includes(WRITTEN_GOALS.get(id) ?? '');
  let from = 0;
  rungs.forEach((rung, index) => {
    if (claimed(rung.quest.id)) from = index + 1;
  });
  const open = rungs.slice(from).filter((rung) => !WRITTEN_GOALS.has(rung.quest.id));
  const reached = open.filter((rung) => rung.cost === 0);
  if (reached.length > 0) return reached[reached.length - 1];
  const next = open[0];
  return next?.allowed ? next : null;
}

/** A business's generated goal: from its level milestones, then from its branch milestones. */
function generatedGoal(state: GameStateV2, def: BusinessDef): Rung | null {
  const business = businessState(state, def.id);
  if (!isOpened(business)) return null;
  const rung = (id: string, goal: QuestGoal, cost: number, allowed = true): Rung => ({ quest: { id, goal, rewardMin: 0 }, cost, allowed });
  const levels = GENERATED_LEVEL_GOALS.filter((target) => target <= def.levels.length).map((target) =>
    rung(`level:${def.id}:${target}`, { type: 'level', businessId: def.id, level: target }, costToLevel(def, business, target)),
  );
  const cap = branchCapAt(def, state.classIndex);
  const branches = GENERATED_BRANCH_GOALS.map((count) =>
    rung(`branches:${def.id}:${count}`, { type: 'branches', businessId: def.id, count }, costToBranches(def, business, count), count <= cap),
  );
  return ladderGoal(state, levels) ?? ladderGoal(state, branches);
}

/**
 * Goals on screen: the next written ones, then generated business goals so there is always something
 * to aim for, cheapest first.
 */
export function activeQuests(state: GameStateV2): QuestDef[] {
  const list = QUESTS.filter((quest) => !state.questsDone.includes(quest.id)).slice(0, ACTIVE_QUESTS);
  if (list.length >= ACTIVE_QUESTS) return list;
  const generated = BUSINESSES.map((def) => generatedGoal(state, def)).filter((entry) => entry !== null);
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

/** Retirement comes at the end of life; "Hand over now" gets there early (handOverEarly). */
export function canRetire(state: GameStateV2) {
  return CONTENT.handover && isLifeOver(state);
}

/** From the top class on, the player may hand over without waiting for 80 (game-design-v2 §4.10). */
export function canHandOverEarly(state: GameStateV2) {
  return CONTENT.legacy && CONTENT.handover && state.classIndex === WEALTH_CLASSES.length - 1 && !isLifeOver(state);
}

/**
 * "Hand over now": the remaining years are skipped and the life ends at 80 as always (the story's
 * hand-over is at 80); the legacy is what was earned until now.
 */
export function handOverEarly(state: GameStateV2): GameStateV2 | null {
  if (!canHandOverEarly(state)) return null;
  return { ...state, lifeSeconds: LIFE_SECONDS };
}

/** Retire: the heir inherits the family legacy and heirlooms and starts a new life from the street. */
export function retire(state: GameStateV2): GameStateV2 | null {
  if (!canRetire(state)) return null;
  return createInitialState({
    generation: state.generation + 1,
    legacyPoints: state.legacyPoints + pendingLegacyPoints(state),
    totalEarnings: state.totalEarnings,
    accessoryMultiplier: state.accessoryMultiplier,
    heirlooms: state.heirlooms,
  });
}

/** Buys the next level of a family heirloom with legacy points. */
export function buyHeirloom(state: GameStateV2, id: string): GameStateV2 | null {
  const def = heirloomDef(id);
  if (!def || def.comingSoon) return null;
  const level = heirloomLevel(state, def.id);
  if (level >= heirloomCap(def, state.generation) || heirloomPrice(def, level) > legacyAvailable(state)) return null;
  // Bought during a life, the jam's cash comes at once (what the heir would have started with).
  const cash = def.id === 'jam' ? jamCash(level + 1) - jamCash(level) : 0;
  return { ...state, cash: state.cash + cash, heirlooms: { ...state.heirlooms, [def.id]: level + 1 } };
}

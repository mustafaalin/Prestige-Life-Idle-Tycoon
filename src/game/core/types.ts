// v2 economy core — pure data types, no React, no storage.
// Shared by the game UI and the balance simulator (scripts/sim-economy.ts).

/**
 * One step a business line grows by (docs/game-design-v2.md §4.3). Level 1 opens the business; each
 * later level is bought once, in order, and raises what every location pays per run.
 */
export interface BusinessLevelDef {
  /** Price of reaching this level (for level 1: opening the business). */
  cost: number;
  /** Money one location pays per run at this level, before multipliers. */
  revenue: number;
  /** Which look the business has from this level on (index into BusinessDef.stageImages). */
  stage: number;
}

export interface BusinessDef {
  id: string;
  name: string;
  /** The first look (a stand, a cart): shown before the line is opened and while no stage art exists. */
  image: string;
  /** Art per stage (stand → shop → store). Missing stages fall back to `image`. */
  stageImages: string[];
  /** Seconds per run. */
  cycleSeconds: number;
  /** Levels in order; levels[0] is opening the business. */
  levels: BusinessLevelDef[];
  /** Price of the first branch; each next one costs `branchCostGrowth` times the one before. */
  branchCost: number;
  branchCostGrowth: number;
  /** One-time price to hire a manager that runs every location automatically, also offline. */
  managerCost: number;
  /** What has to be true before the business can be opened (its class, ...). */
  requires: Requirement[];
}

/**
 * A condition something waits for besides money (docs/game-design-v2.md §7). Businesses, jobs, items
 * and event cards share these, so a locked card always says the same kind of thing and "Go" knows where to send.
 */
export type Requirement =
  | { type: 'class'; index: number }
  /** Live in this home (index into HOUSES) or a better one. */
  | { type: 'home'; index: number }
  | { type: 'item'; itemId: string }
  | { type: 'businessLevel'; businessId: string; level: number }
  /** A job worked to 100% mastery, now or before (docs/game-design-v2.md §4.4). */
  | { type: 'mastered'; careerId: string }
  /** Own this vehicle (index into VEHICLES) or a better one. */
  | { type: 'vehicle'; index: number }
  /** This many businesses run by a manager. */
  | { type: 'managers'; count: number }
  /** A finished course. */
  | { type: 'course'; courseId: string }
  /** A job held, now or before, in this row of the job tree or higher (homes and vehicles, 2026-10-22). */
  | { type: 'jobRow'; level: number }
  /** Any one of these. */
  | { type: 'anyOf'; options: Requirement[] };

/** The career screen's tab a job sits in (careers.ts CAREER_TRACKS). */
export type CareerTrack = 'worker' | 'office' | 'expert' | 'top';

export interface CareerDef {
  id: string;
  name: string;
  image: string;
  track: CareerTrack;
  /** Row in the job tree (1 = the first job). Every job before it sits one row lower; the row sets pay and mastery time. */
  level: number;
  /** The jobs it follows (one row lower): one of them must be mastered. Empty for the first job. */
  after: string[];
  /** Game months of work to reach 100% mastery. */
  masteryMonths: number;
  /** Starting salary per second, before the yearly raises; paid automatically, online and offline. */
  salaryPerSecond: number;
  /** Every condition: one job of `after` mastered, then the extras (a course, an item, an address...). */
  requires: Requirement[];
}

/** A course taken alongside work: costs money, takes game months of play, opens jobs (docs/game-design-v2.md §4.4). */
export interface CourseDef {
  id: string;
  name: string;
  cost: number;
  /** Game months of play it takes (one month = 80 s, like age). */
  months: number;
  /** Courses that must be finished first. */
  requires: Requirement[];
}

export interface WealthClassDef {
  id: string;
  name: string;
  /** Generation earnings needed to reach this class. */
  threshold: number;
}

/** Homes are not status items: you live in one and rent or buy it (HouseDef, config/housing.ts). */
/** Gadgets (phone, laptop...) are bought once and open jobs; they are not "dreams" (no next-in-line). */
export type LifestyleKind = 'vehicle' | 'outfit' | 'toy' | 'gadget';

export interface LifestyleDef {
  id: string;
  kind: LifestyleKind;
  name: string;
  image: string;
  cost: number;
  /** Additive status bonus to all income (0.05 = +5%). */
  statusBonus: number;
  /** Vehicles: index of the home you must live in (or above) to buy it and to see it parked out front. */
  home?: number;
  /** Outfits: the wealth class (index into WEALTH_CLASSES) you must reach to buy it, however much cash you have. */
  minClass?: number;
  /** Vehicles: the career it asks for (a job row reached), none when empty. */
  requires?: Requirement[];
}

export interface HouseDef {
  id: string;
  name: string;
  image: string;
  /** One-time price to rent it and move in (deposit + first rent). There is no recurring rent. */
  moveInCost: number;
  /** Price to own it; null = rent only (the street and the rental flats). */
  buyCost: number | null;
  /** Additive bonus to all income while you live here, rented or owned (0.4 = +40%). */
  homeBonus: number;
  /** Base rent per second it pays when you own it but live elsewhere (before global multipliers). */
  rentPerSecond: number;
  /** What it asks for besides money to move in (a job row reached), none when empty. */
  requires: Requirement[];
}

export interface BusinessState {
  /** 0 = not opened yet; otherwise 1..levels.length. */
  level: number;
  /** Locations besides the first one; opened once the last level is reached. */
  branches: number;
  managed: boolean;
}

/** What a goal asks for. Counts are totals in the current life. */
export type QuestGoal =
  | { type: 'collect'; count: number }
  | { type: 'find'; count: number }
  /** Reach this level of a business (level 1 = open it). */
  | { type: 'level'; businessId: string; level: number }
  /** Own this many branches of a business. */
  | { type: 'branches'; businessId: string; count: number }
  | { type: 'manager'; businessId: string }
  | { type: 'job'; careerId: string }
  | { type: 'home'; index: number }
  | { type: 'class'; index: number }
  /** Vehicles bought (the free starting one doesn't count). */
  | { type: 'vehicle'; count: number };

/** How hard a goal that buys nothing is (a job, a class, collecting): its reward in seconds of income (config/quests.ts). */
export type QuestTier = 'easy' | 'medium' | 'hard';

export interface QuestDef {
  id: string;
  goal: QuestGoal;
  /** Reward = max(rewardMin, a share of the goal's price); a goal that buys nothing pays seconds of income by tier (formulas.ts questReward). */
  rewardMin: number;
  /** Goals that buy nothing: how hard it is (default medium). Purchase goals ignore it. */
  tier?: QuestTier;
}

export interface GameStateV2 {
  version: 2;
  cash: number;
  /** Earnings in the current generation; drives wealth class and legacy points. Never decreases. */
  generationEarnings: number;
  /** Earnings across all generations. */
  totalEarnings: number;
  generation: number;
  legacyPoints: number;
  businesses: Record<string, BusinessState>;
  /** The job held now (CareerDef id), or null: no job yet. */
  careerId: string | null;
  /** Seconds played in each job ever held (only while the game is open, like age): experience. */
  jobSeconds: Record<string, number>;
  /** Courses finished (CourseDef ids). */
  coursesDone: string[];
  /** The course being taken, one at a time, and the seconds of play spent on it. */
  course: { id: string; seconds: number } | null;
  lifestyleOwned: string[];
  /** Id of the house you live in (rented unless it is in homesOwned). */
  home: string;
  /** Houses you own. Owned houses you do not live in are rented out and pay rent. */
  homesOwned: string[];
  classIndex: number;
  /** Seconds played in this life (only while the game is open); drives the hero's age. */
  lifeSeconds: number;
  /** Goals claimed in this life (QuestDef ids, plus generated milestone goal ids). */
  questsDone: string[];
  /** Bottles and cans collected in this life (goal counter). */
  bottles: number;
  /** Wallets Şans found and the hero returned in this life (goal counter). */
  finds: number;
  /**
   * What Şans's paid accessories multiply all income by (1 = none; the Starter Pack's scarf 1.1). Kept
   * across lives. The player's purchases decide it (runtime/purchases.ts accessoryMultiplier): it is set
   * again from them on every load, so the saved number is never the source.
   */
  accessoryMultiplier: number;
  /** Family heirlooms bought with legacy points: level by heirloom id (config/heirlooms.ts). Kept across lives. */
  heirlooms: Record<string, number>;
}

export type IncomeMode = 'active' | 'idle';

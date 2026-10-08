// v2 economy core — pure data types, no React, no storage.
// Shared by the game UI and the balance simulator (scripts/sim-economy.ts).

export interface BusinessDef {
  id: string;
  name: string;
  image: string;
  /** Price of the first unit. */
  baseCost: number;
  /** Each unit costs `costGrowth` × the previous one. */
  costGrowth: number;
  /** Seconds per production cycle (before speed milestones). */
  cycleSeconds: number;
  /** Money paid per owned unit per cycle (before multipliers). */
  baseRevenue: number;
  /** One-time price to hire a manager that runs cycles automatically. */
  managerCost: number;
}

export interface CareerDef {
  id: string;
  name: string;
  image: string;
  /** Price to get this job (training, clothes, licence...). */
  cost: number;
  /** Salary per second; paid automatically, online and offline. */
  salaryPerSecond: number;
  /** Permanent additive bonus to all income while this generation lasts (0.1 = +10%). */
  incomeBonus: number;
}

export interface WealthClassDef {
  id: string;
  name: string;
  /** Generation earnings needed to reach this class. */
  threshold: number;
}

/** Homes are not status items: you live in one and rent or buy it (HouseDef, config/housing.ts). */
export type LifestyleKind = 'vehicle' | 'outfit' | 'toy';

export interface LifestyleDef {
  id: string;
  kind: LifestyleKind;
  name: string;
  image: string;
  cost: number;
  /** Additive status bonus to all income (0.05 = +5%). */
  statusBonus: number;
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
}

export interface BusinessState {
  owned: number;
  managed: boolean;
}

/** One-time upgrade of a single business line (AdVenture Capitalist cash upgrade). */
export interface UpgradeDef {
  /** `${businessId}:${n}`, n = 1..3. */
  id: string;
  businessId: string;
  cost: number;
  /** Units of the business needed before it can be bought. */
  requiredOwned: number;
  /** Multiplies that business's profit. */
  multiplier: number;
}

/** What a goal asks for. Counts are totals in the current life. */
export type QuestGoal =
  | { type: 'collect'; count: number }
  | { type: 'find'; count: number }
  | { type: 'units'; businessId: string; count: number }
  | { type: 'manager'; businessId: string }
  | { type: 'upgrade'; upgradeId: string }
  | { type: 'career'; index: number }
  | { type: 'home'; index: number }
  | { type: 'class'; index: number }
  /** Vehicles bought (the free starting one doesn't count). */
  | { type: 'vehicle'; count: number };

export interface QuestDef {
  id: string;
  goal: QuestGoal;
  /** Reward = max(rewardMin, active income × rewardSeconds). */
  rewardSeconds: number;
  rewardMin: number;
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
  /** Index into CAREERS; -1 = no job yet (living on the street). */
  careerIndex: number;
  lifestyleOwned: string[];
  /** Id of the house you live in (rented unless it is in homesOwned). */
  home: string;
  /** Houses you own. Owned houses you do not live in are rented out and pay rent. */
  homesOwned: string[];
  classIndex: number;
  /** Seconds played in this life (only while the game is open); drives the hero's age. */
  lifeSeconds: number;
  /** Business upgrades bought in this life (UpgradeDef ids). */
  upgrades: string[];
  /** Goals claimed in this life (QuestDef ids, plus generated milestone goal ids). */
  questsDone: string[];
  /** Bottles and cans collected in this life (goal counter). */
  bottles: number;
  /** Wallets Şans found and the hero returned in this life (goal counter). */
  finds: number;
}

export type IncomeMode = 'active' | 'idle';

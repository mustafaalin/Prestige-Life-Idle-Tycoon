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

export type LifestyleKind = 'house' | 'vehicle' | 'outfit' | 'toy';

export interface LifestyleDef {
  id: string;
  kind: LifestyleKind;
  name: string;
  image: string;
  cost: number;
  /** Additive status bonus to all income (0.05 = +5%). */
  statusBonus: number;
}

export interface BusinessState {
  owned: number;
  managed: boolean;
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
  classIndex: number;
}

export type IncomeMode = 'active' | 'idle';

import { BRANCH_CAP_STEPS, BUSINESSES } from '../config/businesses';
import { NOTEBOOK_MIN_SHARE } from '../config/heirlooms';
import { allMet } from '../requirements';
import type { BusinessDef, BusinessLevelDef, BusinessState, GameStateV2 } from '../types';
import { heirloomEffect } from './legacy';

// Business lines: levels, branches and what a run pays (docs/economy-rebuild.md §3). Pure reads of
// config and state, before any global multiplier; state.ts holds the actions, income.ts the totals.

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));

export function businessDef(id: string): BusinessDef | undefined {
  return BUSINESS_BY_ID.get(id);
}

export function emptyBusiness(): BusinessState {
  return { level: 0, branches: 0, managed: false };
}

export function businessState(state: GameStateV2, id: string): BusinessState {
  return state.businesses[id] ?? emptyBusiness();
}

export function isOpened(business: BusinessState) {
  return business.level > 0;
}

/** The level bought next (for an unopened line: opening it), or null at the last level. */
export function nextLevel(def: BusinessDef, business: BusinessState): BusinessLevelDef | null {
  return def.levels[business.level] ?? null;
}

export function isMaxLevel(def: BusinessDef, business: BusinessState) {
  return business.level >= def.levels.length;
}

/** The class a line opens at (its class requirement; 0 when it has none). */
export function businessOpenClass(def: BusinessDef) {
  return def.requires.reduce((open, requirement) => (requirement.type === 'class' ? Math.max(open, requirement.index) : open), 0);
}

/** Whether the line's conditions (class, ...) allow opening it, money aside. */
export function canOpenBusiness(state: GameStateV2, def: BusinessDef) {
  return allMet(state, def.requires);
}

/** Places the business runs in: the first one plus its branches (0 before it is opened). */
export function locations(business: BusinessState) {
  return isOpened(business) ? 1 + business.branches : 0;
}

/** Branches a class allows: 0 before the line opens, Infinity once the steps run out. */
export function branchCapAt(def: BusinessDef, classIndex: number) {
  const step = classIndex - businessOpenClass(def);
  if (step < 0) return 0;
  return BRANCH_CAP_STEPS[step] ?? Infinity;
}

/** Price of the next branch when `branches` are open. */
export function branchCost(def: BusinessDef, branches: number) {
  return def.branchCost * def.branchCostGrowth ** branches;
}

/** Branches open only at the last level, up to what the class allows. */
export function canOpenBranch(state: GameStateV2, def: BusinessDef) {
  const business = businessState(state, def.id);
  return isMaxLevel(def, business) && business.branches < branchCapAt(def, state.classIndex);
}

/** What one location pays per run at a level, before multipliers (0 at level 0). */
export function levelRevenue(def: BusinessDef, level: number) {
  return level > 0 ? (def.levels[Math.min(level, def.levels.length) - 1]?.revenue ?? 0) : 0;
}

/** Money a run pays across every location, before multipliers. */
export function baseRunRevenue(def: BusinessDef, business: BusinessState) {
  return levelRevenue(def, business.level) * locations(business);
}

/** Income per second of a line at 100% uptime, before multipliers. */
export function baseBusinessIncomePerSecond(def: BusinessDef, business: BusinessState) {
  return baseRunRevenue(def, business) / def.cycleSeconds;
}

/** The look a business has at a level (stand, shop, store). */
export function businessStage(def: BusinessDef, level: number) {
  return level > 0 ? (def.levels[Math.min(level, def.levels.length) - 1]?.stage ?? 0) : 0;
}

/** The picture for a business at a level; a stage without art yet shows the latest one drawn before it. */
export function businessImage(def: BusinessDef, level: number) {
  const stage = Math.min(businessStage(def, level), def.stageImages.length - 1);
  return stage >= 0 ? def.stageImages[stage] : def.image;
}

/** The first level of the next look (shop, store), or null at the last look. */
export function nextStageLevel(def: BusinessDef, level: number): number | null {
  const stage = businessStage(def, level);
  const index = def.levels.findIndex((step, at) => at >= level && step.stage > stage);
  return index >= 0 ? index + 1 : null;
}

/** A manager's price after Old Ray's notebook (an heirloom, hidden at launch). */
export function managerCost(state: GameStateV2, def: BusinessDef) {
  return def.managerCost * Math.max(NOTEBOOK_MIN_SHARE, 1 - heirloomEffect(state, 'notebook'));
}

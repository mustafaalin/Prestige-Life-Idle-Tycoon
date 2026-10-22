import { CAREERS, careerDef } from './config/careers';
import { HOUSES } from './config/housing';
import { VEHICLES } from './config/lifestyle';
import { SECONDS_PER_MONTH } from './config/life';
import type { GameStateV2, Requirement } from './types';

// Conditions besides money (docs/game-design-v2.md §7). One evaluator per kind: a new kind of
// condition is one more case here, and every business, job, item or card that uses it gets the same
// check and the same "what is missing" answer.

const HOUSE_INDEX = new Map(HOUSES.map((house, index) => [house.id, index]));

export function isMet(state: GameStateV2, requirement: Requirement): boolean {
  switch (requirement.type) {
    case 'class':
      return state.classIndex >= requirement.index;
    case 'home':
      return (HOUSE_INDEX.get(state.home) ?? 0) >= requirement.index;
    case 'item':
      return state.lifestyleOwned.includes(requirement.itemId);
    case 'businessLevel':
      return (state.businesses[requirement.businessId]?.level ?? 0) >= requirement.level;
    case 'mastered':
      return isMastered(state, requirement.careerId);
    case 'vehicle':
      return VEHICLES.some((vehicle, index) => index >= requirement.index && state.lifestyleOwned.includes(vehicle.id));
    case 'managers':
      return Object.values(state.businesses).filter((business) => business.managed).length >= requirement.count;
    case 'course':
      return state.coursesDone.includes(requirement.courseId);
    case 'jobRow':
      return jobRowReached(state) >= requirement.level;
    case 'anyOf':
      return requirement.options.some((option) => isMet(state, option));
  }
}

/**
 * The highest row of the job tree reached (0 before the first job): the job held or any job held
 * before, counting only jobs reached from the first row, one row after another. A save from an older
 * tree may hold a job that has since moved far up (2026-10-22, phone test: the Cashier, once row 3,
 * now opens the Office tab at row 16); such a job stays held or done but does not count.
 */
export function jobRowReached(state: GameStateV2) {
  const reached = new Set<string>();
  let top = 0;
  // CAREERS is listed row by row, so a job's earlier jobs are settled before it.
  for (const career of CAREERS) {
    const worked = state.careerId === career.id || (state.jobSeconds[career.id] ?? 0) > 0;
    if (!worked) continue;
    if (career.after.length > 0 && !career.after.some((id) => reached.has(id))) continue;
    reached.add(career.id);
    top = Math.max(top, career.level);
  }
  return top;
}

/** Whole game months worked in a job, now or before. */
export function jobMonths(state: GameStateV2, careerId: string) {
  return Math.floor((state.jobSeconds[careerId] ?? 0) / SECONDS_PER_MONTH);
}

/** Share of a job's mastery done (0–1): months worked against the months it takes. */
export function masteryOf(state: GameStateV2, careerId: string) {
  const career = careerDef(careerId);
  if (!career) return 0;
  return Math.min(1, (state.jobSeconds[careerId] ?? 0) / (career.masteryMonths * SECONDS_PER_MONTH));
}

export function isMastered(state: GameStateV2, careerId: string) {
  return masteryOf(state, careerId) >= 1;
}

/** Every condition not met yet, in the order listed. */
export function unmet(state: GameStateV2, requirements: readonly Requirement[]): Requirement[] {
  return requirements.filter((requirement) => !isMet(state, requirement));
}

/** The first condition not met yet, in the order listed (the one a locked card shows), or null. */
export function firstUnmet(state: GameStateV2, requirements: readonly Requirement[]): Requirement | null {
  return requirements.find((requirement) => !isMet(state, requirement)) ?? null;
}

export function allMet(state: GameStateV2, requirements: readonly Requirement[]) {
  return firstUnmet(state, requirements) === null;
}

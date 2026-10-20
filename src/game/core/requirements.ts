import { HOUSES } from './config/housing';
import { SECONDS_PER_MONTH } from './config/life';
import type { GameStateV2, Requirement } from './types';

// Conditions besides money (docs/economy-rebuild.md §7). One evaluator per kind: a new kind of
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
    case 'job':
      return jobMonths(state, requirement.careerId) >= requirement.months;
    case 'course':
      return state.coursesDone.includes(requirement.courseId);
    case 'anyOf':
      return requirement.options.some((option) => isMet(state, option));
  }
}

/** Whole game months worked in a job, now or before. */
export function jobMonths(state: GameStateV2, careerId: string) {
  return Math.floor((state.jobSeconds[careerId] ?? 0) / SECONDS_PER_MONTH);
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

import type { QuestDef } from '../types';

// Goals (plan 1.12 / 2.7): a written path through the first hour, three on screen at a time like
// Egg, Inc.'s missions. When it runs out, goals are generated from each business's next level and
// branch milestones (state.ts activeQuests). Rewards are income-based so they never dwarf the core loop.
// Ids are saved once claimed: never rename one (the economy rebuild started saves fresh once, 2026-10-21).

const quest = (id: string, goal: QuestDef['goal'], rewardMin: number, rewardSeconds = 15): QuestDef => ({
  id,
  goal,
  rewardSeconds,
  rewardMin,
});

const level = (businessId: string, value: number) => ({ type: 'level' as const, businessId, level: value });

export const QUESTS: QuestDef[] = [
  // A job comes first; the Flower Stand is opened from the savings (2026-10-09).
  quest('collect-5', { type: 'collect', count: 5 }, 3),
  quest('job-1', { type: 'career', index: 0 }, 5),
  // Something to buy while saving for the stand (2026-10-13): the bike, then the second job.
  quest('vehicle-2', { type: 'vehicle', count: 1 }, 8),
  quest('job-2', { type: 'career', index: 1 }, 15),
  quest('flower-open', level('flower-stand', 1), 20),
  quest('flower-level-3', level('flower-stand', 3), 40),
  quest('collect-30', { type: 'collect', count: 30 }, 30),
  quest('flower-level-5', level('flower-stand', 5), 60),
  quest('find-1', { type: 'find', count: 1 }, 50),
  quest('flower-manager', { type: 'manager', businessId: 'flower-stand' }, 100),
  quest('coffee-open', level('coffee-cart', 1), 100),
  // Old Ray's van comes with the Day Laborer ceremony; the room is the first move you pay for.
  quest('home-room', { type: 'home', index: 2 }, 150),
  quest('flower-shop', level('flower-stand', 8), 300),
  quest('coffee-level-5', level('coffee-cart', 5), 300),
  quest('coffee-manager', { type: 'manager', businessId: 'coffee-cart' }, 600),
  quest('class-2', { type: 'class', index: 2 }, 1000),
  quest('bakery-open', level('bakery', 1), 1000),
  quest('flower-store', level('flower-stand', 10), 1500),
  quest('flower-branch-1', { type: 'branches', businessId: 'flower-stand', count: 1 }, 2000),
  quest('job-4', { type: 'career', index: 3 }, 3000),
  quest('bakery-manager', { type: 'manager', businessId: 'bakery' }, 5000),
  quest('home-flat-2', { type: 'home', index: 4 }, 5000),
  // The Car Wash opens at Middle Class (game-design-v2 §4.2), so the class goal comes first.
  quest('class-3', { type: 'class', index: 3 }, 20000),
  quest('carwash-open', level('car-wash', 1), 8000),
];

/** Goals on screen at once. */
export const ACTIVE_QUESTS = 3;
/** Generated goals pay this many seconds of active income. */
export const GENERATED_QUEST_SECONDS = 20;
/** Levels a generated goal points at (the shop at 8, the store at 10), then branch counts. */
export const GENERATED_LEVEL_GOALS = [3, 5, 8, 10];
export const GENERATED_BRANCH_GOALS = [1, 3, 5, 10, 20, 50];

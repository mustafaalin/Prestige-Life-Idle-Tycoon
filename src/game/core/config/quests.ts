import type { QuestDef } from '../types';

// Goals (plan 1.12 / 2.7): a written path through the first hour, three on screen at a time like
// Egg, Inc.'s missions. When it runs out, goals are generated from the next business milestones
// (state.ts activeQuests). Rewards are income-based so they never dwarf the core loop.

const quest = (id: string, goal: QuestDef['goal'], rewardMin: number, rewardSeconds = 15): QuestDef => ({
  id,
  goal,
  rewardSeconds,
  rewardMin,
});

export const QUESTS: QuestDef[] = [
  quest('collect-5', { type: 'collect', count: 5 }, 3),
  quest('flower-1', { type: 'units', businessId: 'flower-stand', count: 1 }, 5),
  quest('flower-5', { type: 'units', businessId: 'flower-stand', count: 5 }, 10),
  quest('job-1', { type: 'career', index: 0 }, 10),
  quest('flower-up-1', { type: 'upgrade', upgradeId: 'flower-stand:1' }, 20),
  quest('collect-30', { type: 'collect', count: 30 }, 30),
  quest('flower-10', { type: 'units', businessId: 'flower-stand', count: 10 }, 40),
  quest('find-1', { type: 'find', count: 1 }, 50),
  quest('flower-manager', { type: 'manager', businessId: 'flower-stand' }, 100),
  quest('coffee-1', { type: 'units', businessId: 'coffee-cart', count: 1 }, 100),
  quest('home-1', { type: 'home', index: 1 }, 150),
  // The id keeps its old name (it counted the free wheelbarrow) so saves that claimed it stay claimed.
  quest('vehicle-2', { type: 'vehicle', count: 1 }, 150),
  quest('job-2', { type: 'career', index: 1 }, 200),
  quest('coffee-10', { type: 'units', businessId: 'coffee-cart', count: 10 }, 300),
  quest('flower-up-2', { type: 'upgrade', upgradeId: 'flower-stand:2' }, 400),
  quest('coffee-manager', { type: 'manager', businessId: 'coffee-cart' }, 600),
  quest('class-2', { type: 'class', index: 2 }, 1000),
  quest('bakery-1', { type: 'units', businessId: 'bakery', count: 1 }, 1000),
  quest('coffee-up-1', { type: 'upgrade', upgradeId: 'coffee-cart:1' }, 1500),
  quest('flower-25', { type: 'units', businessId: 'flower-stand', count: 25 }, 2000),
  quest('job-4', { type: 'career', index: 3 }, 3000),
  quest('bakery-manager', { type: 'manager', businessId: 'bakery' }, 5000),
  quest('home-4', { type: 'home', index: 4 }, 5000),
  quest('carwash-1', { type: 'units', businessId: 'car-wash', count: 1 }, 8000),
  quest('class-3', { type: 'class', index: 3 }, 20000),
];

/** Goals on screen at once. */
export const ACTIVE_QUESTS = 3;
/** Generated milestone goals pay this many seconds of active income. */
export const GENERATED_QUEST_SECONDS = 20;

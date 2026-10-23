import type { QuestDef, QuestTier } from '../types';

// Goals (plan 1.12 / 2.7): a written path through the first hour, three on screen at a time like
// Egg, Inc.'s missions. When it runs out, goals are generated from each business's next level and
// branch milestones (state.ts activeQuests). Rewards are small next to the core loop (formulas.ts
// questReward). Ids are saved once claimed: never rename one (the economy rebuild started saves fresh
// once, 2026-10-21).
// The order follows when the simulator's player gets each done (npm run sim -- --quests, 2026-10-23),
// so a goal shows up before it is done and still points the way.

const quest = (id: string, goal: QuestDef['goal'], rewardMin: number, tier?: QuestTier): QuestDef => ({
  id,
  goal,
  rewardMin,
  tier,
});

const level = (businessId: string, value: number) => ({ type: 'level' as const, businessId, level: value });

export const QUESTS: QuestDef[] = [
  // A job comes first; the Flower Stand is opened from the savings (2026-10-09).
  quest('collect-5', { type: 'collect', count: 5 }, 3, 'easy'),
  quest('job-1', { type: 'job', careerId: 'flyer-distributor' }, 5, 'easy'),
  // Something to buy while saving for the stand (2026-10-13).
  quest('vehicle-2', { type: 'vehicle', count: 1 }, 8),
  quest('collect-30', { type: 'collect', count: 30 }, 30, 'easy'),
  quest('find-1', { type: 'find', count: 1 }, 50, 'easy'),
  quest('flower-open', level('flower-stand', 1), 20),
  quest('flower-level-3', level('flower-stand', 3), 40),
  quest('job-2', { type: 'job', careerId: 'dishwasher' }, 15),
  quest('flower-manager', { type: 'manager', businessId: 'flower-stand' }, 100),
  quest('flower-level-5', level('flower-stand', 5), 60),
  quest('job-4', { type: 'job', careerId: 'waiter' }, 100),
  quest('flower-shop', level('flower-stand', 6), 300),
  quest('coffee-open', level('coffee-cart', 1), 100),
  quest('flower-store', level('flower-stand', 11), 1500),
  quest('coffee-manager', { type: 'manager', businessId: 'coffee-cart' }, 600),
  // Old Ray's van comes with the Day Laborer ceremony; the room is the first move you pay for.
  quest('home-room', { type: 'home', index: 2 }, 150),
  quest('class-2', { type: 'class', index: 2 }, 1000, 'hard'),
  quest('flower-branch-1', { type: 'branches', businessId: 'flower-stand', count: 1 }, 2000),
  quest('bakery-open', level('bakery', 1), 1000),
  quest('coffee-level-5', level('coffee-cart', 5), 300),
  quest('class-3', { type: 'class', index: 3 }, 20000, 'hard'),
  // The Car Wash opens at Working Class (config/businesses.ts): it needs no class goal before it.
  quest('carwash-open', level('car-wash', 1), 1000),
  quest('bakery-manager', { type: 'manager', businessId: 'bakery' }, 1000),
  quest('home-flat-2', { type: 'home', index: 4 }, 1000),
];

/** Goals on screen at once. */
export const ACTIVE_QUESTS = 3;
/** A purchase goal pays this share of its price (formulas.ts questPrice). */
export const QUEST_PRICE_SHARE = 0.05;
/** A goal that buys nothing pays this many seconds of active income, by how hard it is. */
export const QUEST_TIER_SECONDS: Record<QuestTier, number> = { easy: 5, medium: 15, hard: 30 };
/** Levels a generated goal points at (the shop at 6, the store at 11, the top at 15), then branch counts. */
export const GENERATED_LEVEL_GOALS = [3, 6, 11, 15];
export const GENERATED_BRANCH_GOALS = [1, 3, 5, 10, 20, 50];

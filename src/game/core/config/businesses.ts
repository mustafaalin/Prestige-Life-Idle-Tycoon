import type { BusinessDef, BusinessLevelDef } from '../types';
import { SECONDS_PER_MONTH } from './life';

// Generation-1 business lines (docs/game-design-v2.md §4.3). A business is opened once and grows by
// named levels (set it up → run it well → scale it), then by branches; nobody buys a 73rd flower
// stand. Amounts follow the in-game calendar (one month = 80 s): what a line earns a month is close to
// what such a business earns in real life, and bigger businesses take longer to pay back (§2).
// Every change here goes through `npm run sim`.
//
// Saved state keeps each line by id with its level and branch count (runtime/storage.ts), so a line
// may get more levels later, but its id and the meaning of a level number must never change.

/**
 * Look of a business by level (2026-10-21, user: equal stages): three looks of five levels each,
 * stand 1–5, shop 6–10, store 11–15. Moving into the new building doubles a run's pay.
 */
export const LEVELS_PER_STAGE = 5;
const STAGE_BY_LEVEL = Array.from({ length: 3 * LEVELS_PER_STAGE }, (_, index) => Math.floor(index / LEVELS_PER_STAGE));

/**
 * Every run takes one second (2026-10-21, user): "Run" pays a little each tap and a managed line pays
 * every second, each with a "+$5" bubble over the business. A run pays what the old 5–15 s runs paid
 * per second, so income is unchanged.
 */
export const RUN_SECONDS = 1;

/**
 * The shape every line's ladder follows until each gets its own designed table (plan Faz E2): price
 * and money per run of each level as multiples of level 1. Within a look each level adds a little;
 * the first level in a new building (6 and 11) costs the most and doubles the run.
 */
const LADDER_COST = [1, 0.5, 0.9, 1.5, 2.5, 12, 5, 8, 12, 17, 70, 28, 38, 50, 66];
const LADDER_REVENUE = [1, 1.2, 1.4, 1.65, 1.9, 3.8, 4.3, 4.9, 5.5, 6.2, 12.4, 13.6, 15, 16.5, 18];

/**
 * Saves from before the 15 levels (schema 2) had 10, with run pay [1, 1.28, 1.6, 2.2, 3, 4, 5.2, 8,
 * 10.4, 16] × level 1. Each old level maps to the first new level that pays at least as much, so no
 * one earns less after the update (runtime/storage.ts migrate).
 */
export const SCHEMA2_LEVEL_MAP = [1, 3, 4, 6, 6, 7, 9, 11, 11, 14];

/** Rounds to 3 significant digits so generated prices read like designed ones. */
export function roundNice(value: number) {
  if (value <= 0) return 0;
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2);
  return Math.round(value / magnitude) * magnitude;
}

function ladder(openCost: number, firstMonthly: number): BusinessLevelDef[] {
  const firstRevenue = (firstMonthly / SECONDS_PER_MONTH) * RUN_SECONDS;
  return LADDER_COST.map((costShare, index) => ({
    cost: roundNice(openCost * costShare),
    revenue: roundNice(firstRevenue * LADDER_REVENUE[index]),
    stage: STAGE_BY_LEVEL[index],
  }));
}

/**
 * A branch is a whole new store: the first costs what every level of the line cost together (from
 * zero to the store), and each next one this much more. A branch repays slower than the levels did,
 * so the cheapest line's branches are not the best buy in the game (2026-10-21: at the top level's
 * price and ×1.15 the bot opened 30 flower stores by Millionaire).
 */
const BRANCH_COST_GROWTH = 1.4;
/** Manager price as a multiple of opening the business. */
const MANAGER_COST_MULTIPLE = 4;

/**
 * Branches allowed by classes since the line opened (the old unit caps, decided 2026-10-16): a
 * ceremony lets a business spread further. Past the end there is no limit.
 */
export const BRANCH_CAP_STEPS = [1, 2, 4, 8, 16, 32];

/**
 * The Billionaire ceremony brings Mr. Bryce to work for the hero (story-v2 §4): the first hotel and
 * its manager come free with the class, like the van and the first home (decided 2026-10-13).
 */
export const CLASS_MANAGER_GIFT = { classIndex: 5, businessId: 'hotel' };

const ART = '/assets/businesses/v2';
/**
 * Every line has three looks (prompts: docs/archive/art-prompts-businesses.md): stage 1 is `{id}.webp`,
 * stages 2 and 3 are `{id}-2.webp` and `{id}-3.webp`.
 */
const STAGES = 3;

const stageImages = (id: string): string[] =>
  Array.from({ length: STAGES }, (_, stage) => (stage === 0 ? `${ART}/${id}.webp` : `${ART}/${id}-${stage + 1}.webp`));

// openCost: opening the business · paybackMonths: game months level 1 takes to repay the opening
// (bigger businesses repay slower, docs/game-design-v2.md §4.2) · openClass: the class the line opens at.
// Fourteen lines (decided 2026-10-21).
const LINES: { id: string; name: string; openCost: number; paybackMonths: number; openClass: number }[] = [
  { id: 'flower-stand', name: 'Flower Stand', openCost: 1000, paybackMonths: 1.25, openClass: 0 },
  { id: 'coffee-cart', name: 'Coffee Cart', openCost: 4e3, paybackMonths: 8, openClass: 1 },
  { id: 'bakery', name: 'Bakery', openCost: 3e4, paybackMonths: 28, openClass: 2 },
  { id: 'car-wash', name: 'Car Wash', openCost: 1.2e5, paybackMonths: 50, openClass: 2 },
  { id: 'mini-market', name: 'Mini Market', openCost: 4e5, paybackMonths: 80, openClass: 3 },
  { id: 'restaurant', name: 'Restaurant', openCost: 8e5, paybackMonths: 110, openClass: 3 },
  { id: 'beauty-salon', name: 'Beauty Salon', openCost: 1.5e6, paybackMonths: 140, openClass: 3 },
  { id: 'real-estate-office', name: 'Real Estate Office', openCost: 3e6, paybackMonths: 170, openClass: 4 },
  { id: 'logistics-warehouse', name: 'Logistics Warehouse', openCost: 1e7, paybackMonths: 150, openClass: 4 },
  { id: 'construction', name: 'Construction Company', openCost: 2.5e7, paybackMonths: 180, openClass: 4 },
  { id: 'factory', name: 'Factory', openCost: 6e7, paybackMonths: 210, openClass: 4 },
  { id: 'hotel', name: 'Hotel Chain', openCost: 1.5e8, paybackMonths: 250, openClass: 5 },
  { id: 'media', name: 'Media Company', openCost: 4e8, paybackMonths: 300, openClass: 5 },
  { id: 'tech-startup', name: 'Tech Startup', openCost: 1e9, paybackMonths: 360, openClass: 5 },
];

/** The Flower Stand has its own designed table (docs/game-design-v2.md §4.3); the others follow its shape for now. */
const FLOWER_STAND_LEVELS: BusinessLevelDef[] = [
  [1000, 5],
  [250, 6],
  [450, 7],
  [750, 8.2],
  [1250, 9.5],
  [6000, 19],
  [2500, 21.5],
  [4000, 24.5],
  [6000, 27.5],
  [8500, 31],
  [35000, 62],
  [14000, 68],
  [19000, 75],
  [25000, 82],
  [33000, 90],
].map(([cost, revenue], index) => ({ cost, revenue, stage: STAGE_BY_LEVEL[index] }));

/** Old Ray, the first manager: a little dearer than the rule so he comes after the first few minutes of running the stand by hand. */
const FLOWER_STAND_MANAGER = 5000;

export const BUSINESSES: BusinessDef[] = LINES.map(({ openCost, paybackMonths, openClass, ...line }) => {
  const levels = line.id === 'flower-stand' ? FLOWER_STAND_LEVELS : ladder(openCost, openCost / paybackMonths);
  return {
    ...line,
    cycleSeconds: RUN_SECONDS,
    image: `${ART}/${line.id}.webp`,
    stageImages: stageImages(line.id),
    levels,
    branchCost: roundNice(levels.reduce((sum, level) => sum + level.cost, 0)),
    branchCostGrowth: BRANCH_COST_GROWTH,
    managerCost: line.id === 'flower-stand' ? FLOWER_STAND_MANAGER : roundNice(openCost * MANAGER_COST_MULTIPLE),
    requires: openClass > 0 ? [{ type: 'class', index: openClass }] : [],
  };
});

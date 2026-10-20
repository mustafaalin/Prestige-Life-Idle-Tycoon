import type { BusinessDef, BusinessLevelDef } from '../types';
import { SECONDS_PER_MONTH } from './life';

// Generation-1 business lines (docs/economy-rebuild.md §3). A business is opened once and grows by
// named levels (set it up → run it well → scale it), then by branches; nobody buys a 73rd flower
// stand. Amounts follow the in-game calendar (one month = 80 s): what a line earns a month is close to
// what such a business earns in real life, and bigger businesses take longer to pay back (§2).
// Every change here goes through `npm run sim`.
//
// Saved state keeps each line by id with its level and branch count (runtime/storage.ts), so a line
// may get more levels later, but its id and the meaning of a level number must never change.

/** Look of a business by level: stand for the first seven levels, shop for 8–9, store from 10. */
const STAGE_BY_LEVEL = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2];

/**
 * The shape every line's ladder follows until each gets its own designed table (plan Faz E2): price
 * and money per run of each level as multiples of level 1. Taken from the Flower Stand draft
 * (economy-rebuild §3.2): cheap fast steps first, expensive big ones at the end.
 */
const LADDER_COST = [1, 0.6, 1.2, 3, 6, 12, 20, 50, 80, 160];
const LADDER_REVENUE = [1, 1.28, 1.6, 2.2, 3, 4, 5.2, 8, 10.4, 16];

/** Rounds to 3 significant digits so generated prices read like designed ones. */
export function roundNice(value: number) {
  if (value <= 0) return 0;
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2);
  return Math.round(value / magnitude) * magnitude;
}

function ladder(openCost: number, firstMonthly: number, cycleSeconds: number): BusinessLevelDef[] {
  const firstRevenue = (firstMonthly / SECONDS_PER_MONTH) * cycleSeconds;
  return LADDER_COST.map((costShare, index) => ({
    cost: roundNice(openCost * costShare),
    revenue: roundNice(firstRevenue * LADDER_REVENUE[index]),
    stage: STAGE_BY_LEVEL[index],
  }));
}

/** Each branch costs this much more than the one before (low on purpose: no runaway prices). */
const BRANCH_COST_GROWTH = 1.15;
/** Manager price as a multiple of opening the business. */
const MANAGER_COST_MULTIPLE = 3;

/**
 * Branches allowed by classes since the line opened (the old unit caps, decided 2026-10-16): a
 * ceremony lets a business spread further. Past the end there is no limit.
 */
export const BRANCH_CAP_STEPS = [2, 5, 10, 20];

/**
 * The Billionaire ceremony brings Mr. Bryce to work for the hero (story-v2 §4): the first hotel and
 * its manager come free with the class, like the van and the first home (decided 2026-10-13).
 */
export const CLASS_MANAGER_GIFT = { classIndex: 5, businessId: 'hotel' };

const ART = '/assets/businesses/v2';

// openCost: opening the business · firstMonthly: what level 1 earns a month with a manager.
// openClass: the class the line opens at (decided 2026-10-16: Middle Class opens two lines,
// Millionaire two, Billionaire three).
const LINES: { id: string; name: string; openCost: number; firstMonthly: number; cycleSeconds: number; openClass: number }[] = [
  { id: 'flower-stand', name: 'Flower Stand', openCost: 500, firstMonthly: 400, cycleSeconds: 5, openClass: 0 },
  { id: 'coffee-cart', name: 'Coffee Cart', openCost: 4e3, firstMonthly: 1.5e3, cycleSeconds: 6, openClass: 1 },
  { id: 'bakery', name: 'Bakery', openCost: 3e4, firstMonthly: 5e3, cycleSeconds: 8, openClass: 2 },
  { id: 'car-wash', name: 'Car Wash', openCost: 1.2e5, firstMonthly: 1.2e4, cycleSeconds: 9, openClass: 3 },
  { id: 'mini-market', name: 'Mini Market', openCost: 5e5, firstMonthly: 3e4, cycleSeconds: 10, openClass: 3 },
  { id: 'beauty-salon', name: 'Beauty Salon', openCost: 2e6, firstMonthly: 8e4, cycleSeconds: 11, openClass: 4 },
  { id: 'logistics-warehouse', name: 'Logistics Warehouse', openCost: 1.5e7, firstMonthly: 4e5, cycleSeconds: 12, openClass: 4 },
  { id: 'factory', name: 'Factory', openCost: 1e8, firstMonthly: 2e6, cycleSeconds: 13, openClass: 5 },
  { id: 'hotel', name: 'Hotel Chain', openCost: 6e8, firstMonthly: 9e6, cycleSeconds: 14, openClass: 5 },
  { id: 'tech-startup', name: 'Tech Startup', openCost: 4e9, firstMonthly: 5e7, cycleSeconds: 15, openClass: 5 },
];

/** The Flower Stand has its own designed table (economy-rebuild §3.2); the others follow its shape for now. */
const FLOWER_STAND_LEVELS: BusinessLevelDef[] = [
  { cost: 500, revenue: 25, stage: 0 },
  { cost: 300, revenue: 32, stage: 0 },
  { cost: 600, revenue: 40, stage: 0 },
  { cost: 1500, revenue: 55, stage: 0 },
  { cost: 3000, revenue: 75, stage: 0 },
  { cost: 6000, revenue: 100, stage: 0 },
  { cost: 10000, revenue: 130, stage: 0 },
  { cost: 25000, revenue: 200, stage: 1 },
  { cost: 40000, revenue: 260, stage: 1 },
  { cost: 80000, revenue: 400, stage: 2 },
];

export const BUSINESSES: BusinessDef[] = LINES.map(({ openCost, firstMonthly, openClass, ...line }) => {
  const levels = line.id === 'flower-stand' ? FLOWER_STAND_LEVELS : ladder(openCost, firstMonthly, line.cycleSeconds);
  return {
    ...line,
    image: `${ART}/${line.id}.webp`,
    // Shop and store art comes with plan Faz E3 (GPT); until then every stage shows the first look.
    stageImages: [`${ART}/${line.id}.webp`],
    levels,
    branchCost: levels[levels.length - 1].cost,
    branchCostGrowth: BRANCH_COST_GROWTH,
    managerCost: roundNice(openCost * MANAGER_COST_MULTIPLE),
    requires: openClass > 0 ? [{ type: 'class', index: openClass }] : [],
  };
});

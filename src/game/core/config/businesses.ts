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
/** Lines whose art and manager portrait are not drawn yet (plan Faz E3): they show the business icon. */
export const ART_PENDING = new Set(['restaurant', 'real-estate-office', 'construction', 'media']);
const PENDING_IMAGE = '/assets/icons/v2/business.webp';
/**
 * How many of a line's three looks are drawn (prompts: docs/art-prompts-businesses.md). Stage 1 is
 * `{id}.webp`, stages 2 and 3 are `{id}-2.webp` and `{id}-3.webp`; a stage without art shows the one
 * before it. Raise the number when the art arrives.
 */
const STAGE_ART: Record<string, number> = {};

function stageImages(id: string): string[] {
  if (ART_PENDING.has(id)) return [];
  const drawn = STAGE_ART[id] ?? 1;
  return Array.from({ length: drawn }, (_, stage) => (stage === 0 ? `${ART}/${id}.webp` : `${ART}/${id}-${stage + 1}.webp`));
}

// openCost: opening the business · paybackMonths: game months level 1 takes to repay the opening
// (bigger businesses repay slower, economy-rebuild §2) · openClass: the class the line opens at.
// Fourteen lines (decided 2026-10-21); restaurant, real-estate-office, construction and media are new
// and wait for their art and managers (plan Faz E3).
const LINES: { id: string; name: string; openCost: number; paybackMonths: number; cycleSeconds: number; openClass: number }[] = [
  { id: 'flower-stand', name: 'Flower Stand', openCost: 1000, paybackMonths: 1.25, cycleSeconds: 5, openClass: 0 },
  { id: 'coffee-cart', name: 'Coffee Cart', openCost: 4e3, paybackMonths: 8, cycleSeconds: 6, openClass: 1 },
  { id: 'bakery', name: 'Bakery', openCost: 3e4, paybackMonths: 28, cycleSeconds: 8, openClass: 2 },
  { id: 'car-wash', name: 'Car Wash', openCost: 1.2e5, paybackMonths: 50, cycleSeconds: 9, openClass: 2 },
  { id: 'mini-market', name: 'Mini Market', openCost: 4e5, paybackMonths: 80, cycleSeconds: 10, openClass: 3 },
  { id: 'restaurant', name: 'Restaurant', openCost: 8e5, paybackMonths: 110, cycleSeconds: 10, openClass: 3 },
  { id: 'beauty-salon', name: 'Beauty Salon', openCost: 1.5e6, paybackMonths: 140, cycleSeconds: 11, openClass: 3 },
  { id: 'real-estate-office', name: 'Real Estate Office', openCost: 3e6, paybackMonths: 170, cycleSeconds: 11, openClass: 4 },
  { id: 'logistics-warehouse', name: 'Logistics Warehouse', openCost: 1e7, paybackMonths: 150, cycleSeconds: 12, openClass: 4 },
  { id: 'construction', name: 'Construction Company', openCost: 2.5e7, paybackMonths: 180, cycleSeconds: 12, openClass: 4 },
  { id: 'factory', name: 'Factory', openCost: 6e7, paybackMonths: 210, cycleSeconds: 13, openClass: 4 },
  { id: 'hotel', name: 'Hotel Chain', openCost: 1.5e8, paybackMonths: 250, cycleSeconds: 14, openClass: 5 },
  { id: 'media', name: 'Media Company', openCost: 4e8, paybackMonths: 300, cycleSeconds: 14, openClass: 5 },
  { id: 'tech-startup', name: 'Tech Startup', openCost: 1e9, paybackMonths: 360, cycleSeconds: 15, openClass: 5 },
];

/** The Flower Stand has its own designed table (economy-rebuild §3.2); the others follow its shape for now. */
const FLOWER_STAND_LEVELS: BusinessLevelDef[] = [
  { cost: 1000, revenue: 25, stage: 0 },
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

/** Old Ray, the first manager: a little dearer than the rule so he comes after the first few minutes of running the stand by hand. */
const FLOWER_STAND_MANAGER = 5000;

export const BUSINESSES: BusinessDef[] = LINES.map(({ openCost, paybackMonths, openClass, ...line }) => {
  const levels = line.id === 'flower-stand' ? FLOWER_STAND_LEVELS : ladder(openCost, openCost / paybackMonths, line.cycleSeconds);
  return {
    ...line,
    image: ART_PENDING.has(line.id) ? PENDING_IMAGE : `${ART}/${line.id}.webp`,
    stageImages: stageImages(line.id),
    levels,
    branchCost: roundNice(levels.reduce((sum, level) => sum + level.cost, 0)),
    branchCostGrowth: BRANCH_COST_GROWTH,
    managerCost: line.id === 'flower-stand' ? FLOWER_STAND_MANAGER : roundNice(openCost * MANAGER_COST_MULTIPLE),
    requires: openClass > 0 ? [{ type: 'class', index: openClass }] : [],
  };
});

import type { BusinessDef } from '../types';

// Generation-1 business line (AdVenture Capitalist style generators).
// Values are generated from a few tuning knobs so the whole curve moves together.
// Change knobs here, then run `npm run sim` to check pacing (docs/game-design-v2.md §5).
export const BUSINESS_TUNING = {
  /** The price the tier ladder is built from: each tier's first unit is `costStep` times the one before. */
  ladderBase: 250,
  /** Manager price as a multiple of the tier's first unit price. */
  managerCostMultiple: 12,
};

/**
 * The Flower Stand is cheaper than its place on the ladder and so is its manager (decided 2026-10-13,
 * after the first phone test): at $250 and $3K there was nothing to buy between the second job and
 * the stand, and the first manager took 19 minutes. The other tiers keep their ladder prices.
 */
const FIRST_STAND = { cost: 120, managerCost: 1000 };

/**
 * The Billionaire ceremony brings Mr. Bryce to work for the hero (story-v2 §4): the first Hotel Chain
 * and its manager come free with the class, like the van and the first home (decided 2026-10-13).
 * A first hotel adds next to nothing to a Billionaire's income, so nobody met him otherwise.
 */
export const CLASS_MANAGER_GIFT = { classIndex: 5, businessId: 'hotel' };

// Each tier's first unit costs `costStep` times the previous one (2026-10-09). Small steps early, so
// the first businesses come quickly; bigger steps later, so new businesses keep arriving across the
// days instead of all on the first one. Cycles are short and readable (1–15 s); they only change how
// often a run pays, not income per second.
//
// paybackMinutes (how long the first unit takes to repay its price, before any bonus) sets each
// tier's income and so the single-life pacing (game-design-v2 §5). Tuned with `npm run sim`.
// The last two were 32000 and 300000 until 2026-10-13: a first hotel added a thousandth to a
// Billionaire's income and the bot never bought either in a first life. At 6000 and 5000 hotels sell
// from day 6 and the startup from day 14, with every pacing target where it was.
const TIERS: {
  id: string;
  name: string;
  image: string;
  costStep: number;
  cycleSeconds: number;
  costGrowth: number;
  paybackMinutes: number;
}[] = [
  { id: 'flower-stand', name: 'Flower Stand', image: '/assets/businesses/v2/flower-stand.webp', costStep: 1, cycleSeconds: 1, costGrowth: 1.2, paybackMinutes: 2 },
  { id: 'coffee-cart', name: 'Coffee Cart', image: '/assets/businesses/v2/coffee-cart.webp', costStep: 3, cycleSeconds: 2, costGrowth: 1.2, paybackMinutes: 6 },
  { id: 'bakery', name: 'Bakery', image: '/assets/businesses/v2/bakery.webp', costStep: 4, cycleSeconds: 3, costGrowth: 1.18, paybackMinutes: 15 },
  { id: 'car-wash', name: 'Car Wash', image: '/assets/businesses/v2/car-wash.webp', costStep: 5, cycleSeconds: 4, costGrowth: 1.17, paybackMinutes: 30 },
  { id: 'mini-market', name: 'Mini Market', image: '/assets/businesses/v2/mini-market.webp', costStep: 6, cycleSeconds: 5, costGrowth: 1.16, paybackMinutes: 90 },
  { id: 'beauty-salon', name: 'Beauty Salon', image: '/assets/businesses/v2/beauty-salon.webp', costStep: 8, cycleSeconds: 7, costGrowth: 1.15, paybackMinutes: 150 },
  { id: 'logistics-warehouse', name: 'Logistics Warehouse', image: '/assets/businesses/v2/logistics-warehouse.webp', costStep: 10, cycleSeconds: 9, costGrowth: 1.14, paybackMinutes: 750 },
  { id: 'factory', name: 'Factory', image: '/assets/businesses/v2/factory.webp', costStep: 12, cycleSeconds: 11, costGrowth: 1.13, paybackMinutes: 4500 },
  { id: 'hotel', name: 'Hotel Chain', image: '/assets/businesses/v2/hotel.webp', costStep: 15, cycleSeconds: 13, costGrowth: 1.12, paybackMinutes: 6000 },
  { id: 'tech-startup', name: 'Tech Startup', image: '/assets/businesses/v2/tech-startup.webp', costStep: 20, cycleSeconds: 15, costGrowth: 1.12, paybackMinutes: 5000 },
];

/** Rounds to 3 significant digits so generated prices read like designed ones. */
export function roundNice(value: number) {
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2);
  return Math.round(value / magnitude) * magnitude;
}

let tierCost = BUSINESS_TUNING.ladderBase;

export const BUSINESSES: BusinessDef[] = TIERS.map(({ paybackMinutes, costStep, ...tier }, index) => {
  const t = BUSINESS_TUNING;
  tierCost *= costStep;
  const baseCost = index === 0 ? FIRST_STAND.cost : roundNice(tierCost);
  return {
    ...tier,
    baseCost,
    baseRevenue: roundNice((baseCost * tier.cycleSeconds) / (paybackMinutes * 60)),
    managerCost: index === 0 ? FIRST_STAND.managerCost : roundNice(baseCost * t.managerCostMultiple),
  };
});

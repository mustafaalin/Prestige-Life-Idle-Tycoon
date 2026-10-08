import type { BusinessDef } from '../types';

// Generation-1 business line (AdVenture Capitalist style generators).
// Values are generated from a few tuning knobs so the whole curve moves together.
// Change knobs here, then run `npm run sim` to check pacing (docs/game-design-v2.md §5).
export const BUSINESS_TUNING = {
  /** Price of the first Flower Stand ($25 with a 4 s cycle: every run pays at least $1). */
  firstCost: 25,
  /** Each tier's first unit costs this many times the previous tier's. */
  costStep: 15,
  /** Cycle seconds of tier 1; doubles every tier. */
  firstCycleSeconds: 4,
  /** First-unit payback of tier 1 before revenueFactor (the Flower Stand's ×2.7 makes it 100 s). */
  firstPaybackSeconds: 270,
  /** First-unit payback grows by this factor every tier. */
  paybackStep: 3.3,
  /** Manager price as a multiple of the tier's first unit price. */
  managerCostMultiple: 12,
};

// revenueFactor shapes the single-life pacing (game-design-v2 §5): the first two tiers are faster so
// businesses beat bottles and jobs from the first minutes (2026-10-08: a Flower Stand run paid $0.01);
// the middle tiers are slower so Billionaire is not reached minutes after Millionaire; the late
// tiers are faster so the hero reaches the top in mid-life instead of old age.
const TIERS: { id: string; name: string; image: string; costGrowth: number; revenueFactor?: number }[] = [
  { id: 'flower-stand', name: 'Flower Stand', image: '/assets/businesses/small/flower-shop.png', costGrowth: 1.15, revenueFactor: 2.7 },
  { id: 'coffee-cart', name: 'Coffee Cart', image: '/assets/businesses/small/coffee-shop.png', costGrowth: 1.15, revenueFactor: 1.2 },
  { id: 'bakery', name: 'Bakery', image: '/assets/businesses/small/bakery.png', costGrowth: 1.14 },
  { id: 'car-wash', name: 'Car Wash', image: '/assets/businesses/small/car-wash.png', costGrowth: 1.13 },
  { id: 'mini-market', name: 'Mini Market', image: '/assets/businesses/small/grocery-mini-market.png', costGrowth: 1.12, revenueFactor: 0.7 },
  { id: 'beauty-salon', name: 'Beauty Salon', image: '/assets/businesses/small/beauty-salon.png', costGrowth: 1.11, revenueFactor: 0.6 },
  { id: 'logistics-warehouse', name: 'Logistics Warehouse', image: '/assets/businesses/large/logistic-warehouse.png', costGrowth: 1.1, revenueFactor: 2 },
  { id: 'factory', name: 'Factory', image: '/assets/businesses/large/manufacturing-factory.png', costGrowth: 1.09, revenueFactor: 2.5 },
  { id: 'hotel', name: 'Hotel Chain', image: '/assets/businesses/large/hotel.png', costGrowth: 1.09, revenueFactor: 2.5 },
  { id: 'tech-startup', name: 'Tech Startup', image: '/assets/businesses/large/tech-startup.png', costGrowth: 1.09, revenueFactor: 2.5 },
];

/** Rounds to 3 significant digits so generated prices read like designed ones. */
export function roundNice(value: number) {
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2);
  return Math.round(value / magnitude) * magnitude;
}

export const BUSINESSES: BusinessDef[] = TIERS.map(({ revenueFactor = 1, ...tier }, index) => {
  const t = BUSINESS_TUNING;
  const baseCost = roundNice(t.firstCost * t.costStep ** index);
  const cycleSeconds = t.firstCycleSeconds * 2 ** index;
  const payback = t.firstPaybackSeconds * t.paybackStep ** index;
  return {
    ...tier,
    baseCost,
    cycleSeconds,
    baseRevenue: roundNice(((baseCost * cycleSeconds) / payback) * revenueFactor),
    managerCost: roundNice(baseCost * t.managerCostMultiple),
  };
});

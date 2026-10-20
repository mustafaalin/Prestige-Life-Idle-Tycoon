// Family heirlooms (plan 2.2, decided 2026-10-15; game-design-v2.md §4.10). Legacy points are no longer
// an automatic +1% each: they are spent here on lasting family heirlooms that every later heir keeps.
// Each heirloom has levels with prices growing ×1.5 a level and a cap that rises a little each generation, so how
// fast an heir climbs stays in hand (the second life should take about a third of the first; the
// watch alone is at most ×2 there). Rules: core/state.ts buyHeirloom, core/formulas.ts. Checked by
// `npm run sim`.

export type HeirloomId = 'watch' | 'jam' | 'notebook' | 'collar' | 'album';

export interface HeirloomDef {
  id: HeirloomId;
  /** Price of level 1; every next level costs HEIRLOOM_PRICE_GROWTH times the one before. */
  firstCost: number;
  /** Levels the first heir (generation 2) can buy; each later generation adds `capGrowth`. */
  firstCap: number;
  capGrowth: number;
  /** Levels there are at all. */
  maxLevel: number;
  /** What one level does (its meaning is the heirloom's: see the effects below). */
  perLevel: number;
  /** Not for sale yet: what it improves has not come to the heirs (levels already bought are kept). */
  comingSoon?: boolean;
}

export const HEIRLOOMS: HeirloomDef[] = [
  // Grandfather Mehmet's watch: all income, +30% a level (×2.5 at the first heir's cap: their climb
  // takes ~4 h of play instead of 9, simulator 2026-10-15).
  { id: 'watch', firstCost: 50, firstCap: 5, capGrowth: 1, maxLevel: 10, perLevel: 0.3 },
  // Mom's plum jam: the heir starts with cash (×10 a level: $1K, $10K, $100K...).
  { id: 'jam', firstCost: 150, firstCap: 3, capGrowth: 1, maxLevel: 6, perLevel: 10 },
  // Old Ray's notebook: managers cost 10% less a level.
  { id: 'notebook', firstCost: 150, firstCap: 3, capGrowth: 1, maxLevel: 5, perLevel: 0.1 },
  // Şans's collar, passed to his pup: his finds pay 25% more a level.
  { id: 'collar', firstCost: 150, firstCap: 3, capGrowth: 1, maxLevel: 6, perLevel: 0.25 },
  // The family album: the gifts that close ceremonies and life moments are 25% bigger a level. Heirs
  // have no ceremonies until the second generation's story comes, so it waits until then.
  { id: 'album', firstCost: 150, firstCap: 3, capGrowth: 1, maxLevel: 6, perLevel: 0.25, comingSoon: true },
];

/**
 * Each level costs this many times the one before (2026-10-16; was ×2). With ×2 the effects (added
 * per level) fell behind the prices and later generations stopped speeding up (discussion-notes.md §3.5).
 */
export const HEIRLOOM_PRICE_GROWTH = 1.5;

/** The heir's starting cash at jam level 1 ($1K); each level ×10. */
export const JAM_FIRST_CASH = 1_000;
/** Managers never get cheaper than this share of their price. */
export const NOTEBOOK_MIN_SHARE = 0.5;

export function heirloomDef(id: string): HeirloomDef | undefined {
  return HEIRLOOMS.find((def) => def.id === id);
}

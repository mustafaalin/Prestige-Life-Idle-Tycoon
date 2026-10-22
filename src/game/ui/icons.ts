// The shared raster icons (docs/design-art-production-plan.md §3), in one place so a screen never
// spells a path. Small functional marks (arrows, close, lock, check) stay vector (lucide).

const DIR = '/assets/icons/v2';

/**
 * The money series (2026-10-22, art/pilot/15-iap/v2/money-N.png), smallest first: a banknote, a
 * bundle, three bundles, a pyramid, a briefcase, a vault. Index 0 is M1. A bigger reward gets a
 * bigger one (ui/piles.ts).
 */
export const MONEY = [1, 2, 3, 4, 5, 6].map((tier) => `${DIR}/money-${tier}.webp`);

export const ICONS = {
  business: `${DIR}/business.webp`,
  career: `${DIR}/career.webp`,
  shop: `${DIR}/shop.webp`,
  /** The balance in the top bar (money series M3, three bundles, 2026-10-22); the money flies into it. */
  money: `${DIR}/money-3.webp`,
  /** One coin. */
  coin: `${DIR}/coin.webp`,
  /**
   * One bundle with its gold band (money series M2, 2026-10-22, user: not the loose note), for every
   * flight into the balance and out of it and the businesses' "+$5" bubbles.
   */
  bill: `${DIR}/money-2.webp`,
  /** Status: the wealth class and the status bonus. */
  status: `${DIR}/prestige-points.webp`,
  /** The family album: the story moments seen so far. */
  album: `${DIR}/family-album.webp`,
  retirement: `${DIR}/retirement.webp`,
  /** The shop's four sections; `luxury` is a section mark, not a currency. */
  home: `${DIR}/home.webp`,
  vehicle: `${DIR}/vehicle.webp`,
  outfit: `${DIR}/outfit.webp`,
  luxury: `${DIR}/luxury.webp`,
  /** Old Ray's deals (the investment account): a savings pot with a rising arrow. */
  invest: `${DIR}/invest.webp`,
  /** A rewarded video (a red play button, 2026-10-22): on every "watch an ad" button. */
  adReward: `${DIR}/ad-reward.webp`,
  /**
   * The same play button crossed out in a gold ring (the Comfort Pack's picture): on the offers the
   * pack pays at once, so the player sees the pack at work (2026-10-22, user).
   */
  adFree: '/assets/iap/v2/no-ads.webp',
  /** Old Ray's guide and a goal's "Go" point with this gloved hand (2026-10-23, GPT, docs/art-prompts-v2.md §0b K1). */
  hand: `${DIR}/ui-hand.webp`,
  /** Family legacy points; never the status star. */
  legacy: `${DIR}/legacy-points.webp`,
  /** The family heirlooms (the album's is `album`). */
  heirloomWatch: `${DIR}/heirloom-watch.webp`,
  heirloomJam: `${DIR}/heirloom-jam.webp`,
  heirloomNotebook: `${DIR}/heirloom-notebook.webp`,
  heirloomCollar: `${DIR}/heirloom-collar.webp`,
};

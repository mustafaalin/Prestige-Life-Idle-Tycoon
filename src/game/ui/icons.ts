// The shared raster icons (docs/design-art-production-plan.md §3), in one place so a screen never
// spells a path. Small functional marks (arrows, close, lock, check) stay vector (lucide).

const DIR = '/assets/icons/v2';

export const ICONS = {
  business: `${DIR}/business.webp`,
  career: `${DIR}/career.webp`,
  shop: `${DIR}/shop.webp`,
  /** The balance in the top bar; coins fly into it. */
  money: `${DIR}/money.webp`,
  /** One coin. */
  coin: `${DIR}/coin.webp`,
  /** Green banknotes, for every flight into the balance and out of it (2026-10-21, user: notes, not coins). */
  bill: `${DIR}/bill.webp`,
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
  /** A rewarded video: on every "watch an ad" button. */
  adReward: `${DIR}/ad-reward.webp`,
  /** Family legacy points; never the status star. */
  legacy: `${DIR}/legacy-points.webp`,
  /** The family heirlooms (the album's is `album`). */
  heirloomWatch: `${DIR}/heirloom-watch.webp`,
  heirloomJam: `${DIR}/heirloom-jam.webp`,
  heirloomNotebook: `${DIR}/heirloom-notebook.webp`,
  heirloomCollar: `${DIR}/heirloom-collar.webp`,
};

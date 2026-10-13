// The shared raster icons (docs/design-art-production-plan.md §3), in one place so a screen never
// spells a path. Small functional marks (arrows, close, lock, check) stay vector (lucide).

const DIR = '/assets/icons/v2';

export const ICONS = {
  business: `${DIR}/business.webp`,
  career: `${DIR}/career.webp`,
  shop: `${DIR}/shop.webp`,
  /** The balance in the top bar; coins fly into it. */
  money: `${DIR}/money.webp`,
  /** One coin, for the flight into the balance. */
  coin: `${DIR}/coin.webp`,
  /** Status: the wealth class and the status bonus. */
  status: `${DIR}/prestige-points.webp`,
};

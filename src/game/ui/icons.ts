// The shared raster icons (docs/design-art-production-plan.md §3), in one place so a screen never
// spells a path. Only the small functional marks (close, arrows, the empty ring) stay vector (lucide).

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
  /** The "Me" tab and the three skills (2026-10-25, GPT, docs/art-prompts-v2.md §0d). */
  self: `${DIR}/skills.webp`,
  skillStrength: `${DIR}/skill-strength.webp`,
  skillSmarts: `${DIR}/skill-smarts.webp`,
  skillCharisma: `${DIR}/skill-charisma.webp`,
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

/**
 * Our own interface icons (2026-10-23, GPT, docs/art-prompts-v2.md §0b), in place of the default line
 * icons: drawn through UiIcon (ui/UiIcon.tsx), at 16 px or more so they stay readable.
 */
export const UI_ICONS = {
  lock: `${DIR}/ui-lock.webp`,
  check: `${DIR}/ui-check.webp`,
  run: `${DIR}/ui-run.webp`,
  upgrade: `${DIR}/ui-upgrade.webp`,
  branch: `${DIR}/ui-branch.webp`,
  timer: `${DIR}/ui-timer.webp`,
  gift: `${DIR}/ui-gift.webp`,
  call: `${DIR}/ui-call.webp`,
  heart: `${DIR}/ui-heart.webp`,
  course: `${DIR}/ui-course.webp`,
  key: `${DIR}/ui-key.webp`,
  job: `${DIR}/ui-job.webp`,
  home: `${DIR}/ui-home.webp`,
  outfit: `${DIR}/ui-outfit.webp`,
  car: `${DIR}/ui-car.webp`,
  trophy: `${DIR}/ui-trophy.webp`,
  newspaper: `${DIR}/ui-newspaper.webp`,
  sound: `${DIR}/ui-sound.webp`,
  music: `${DIR}/ui-music.webp`,
  bell: `${DIR}/ui-bell.webp`,
  privacy: `${DIR}/ui-privacy.webp`,
  restore: `${DIR}/ui-restore.webp`,
  copy: `${DIR}/ui-copy.webp`,
};

import type { HouseDef } from '../types';

// Homes: rent → buy → rent out (docs/game-design-v2.md §4.8). You always live in exactly one house,
// and the home scene shows it (with your best vehicle parked out front). Twelve homes, each its own
// place on screen (decided 2026-10-10; there were 25, many of them looking alike).
// Renting costs a one-time move-in fee and no recurring rent, so net income never goes negative.
// The house you live in gives a bonus by its tier; owned houses you moved out of pay rent.

interface HomeSpec {
  name: string;
  /** Scene background, also the shop card. Art list: docs/art-brief-v2.md. */
  image: string;
  moveInCost: number;
}

const SCENE = '/assets/scene';
// v1 backgrounds stand in until the new art comes (art-brief §4.2).
const V1 = '/assets/houses/backgrounds';

const HOMES: HomeSpec[] = [
  { name: 'Street Tent', image: `${SCENE}/alley.webp`, moveInCost: 0 },
  { name: 'Old Van', image: `${SCENE}/van.webp`, moveInCost: 1_200 },
  { name: 'Rented Room', image: `${V1}/house-6.webp`, moveInCost: 2_500 },
  { name: 'Old Rental Flat', image: `${SCENE}/flat.webp`, moveInCost: 9_000 },
  { name: 'Newer Rental Flat', image: `${V1}/house-7.webp`, moveInCost: 40_000 },
  { name: 'Flat in a Gated Complex', image: `${V1}/house-9.webp`, moveInCost: 240_000 },
  { name: 'First Home of Your Own', image: `${V1}/house-10.webp`, moveInCost: 650_000 },
  { name: 'Suburban House with a Garden', image: `${V1}/house-11.webp`, moveInCost: 2.5e6 },
  { name: 'Villa', image: `${V1}/house-12.webp`, moveInCost: 2e7 },
  { name: 'Lakeside Glass House', image: `${V1}/house-13.webp`, moveInCost: 2e8 },
  { name: 'Beachfront Estate', image: `${V1}/house-19.webp`, moveInCost: 2e9 },
  { name: 'Grand Mansion', image: `${V1}/house-24.webp`, moveInCost: 2e10 },
];

/** Houses 1..RENT_ONLY_COUNT (street to the flat in the complex) can only be rented. */
export const RENT_ONLY_COUNT = 6;

/** Buy price = move-in fee × this (the move-in fee is ~4% of the price). */
export const BUY_PRICE_PER_MOVE_IN = 25;

/** Living in house n gives +(n − 1) × this to all income. */
export const HOME_BONUS_PER_TIER = 0.08;

/**
 * Rent payback (buy price / base rent) grows with price like business paybacks do:
 * hours = RENT_PAYBACK_HOURS_AT_1M × (price / $1M) ^ RENT_PAYBACK_EXPONENT. Tuned with `npm run sim`
 * so rent is a side income, never the main one.
 */
export const RENT_PAYBACK_HOURS_AT_1M = 12;
export const RENT_PAYBACK_EXPONENT = 0.44;

export function rentPaybackSeconds(buyCost: number) {
  return RENT_PAYBACK_HOURS_AT_1M * 3600 * (buyCost / 1e6) ** RENT_PAYBACK_EXPONENT;
}

export const HOUSES: HouseDef[] = HOMES.map((home, index) => {
  const buyCost = index < RENT_ONLY_COUNT ? null : home.moveInCost * BUY_PRICE_PER_MOVE_IN;
  return {
    id: `home-${index + 1}`,
    name: home.name,
    image: home.image,
    moveInCost: home.moveInCost,
    buyCost,
    homeBonus: index * HOME_BONUS_PER_TIER,
    rentPerSecond: buyCost === null ? 0 : buyCost / rentPaybackSeconds(buyCost),
  };
});

/** Every new life starts in the tent. */
export const STARTING_HOME_ID = HOUSES[0].id;

/**
 * The home each class's story stands in (index = wealth class, value = house index). A class-up
 * moves a hero who is still below it there, rented and free: the Day Laborer ceremony gives Old Ray's
 * van, the Working Class one the flat whose door locks (story-v2 §4). A hero who already moved
 * further stays where they are.
 */
export const CLASS_HOME_FLOOR = [0, 1, 3, 5, 6, 8, 9, 10];

/**
 * Saves from before 2026-10-10 had 25 houses (`house-1`…`house-25`); each maps to the new home
 * closest in kind and price, never lower.
 */
export const LEGACY_HOUSE_TO_HOME: Record<string, string> = Object.fromEntries(
  [1, 2, 2, 2, 4, 4, 5, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12].map((home, index) => [
    `house-${index + 1}`,
    `home-${home}`,
  ]),
);

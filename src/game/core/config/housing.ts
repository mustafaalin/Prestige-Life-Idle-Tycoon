import type { HouseDef } from '../types';
import { SECONDS_PER_MONTH } from './life';

// Homes: rent → buy → rent out (docs/game-design-v2.md §4.6). You always live in exactly one house,
// and the home scene shows it (with your best vehicle parked out front). Twelve homes, each its own
// place on screen (decided 2026-10-10; there were 25, many of them looking alike).
// Renting costs a one-time move-in fee and no recurring rent, so net income never goes negative.
// Prices are real ones (2026-10-21, docs/game-design-v2.md §4.6): buying costs 25 move-in fees, from a
// $300K first home to an $80M mansion. Homes give no income bonus any more; owned houses you moved
// out of pay rent. You only ever move up: each home has its own vehicles parked out front.

interface HomeSpec {
  name: string;
  /** Scene background, also the shop card. Art list: docs/art-brief-v2.md. */
  image: string;
  moveInCost: number;
}

const SCENE = '/assets/scene';

const HOMES: HomeSpec[] = [
  { name: 'Street Tent', image: `${SCENE}/alley.webp`, moveInCost: 0 },
  { name: 'Old Van', image: `${SCENE}/home-2.webp`, moveInCost: 500 },
  { name: 'Rented Room', image: `${SCENE}/home-3.webp`, moveInCost: 800 },
  { name: 'Old Rental Flat', image: `${SCENE}/home-4.webp`, moveInCost: 1_500 },
  { name: 'Newer Rental Flat', image: `${SCENE}/home-5.webp`, moveInCost: 3_000 },
  { name: 'Flat in a Gated Complex', image: `${SCENE}/home-6.webp`, moveInCost: 6_000 },
  { name: 'First Home of Your Own', image: `${SCENE}/home-7.webp`, moveInCost: 12_000 },
  { name: 'Suburban House with a Garden', image: `${SCENE}/home-8.webp`, moveInCost: 32_000 },
  { name: 'Villa', image: `${SCENE}/home-9.webp`, moveInCost: 120_000 },
  { name: 'Lakeside Glass House', image: `${SCENE}/home-10.webp`, moveInCost: 320_000 },
  { name: 'Beachfront Estate', image: `${SCENE}/home-11.webp`, moveInCost: 1e6 },
  { name: 'Grand Mansion', image: `${SCENE}/home-12.webp`, moveInCost: 3.2e6 },
];

/** Houses 1..RENT_ONLY_COUNT (street to the flat in the complex) can only be rented. */
export const RENT_ONLY_COUNT = 6;

/** Buy price = move-in fee × this (the move-in fee is ~4% of the price). */
export const BUY_PRICE_PER_MOVE_IN = 25;

/** Living in house n gives +(n − 1) × this to all income: none since the economy rebuild (2026-10-20). */
export const HOME_BONUS_PER_TIER = 0;

/** Living in a house you own adds this on top (none since 2026-10-20). */
export const OWNER_HOME_BONUS = 0;

/**
 * A house you own and moved out of rents for what real houses do (2026-10-21): it repays its price in
 * this many game months (~0.5% of the price a month).
 */
export const RENT_PAYBACK_MONTHS = 200;

export function rentPaybackSeconds() {
  return RENT_PAYBACK_MONTHS * SECONDS_PER_MONTH;
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
    rentPerSecond: buyCost === null ? 0 : buyCost / rentPaybackSeconds(),
  };
});

/** Every new life starts in the tent. */
export const STARTING_HOME_ID = HOUSES[0].id;

/**
 * The Millionaire ceremony ("this time I bought myself a home") makes the home it moves the hero to his
 * own (core/state.ts applyClassUp). Every other class-up moves him one home up, rented and free.
 */
export const FIRST_OWNED_HOME_CLASS = 4;

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

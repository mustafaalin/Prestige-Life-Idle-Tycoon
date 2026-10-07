import type { HouseDef } from '../types';

// Homes: rent → buy → rent out (docs/game-design-v2.md §4.8). You always live in exactly one house.
// Renting costs a one-time move-in fee and no recurring rent, so net income never goes negative.
// The house you live in gives a bonus by its tier; owned houses you moved out of pay rent.

const HOUSE_NAMES = [
  'Street Tent', 'Makeshift Shack', 'Shelter Entrance', 'Old Van Sleep Spot', 'Old Rental Apartment',
  'Basement Rental', 'Newer Rental Apartment', 'Modern Rental Apartment', 'Gated Community Block',
  'First Owned Small Detached House', 'Owned Suburban House', 'Luxury Villa', 'Lakeside Glass Cabin',
  'Tropical Jungle Villa', 'Modern Glass Mansion', 'Mountain Chalet Resort', 'Penthouse Entrance Terrace',
  'Downtown Penthouse Terrace', 'Beachfront Estate', 'Countryside Estate', 'Desert Modern Villa',
  'Countryside Grand Estate', 'Futuristic Smart Home', 'Ultra Luxury Mansion', 'European Castle Estate',
];

/** Move-in fee of house 2; each next house costs MOVE_IN_GROWTH × more. House 1 (the tent) is free. */
export const FIRST_MOVE_IN_COST = 200;
export const MOVE_IN_GROWTH = 2.75;

/** Houses 1..RENT_ONLY_COUNT (street to rental flats) can only be rented. */
export const RENT_ONLY_COUNT = 9;

/** Buy price = move-in fee × this (the move-in fee is ~4% of the price). */
export const BUY_PRICE_PER_MOVE_IN = 25;

/** Living in house n gives +(n − 1) × this to all income. */
export const HOME_BONUS_PER_TIER = 0.05;

/**
 * Rent payback (buy price / base rent) grows with price like business paybacks do:
 * hours = RENT_PAYBACK_HOURS_AT_1M × (price / $1M) ^ RENT_PAYBACK_EXPONENT. Tuned with `npm run sim`
 * so rent is a side income (median ~8% of income, up to ~25% late in a generation), never the main one.
 */
export const RENT_PAYBACK_HOURS_AT_1M = 1;
export const RENT_PAYBACK_EXPONENT = 0.44;

export function rentPaybackSeconds(buyCost: number) {
  return RENT_PAYBACK_HOURS_AT_1M * 3600 * (buyCost / 1e6) ** RENT_PAYBACK_EXPONENT;
}

export const HOUSES: HouseDef[] = HOUSE_NAMES.map((name, index) => {
  const moveInCost = index === 0 ? 0 : Math.round(FIRST_MOVE_IN_COST * MOVE_IN_GROWTH ** (index - 1));
  const buyCost = index < RENT_ONLY_COUNT ? null : moveInCost * BUY_PRICE_PER_MOVE_IN;
  return {
    id: `house-${index + 1}`,
    name,
    image: `/assets/houses/backgrounds/house-${index + 1}.webp`,
    moveInCost,
    buyCost,
    homeBonus: index * HOME_BONUS_PER_TIER,
    rentPerSecond: buyCost === null ? 0 : buyCost / rentPaybackSeconds(buyCost),
  };
});

/** Every new life starts in the tent. */
export const STARTING_HOME_ID = HOUSES[0].id;

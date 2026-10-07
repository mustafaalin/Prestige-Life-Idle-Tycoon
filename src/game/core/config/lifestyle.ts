import type { LifestyleDef, LifestyleKind } from '../types';

// Status items: vehicles, outfits and luxury toys (homes live in housing.ts). They are never an expense;
// each one adds a permanent (per generation) income bonus, so shopping makes you stronger.
// Prices are geometric so every next dream sits a few minutes to a few hours of income away.

const VEHICLE_NAMES = [
  'Wheelbarrow', 'City Bike', 'Electric Scooter', 'Moped', 'Used Microcar', 'Old Hatchback', 'Old Sedan',
  'Modern Hatchback', 'Sedan', 'Compact SUV', 'Electric Sedan', 'Luxury Sedan', 'Sport Coupe', 'Supercar',
  'Armored Luxury SUV', 'Premium Convertible',
];

const TOYS: { name: string; vehicleImage: number; cost: number }[] = [
  { name: 'Speedboat', vehicleImage: 17, cost: 5e9 },
  { name: 'Mega Yacht', vehicleImage: 18, cost: 5e10 },
  { name: 'Private Helicopter', vehicleImage: 19, cost: 2e11 },
  { name: 'Private Jet', vehicleImage: 20, cost: 1e12 },
];

const OUTFIT_NAMES = [
  'Bare Basics', 'Street Casual', 'Daily Grind', 'Summer Ease', 'Clean Start', 'Urban Comfort', 'Street Edge',
  'Smart Casual', 'Easy Boss', 'Laid Back Chic', 'Low Key Sharp', 'Off Duty', 'Rising Pro', 'The Coat',
  'All White', 'Sharp Suit', 'Power Move', 'Black Tie', 'Icon', 'Elite',
];

function geometric(
  kind: LifestyleKind,
  names: string[],
  image: (index: number) => string,
  firstCost: number,
  growth: number,
  statusBonus: number
): LifestyleDef[] {
  // Index 0 is the free starting item (wheelbarrow, bare basics).
  return names.map((name, index) => ({
    id: `${kind}-${index + 1}`,
    kind,
    name,
    image: image(index + 1),
    cost: index === 0 ? 0 : Math.round(firstCost * growth ** (index - 1)),
    statusBonus: index === 0 ? 0 : statusBonus,
  }));
}

export const VEHICLES = geometric('vehicle', VEHICLE_NAMES, (n) => `/assets/vehicles/vehicle-${n}.png`, 20, 3.3, 0.03);
export const OUTFITS = geometric('outfit', OUTFIT_NAMES, (n) => `/assets/outfits/ch-${n}-1.png`, 30, 3, 0.02);
export const LUXURY_TOYS: LifestyleDef[] = TOYS.map((toy, index) => ({
  id: `toy-${index + 1}`,
  kind: 'toy',
  name: toy.name,
  image: `/assets/vehicles/vehicle-${toy.vehicleImage}.png`,
  cost: toy.cost,
  statusBonus: 0.1,
}));

export const LIFESTYLE_ITEMS: LifestyleDef[] = [...VEHICLES, ...OUTFITS, ...LUXURY_TOYS];

/** Items every new life starts with. */
export const STARTING_LIFESTYLE_IDS = ['vehicle-1', 'outfit-1'];

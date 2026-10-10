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

// The hero's four story outfits (decided 2026-10-11; there were 20 that never showed on screen).
// The one you wear is the best you own; a class-up gives its outfit for free (CLASS_OUTFIT_FLOOR),
// buying ahead wears it early. Art: docs/art-brief-v2.md §4.1, scene poses in ui/scene/stages.ts.
const OUTFIT_SPECS: { id: string; name: string; image: string; cost: number }[] = [
  { id: 'outfit-hoodie', name: 'Hoodie', image: '/assets/scene/hero-street-idle.webp', cost: 0 },
  { id: 'outfit-work', name: 'Work Clothes', image: '/assets/scene/hero-work-idle.webp', cost: 6_000 },
  // v1 pictures stand in until the new art comes.
  { id: 'outfit-smart', name: 'Smart Casual', image: '/assets/outfits/ch-8-1.png', cost: 200_000 },
  { id: 'outfit-suit', name: 'Suit', image: '/assets/outfits/ch-16-1.png', cost: 1.5e7 },
];

/** Status bonus of each outfit after the free hoodie. */
const OUTFIT_STATUS_BONUS = 0.12;

/** The outfit each wealth class wears at least (index into OUTFITS: hoodie, work clothes, smart casual, suit). */
export const CLASS_OUTFIT_FLOOR = [0, 0, 1, 2, 2, 3, 3, 3];

/**
 * Saves from before 2026-10-11 had 20 outfits (`outfit-1`…`outfit-20`, bought in order); the best one
 * maps to the new outfit closest in price, never lower: from #7 work clothes, #11 smart casual, #15 suit.
 */
export function legacyOutfitIndex(oldNumber: number) {
  return oldNumber >= 15 ? 3 : oldNumber >= 11 ? 2 : oldNumber >= 7 ? 1 : 0;
}

function geometric(
  kind: LifestyleKind,
  names: string[],
  image: (index: number) => string,
  firstCost: number,
  growth: number,
  statusBonus: number
): LifestyleDef[] {
  // Index 0 is the free starting item (the wheelbarrow).
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
export const OUTFITS: LifestyleDef[] = OUTFIT_SPECS.map((outfit, index) => ({
  id: outfit.id,
  kind: 'outfit',
  name: outfit.name,
  image: outfit.image,
  cost: outfit.cost,
  statusBonus: index === 0 ? 0 : OUTFIT_STATUS_BONUS,
}));
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
export const STARTING_LIFESTYLE_IDS = ['vehicle-1', 'outfit-hoodie'];

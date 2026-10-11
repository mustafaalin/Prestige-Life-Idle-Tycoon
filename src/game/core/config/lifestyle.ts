import type { LifestyleDef } from '../types';

// Status items: vehicles, outfits and luxury toys (homes live in housing.ts). They are never an expense;
// each one adds a permanent (per generation) income bonus, so shopping makes you stronger.
// Each next dream sits a few minutes to a few hours of income away.

// Twelve vehicles, each step its own silhouette and color so it reads on a small screen (decided
// 2026-10-11; there were 16, starting with a free wheelbarrow). A new life starts without one.
// Art and prompts: docs/art-prompts-v2.md §2.
//
// Homes and vehicles climb together (game-design §4.4, decided 2026-10-11): `home` is the home a
// vehicle opens in (index into HOUSES), and the last vehicle of a home is needed to move on to the
// next one. So each home has the car you came with and the one you buy there parked out front, never
// a supercar by the tent. The tent opens two, every other home but the last opens one.
const V2 = '/assets/vehicles/v2';
// v1 pictures stand in until the new art comes.
const V1 = '/assets/vehicles';
const VEHICLE_SPECS: { id: string; name: string; image: string; cost: number; home: number }[] = [
  { id: 'vehicle-bike', name: 'City Bike', image: `${V2}/vehicle-1.webp`, cost: 20, home: 0 },
  { id: 'vehicle-scooter', name: 'Retro Scooter', image: `${V2}/vehicle-2.webp`, cost: 150, home: 0 },
  { id: 'vehicle-old-sedan', name: 'Old Family Sedan', image: `${V2}/vehicle-3.webp`, cost: 1_500, home: 1 },
  { id: 'vehicle-motorcycle', name: 'Motorcycle', image: `${V1}/vehicle-4.png`, cost: 5_000, home: 2 },
  { id: 'vehicle-hatchback', name: 'Modern Hatchback', image: `${V2}/vehicle-4.webp`, cost: 12_000, home: 3 },
  { id: 'vehicle-suv', name: 'Family SUV', image: `${V2}/vehicle-5.webp`, cost: 90_000, home: 4 },
  { id: 'vehicle-pickup', name: 'Pickup Truck', image: `${V1}/vehicle-10.png`, cost: 300_000, home: 5 },
  { id: 'vehicle-executive', name: 'Executive Sedan', image: `${V1}/vehicle-12.png`, cost: 700_000, home: 6 },
  { id: 'vehicle-coupe', name: 'Sports Coupe', image: `${V1}/vehicle-13.png`, cost: 4e6, home: 7 },
  { id: 'vehicle-offroader', name: 'Luxury Off-Roader', image: `${V1}/vehicle-15.png`, cost: 2.5e7, home: 8 },
  { id: 'vehicle-supercar', name: 'Supercar', image: `${V1}/vehicle-14.png`, cost: 1.5e8, home: 9 },
  { id: 'vehicle-grand', name: 'Grand Luxury Car', image: `${V1}/vehicle-16.png`, cost: 1e9, home: 10 },
];

/** Twelve vehicles add up to the same +45% the ten (at 4.5%) and the sixteen before them gave. */
const VEHICLE_STATUS_BONUS = 0.0375;

/**
 * Saves from before 2026-10-11 had 16 vehicles (`vehicle-1`…`vehicle-16`, bought in order, the first
 * free at +3% each after it). The best one maps to as many new vehicles as keep the bonus, never lower.
 */
export function legacyVehicleCount(oldNumber: number) {
  return oldNumber <= 1 ? 0 : Math.min(VEHICLE_SPECS.length, Math.ceil((oldNumber - 1) * 0.8));
}

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

export const VEHICLES: LifestyleDef[] = VEHICLE_SPECS.map((vehicle) => ({
  ...vehicle,
  kind: 'vehicle',
  statusBonus: VEHICLE_STATUS_BONUS,
}));
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
export const STARTING_LIFESTYLE_IDS = ['outfit-hoodie'];

import type { LifestyleDef } from '../types';
import { careerAsk } from './housing';

// Personal items: vehicles, outfits and luxury toys (homes live in housing.ts). They are never an
// expense. Since the economy rebuild (decided 2026-10-20, docs/game-design-v2.md §4.5) they cost what
// they cost in real life and give no income bonus: their worth is the life they show and, from plan
// Faz E4, what they open (jobs, events, places). Only Şans's collars still add to income.

// Twelve vehicles, each step its own silhouette and color so it reads on a small screen (decided
// 2026-10-11; there were 16, starting with a free wheelbarrow). A new life starts without one.
// Art and prompts: docs/archive/art-prompts-v2-gen1.md §2.
//
// Homes and vehicles climb together (game-design §4.6, decided 2026-10-11): `home` is the home a
// vehicle opens in (index into HOUSES), and the last vehicle of a home is needed to move on to the
// next one. So each home has the car you came with and the one you buy there parked out front, never
// a supercar by the tent. One home, one vehicle (2026-10-21, user: a class-up that skipped homes opened
// four vehicles at once): the bike by the tent, the scooter at the van, the grand car at the mansion.
const V2 = '/assets/vehicles/v2';
const VEHICLE_SPECS: { id: string; name: string; image: string; cost: number; home: number; jobRow: number }[] = [
  { id: 'vehicle-bike', name: 'City Bike', image: `${V2}/vehicle-1.webp`, cost: 150, home: 0, jobRow: 0 },
  { id: 'vehicle-scooter', name: 'Retro Scooter', image: `${V2}/vehicle-2.webp`, cost: 1_200, home: 1, jobRow: 1 },
  { id: 'vehicle-old-sedan', name: 'Old Family Sedan', image: `${V2}/vehicle-3.webp`, cost: 5_000, home: 2, jobRow: 2 },
  { id: 'vehicle-motorcycle', name: 'Motorcycle', image: `${V2}/vehicle-motorcycle.webp`, cost: 8_000, home: 3, jobRow: 3 },
  { id: 'vehicle-hatchback', name: 'Modern Hatchback', image: `${V2}/vehicle-4.webp`, cost: 18_000, home: 4, jobRow: 4 },
  { id: 'vehicle-suv', name: 'Family SUV', image: `${V2}/vehicle-5.webp`, cost: 40_000, home: 5, jobRow: 6 },
  { id: 'vehicle-pickup', name: 'Pickup Truck', image: `${V2}/vehicle-pickup.webp`, cost: 55_000, home: 6, jobRow: 7 },
  { id: 'vehicle-executive', name: 'Executive Sedan', image: `${V2}/vehicle-6.webp`, cost: 90_000, home: 7, jobRow: 7 },
  { id: 'vehicle-coupe', name: 'Sports Coupe', image: `${V2}/vehicle-7.webp`, cost: 180_000, home: 8, jobRow: 9 },
  { id: 'vehicle-offroader', name: 'Luxury Off-Roader', image: `${V2}/vehicle-8.webp`, cost: 250_000, home: 9, jobRow: 10 },
  { id: 'vehicle-supercar', name: 'Supercar', image: `${V2}/vehicle-9.webp`, cost: 500_000, home: 10, jobRow: 14 },
  { id: 'vehicle-grand', name: 'Grand Luxury Car', image: `${V2}/vehicle-10.webp`, cost: 1.5e6, home: 11, jobRow: 22 },
];

/** Items give no income bonus since the economy rebuild (2026-10-20); the field stays for the collars. */
const ITEM_STATUS_BONUS = 0;

/**
 * Saves from before 2026-10-11 had 16 vehicles (`vehicle-1`…`vehicle-16`, bought in order, the first
 * free at +3% each after it). The best one maps to as many new vehicles as keep the bonus, never lower.
 */
export function legacyVehicleCount(oldNumber: number) {
  return oldNumber <= 1 ? 0 : Math.min(VEHICLE_SPECS.length, Math.ceil((oldNumber - 1) * 0.8));
}

// Real prices (2026-10-21): bought in this order, so each costs more than the one before.
const TOYS: { name: string; image: string; cost: number }[] = [
  { name: 'Speedboat', image: `${V2}/luxury-speedboat.webp`, cost: 300_000 },
  { name: 'Mega Yacht', image: `${V2}/luxury-mega-yacht.webp`, cost: 1e7 },
  { name: 'Private Helicopter', image: `${V2}/luxury-private-helicopter.webp`, cost: 1.5e7 },
  { name: 'Private Jet', image: `${V2}/luxury-private-jet.webp`, cost: 6e7 },
];

// The hero's story outfits (decided 2026-10-11; there were 20 that never showed on screen). Seven since
// 2026-10-14: the coat (Millionaire), three-piece (Multibillionaire) and tuxedo (Richest) joined.
// The one you wear is the best you own; a class-up gives its outfit for free (CLASS_OUTFIT_FLOOR),
// buying ahead wears it early. Art: docs/art-brief-v2.md §4.1, scene poses in ui/scene/stages.ts.
// Money alone does not open an outfit (decided 2026-10-14): `minClass` is the wealth class it opens in,
// so a Working Class hero wears work clothes at most. Smart casual and the coat open with the class that
// gives them, so they are never bought; the suit and three-piece can be bought a class early. The tuxedo
// opens with Billionaire too (2026-10-23, npm run progresscheck): Multibillionaire rarely comes in the first life.
const OUTFIT_SPECS: { id: string; name: string; image: string; cost: number; minClass: number }[] = [
  { id: 'outfit-hoodie', name: 'Hoodie', image: '/assets/scene/hero-street-idle.webp', cost: 0, minClass: 0 },
  { id: 'outfit-work', name: 'Work Clothes', image: '/assets/scene/hero-work-idle.webp', cost: 60, minClass: 1 },
  { id: 'outfit-smart', name: 'Smart Casual', image: '/assets/scene/hero-smart-idle.webp', cost: 400, minClass: 3 },
  { id: 'outfit-coat', name: 'Camel Overcoat', image: '/assets/scene/hero-coat-idle.webp', cost: 1_500, minClass: 4 },
  { id: 'outfit-suit', name: 'Suit', image: '/assets/scene/hero-suit-idle.webp', cost: 3_000, minClass: 4 },
  { id: 'outfit-threepiece', name: 'Three-Piece Suit', image: '/assets/scene/hero-threepiece-idle.webp', cost: 8_000, minClass: 5 },
  { id: 'outfit-tux', name: 'Tuxedo', image: '/assets/scene/hero-tux-idle.webp', cost: 15_000, minClass: 5 },
];


/**
 * The outfit each wealth class wears at least (index into OUTFITS: hoodie, work clothes, smart casual,
 * coat, suit, three-piece, tuxedo).
 */
export const CLASS_OUTFIT_FLOOR = [0, 0, 1, 2, 3, 4, 5, 6];

/** Index of an outfit in OUTFITS by id. */
export const outfitIndex = (id: string) => OUTFIT_SPECS.findIndex((outfit) => outfit.id === id);

/**
 * Saves from before 2026-10-11 had 20 outfits (`outfit-1`…`outfit-20`, bought in order); the best one
 * maps to the new outfit closest in price, never lower: from #7 work clothes, #11 smart casual, #15 suit.
 */
export function legacyOutfitIndex(oldNumber: number) {
  return outfitIndex(oldNumber >= 15 ? 'outfit-suit' : oldNumber >= 11 ? 'outfit-smart' : oldNumber >= 7 ? 'outfit-work' : 'outfit-hoodie');
}

// A vehicle asks for a job row like a home does (housing.ts careerAsk).
export const VEHICLES: LifestyleDef[] = VEHICLE_SPECS.map(({ jobRow, ...vehicle }) => ({
  ...vehicle,
  kind: 'vehicle',
  statusBonus: ITEM_STATUS_BONUS,
  requires: careerAsk(jobRow),
}));
export const OUTFITS: LifestyleDef[] = OUTFIT_SPECS.map((outfit) => ({
  id: outfit.id,
  kind: 'outfit',
  name: outfit.name,
  image: outfit.image,
  cost: outfit.cost,
  minClass: outfit.minClass,
  statusBonus: ITEM_STATUS_BONUS,
}));
export const LUXURY_TOYS: LifestyleDef[] = TOYS.map((toy, index) => ({
  id: `toy-${index + 1}`,
  kind: 'toy',
  name: toy.name,
  image: toy.image,
  cost: toy.cost,
  statusBonus: ITEM_STATUS_BONUS,
}));

/**
 * Gear (2026-10-21): bought once at a real price, they open jobs (careers.ts) rather than show on the
 * scene.
 */
const GADGET_SPECS: { id: string; name: string; cost: number }[] = [
  { id: 'gadget-phone', name: 'Smartphone', cost: 300 },
  { id: 'gadget-toolbox', name: 'Toolbox', cost: 400 },
  { id: 'gadget-camera', name: 'Camera', cost: 900 },
  { id: 'gadget-laptop', name: 'Laptop', cost: 1_200 },
];

export const GADGETS: LifestyleDef[] = GADGET_SPECS.map((gadget) => ({
  ...gadget,
  kind: 'gadget',
  image: `/assets/items/v2/${gadget.id}.webp`,
  statusBonus: ITEM_STATUS_BONUS,
}));

export const LIFESTYLE_ITEMS: LifestyleDef[] = [...VEHICLES, ...OUTFITS, ...LUXURY_TOYS, ...GADGETS];

/** Items every new life starts with. */
export const STARTING_LIFESTYLE_IDS = ['outfit-hoodie'];

/**
 * Şans's collars (decided 2026-10-15, user): a class-up gives him a better one, and only the one he
 * wears counts, so the gold collar is +6%, not +12%. They are not bought and not saved: the class
 * reached decides (a new life starts him on the rope again). Their bonus is a status bonus, like a
 * vehicle's. The scene and the ceremony's collar card show them (ui/scene/stages.ts).
 */
export interface CollarDef {
  id: 'leather' | 'silver' | 'gold';
  /** The wealth class that gives it (index into WEALTH_CLASSES). */
  fromClass: number;
  statusBonus: number;
}

export const COLLARS: CollarDef[] = [
  { id: 'leather', fromClass: 3, statusBonus: 0.02 },
  { id: 'silver', fromClass: 4, statusBonus: 0.04 },
  { id: 'gold', fromClass: 5, statusBonus: 0.06 },
];

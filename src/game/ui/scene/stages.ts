import { HOUSES } from '../../core/config/housing';
import { VEHICLES } from '../../core/config/lifestyle';

// What the home scene shows (discussion-notes §7, decided 2026-10-10 and 2026-10-11):
// - the place is the home you live in (its picture is the house's image in config/housing.ts);
// - your best vehicle is parked out front;
// - the hero wears the best outfit you own (config/lifestyle.ts OUTFITS; a class-up gives its own);
// - what lies on the ground and Şans' collar follow the class, revealed by its ceremony.
// Art list and prompts: docs/art-brief-v2.md.
//
// A look only names the art that exists. Anything it leaves out is taken from the one before, so a
// look whose art is still being made keeps the previous one instead of a broken image.

export type Pose = 'idle' | 'collect' | 'joy' | 'pet';

export interface PoseArt {
  src: string;
  /** Height as a share of the background's height. */
  height: number;
  /** Width / height of the image file. */
  aspect: number;
  /** Center x of the image. */
  x: number;
  /** Mirrored, so Şans ends up on the hero's right like in the scene. */
  flip?: boolean;
}

export interface SpriteArt {
  src: string;
  x: number;
  /** Feet line, as a share of the background's height. */
  y: number;
  height: number;
  aspect: number;
}

export interface ItemArt {
  src: string;
  /** Width as a share of the background's width. */
  width: number;
}

/** The hero in one outfit. */
export type HeroLook = Record<Pose, PoseArt>;

export interface ClassLook {
  /** What lies on the ground to collect (bottles in the alley, money later). */
  items: ItemArt[];
  /** Şans sitting, and Şans with a found wallet (his collar changes with the class). */
  sans: SpriteArt;
  find: SpriteArt;
}

const DIR = '/assets/scene';

/** Index = outfit (OUTFITS order). Empty = art pending, the outfit before stands in. */
const HERO_ART: (HeroLook | null)[] = [
  // Hoodie.
  {
    idle: { src: `${DIR}/hero-street-idle.webp`, height: 0.4, aspect: 0.34, x: 0.4 },
    collect: { src: `${DIR}/hero-street-collect.webp`, height: 0.27, aspect: 0.681, x: 0.4 },
    joy: { src: `${DIR}/hero-street-joy.webp`, height: 0.41, aspect: 0.528, x: 0.4 },
    pet: { src: `${DIR}/hero-street-pet-sans.webp`, height: 0.31, aspect: 0.816, x: 0.48, flip: true },
  },
  // Work clothes.
  {
    idle: { src: `${DIR}/hero-work-idle.webp`, height: 0.42, aspect: 0.371, x: 0.4 },
    collect: { src: `${DIR}/hero-work-collect.webp`, height: 0.22, aspect: 0.611, x: 0.4 },
    joy: { src: `${DIR}/hero-work-joy.webp`, height: 0.425, aspect: 0.353, x: 0.4 },
    pet: { src: `${DIR}/hero-work-pet-sans.webp`, height: 0.22, aspect: 0.839, x: 0.47, flip: true },
  },
  // Smart casual: art pending.
  null,
  // Suit: art pending.
  null,
];

const HERO_LOOKS: HeroLook[] = HERO_ART.reduce<HeroLook[]>((looks, art, index) => {
  looks.push(art ?? looks[index - 1]);
  return looks;
}, []);

export function heroLook(outfitIndex: number): HeroLook {
  return HERO_LOOKS[Math.min(Math.max(outfitIndex, 0), HERO_LOOKS.length - 1)];
}

const STREET: ClassLook = {
  items: [
    { src: `${DIR}/bottle-green.webp`, width: 0.14 },
    { src: `${DIR}/bottle-brown.webp`, width: 0.14 },
    { src: `${DIR}/can-red.webp`, width: 0.1 },
  ],
  sans: { src: `${DIR}/sans-sit.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
  find: { src: `${DIR}/sans-wallet.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.929 },
};

/** Index = wealth class. Missing fields come from the class before (see the note at the top). */
const LOOK_ART: Partial<ClassLook>[] = [
  // 0 Living on the Street: bottles and cans.
  STREET,
  // 1 Day Laborer: still bottles and cans.
  {},
  // 2 Working Class: coins. Şans keeps the rope collar.
  {
    items: [
      { src: `${DIR}/coin-one.webp`, width: 0.08 },
      { src: `${DIR}/coin-pile.webp`, width: 0.12 },
      { src: `${DIR}/coin-bill.webp`, width: 0.13 },
    ],
  },
  // 3 Middle Class: Şans gets a leather collar. Art pending.
  {},
  // 4 Millionaire: banknotes. Art pending.
  {},
  // 5 Billionaire (and up for now): Şans' gold collar. Art pending.
  {},
];

const LOOKS: ClassLook[] = LOOK_ART.reduce<ClassLook[]>((looks, art, index) => {
  looks.push(index === 0 ? STREET : { ...looks[index - 1], ...art });
  return looks;
}, []);

export function classLook(classIndex: number): ClassLook {
  return LOOKS[Math.min(Math.max(classIndex, 0), LOOKS.length - 1)];
}

/** Every picture of a look, so the next one can be loaded before the ceremony reveals it. */
export function lookImages(look: ClassLook, hero: HeroLook): string[] {
  return [
    ...Object.values(hero).map((pose) => pose.src),
    ...look.items.map((item) => item.src),
    look.sans.src,
    look.find.src,
  ];
}

// ── Home and vehicle ──

/** Where the vehicle stands: center x and ground line as shares of the picture, and how wide a car is. */
export interface ParkingSpot {
  x: number;
  y: number;
  /** Width of a full-size car as a share of the picture's width; smaller vehicles scale down. */
  carWidth: number;
}

/** Left of the hero, a step behind, so the car never covers the hero or Şans. */
const DEFAULT_PARKING: ParkingSpot = { x: 0.29, y: 0.7, carWidth: 0.36 };

/** Homes whose picture needs the car somewhere else (tuned on the phone when the new art comes). */
const PARKING: Record<string, ParkingSpot> = {};

export interface HomeArt {
  background: string;
  parking: ParkingSpot;
}

export function homeArt(houseId: string): HomeArt {
  const house = HOUSES.find((item) => item.id === houseId) ?? HOUSES[0];
  return { background: house.image, parking: PARKING[house.id] ?? DEFAULT_PARKING };
}

/** Size next to a car (1); the art files are cropped to the vehicle, so this sets the scale. */
const VEHICLE_SIZE: Record<string, number> = {
  'vehicle-bike': 0.55,
  'vehicle-scooter': 0.55,
  'vehicle-offroader': 1.06,
};

export interface VehicleArt {
  id: string;
  src: string;
  /** Width as a share of a full-size car. */
  size: number;
}

/** The best vehicle you own (they are bought in order), or null. */
export function parkedVehicle(owned: readonly string[]): VehicleArt | null {
  for (let index = VEHICLES.length - 1; index >= 0; index -= 1) {
    const vehicle = VEHICLES[index];
    if (owned.includes(vehicle.id)) return { id: vehicle.id, src: vehicle.image, size: VEHICLE_SIZE[vehicle.id] ?? 1 };
  }
  return null;
}

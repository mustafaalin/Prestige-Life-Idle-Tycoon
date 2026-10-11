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

// ── The stage ──
// Every home is painted on the same stage (same camera height and ground), so sizes come from real
// metres instead of being tuned picture by picture. Plan and screen map: docs/session-handoff.md.

/** Ground line the hero and Şans stand on. */
export const FEET_Y = 0.735;
/** The camera's eye level (the hero's eyes): things shrink toward it as they stand further back. */
const HORIZON_Y = 0.37;
/** One metre at the feet line, as a share of the picture's height (the hero is 1.78 m). */
const METRE = 0.225;
/** A vehicle's rear never passes this to the left, the edge of what narrow phones show. */
const LANE_START_X = 0.13;

/** Size of something standing on ground line `y`, next to the same thing at the feet line. */
function depthScale(y: number) {
  return (y - HORIZON_Y) / (FEET_Y - HORIZON_Y);
}

/** Where a vehicle stands: its nose (it faces right, the rest runs left behind the hero) and the ground under its wheels. */
export interface Lane {
  x: number;
  y: number;
}

export type LaneKind = 'car' | 'near';

/** Cars park about 2.5 m behind the hero, where every one of them fits at real size; a bike or
 * scooter stands right beside him. The nose is the fixed end, so a car's face is always in the open. */
export type HomeLayout = Record<LaneKind, Lane>;

const DEFAULT_LAYOUT: HomeLayout = {
  car: { x: 0.89, y: 0.62 },
  near: { x: 0.89, y: 0.7 },
};

/** The first backgrounds have little ground in front of the wall, so the car stays closer. */
const SHALLOW_LAYOUT: HomeLayout = { ...DEFAULT_LAYOUT, car: { x: 0.89, y: 0.66 } };

/** Shade that makes the cut-out sprites sit in a place's light (a CSS filter). */
const DEFAULT_LIGHT = 'brightness(0.9) saturate(0.95)';

export interface HomeArt {
  background: string;
  /** Shown mirrored: the first backgrounds were painted with the home on the right, where the car parks. */
  mirror: boolean;
  layout: HomeLayout;
  light: string;
  /** The hero and Şans stand this far right of their usual place (a share of the picture's width). */
  castX: number;
}

/** What a home's picture needs different from the defaults (tuned on the phone; DEV → scene lab). */
const HOME_ART: Record<string, Partial<Omit<HomeArt, 'background'>>> = {
  // Street tent: a dark, cold alley. The tent is on the right, so Şans sits in front of it and the
  // bike or scooter (no car is ever parked here) stands on the left, behind the hero.
  'home-1': {
    layout: { ...SHALLOW_LAYOUT, near: { x: 0.46, y: 0.7 } },
    light: 'brightness(0.8) saturate(0.85)',
    castX: 0.06,
  },
  // Old van.
  'home-2': { mirror: true, layout: SHALLOW_LAYOUT },
  // Old rental flat: warm evening light.
  'home-4': { mirror: true, layout: SHALLOW_LAYOUT, light: 'brightness(0.95) saturate(1) sepia(0.12)' },
};

export function homeArt(houseId: string): HomeArt {
  const house = HOUSES.find((item) => item.id === houseId) ?? HOUSES[0];
  return {
    background: house.image,
    mirror: false,
    layout: DEFAULT_LAYOUT,
    light: DEFAULT_LIGHT,
    castX: 0,
    ...HOME_ART[house.id],
  };
}

// ── Vehicles ──

interface VehicleShape {
  /** Real height in metres of everything the art's box covers (an antenna or mirrors count); the size
   * on screen comes from it, so it does not depend on the art's angle. */
  metres: number;
  /** Width / height of the image file (cropped to the vehicle). */
  aspect: number;
  lane?: LaneKind;
  /** Older art was drawn facing left and is mirrored on the scene. */
  facesLeft?: boolean;
}

/** Art wider than the lane (about 2.75 m: width = metres × aspect) is shrunk; art-brief §3 has the
 * widest shape each car may have. */
const VEHICLE_SHAPE: Record<string, VehicleShape> = {
  'vehicle-bike': { metres: 1.1, aspect: 0.678, lane: 'near' },
  'vehicle-scooter': { metres: 1.28, aspect: 0.829, lane: 'near' },
  'vehicle-old-sedan': { metres: 1.4, aspect: 1.376 },
  // Art pending: a v1 scooter stands in.
  'vehicle-motorcycle': { metres: 1.15, aspect: 1.003, lane: 'near', facesLeft: true },
  // 1.5 m body plus the antenna.
  'vehicle-hatchback': { metres: 1.69, aspect: 1.322 },
  'vehicle-suv': { metres: 1.7, aspect: 1.86, facesLeft: true },
  // Art pending: a v1 car stands in.
  'vehicle-pickup': { metres: 1.85, aspect: 1.711, facesLeft: true },
  'vehicle-executive': { metres: 1.46, aspect: 2.18, facesLeft: true },
  'vehicle-coupe': { metres: 1.3, aspect: 2.129, facesLeft: true },
  'vehicle-offroader': { metres: 1.9, aspect: 2.009, facesLeft: true },
  'vehicle-supercar': { metres: 1.15, aspect: 2.145, facesLeft: true },
  'vehicle-grand': { metres: 1.55, aspect: 2.249, facesLeft: true },
};
const DEFAULT_SHAPE: VehicleShape = { metres: 1.45, aspect: 2 };

export interface VehicleArt {
  id: string;
  src: string;
  metres: number;
  aspect: number;
  lane: LaneKind;
  mirror: boolean;
}

export function vehicleArt(id: string): VehicleArt | null {
  const vehicle = VEHICLES.find((item) => item.id === id);
  if (!vehicle) return null;
  const shape = VEHICLE_SHAPE[id] ?? DEFAULT_SHAPE;
  return { id, src: vehicle.image, metres: shape.metres, aspect: shape.aspect, lane: shape.lane ?? 'car', mirror: shape.facesLeft ?? false };
}

export interface VehicleBox {
  /** Left edge (the rear) and ground line, as shares of the picture. */
  x: number;
  y: number;
  /** Width as a share of the picture's width. */
  width: number;
  /** 1 = real size; below 1 the art is too wide for its lane and was shrunk by this much. */
  fit: number;
  mirror: boolean;
}

/** Where a vehicle stands in front of a home, at real size unless its art is too wide for the lane. */
export function vehicleBox(vehicle: VehicleArt, layout: HomeLayout): VehicleBox {
  const lane = layout[vehicle.lane];
  const height = vehicle.metres * METRE * depthScale(lane.y);
  const width = height * vehicle.aspect * (16 / 9);
  const fit = Math.min(1, (lane.x - LANE_START_X) / width);
  return { x: lane.x - width * fit, y: lane.y, width: width * fit, fit, mirror: vehicle.mirror };
}

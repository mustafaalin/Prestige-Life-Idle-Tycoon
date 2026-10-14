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
  /** What lies on the ground to collect (bottles in the alley, then coins; nothing from Middle Class on). */
  items: ItemArt[];
  /** Şans sitting, and Şans with a found wallet (his collar changes with the class). */
  sans: SpriteArt;
  find: SpriteArt;
  /** Şans asleep, for the "while you were away" card: a low, long picture, never put in the sitting dog's box. */
  sleep: string;
}

const DIR = '/assets/scene';

/** An outfit's art. Outfits from Middle Class on have no collect pose (nothing lies on the ground by then). */
type HeroArt = Omit<HeroLook, 'collect'> & { collect?: PoseArt };

/** Index = outfit (OUTFITS order). Empty = art pending, the outfit before stands in. */
const HERO_ART: (HeroArt | null)[] = [
  // Hoodie: standing up, a hand on the backpack strap, hopeful (in the tent he is cold instead, below).
  {
    idle: { src: `${DIR}/hero-street-hopeful.webp`, height: 0.41, aspect: 0.319, x: 0.4 },
    collect: { src: `${DIR}/hero-street-collect.webp`, height: 0.27, aspect: 0.681, x: 0.4 },
    joy: { src: `${DIR}/hero-street-joy.webp`, height: 0.41, aspect: 0.528, x: 0.4 },
    pet: { src: `${DIR}/hero-street-pet-sans.webp`, height: 0.31, aspect: 0.816, x: 0.48, flip: true },
  },
  // Work clothes.
  {
    idle: { src: `${DIR}/hero-work-idle.webp`, height: 0.42, aspect: 0.371, x: 0.4 },
    collect: { src: `${DIR}/hero-work-collect.webp`, height: 0.25, aspect: 0.611, x: 0.4 },
    joy: { src: `${DIR}/hero-work-joy.webp`, height: 0.444, aspect: 0.353, x: 0.4 },
    pet: { src: `${DIR}/hero-work-pet-sans.webp`, height: 0.25, aspect: 0.839, x: 0.47, flip: true },
  },
  // Smart casual: relaxed, a hand in his pocket. A raised fist adds to a joy picture's height; the body
  // stays the idle's size.
  {
    idle: { src: `${DIR}/hero-smart-idle.webp`, height: 0.42, aspect: 0.307, x: 0.4 },
    joy: { src: `${DIR}/hero-smart-joy.webp`, height: 0.451, aspect: 0.328, x: 0.4 },
    pet: { src: `${DIR}/hero-smart-pet-sans.webp`, height: 0.225, aspect: 1.046, x: 0.49, flip: true },
  },
  // Camel overcoat: hands in the coat pockets, enjoying a cold bright day.
  {
    idle: { src: `${DIR}/hero-coat-idle.webp`, height: 0.42, aspect: 0.306, x: 0.4 },
    joy: { src: `${DIR}/hero-coat-joy.webp`, height: 0.445, aspect: 0.37, x: 0.4 },
    pet: { src: `${DIR}/hero-coat-pet-sans.webp`, height: 0.222, aspect: 1.142, x: 0.49, flip: true },
  },
  // Suit: sure of himself, buttoning his jacket.
  {
    idle: { src: `${DIR}/hero-suit-idle.webp`, height: 0.42, aspect: 0.328, x: 0.4 },
    joy: { src: `${DIR}/hero-suit-joy.webp`, height: 0.444, aspect: 0.367, x: 0.4 },
    pet: { src: `${DIR}/hero-suit-pet-sans.webp`, height: 0.222, aspect: 1.076, x: 0.49, flip: true },
  },
  // Three-piece suit: adjusting a cufflink.
  {
    idle: { src: `${DIR}/hero-threepiece-idle.webp`, height: 0.42, aspect: 0.322, x: 0.4 },
    joy: { src: `${DIR}/hero-threepiece-joy.webp`, height: 0.448, aspect: 0.365, x: 0.4 },
    pet: { src: `${DIR}/hero-threepiece-pet-sans.webp`, height: 0.222, aspect: 1.088, x: 0.49, flip: true },
  },
  // Tuxedo: hands loosely together, calm and warm.
  {
    idle: { src: `${DIR}/hero-tux-idle.webp`, height: 0.42, aspect: 0.29, x: 0.4 },
    joy: { src: `${DIR}/hero-tux-joy.webp`, height: 0.443, aspect: 0.364, x: 0.4 },
    pet: { src: `${DIR}/hero-tux-pet-sans.webp`, height: 0.222, aspect: 1.093, x: 0.49, flip: true },
  },
];

const HERO_LOOKS: HeroLook[] = HERO_ART.reduce<HeroLook[]>((looks, art, index) => {
  // Bought early, such an outfit can still meet coins on the ground: the hero collects standing.
  looks.push(art ? { ...art, collect: art.collect ?? art.idle } : looks[index - 1]);
  return looks;
}, []);

/** The hoodie in the tent: hunched and cold. The pose tells his mood, so it lifts the day he moves out. */
const TENT_LOOK: HeroLook = {
  ...HERO_LOOKS[0],
  idle: { src: `${DIR}/hero-street-idle.webp`, height: 0.4, aspect: 0.34, x: 0.4 },
};

/** The hero in an outfit; `houseId` is where he lives (left out: any home but the tent). */
export function heroLook(outfitIndex: number, houseId?: string): HeroLook {
  const look = HERO_LOOKS[Math.min(Math.max(outfitIndex, 0), HERO_LOOKS.length - 1)];
  return look === HERO_LOOKS[0] && houseId === HOUSES[0].id ? TENT_LOOK : look;
}

const STREET: ClassLook = {
  items: [
    { src: `${DIR}/bottle-green.webp`, width: 0.14 },
    { src: `${DIR}/bottle-brown.webp`, width: 0.14 },
    { src: `${DIR}/can-red.webp`, width: 0.1 },
  ],
  sans: { src: `${DIR}/sans-sit.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
  find: { src: `${DIR}/sans-wallet.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.929 },
  sleep: `${DIR}/sans-sleep.webp`,
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
  // 3 Middle Class: nothing to collect from here on (COLLECT_END_CLASS). Şans gets a leather collar.
  {
    sans: { src: `${DIR}/sans-sit-leather.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
    find: { src: `${DIR}/sans-wallet-leather.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.907 },
    sleep: `${DIR}/sans-sleep-leather.webp`,
  },
  // 4 Millionaire: a silver collar (2026-10-15), drawn on the at-ease dog of the gold collar.
  {
    sans: { src: `${DIR}/sans-sit-silver.webp`, x: 0.66, y: 0.748, height: 0.151, aspect: 0.64 },
    find: { src: `${DIR}/sans-wallet-silver.webp`, x: 0.72, y: 0.752, height: 0.148, aspect: 0.89 },
    sleep: `${DIR}/sans-sleep-silver.webp`,
  },
  // 5 Billionaire and up: a gold collar, and a dog at ease (he sits relaxed and trots in with his find).
  {
    sans: { src: `${DIR}/sans-sit-gold.webp`, x: 0.66, y: 0.748, height: 0.151, aspect: 0.631 },
    find: { src: `${DIR}/sans-wallet-gold.webp`, x: 0.72, y: 0.752, height: 0.148, aspect: 0.883 },
    sleep: `${DIR}/sans-sleep-gold.webp`,
  },
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
/** A vehicle's rear never passes this to the left (or, parked facing left, its mirror image to the
 * right), the edge of what narrow phones show. */
const LANE_START_X = 0.13;

/** Size of something standing on ground line `y`, next to the same thing at the feet line. */
function depthScale(y: number) {
  return (y - HORIZON_Y) / (FEET_Y - HORIZON_Y);
}

/** Where a vehicle stands: its nose (it faces right, the rest runs left behind the hero) and the ground under its wheels. */
export interface Lane {
  x: number;
  y: number;
  /** Parked the other way round: the nose at `x` points left and the rest runs right behind the hero. */
  facesLeft?: boolean;
}

export type LaneKind = 'car' | 'near';

/** Cars park about 2.5 m behind the hero, where every one of them fits at real size; a bike or
 * scooter stands right beside him. The nose is the fixed end, so a car's face is always in the open. */
export type HomeLayout = Record<LaneKind, Lane>;

const DEFAULT_LAYOUT: HomeLayout = {
  car: { x: 0.89, y: 0.62 },
  near: { x: 0.89, y: 0.7 },
};

/** Shade that makes the cut-out sprites sit in a place's light (a CSS filter). */
const DEFAULT_LIGHT = 'brightness(0.9) saturate(0.95)';

export interface HomeArt {
  background: string;
  layout: HomeLayout;
  light: string;
  /** The hero and Şans stand this far right of their usual place (a share of the picture's width). */
  castX: number;
}

/** What a home's picture needs different from the defaults (tuned on the phone; DEV → scene lab). */
const HOME_ART: Record<string, Partial<Omit<HomeArt, 'background'>>> = {
  // Street tent: a dark, cold alley. The tent is on the right, so Şans sits in front of it and the
  // bike (the only vehicle ever parked here) stands on the left, turned left: its rear is behind
  // the hero and its face in the open.
  'home-1': {
    layout: { ...DEFAULT_LAYOUT, near: { x: 0.14, y: 0.7, facesLeft: true } },
    light: 'brightness(0.8) saturate(0.85)',
    castX: 0.06,
  },
  // Old van: the van is far back on the left, so the hero steps right to leave it in view.
  'home-2': { castX: 0.07 },
  // Rented room and the flats: the door is left of the middle, the hero stands clear of it.
  'home-3': { castX: 0.07 },
  // Warm evening light.
  'home-4': { castX: 0.07, light: 'brightness(0.95) saturate(1) sepia(0.12)' },
  'home-5': { castX: 0.07 },
};

export function homeArt(houseId: string): HomeArt {
  const house = HOUSES.find((item) => item.id === houseId) ?? HOUSES[0];
  return {
    background: house.image,
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
}

/** Art wider than the lane (about 2.75 m: width = metres × aspect) is shrunk; art-brief §3 has the
 * widest shape each car may have. */
const VEHICLE_SHAPE: Record<string, VehicleShape> = {
  'vehicle-bike': { metres: 1.1, aspect: 0.678, lane: 'near' },
  'vehicle-scooter': { metres: 1.28, aspect: 0.829, lane: 'near' },
  'vehicle-old-sedan': { metres: 1.4, aspect: 1.376 },
  // 1.1 m to the tank, the mirrors stand above it.
  'vehicle-motorcycle': { metres: 1.3, aspect: 0.896, lane: 'near' },
  // 1.5 m body plus the antenna.
  'vehicle-hatchback': { metres: 1.69, aspect: 1.322 },
  // Roof rails included.
  'vehicle-suv': { metres: 1.7, aspect: 1.442 },
  'vehicle-pickup': { metres: 1.8, aspect: 1.599 },
  'vehicle-executive': { metres: 1.46, aspect: 1.67 },
  'vehicle-coupe': { metres: 1.3, aspect: 1.642 },
  'vehicle-offroader': { metres: 1.85, aspect: 1.565 },
  'vehicle-supercar': { metres: 1.15, aspect: 2.045 },
  'vehicle-grand': { metres: 1.55, aspect: 1.758 },
};
const DEFAULT_SHAPE: VehicleShape = { metres: 1.45, aspect: 2 };

export interface VehicleArt {
  id: string;
  src: string;
  metres: number;
  aspect: number;
  lane: LaneKind;
}

export function vehicleArt(id: string): VehicleArt | null {
  const vehicle = VEHICLES.find((item) => item.id === id);
  if (!vehicle) return null;
  const shape = VEHICLE_SHAPE[id] ?? DEFAULT_SHAPE;
  return { id, src: vehicle.image, metres: shape.metres, aspect: shape.aspect, lane: shape.lane ?? 'car' };
}

export interface VehicleBox {
  /** Left edge and ground line, as shares of the picture. */
  x: number;
  y: number;
  /** Width as a share of the picture's width. */
  width: number;
  /** 1 = real size; below 1 the art is too wide for its lane and was shrunk by this much. */
  fit: number;
  /** The art faces right; here it is shown mirrored, nose to the left (the lane's `facesLeft`). */
  facesLeft: boolean;
}

/** Where a vehicle stands in front of a home, at real size unless its art is too wide for the lane. */
export function vehicleBox(vehicle: VehicleArt, layout: HomeLayout): VehicleBox {
  const lane = layout[vehicle.lane];
  const height = vehicle.metres * METRE * depthScale(lane.y);
  const width = height * vehicle.aspect * (16 / 9);
  const facesLeft = lane.facesLeft ?? false;
  const room = facesLeft ? 1 - LANE_START_X - lane.x : lane.x - LANE_START_X;
  const fit = Math.min(1, room / width);
  return { x: facesLeft ? lane.x : lane.x - width * fit, y: lane.y, width: width * fit, fit, facesLeft };
}

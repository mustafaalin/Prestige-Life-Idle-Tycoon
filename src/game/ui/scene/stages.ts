import { HOUSES } from '../../core/config/housing';
import { VEHICLES } from '../../core/config/lifestyle';
import { currentCity } from '../../runtime/city';
import { COLLAR } from './rigs';

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

export type ItemKind = 'bottles' | 'coins';

/** The hero in one outfit. */
export type HeroLook = Record<Pose, PoseArt>;

export interface ClassLook {
  /** What lies on the ground to collect (bottles in the alley, then coins; nothing from Middle Class on). */
  items: ItemArt[];
  /** What those are, for the words that name them (the ad shower: "Bottle shower" or "Coin shower"). */
  itemKind: ItemKind;
  /** Şans sitting, and Şans with a found wallet (his collar changes with the class). */
  sans: SpriteArt;
  find: SpriteArt;
  /** The same collar on Şans' rig (rigs.ts COLLAR). */
  collar: number;
  /** Şans asleep, for the "while you were away" card: a low, long picture, never put in the sitting dog's box. */
  sleep: string;
}

const DIR = '/assets/scene';

/** An outfit's art. Outfits from Middle Class on have no collect pose (nothing lies on the ground by then). */
type HeroArt = Omit<HeroLook, 'collect'> & { collect?: PoseArt };

/**
 * Index = outfit (OUTFITS order). Empty = art pending, the outfit before stands in. Heights: the head
 * keeps one size in every pose and Şans in a petting picture matches the sitting one (scene board,
 * 2026-10-21: the hoodie's petting picture was a fifth too big, its joy a little small).
 */
const HERO_ART: (HeroArt | null)[] = [
  // Hoodie: standing up, a hand on the backpack strap, hopeful (in the tent he is cold instead, below).
  {
    idle: { src: `${DIR}/hero-street-hopeful.webp`, height: 0.41, aspect: 0.319, x: 0.4 },
    collect: { src: `${DIR}/hero-street-collect.webp`, height: 0.27, aspect: 0.681, x: 0.4 },
    joy: { src: `${DIR}/hero-street-joy.webp`, height: 0.424, aspect: 0.528, x: 0.4 },
    pet: { src: `${DIR}/hero-street-pet-sans.webp`, height: 0.275, aspect: 0.816, x: 0.48, flip: true },
  },
  // Work clothes.
  {
    idle: { src: `${DIR}/hero-work-idle.webp`, height: 0.42, aspect: 0.371, x: 0.4 },
    collect: { src: `${DIR}/hero-work-collect.webp`, height: 0.25, aspect: 0.611, x: 0.4 },
    joy: { src: `${DIR}/hero-work-joy.webp`, height: 0.444, aspect: 0.353, x: 0.4 },
    pet: { src: `${DIR}/hero-work-pet-sans.webp`, height: 0.26, aspect: 0.839, x: 0.47, flip: true },
  },
  // Smart casual: relaxed, a hand in his pocket. A raised fist adds to a joy picture's height; the body
  // stays the idle's size.
  {
    idle: { src: `${DIR}/hero-smart-idle.webp`, height: 0.42, aspect: 0.307, x: 0.4 },
    joy: { src: `${DIR}/hero-smart-joy.webp`, height: 0.451, aspect: 0.328, x: 0.4 },
    pet: { src: `${DIR}/hero-smart-pet-sans.webp`, height: 0.235, aspect: 1.046, x: 0.49, flip: true },
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

/**
 * The first hero from 60 on (story-v2.md §6): one grandfather look whatever he wears (the outfit's
 * bonus stays). He pets Şans standing, slightly bent, so that picture is taller than the others' crouch.
 */
const GRANDPA_ART: HeroArt = {
  idle: { src: `${DIR}/hero-grandpa-idle.webp`, height: 0.42, aspect: 0.289, x: 0.4 },
  joy: { src: `${DIR}/hero-grandpa-joy.webp`, height: 0.405, aspect: 0.394, x: 0.4 },
  // Redrawn 2026-10-21 with Şans at his sitting size (he was a quarter too big).
  pet: { src: `${DIR}/hero-grandpa-pet-sans.webp`, height: 0.358, aspect: 0.618, x: 0.47, flip: true },
};
const GRANDPA_LOOK: HeroLook = { ...GRANDPA_ART, collect: GRANDPA_ART.idle };

/**
 * The Starter Pack's scarf on the petting pictures (2026-10-21; Şans and the hero are one picture, so
 * each has a twin drawn with the scarf, same framing): the file gets `-scarf`, the width may differ a
 * little. Key: the plain picture.
 */
const PET_SCARF_ASPECT: Record<string, number> = {
  'hero-street-pet-sans.webp': 0.816,
  'hero-work-pet-sans.webp': 0.839,
  'hero-smart-pet-sans.webp': 1.043,
  'hero-coat-pet-sans.webp': 1.14,
  'hero-suit-pet-sans.webp': 1.075,
  'hero-threepiece-pet-sans.webp': 1.087,
  'hero-tux-pet-sans.webp': 1.095,
  'hero-grandpa-pet-sans.webp': 0.618,
};

function withScarf(look: HeroLook): HeroLook {
  const file = look.pet.src.slice(DIR.length + 1);
  const aspect = PET_SCARF_ASPECT[file];
  return aspect ? { ...look, pet: { ...look.pet, src: `${DIR}/${file.replace('.webp', '-scarf.webp')}`, aspect } } : look;
}

// Made once, so the same look is the same object (the scene compares looks to announce a new outfit).
const SCARF_LOOKS = HERO_LOOKS.map(withScarf);
const TENT_SCARF_LOOK = withScarf(TENT_LOOK);
const GRANDPA_SCARF_LOOK = withScarf(GRANDPA_LOOK);

/**
 * The hero in an outfit; `houseId` is where he lives (left out: any home but the tent). `grandpa`:
 * the first hero is 60 or older. `scarf`: Şans wears the Starter Pack's scarf (the petting picture).
 */
export function heroLook(outfitIndex: number, houseId?: string, grandpa = false, scarf = false): HeroLook {
  if (grandpa) return scarf ? GRANDPA_SCARF_LOOK : GRANDPA_LOOK;
  const index = Math.min(Math.max(outfitIndex, 0), HERO_LOOKS.length - 1);
  const tent = HERO_LOOKS[index] === HERO_LOOKS[0] && houseId === HOUSES[0].id;
  if (scarf) return tent ? TENT_SCARF_LOOK : SCARF_LOOKS[index];
  return tent ? TENT_LOOK : HERO_LOOKS[index];
}

const STREET: ClassLook = {
  items: [
    { src: `${DIR}/bottle-green.webp`, width: 0.14 },
    { src: `${DIR}/bottle-brown.webp`, width: 0.14 },
    { src: `${DIR}/can-red.webp`, width: 0.1 },
  ],
  itemKind: 'bottles',
  sans: { src: `${DIR}/sans-sit.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
  find: { src: `${DIR}/sans-wallet.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.929 },
  collar: COLLAR.rope,
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
    itemKind: 'coins',
  },
  // 3 Middle Class: nothing to collect from here on (COLLECT_END_CLASS). Şans gets a leather collar.
  {
    sans: { src: `${DIR}/sans-sit-leather.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
    find: { src: `${DIR}/sans-wallet-leather.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.907 },
    collar: COLLAR.leather,
    sleep: `${DIR}/sans-sleep-leather.webp`,
  },
  // 4 Millionaire: a silver collar (2026-10-15), drawn on the at-ease dog of the gold collar.
  {
    sans: { src: `${DIR}/sans-sit-silver.webp`, x: 0.66, y: 0.748, height: 0.151, aspect: 0.64 },
    find: { src: `${DIR}/sans-wallet-silver.webp`, x: 0.72, y: 0.752, height: 0.148, aspect: 0.89 },
    collar: COLLAR.silver,
    sleep: `${DIR}/sans-sleep-silver.webp`,
  },
  // 5 Billionaire and up: a gold collar, and a dog at ease (he sits relaxed and trots in with his find).
  {
    sans: { src: `${DIR}/sans-sit-gold.webp`, x: 0.66, y: 0.748, height: 0.151, aspect: 0.631 },
    find: { src: `${DIR}/sans-wallet-gold.webp`, x: 0.72, y: 0.752, height: 0.148, aspect: 0.883 },
    collar: COLLAR.gold,
    sleep: `${DIR}/sans-sleep-gold.webp`,
  },
];

const LOOKS: ClassLook[] = LOOK_ART.reduce<ClassLook[]>((looks, art, index) => {
  looks.push(index === 0 ? STREET : { ...looks[index - 1], ...art });
  return looks;
}, []);

/**
 * The Starter Pack's red scarf (runtime/purchases.ts hasScarf): every sitting, wallet and sleeping
 * picture has a twin drawn with the scarf tied on (GPT 2026-10-15; docs/archive/sans-scarf-handoff.md), same
 * pose and scale, so only the file and its width change. Key: the plain picture.
 */
const SCARF_TWINS: Record<string, { src: string; aspect?: number }> = {
  'sans-sit.webp': { src: 'sans-sit-rope-scarf.webp', aspect: 0.631 },
  'sans-sit-leather.webp': { src: 'sans-sit-leather-scarf.webp', aspect: 0.645 },
  'sans-sit-silver.webp': { src: 'sans-sit-silver-scarf.webp', aspect: 0.638 },
  'sans-sit-gold.webp': { src: 'sans-sit-gold-scarf.webp', aspect: 0.631 },
  'sans-wallet.webp': { src: 'sans-wallet-rope-scarf.webp', aspect: 0.931 },
  'sans-wallet-leather.webp': { src: 'sans-wallet-leather-scarf.webp', aspect: 0.914 },
  'sans-wallet-silver.webp': { src: 'sans-wallet-silver-scarf.webp', aspect: 0.898 },
  'sans-wallet-gold.webp': { src: 'sans-wallet-gold-scarf.webp', aspect: 0.888 },
  'sans-sleep.webp': { src: 'sans-sleep-rope-scarf.webp' },
  'sans-sleep-leather.webp': { src: 'sans-sleep-leather-scarf.webp' },
  'sans-sleep-silver.webp': { src: 'sans-sleep-silver-scarf.webp' },
  'sans-sleep-gold.webp': { src: 'sans-sleep-gold-scarf.webp' },
};

function scarfTwin<T extends { src: string; aspect: number }>(art: T): T {
  const twin = SCARF_TWINS[art.src.slice(DIR.length + 1)];
  return twin ? { ...art, src: `${DIR}/${twin.src}`, aspect: twin.aspect ?? art.aspect } : art;
}

/** A class's look; `scarf`: Şans wears the Starter Pack's scarf. */
export function classLook(classIndex: number, scarf = false): ClassLook {
  const look = LOOKS[Math.min(Math.max(classIndex, 0), LOOKS.length - 1)];
  if (!scarf) return look;
  const sleep = SCARF_TWINS[look.sleep.slice(DIR.length + 1)];
  return {
    ...look,
    sans: scarfTwin(look.sans),
    find: scarfTwin(look.find),
    sleep: sleep ? `${DIR}/${sleep.src}` : look.sleep,
  };
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
  // Rented room and the flats: the door is left of the middle, the hero stands clear of it. The room's
  // and the newer flat's fronts are close, so the car parks further forward (scene board, 2026-10-21).
  'home-3': { castX: 0.07, layout: { ...DEFAULT_LAYOUT, car: { x: 0.89, y: 0.655 } } },
  // Warm evening light.
  'home-4': { castX: 0.07, light: 'brightness(0.95) saturate(1) sepia(0.12)' },
  'home-5': { castX: 0.07, layout: { ...DEFAULT_LAYOUT, car: { x: 0.89, y: 0.655 } } },
  // The suburban house and the mansion stand small and far back: a car parked further back stays
  // smaller and leaves them in view. The beach estate's front is too shallow for that; its picture is
  // being redrawn further back (art-prompts-v2 §4).
  'home-8': { layout: { ...DEFAULT_LAYOUT, car: { x: 0.89, y: 0.57 } } },
  'home-12': { layout: { ...DEFAULT_LAYOUT, car: { x: 0.87, y: 0.59 } } },
};

/**
 * Lumen's homes (runtime/city.ts; docs/lumen-art-handoff.md). Defaults until tuned on the phone; the
 * near homes have their door in the left third like the old city's, so the hero steps right.
 */
const LUMEN_HOME_ART: Record<string, Partial<Omit<HomeArt, 'background'>>> = {
  'home-2': { castX: 0.07 },
  'home-3': { castX: 0.07 },
  'home-4': { castX: 0.07 },
  'home-5': { castX: 0.07 },
};

export function homeArt(houseId: string): HomeArt {
  const house = HOUSES.find((item) => item.id === houseId) ?? HOUSES[0];
  return {
    background: house.image,
    layout: DEFAULT_LAYOUT,
    light: DEFAULT_LIGHT,
    castX: 0,
    ...(currentCity() === 'lumen' ? LUMEN_HOME_ART : HOME_ART)[house.id],
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
  // A low car read small next to the others at its real 1.3 m (scene board, 2026-10-21).
  'vehicle-coupe': { metres: 1.52, aspect: 1.642 },
  'vehicle-offroader': { metres: 1.85, aspect: 1.565 },
  // The orange McLaren-like car (2026-10-21, art/pilot/09-vehicles/vehicle-9-feature-supercar-v1.png).
  'vehicle-supercar': { metres: 1.15, aspect: 2.338 },
  'vehicle-grand': { metres: 1.55, aspect: 1.758 },
};
/** Lumen's vehicles (heights from docs/art-prompts-lumen.md §4, aspects of the cut files, 2026-10-17). */
const LUMEN_VEHICLE_SHAPE: Record<string, VehicleShape> = {
  'vehicle-bike': { metres: 1.1, aspect: 1.058, lane: 'near' },
  'vehicle-scooter': { metres: 1.28, aspect: 0.916, lane: 'near' },
  'vehicle-old-sedan': { metres: 1.45, aspect: 1.142 },
  'vehicle-motorcycle': { metres: 1.2, aspect: 1.161, lane: 'near' },
  'vehicle-hatchback': { metres: 1.6, aspect: 1.676 },
  'vehicle-suv': { metres: 1.65, aspect: 1.61 },
  'vehicle-pickup': { metres: 1.85, aspect: 1.331 },
  'vehicle-executive': { metres: 1.45, aspect: 1.837 },
  'vehicle-coupe': { metres: 1.28, aspect: 1.779 },
  'vehicle-offroader': { metres: 1.9, aspect: 1.264 },
  'vehicle-supercar': { metres: 1.12, aspect: 2.041 },
  'vehicle-grand': { metres: 1.55, aspect: 1.552 },
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
  const shape = (currentCity() === 'lumen' ? LUMEN_VEHICLE_SHAPE : VEHICLE_SHAPE)[id] ?? DEFAULT_SHAPE;
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

/**
 * Tall cars are drawn shorter than they are (2026-10-23, user: "the pickup hides the house"). At real
 * size anything as tall as the hero's eyes reaches the horizon, where the homes stand, so a pickup or an
 * SUV covered the house behind it wherever it parked. A flat 80% fixed that but made low cars tiny
 * (user, same day: the old sedan "looked fine before"), so only the height above CAR_FULL_METRES is
 * squeezed: cars up to it keep their real size, a pickup stays about where 80% put it. Bikes beside the
 * hero are never squeezed.
 */
const CAR_FULL_METRES = 1.4;
const CAR_TALL_SHARE = 0.2;

/** The height a vehicle is drawn at: real, with the part above CAR_FULL_METRES squeezed for cars. */
function stageMetres(vehicle: VehicleArt) {
  if (vehicle.lane !== 'car' || vehicle.metres <= CAR_FULL_METRES) return vehicle.metres;
  return CAR_FULL_METRES + (vehicle.metres - CAR_FULL_METRES) * CAR_TALL_SHARE;
}

/** Where a vehicle stands in front of a home, at stage size unless its art is too wide for the lane. */
export function vehicleBox(vehicle: VehicleArt, layout: HomeLayout): VehicleBox {
  const lane = layout[vehicle.lane];
  const height = stageMetres(vehicle) * METRE * depthScale(lane.y);
  const width = height * vehicle.aspect * (16 / 9);
  const facesLeft = lane.facesLeft ?? false;
  const room = facesLeft ? 1 - LANE_START_X - lane.x : lane.x - LANE_START_X;
  const fit = Math.min(1, room / width);
  return { x: facesLeft ? lane.x : lane.x - width * fit, y: lane.y, width: width * fit, fit, facesLeft };
}

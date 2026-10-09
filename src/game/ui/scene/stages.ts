// The home scene follows the hero's class (discussion-notes §7, decided 2026-10-09): each class-up
// ceremony moves the hero to the next place, in the next outfit. One stage per class; the shop's
// homes and outfits do not change the scene yet. Art list and prompts: docs/art-brief-v2.md.
//
// A stage only names the art that exists. Anything it leaves out is taken from the stage before,
// so a class whose art is still being made keeps the previous look instead of a broken image.

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

export interface SceneStage {
  background: string;
  /** Hero in this stage's outfit. */
  poses: Record<Pose, PoseArt>;
  /** What lies on the ground to collect (bottles in the alley, money later). */
  items: ItemArt[];
  /** Şans sitting, and Şans with a found wallet (his collar changes with the class). */
  sans: SpriteArt;
  find: SpriteArt;
}

const DIR = '/assets/scene';

const STREET: SceneStage = {
  background: `${DIR}/alley.webp`,
  poses: {
    idle: { src: `${DIR}/hero-street-idle.webp`, height: 0.4, aspect: 0.34, x: 0.4 },
    collect: { src: `${DIR}/hero-street-collect.webp`, height: 0.27, aspect: 0.681, x: 0.4 },
    joy: { src: `${DIR}/hero-street-joy.webp`, height: 0.41, aspect: 0.528, x: 0.4 },
    pet: { src: `${DIR}/hero-street-pet-sans.webp`, height: 0.31, aspect: 0.816, x: 0.48, flip: true },
  },
  items: [
    { src: `${DIR}/bottle-green.webp`, width: 0.14 },
    { src: `${DIR}/bottle-brown.webp`, width: 0.14 },
    { src: `${DIR}/can-red.webp`, width: 0.1 },
  ],
  sans: { src: `${DIR}/sans-sit.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 },
  find: { src: `${DIR}/sans-wallet.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.929 },
};

/** Index = wealth class. Missing fields come from the stage before (see the note at the top). */
const STAGE_ART: Partial<SceneStage>[] = [
  // 0 Living on the Street: the alley, the hoodie, bottles and cans.
  STREET,
  // 1 Day Laborer: the old van becomes home (same alley camera, morning light). Still the hoodie.
  { background: `${DIR}/van.webp` },
  // 2 Working Class: outside the first rented flat; work clothes; coins. Art pending.
  {},
  // 3 Middle Class: a modern apartment complex; smart casual; Şans gets a leather collar. Art pending.
  {},
  // 4 Millionaire: a detached house with a garden; smart casual; banknotes. Art pending.
  {},
  // 5 Billionaire (and up for now): a villa; suit; Şans' gold collar. Art pending.
  {},
];

const STAGES: SceneStage[] = STAGE_ART.reduce<SceneStage[]>((stages, art, index) => {
  stages.push(index === 0 ? STREET : { ...stages[index - 1], ...art });
  return stages;
}, []);

export function sceneStage(classIndex: number): SceneStage {
  return STAGES[Math.min(Math.max(classIndex, 0), STAGES.length - 1)];
}

/** Every picture of a stage, so the next stage can be loaded before the ceremony reveals it. */
export function stageImages(stage: SceneStage): string[] {
  return [
    stage.background,
    ...Object.values(stage.poses).map((pose) => pose.src),
    ...stage.items.map((item) => item.src),
    stage.sans.src,
    stage.find.src,
  ];
}

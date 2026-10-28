// The Rive rigs of the hero and Şans (docs/research/character-animation-2026-10-25.md §11; built by
// scripts/rig/gen3.py and scripts/rig/sans_rig.py with --game, copied to public/assets/rig/). On the
// home scene they stand in for the idle pictures; petting, collecting, Şans' find and his sleep stay
// pictures, and so does the grandfather. Inputs are the rigs' view model properties.

export interface Rig {
  src: string;
  /** Artboard size, px. */
  width: number;
  height: number;
  /** Where the figure stands in the artboard at rest (measured on the rig): top of the head, soles, middle. */
  top: number;
  bottom: number;
  centerX: number;
}

export const HERO_RIG: Rig = { src: '/assets/rig/hero.riv', width: 1200, height: 1400, top: 154, bottom: 1382, centerX: 620 };
export const SANS_RIG: Rig = { src: '/assets/rig/sans.riv', width: 800, height: 1170, top: 36, bottom: 1137, centerX: 391 };

/** The hero's height on the scene as a share of the background's, the idle pictures' height. */
export const HERO_RIG_HEIGHT = 0.42;

/** Hero view model `mood` (gen3.py MOOD_FACES): the face at rest, and the one he goes back to after talking. */
export const MOOD = { neutral: 0, smile: 1, laugh: 2, sad: 3, worried: 4, determined: 5, surprised: 6 } as const;

/** Hero view model `pose`: 0 rest, 1 cold (the body shivers, the head sinks, the teeth chatter). */
export const HERO_POSE = { rest: 0, cold: 1 } as const;

/** Outfit slots `top` / `bottom` / `shoes`: 0 bare, then OUTFITS in order (core/config/lifestyle.ts). */
export const outfitSlot = (outfitIndex: number) => outfitIndex + 1;

/** Şans view model `collar`: 0 none, 1 rope, 2 leather, 3 silver, 4 gold, 5 ruby. */
export const COLLAR = { none: 0, rope: 1, leather: 2, silver: 3, gold: 4, ruby: 5 } as const;

export interface RigInputs {
  numbers?: Record<string, number>;
  booleans?: Record<string, boolean>;
}

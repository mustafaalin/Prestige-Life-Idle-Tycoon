import { CONTENT } from '../../core/config/content';
import { outfitIndex } from '../../core/config/lifestyle';
import type { MessageKey } from '../../i18n/translate';
import type { LifeMomentId } from '../../runtime/story';

// Class-up ceremonies (story-v2.md §4, plan 1.10): after the "new class" title, a few short story
// beats in visual-novel style (portrait + bubble), then the before/now card. Each ceremony answers
// what the one before planted, and some plant the next. Index = wealth class (WEALTH_CLASSES).

/** `burak` speaks with a name tag only until his portraits come (docs/archive/art-prompts-burak.md). */
export type CastId =
  | 'hero'
  | 'mom'
  | 'riza'
  | 'bryce'
  | 'staff'
  | 'nevin'
  | 'defne'
  | 'defneOld'
  | 'elif'
  | 'ada'
  | 'adaChild'
  | 'burak';

export const FACES = {
  hero: ['worried', 'soft', 'determined', 'happy'],
  mom: ['worried', 'teary', 'smile', 'tears'],
  riza: ['warm', 'concerned', 'serious', 'laugh'],
  bryce: ['angry', 'smug', 'sly', 'shocked'],
  nevin: ['smile', 'moved', 'surprised', 'laugh'],
  defne: ['smile', 'shy', 'surprised', 'laugh'],
  defneOld: ['smile', 'shy', 'surprised', 'laugh'],
  elif: ['smile', 'teary', 'surprised', 'laugh'],
  ada: ['smile', 'determined', 'surprised', 'laugh'],
  /** Ada at 7 (the grandfather's moment); `ada` is her at 17. */
  adaChild: ['smile', 'determined', 'surprised', 'laugh'],
} as const;

type Face<C extends CastId> = C extends keyof typeof FACES ? (typeof FACES)[C][number] : never;

/** `when`: the line only plays once that life moment has (Brad's shadow, the heir's vow). */
export type CeremonyLine =
  | { [C in CastId]: { speaker: C; face?: Face<C>; phone?: boolean; text: MessageKey; when?: LifeMomentId } }[CastId]
  /** Narration: no speaker, centered caption. */
  | { speaker?: undefined; text: MessageKey; when?: LifeMomentId };

export interface StoryImage {
  src: string;
  /**
   * `panel`: a 9:16 story frame, shown at full width from the top so a tall phone crops nothing; what
   * is left below it sits under the speech bubble and is filled with a blurred copy. `contain`: a
   * small picture (the old photo) shown whole on a blurred copy of itself.
   */
  fit: 'panel' | 'contain';
  /** A slow push-in towards a point of the picture (percent from its top left). None by default. */
  zoom?: { to: number; x: number; y: number };
}

export interface CeremonyShot {
  /** A story picture behind the lines; without one the ceremony's warm backdrop shows. */
  image?: StoryImage;
  lines: CeremonyLine[];
}

const IMAGES = '/assets/story/ceremony';
const panel = (name: string, zoom?: StoryImage['zoom']): StoryImage => ({ src: `${IMAGES}/${name}.webp`, fit: 'panel', zoom });
const OLD_PHOTO: StoryImage = { src: `${IMAGES}/old-photo.webp`, fit: 'contain' };

const TOP_CLASS_CEREMONIES: Record<number, CeremonyShot[]> = {
  // Multibillionaire: the workshop Old Ray and Dad never opened.
  6: [
    {
      image: panel('workshop'),
      lines: [
        { speaker: 'hero', face: 'happy', text: 'ceremony.c6.hero' },
        { speaker: 'riza', face: 'serious', text: 'ceremony.c6.riza' },
        { speaker: 'riza', face: 'laugh', text: 'ceremony.c6.riza2' },
      ],
    },
  ],
  // Richest Person Alive: the big windows Mom asked for (her message), and a cake on time this time.
  7: [
    {
      image: panel('mansion-cake', { to: 1.02, x: 51, y: 35 }),
      lines: [
        { speaker: 'hero', face: 'soft', text: 'ceremony.c7.hero' },
        { speaker: 'hero', face: 'happy', text: 'ceremony.c7.hero2' },
        { speaker: 'mom', face: 'tears', text: 'ceremony.c7.mom' },
      ],
    },
  ],
};

export const CEREMONIES: Record<number, CeremonyShot[]> = {
  // Day Laborer: the first warm meal; Old Ray hands over his old van (the hero's next home: every
  // class-up moves him one home up, core/state.ts applyClassUp) and sees someone in the hero's face.
  1: [
    {
      image: panel('soup'),
      lines: [
        { speaker: 'hero', face: 'soft', text: 'ceremony.c1.hero' },
        { speaker: 'mom', face: 'teary', phone: true, text: 'ceremony.c1.mom' },
        { speaker: 'riza', face: 'warm', text: 'ceremony.c1.van' },
        { speaker: 'riza', face: 'concerned', text: 'ceremony.c1.riza' },
      ],
    },
  ],
  // Working Class: the owner of a wallet Şans found comes to say thanks, with her granddaughter
  // (the hero's future wife, story §4c). Then a door that locks, and Mom remembers the notebook.
  2: [
    {
      image: panel('nevin-door'),
      lines: [
        { speaker: 'nevin', face: 'moved', text: 'ceremony.c2.nevin' },
        { speaker: 'defne', face: 'smile', text: 'ceremony.c2.defne' },
        { speaker: 'hero', face: 'soft', text: 'ceremony.c2.hero0' },
      ],
    },
    {
      lines: [
        { speaker: 'hero', face: 'happy', text: 'ceremony.c2.hero' },
        { speaker: 'mom', face: 'smile', phone: true, text: 'ceremony.c2.mom' },
      ],
    },
  ],
  // Middle Class (end of the first session): the old house comes back, the promise from the bus
  // station is kept and the prologue's birthday cake finally arrives (Mom is there, not on the phone);
  // the notebook hides a photo. The question stays open until the next session on purpose (story §4).
  3: [
    {
      lines: [
        { speaker: 'hero', face: 'soft', text: 'ceremony.c3.hero' },
        { speaker: 'mom', face: 'tears', text: 'ceremony.c3.mom' },
        { speaker: 'hero', face: 'happy', text: 'ceremony.c3.hero2' },
        { speaker: 'mom', face: 'tears', text: 'ceremony.c3.mom2' },
      ],
    },
    { image: panel('attic', { to: 1.02, x: 50, y: 39 }), lines: [{ text: 'ceremony.c3.attic' }, { text: 'ceremony.c3.attic2' }] },
    { image: OLD_PHOTO, lines: [{ speaker: 'hero', face: 'worried', text: 'ceremony.c3.photo' }] },
  ],
  // Millionaire (the return session): two chairs in the garden; Old Ray recognises the photo.
  4: [
    {
      lines: [
        { speaker: 'hero', face: 'happy', text: 'ceremony.c4.hero' },
        { speaker: 'mom', face: 'smile', phone: true, text: 'ceremony.c4.mom' },
      ],
    },
    {
      // The photo's face is turned to Old Ray; the player sees it in the memory bubble by his head.
      image: panel('riza-garden'),
      lines: [
        { speaker: 'riza', face: 'concerned', text: 'ceremony.c4.riza' },
        { speaker: 'riza', face: 'serious', text: 'ceremony.c4.riza2' },
        // Where the hero's watch comes from: the heirloom the hand-over gives the heir.
        { speaker: 'riza', face: 'warm', text: 'ceremony.c4.watch' },
      ],
    },
  ],
  // Billionaire: Mr. Bryce retires and sells; the hero keeps everyone, Bryce included (he comes as the
  // Hotel Chain's manager when the ceremony's class is reached, businesses.ts CLASS_MANAGER_GIFT), and
  // the firing from the prologue becomes the new house rule. No ages are said (story §6).
  5: [
    {
      image: panel('restaurant'),
      lines: [
        // The sale, said here: Mom's message about it never reached a fast player.
        { text: 'ceremony.c5.sale' },
        { speaker: 'staff', text: 'ceremony.c5.staff' },
        { speaker: 'hero', face: 'determined', text: 'ceremony.c5.hero' },
        { speaker: 'bryce', face: 'shocked', text: 'ceremony.c5.bryce' },
        { speaker: 'hero', face: 'soft', text: 'ceremony.c5.hero2' },
        { speaker: 'hero', face: 'happy', text: 'ceremony.c5.hero3' },
      ],
    },
  ],
  // The two top classes tell their story with the grandchild (config/content.ts topClassStory).
  ...(CONTENT.topClassStory ? TOP_CLASS_CEREMONIES : {}),
};

/** The shots with the lines this story so far allows (`when`). */
export function shotsFor(shots: CeremonyShot[], lifeSeen: string[]): CeremonyShot[] {
  return shots.map((shot) => ({ ...shot, lines: shot.lines.filter((line) => !line.when || lifeSeen.includes(line.when)) }));
}

/** The hero's portraits by outfit (index = OUTFITS), then the grandfather's (GRANDPA_LOOK). */
const HERO_PORTRAITS = ['hero', 'hero-work', 'hero-smart', 'hero-coat', 'hero-suit', 'hero-threepiece', 'hero-tux', 'grandpa'];

/** Pass as `heroOutfit` for a moment after 60: the hero speaks with the grandfather's face. */
export const GRANDPA_LOOK = HERO_PORTRAITS.indexOf('grandpa');

const PORTRAIT_SET: Partial<Record<CastId, string>> = { bryce: 'bulent', defneOld: 'defne-old', adaChild: 'ada-child' };

/**
 * The outfit the hero wears in each class's ceremony: the one its story frames were drawn with. The
 * coat, three-piece and tuxedo came later (2026-10-14), so those ceremonies keep smart casual and the
 * suit; the class's new outfit shows on the scene once the ceremony ends.
 */
const CEREMONY_OUTFITS = [
  'outfit-hoodie',
  'outfit-hoodie',
  'outfit-work',
  'outfit-smart',
  'outfit-smart',
  'outfit-suit',
  'outfit-suit',
  'outfit-suit',
].map(outfitIndex);

export const ceremonyOutfit = (classIndex: number) =>
  CEREMONY_OUTFITS[Math.min(Math.max(classIndex, 0), CEREMONY_OUTFITS.length - 1)];

/**
 * Cast without portraits (staff) speak with a name tag only. `heroOutfit` picks the hero's set, so
 * his face in the bubble wears what he wears in the picture behind it.
 */
export function portraitOf(speaker: CastId, face: string | undefined, heroOutfit = 0): string | null {
  if (!(speaker in FACES) || !face) return null;
  const set = speaker === 'hero' ? HERO_PORTRAITS[Math.min(Math.max(heroOutfit, 0), HERO_PORTRAITS.length - 1)] : (PORTRAIT_SET[speaker] ?? speaker);
  return `/assets/story/portraits/${set}-${face}.webp`;
}

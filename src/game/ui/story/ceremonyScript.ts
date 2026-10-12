import type { MessageKey } from '../../i18n/translate';

// Class-up ceremonies (story-v2.md §4, plan 1.10): after the "new class" title, a few short story
// beats in visual-novel style (portrait + bubble), then the before/now card. Each ceremony answers
// what the one before planted, and some plant the next. Index = wealth class (WEALTH_CLASSES).

export type CastId = 'hero' | 'mom' | 'riza' | 'bryce' | 'staff' | 'nevin' | 'defne';

export const FACES = {
  hero: ['worried', 'soft', 'determined', 'happy'],
  mom: ['worried', 'teary', 'smile', 'tears'],
  riza: ['warm', 'concerned', 'serious', 'laugh'],
  bryce: ['angry', 'smug', 'sly', 'shocked'],
  nevin: ['smile', 'moved', 'surprised', 'laugh'],
  defne: ['smile', 'shy', 'surprised', 'laugh'],
} as const;

type Face<C extends CastId> = C extends keyof typeof FACES ? (typeof FACES)[C][number] : never;

export type CeremonyLine =
  | { [C in CastId]: { speaker: C; face?: Face<C>; phone?: boolean; text: MessageKey } }[CastId]
  /** Narration: no speaker, centered caption. */
  | { speaker?: undefined; text: MessageKey };

export interface CeremonyShot {
  /** A story picture behind the lines; without one the ceremony's warm backdrop shows. */
  image?: { src: string; fit: 'cover' | 'contain' };
  lines: CeremonyLine[];
}

const IMAGES = '/assets/story/ceremony';
const ATTIC = { src: `${IMAGES}/attic.webp`, fit: 'cover' } as const;
const OLD_PHOTO = { src: `${IMAGES}/old-photo.webp`, fit: 'contain' } as const;

export const CEREMONIES: Record<number, CeremonyShot[]> = {
  // Day Laborer: the first warm meal; Old Ray hands over his old van (the hero's next home,
  // housing.ts CLASS_HOME_FLOOR) and sees someone in the hero's face.
  1: [
    {
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
  // Middle Class (end of the first session): the old house comes back, and the notebook hides a photo.
  // The question stays open until the next session on purpose (story §4, hook chain).
  3: [
    {
      lines: [
        { speaker: 'hero', face: 'soft', text: 'ceremony.c3.hero' },
        { speaker: 'mom', face: 'tears', phone: true, text: 'ceremony.c3.mom' },
      ],
    },
    { image: ATTIC, lines: [{ text: 'ceremony.c3.attic' }, { text: 'ceremony.c3.attic2' }] },
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
      image: OLD_PHOTO,
      lines: [
        { speaker: 'riza', face: 'concerned', text: 'ceremony.c4.riza' },
        { speaker: 'riza', face: 'serious', text: 'ceremony.c4.riza2' },
      ],
    },
  ],
  // Billionaire: the hero buys Mr. Bryce's company and keeps everyone, Bryce included.
  5: [
    {
      lines: [
        { speaker: 'staff', text: 'ceremony.c5.staff' },
        { speaker: 'hero', face: 'determined', text: 'ceremony.c5.hero' },
        { speaker: 'bryce', face: 'shocked', text: 'ceremony.c5.bryce' },
        { speaker: 'hero', face: 'soft', text: 'ceremony.c5.hero2' },
        { speaker: 'hero', face: 'happy', text: 'ceremony.c5.hero3' },
      ],
    },
  ],
  // Multibillionaire: the workshop Old Ray and Dad never opened.
  6: [
    {
      lines: [
        { speaker: 'hero', face: 'happy', text: 'ceremony.c6.hero' },
        { speaker: 'riza', face: 'serious', text: 'ceremony.c6.riza' },
        { speaker: 'riza', face: 'laugh', text: 'ceremony.c6.riza2' },
      ],
    },
  ],
  // Richest Person Alive: the promise from the bus station, and the birthday cake from the prologue.
  7: [
    {
      lines: [
        { speaker: 'hero', face: 'soft', text: 'ceremony.c7.hero' },
        { speaker: 'hero', face: 'happy', text: 'ceremony.c7.hero2' },
        { speaker: 'mom', face: 'tears', text: 'ceremony.c7.mom' },
      ],
    },
  ],
};

/** Cast without portraits (staff) speak with a name tag only. */
export function portraitOf(speaker: CastId, face: string | undefined): string | null {
  if (!(speaker in FACES) || !face) return null;
  return `/assets/story/portraits/${speaker === 'bryce' ? 'bulent' : speaker}-${face}.webp`;
}

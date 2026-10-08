import type { MessageKey } from '../../i18n/translate';

// Prologue script (story-v2.md §4): comic panels, each with one or more short lines.
// A line with no speaker is narration. Positions are fractions of the 9:16 panel image.

export type Speaker = 'hero' | 'mom' | 'boss';

export interface StoryLine {
  speaker?: Speaker;
  /** The speaker is heard over the phone. */
  phone?: boolean;
  text: MessageKey;
}

export interface StoryPanel {
  image: string;
  /** Bottom edge of the speech bubble: just above the speakers' heads, so faces stay clear. */
  bubbleY: number;
  /** Horizontal position of each speaker's head; the bubble's tail points there. */
  speakers: Partial<Record<Speaker, number>>;
  lines: StoryLine[];
}

const IMAGE_DIR = '/assets/story/prologue';

export const PROLOGUE: StoryPanel[] = [
  {
    image: `${IMAGE_DIR}/prologue-1-restaurant.webp`,
    bubbleY: 0.17,
    speakers: { hero: 0.53 },
    lines: [{ speaker: 'hero', text: 'prologue.restaurant' }],
  },
  {
    image: `${IMAGE_DIR}/prologue-2-phone.webp`,
    bubbleY: 0.29,
    speakers: { hero: 0.52, mom: 0.45 },
    lines: [
      { speaker: 'hero', text: 'prologue.phoneHero' },
      { speaker: 'mom', phone: true, text: 'prologue.phoneMom' },
    ],
  },
  {
    image: `${IMAGE_DIR}/prologue-3-fired.webp`,
    bubbleY: 0.27,
    speakers: { hero: 0.31, boss: 0.55 },
    lines: [
      { speaker: 'boss', text: 'prologue.firedBoss' },
      { speaker: 'hero', text: 'prologue.firedHero' },
      { speaker: 'boss', text: 'prologue.firedBoss2' },
    ],
  },
  {
    image: `${IMAGE_DIR}/prologue-4-door.webp`,
    bubbleY: 0.32,
    speakers: { mom: 0.42, hero: 0.64 },
    lines: [
      { speaker: 'mom', text: 'prologue.doorMom' },
      { speaker: 'hero', text: 'prologue.doorHero' },
      { speaker: 'mom', text: 'prologue.doorMom2' },
    ],
  },
  {
    image: `${IMAGE_DIR}/prologue-5-bus.webp`,
    bubbleY: 0.345,
    speakers: { mom: 0.45, hero: 0.57 },
    lines: [
      { speaker: 'mom', text: 'prologue.busMom' },
      { speaker: 'hero', text: 'prologue.busHero' },
    ],
  },
  {
    image: `${IMAGE_DIR}/prologue-6-alley.webp`,
    bubbleY: 0.36,
    speakers: {},
    lines: [{ text: 'prologue.alley' }, { text: 'prologue.alley2' }],
  },
];

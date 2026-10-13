import type { LifeMomentId } from '../../runtime/story';
import type { CeremonyShot, StoryImage } from './ceremonyScript';

// Life moments (story-v2.md §4c): the hero's life told by age, each a single beat of a few lines.
// Each has its own picture (art/pilot/10-life/).

const IMAGES = '/assets/story/life';
const picture = (name: string): StoryImage => ({ src: `${IMAGES}/${name}.webp`, fit: 'panel' });

/** What the hero wears in each picture (index = OUTFITS); his portrait in the bubble follows it. */
export const LIFE_OUTFIT: Record<LifeMomentId, number> = { date: 2, wedding: 3, birth: 2 };

export const LIFE_SCRIPT: Record<LifeMomentId, CeremonyShot[]> = {
  // The cookies from the Working Class ceremony come back, and so does Şans, who started it all.
  // The opening caption carries the years since they met, for a player Mom's message never reached.
  date: [
    {
      image: picture('date'),
      lines: [
        { text: 'moments.date.cookies' },
        { speaker: 'defne', face: 'shy', text: 'moments.date.defne' },
        { speaker: 'hero', face: 'happy', text: 'moments.date.hero' },
        { speaker: 'defne', face: 'laugh', text: 'moments.date.defne2' },
      ],
    },
  ],
  // Under the plum tree of the old house; Mom's two garden chairs are no longer enough.
  wedding: [
    {
      image: picture('wedding'),
      lines: [
        { text: 'moments.wedding.tree' },
        { speaker: 'riza', face: 'concerned', text: 'moments.wedding.riza' },
        { speaker: 'riza', face: 'laugh', text: 'moments.wedding.riza2' },
        { speaker: 'mom', face: 'tears', text: 'moments.wedding.mom' },
      ],
    },
  ],
  // Mom's "you're all I need" from the prologue, now in the hero's mouth. The player names her next.
  birth: [
    {
      image: picture('birth'),
      lines: [
        { speaker: 'hero', face: 'happy', text: 'moments.birth.hero' },
        { speaker: 'mom', face: 'tears', phone: true, text: 'moments.birth.mom' },
        { speaker: 'hero', face: 'soft', text: 'moments.birth.hero2' },
      ],
    },
  ],
};

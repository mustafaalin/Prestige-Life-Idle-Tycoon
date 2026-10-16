import { outfitIndex } from '../../core/config/lifestyle';
import type { LifeMomentId } from '../../runtime/story';
import { GRANDPA_LOOK, type CeremonyShot, type StoryImage } from './ceremonyScript';

// Life moments (story-v2.md §4c): the hero's life told by age, each a single beat of a few lines,
// and the first ride of each luxury, where the family gets to use it. Each has its own picture
// (art/pilot/10-life/).

const IMAGES = '/assets/story/life';
/** Frames still being drawn (docs/art-prompts-dynasty.md S1–S3): the moment plays over the dimmed scene until then. */
const PANELS_TO_COME = new Set(['grandchild', 'grandpa', 'handover']);
const picture = (name: string): StoryImage | undefined =>
  PANELS_TO_COME.has(name) ? undefined : { src: `${IMAGES}/${name}.webp`, fit: 'panel' };

/** What the hero wears in each picture (index = OUTFITS); his portrait in the bubble follows it. */
const SMART = outfitIndex('outfit-smart');
const SUIT = outfitIndex('outfit-suit');
export const LIFE_OUTFIT: Record<LifeMomentId, number> = {
  date: SMART,
  wedding: SUIT,
  birth: SMART,
  boat: SUIT,
  yacht: SUIT,
  heli: SUIT,
  jet: SUIT,
  grandchild: GRANDPA_LOOK,
  grandpa: GRANDPA_LOOK,
  handover: GRANDPA_LOOK,
};

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
  // The father's promise to take Mom to the sea; a lake counts, and the sea is next (the yacht).
  boat: [
    {
      image: picture('boat'),
      lines: [
        { text: 'moments.boat.never' },
        { speaker: 'mom', face: 'worried', text: 'moments.boat.mom' },
        { speaker: 'mom', face: 'teary', text: 'moments.boat.mom2' },
        { speaker: 'hero', face: 'soft', text: 'moments.boat.hero' },
      ],
    },
  ],
  // The sea the boat promised, on Old Ray's birthday; he and Mom both think of Mehmet.
  yacht: [
    {
      image: picture('yacht'),
      lines: [
        { text: 'moments.yacht.surprise' },
        { speaker: 'riza', face: 'concerned', text: 'moments.yacht.riza' },
        { speaker: 'mom', face: 'smile', text: 'moments.yacht.mom' },
        { speaker: 'riza', face: 'laugh', text: 'moments.yacht.riza2' },
      ],
    },
  ],
  // Over the old alley: the tent's corner and Old Ray's stand. The prologue's rain, answered.
  heli: [
    {
      image: picture('heli'),
      lines: [
        { text: 'moments.heli.city' },
        { speaker: 'hero', face: 'soft', text: 'moments.heli.hero' },
        { speaker: 'defne', face: 'laugh', text: 'moments.heli.defne' },
        { speaker: 'hero', face: 'happy', text: 'moments.heli.hero2' },
      ],
    },
  ],
  // Everyone on board, to Mom's hometown: the aunt she stayed with after the prologue.
  jet: [
    {
      image: picture('jet'),
      lines: [
        { text: 'moments.jet.window' },
        { speaker: 'nevin', face: 'laugh', text: 'moments.jet.nevin' },
        { speaker: 'riza', face: 'warm', text: 'moments.jet.riza' },
        { speaker: 'hero', face: 'soft', text: 'moments.jet.hero' },
        { speaker: 'mom', face: 'tears', text: 'moments.jet.mom' },
      ],
    },
  ],
  // The birth room again, thirty-two years on: the plum jam, and now his daughter holds the baby.
  // The player names her next (the heir).
  grandchild: [
    {
      image: picture('grandchild'),
      lines: [
        { text: 'moments.grandchild.room' },
        { speaker: 'elif', face: 'teary', text: 'moments.grandchild.elif' },
        { speaker: 'hero', face: 'soft', text: 'moments.grandchild.hero' },
        { speaker: 'defneOld', face: 'laugh', text: 'moments.grandchild.defne' },
      ],
    },
  ],
  // The flower stand of his first job; Old Ray's first lesson ("set out the flowers"), now his to give.
  // Ada is seven: no portrait, a name tag only.
  grandpa: [
    {
      image: picture('grandpa'),
      lines: [
        { text: 'moments.grandpa.corner' },
        { speaker: 'ada', text: 'moments.grandpa.ada' },
        { speaker: 'hero', face: 'happy', text: 'moments.grandpa.hero' },
        { speaker: 'hero', face: 'soft', text: 'moments.grandpa.hero2' },
      ],
    },
  ],
  // The bus station of the prologue: he gives Ada his father's watch (the first heirloom) and sends
  // her off to rise under her own name. The retirement panel follows.
  handover: [
    {
      image: picture('handover'),
      lines: [
        { text: 'moments.handover.platform' },
        { speaker: 'ada', face: 'determined', text: 'moments.handover.ada' },
        { speaker: 'hero', face: 'soft', text: 'moments.handover.hero' },
        { speaker: 'hero', face: 'determined', text: 'moments.handover.hero2' },
        { speaker: 'ada', face: 'laugh', text: 'moments.handover.ada2' },
        { speaker: 'hero', face: 'happy', text: 'moments.handover.hero3' },
      ],
    },
  ],
};

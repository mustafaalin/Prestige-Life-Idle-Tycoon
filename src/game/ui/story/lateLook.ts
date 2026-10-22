import { GRANDPA_AGE } from '../../core/config/life';
import { heroAge } from '../../core/formulas';
import type { GameStateV2 } from '../../core/types';
import type { LateKey, LifeMomentId, StoryProgress } from '../../runtime/story';
import type { AlbumEntry } from './album';
import { CEREMONIES, GRANDPA_LOOK, type CeremonyLine, type CeremonyShot, type StoryImage } from './ceremonyScript';
import { LIFE_SCRIPT } from './lifeScript';

// Story beats that can play after the hero turns 60 (2026-10-23): the Billionaire ceremony (~67 for an
// engaged player) and the luxury moments (the jet comes ~70, it is the Chair of the Board's condition).
// Their frames were drawn with the young hero while the scene already shows a grandfather, so each has a
// grandfather version, told with his old face and Defne's older one. On the yacht Old Ray is gone
// (story-v2.md §6): the birthday at sea becomes Mom's. A version plays only once its frame is in place
// (LATE_READY; prompts in docs/art-prompts-v2.md §0), and the album shows the version that was seen.

/** Keys whose `-old` frame is in public/assets/story/ (all five since 2026-10-23). */
const LATE_READY = new Set<LateKey>(['c5', 'boat', 'yacht', 'heli', 'jet']);

const frame = (folder: 'ceremony' | 'life', name: string): StoryImage => ({
  src: `/assets/story/${folder}/${name}-old.webp`,
  fit: 'panel',
});

/** The shots again with a new frame, and Defne with her older face. */
function aged(shots: CeremonyShot[], image: StoryImage): CeremonyShot[] {
  return shots.map((shot, index) => ({
    image: index === 0 ? image : shot.image,
    lines: shot.lines.map((line) => (line.speaker === 'defne' ? ({ ...line, speaker: 'defneOld' } as CeremonyLine) : line)),
  }));
}

const LATE_SHOTS: Record<LateKey, CeremonyShot[]> = {
  c5: aged(CEREMONIES[5], frame('ceremony', 'restaurant')),
  boat: aged(LIFE_SCRIPT.boat, frame('life', 'boat')),
  yacht: [
    {
      image: frame('life', 'yacht'),
      lines: [
        { text: 'moments.yacht.surpriseLate' },
        { speaker: 'mom', face: 'tears', text: 'moments.yacht.momLate' },
        { speaker: 'defneOld', face: 'laugh', text: 'moments.yacht.defneLate' },
        { speaker: 'hero', face: 'soft', text: 'moments.yacht.heroLate' },
      ],
    },
  ],
  heli: aged(LIFE_SCRIPT.heli, frame('life', 'heli')),
  jet: aged(LIFE_SCRIPT.jet, frame('life', 'jet')),
};

export function lateKeyOfCeremony(classIndex: number): LateKey | null {
  return classIndex === 5 ? 'c5' : null;
}

export function lateKeyOfLife(id: LifeMomentId): LateKey | null {
  return id === 'boat' || id === 'yacht' || id === 'heli' || id === 'jet' ? id : null;
}

export function lateKeyOfEntry(entry: AlbumEntry): LateKey | null {
  return entry.kind === 'ceremony' ? lateKeyOfCeremony(entry.classIndex) : lateKeyOfLife(entry.id);
}

/** The beat plays in its grandfather version now: its frame is ready and the hero is 60 or older. */
export function playsLate(key: LateKey | null, game: GameStateV2): key is LateKey {
  return key !== null && LATE_READY.has(key) && game.generation === 1 && heroAge(game).years >= GRANDPA_AGE;
}

/** A replay (album) shows the version the player saw. */
export function seenLate(key: LateKey | null, story: StoryProgress): key is LateKey {
  return key !== null && LATE_READY.has(key) && story.lateSeen.includes(key);
}

/** The shots and the hero's look for a beat, in its grandfather version or as written. */
export function lateVersion(key: LateKey | null, late: boolean, shots: CeremonyShot[], heroOutfit: number) {
  return late && key !== null ? { shots: LATE_SHOTS[key], heroOutfit: GRANDPA_LOOK } : { shots, heroOutfit };
}

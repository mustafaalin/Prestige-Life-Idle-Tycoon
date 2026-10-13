import { LIFE_MOMENTS, type LifeMomentId, type StoryProgress } from '../../runtime/story';
import { CEREMONIES, portraitOf, type CeremonyShot } from './ceremonyScript';
import { LIFE_SCRIPT } from './lifeScript';

// The family album (story-v2.md §7): the class ceremonies and life moments the player has seen, in
// the order the story tells them. It only reads the story progress; watching one again changes nothing.

export type AlbumEntry = { kind: 'ceremony'; classIndex: number } | { kind: 'life'; id: LifeMomentId };

const ceremony = (classIndex: number): AlbumEntry => ({ kind: 'ceremony', classIndex });
const life = (id: LifeMomentId): AlbumEntry => ({ kind: 'life', id });

/** Each life moment sits after the ceremony it builds on (LIFE_MOMENTS `afterCeremony`). */
export const ALBUM: AlbumEntry[] = [
  ceremony(1),
  ceremony(2),
  life('date'),
  ceremony(3),
  life('wedding'),
  life('birth'),
  ceremony(4),
  ceremony(5),
  ceremony(6),
  ceremony(7),
];

export function albumKey(entry: AlbumEntry) {
  return entry.kind === 'ceremony' ? `c${entry.classIndex}` : entry.id;
}

export function albumSeen(entry: AlbumEntry, story: StoryProgress) {
  return entry.kind === 'ceremony' ? story.ceremonySeen >= entry.classIndex : story.lifeSeen.includes(entry.id);
}

export function albumShots(entry: AlbumEntry): CeremonyShot[] {
  return entry.kind === 'ceremony' ? (CEREMONIES[entry.classIndex] ?? []) : LIFE_SCRIPT[entry.id];
}

/** The age a life moment plays at. */
export function albumAge(entry: Extract<AlbumEntry, { kind: 'life' }>) {
  return LIFE_MOMENTS.find((moment) => moment.id === entry.id)?.age ?? 0;
}

/**
 * The picture on the album page: the moment's own story frame, or, for a moment told with portraits
 * only, the face of the last one to speak.
 */
export function albumCover(entry: AlbumEntry): { src: string; portrait: boolean } | null {
  const shots = albumShots(entry);
  const frame = shots.find((shot) => shot.image?.fit === 'panel')?.image;
  if (frame) return { src: frame.src, portrait: false };
  const spoken = shots.flatMap((shot) => shot.lines).filter((line) => line.speaker !== undefined);
  const last = spoken[spoken.length - 1];
  const src = last ? portraitOf(last.speaker, last.face) : null;
  return src ? { src, portrait: true } : null;
}

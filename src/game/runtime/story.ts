import type { GameStateV2 } from '../core/types';

// Story progress (story-v2.md §4): which class-up ceremonies the player has seen and which of Mom's
// messages arrived. Pure functions; the store saves it next to the game state. Not part of the
// economy core, so the simulator never sees it.

export interface StoryProgress {
  /** Highest wealth class whose ceremony was shown (0 = none yet; the street has no ceremony). */
  ceremonySeen: number;
  /** Ids of Mom's messages already shown. */
  momSeen: string[];
  /** When the last message from Mom was shown (ms; 0 = never). */
  momShownAt: number;
  /** The notification permission was asked once (after the first ceremony). */
  notificationsAsked: boolean;
}

export interface MomMessageDef {
  id: string;
  /** The message belongs to this class: it only shows while this is the player's class. */
  classIndex: number;
}

/**
 * Mom's messages, in the order they arrive (text in i18n `mom.<id>`). Three of them plant the next
 * ceremony (Bryce's sale, the workshop, the big windows); one keeps Defne in the story. A class's
 * messages that were not shown before the player moved on are skipped, so Mom never talks about a
 * step that is long past.
 */
export const MOM_MESSAGES: MomMessageDef[] = [
  { id: 'aunt', classIndex: 1 },
  { id: 'curtains', classIndex: 2 },
  { id: 'stair', classIndex: 3 },
  { id: 'bryce', classIndex: 4 },
  { id: 'defne', classIndex: 4 },
  { id: 'clipping', classIndex: 4 },
  { id: 'job', classIndex: 5 },
  { id: 'workshop', classIndex: 5 },
  { id: 'jam', classIndex: 5 },
  { id: 'windows', classIndex: 6 },
  { id: 'chair', classIndex: 6 },
];

/** Mom writes at most once a day... */
export const MOM_MIN_GAP_MS = 20 * 60 * 60 * 1000;
/** ...and only when the player comes back after a real break, never in the middle of a session. */
export const MOM_MIN_AWAY_SECONDS = 60 * 60;

export function createStoryProgress(classIndex = 0): StoryProgress {
  return { ceremonySeen: classIndex, momSeen: [], momShownAt: 0, notificationsAsked: false };
}

/** The story so far is the first generation's; the heir's story is Faz 2 (story §6). */
function storyRuns(game: GameStateV2) {
  return game.generation === 1;
}

/** The class the home scene shows: a new place is revealed by its ceremony, so it waits for it. */
export function sceneClass(game: GameStateV2, story: StoryProgress): number {
  return storyRuns(game) ? Math.min(game.classIndex, story.ceremonySeen) : game.classIndex;
}

/** The next class whose ceremony is waiting, or null. Several class-ups play one after another. */
export function pendingCeremony(game: GameStateV2, story: StoryProgress): number | null {
  if (!storyRuns(game) || story.ceremonySeen >= game.classIndex) return null;
  return story.ceremonySeen + 1;
}

/** The message Mom has for the current class that has not been shown yet. */
export function nextMomMessage(game: GameStateV2, story: StoryProgress): MomMessageDef | null {
  if (!storyRuns(game)) return null;
  return MOM_MESSAGES.find((message) => message.classIndex === game.classIndex && !story.momSeen.includes(message.id)) ?? null;
}

/** Mom's message for a player returning now after `awaySeconds`, or null. */
export function momMessageOnReturn(
  game: GameStateV2,
  story: StoryProgress,
  awaySeconds: number,
  now: number,
): MomMessageDef | null {
  if (awaySeconds < MOM_MIN_AWAY_SECONDS || now - story.momShownAt < MOM_MIN_GAP_MS) return null;
  return nextMomMessage(game, story);
}

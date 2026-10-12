import { heroAge } from '../core/formulas';
import type { GameStateV2 } from '../core/types';

// Story progress (story-v2.md §4): which class-up ceremonies and life moments the player has seen and
// which of Mom's messages arrived. Pure functions; the store saves it next to the game state. Not part of the
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
  /** The hero's name, asked after the first business (story §3); '' = not asked yet. */
  heroName: string;
  /** Ids of the life moments already shown (story §4c). */
  lifeSeen: string[];
  /** The daughter's name, asked after she is born; '' = not asked yet. */
  daughterName: string;
  /** Old Ray's guide (plan 1.12): steps whose line was shown, and steps finished by an action. */
  guideSeen: string[];
  guideDone: string[];
}

export interface MomMessageDef {
  id: string;
  /** The message belongs to this class: it only shows while this is the player's class. */
  classIndex: number;
  /**
   * A bridge to a life moment: it shows from its class on (not only in it) until that moment has
   * played, ahead of the class's own messages, so a fast player cannot outrun it.
   */
  untilMoment?: LifeMomentId;
}

/**
 * Mom's messages, in the order they arrive (text in i18n `mom.<id>`). Three of them plant the next
 * ceremony (Bryce's sale, the workshop, the big windows). A class's messages that were not shown
 * before the player moved on are skipped, so Mom never talks about a step that is long past. The
 * one about Defne is the exception: it bridges the years between meeting her and the first date.
 */
export const MOM_MESSAGES: MomMessageDef[] = [
  { id: 'aunt', classIndex: 1 },
  { id: 'curtains', classIndex: 2 },
  { id: 'stair', classIndex: 3 },
  { id: 'bryce', classIndex: 4 },
  { id: 'defne', classIndex: 2, untilMoment: 'date' },
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
  return {
    ceremonySeen: classIndex,
    momSeen: [],
    momShownAt: 0,
    notificationsAsked: false,
    heroName: '',
    lifeSeen: [],
    daughterName: '',
    guideSeen: [],
    guideDone: [],
  };
}

/** The longest name the hero can be given. */
export const HERO_NAME_MAX = 16;

/** The story so far is the first generation's; the heir's story is Faz 2 (story §6). */
export function storyRuns(game: GameStateV2) {
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

export type LifeMomentId = 'date' | 'wedding' | 'birth';

export interface LifeMomentDef {
  id: LifeMomentId;
  /** The hero's age (whole years) from which the moment plays. */
  age: number;
  /** The class ceremony that has to be seen first: the moment builds on what it showed. */
  afterCeremony: number;
}

/**
 * The hero's life, told by age (story §4c): class ceremonies follow money and crowd into the first
 * hours, age runs evenly through the whole life. In order; each one waits for the one before it.
 * The date needs Defne (Working Class ceremony), the wedding the old house's garden (Middle Class).
 */
export const LIFE_MOMENTS: LifeMomentDef[] = [
  { id: 'date', age: 25, afterCeremony: 2 },
  { id: 'wedding', age: 28, afterCeremony: 3 },
  { id: 'birth', age: 31, afterCeremony: 3 },
];

/** After a ceremony or a life moment the next life moment waits this long: one story beat at a time. */
export const LIFE_MOMENT_GAP_MS = 2 * 60 * 1000;

/** The life moment that is due now, or null. A waiting class ceremony always plays first. */
export function pendingLifeMoment(game: GameStateV2, story: StoryProgress): LifeMomentDef | null {
  if (!storyRuns(game) || pendingCeremony(game, story) !== null) return null;
  const next = LIFE_MOMENTS.find((moment) => !story.lifeSeen.includes(moment.id));
  if (!next || heroAge(game).years < next.age || story.ceremonySeen < next.afterCeremony) return null;
  return next;
}

/** She was born but the app closed before the player named her: the question is still open. */
export function daughterNeedsName(story: StoryProgress) {
  return story.lifeSeen.includes('birth') && !story.daughterName;
}

/** The message Mom has for the current class that has not been shown yet. */
export function nextMomMessage(game: GameStateV2, story: StoryProgress): MomMessageDef | null {
  if (!storyRuns(game)) return null;
  const unseen = MOM_MESSAGES.filter((message) => !story.momSeen.includes(message.id));
  const bridge = unseen.find(
    (message) =>
      message.untilMoment !== undefined &&
      story.ceremonySeen >= message.classIndex &&
      !story.lifeSeen.includes(message.untilMoment),
  );
  return bridge ?? unseen.find((message) => !message.untilMoment && message.classIndex === game.classIndex) ?? null;
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

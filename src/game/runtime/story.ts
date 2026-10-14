import { RICH_MILESTONES, type RichMilestoneDef } from '../core/config/richList';
import { heroAge, richListRank } from '../core/formulas';
import type { GameStateV2 } from '../core/types';

// Story progress (story-v2.md §4): which class-up ceremonies and life moments the player has seen and
// which of Mom's messages arrived. Pure functions; the store saves it next to the game state. Not part of the
// economy core; the simulator reads only LIFE_MOMENTS and storyRuns, for the gifts that close them.

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
  /** When the last event card was answered (ms; 0 = never): reopening the game does not bring the next call sooner. */
  eventAnsweredAt: number;
  /** Rich List cards already shown (discussion-notes §10). */
  richSeen: string[];
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
    eventAnsweredAt: 0,
    richSeen: [],
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

export type AgeMomentId = 'date' | 'wedding' | 'birth';
export type LuxuryMomentId = 'boat' | 'yacht' | 'heli' | 'jet';
export type LifeMomentId = AgeMomentId | LuxuryMomentId;

export interface LifeMomentDef {
  id: AgeMomentId;
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

/**
 * Luxury moments (story §4c, 2026-10-14): the first time a luxury is bought, the family gets to use it.
 * Luxuries are bought in order; when several are due at once (a long time away, or a save from before
 * these moments) the newest plays and the ones below it count as seen with it (they wait in the album).
 */
export const LUXURY_MOMENTS: { id: LuxuryMomentId; item: string }[] = [
  { id: 'boat', item: 'toy-1' },
  { id: 'yacht', item: 'toy-2' },
  { id: 'heli', item: 'toy-3' },
  { id: 'jet', item: 'toy-4' },
];

/** Every life moment id, for the save and the album. */
export const LIFE_MOMENT_IDS: LifeMomentId[] = [
  ...LIFE_MOMENTS.map((moment) => moment.id),
  ...LUXURY_MOMENTS.map((moment) => moment.id),
];

/** The luxury a moment belongs to, or null for a moment told by age. */
export function luxuryOf(id: LifeMomentId): string | null {
  return LUXURY_MOMENTS.find((moment) => moment.id === id)?.item ?? null;
}

/** The luxury moments below `id`, seen together with it. */
export function luxuryMomentsBelow(id: LifeMomentId): LuxuryMomentId[] {
  const index = LUXURY_MOMENTS.findIndex((moment) => moment.id === id);
  return index > 0 ? LUXURY_MOMENTS.slice(0, index).map((moment) => moment.id) : [];
}

/** After a ceremony or a life moment the next life moment waits this long: one story beat at a time. */
export const LIFE_MOMENT_GAP_MS = 2 * 60 * 1000;

/**
 * The life moment that is due now, or null. A waiting class ceremony always plays first; then the
 * moments told by age, then the newest luxury bought whose moment was not seen.
 */
export function pendingLifeMoment(game: GameStateV2, story: StoryProgress): { id: LifeMomentId } | null {
  if (!storyRuns(game) || pendingCeremony(game, story) !== null) return null;
  const next = LIFE_MOMENTS.find((moment) => !story.lifeSeen.includes(moment.id));
  if (next && heroAge(game).years >= next.age && story.ceremonySeen >= next.afterCeremony) return next;
  const owned = LUXURY_MOMENTS.filter((moment) => game.lifestyleOwned.includes(moment.item));
  const newest = owned[owned.length - 1];
  return newest && !story.lifeSeen.includes(newest.id) ? newest : null;
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

/** The Rich List opens with the Billionaire ceremony. */
export const RICH_LIST_CLASS = 5;

/**
 * The Rich List card due now, or null: the best place passed whose card was not shown. Places passed
 * together (a long time away) bring one card, the latest; the ones below it count as shown with it.
 * Ceremonies come first, and at #1 the Richest ceremony says it all.
 */
export function pendingRichMoment(game: GameStateV2, story: StoryProgress): RichMilestoneDef | null {
  if (!storyRuns(game) || pendingCeremony(game, story) !== null || story.ceremonySeen < RICH_LIST_CLASS) return null;
  const rank = richListRank(game.generationEarnings);
  if (rank === null || rank === 1) return null;
  const passed = RICH_MILESTONES.filter((milestone) => rank <= milestone.rank);
  const latest = passed[passed.length - 1];
  return latest && !story.richSeen.includes(latest.id) ? latest : null;
}

/** The ids a shown card settles: its own and every place below it. */
export function richMomentsUpTo(id: string): string[] {
  const index = RICH_MILESTONES.findIndex((milestone) => milestone.id === id);
  return RICH_MILESTONES.slice(0, index + 1).map((milestone) => milestone.id);
}

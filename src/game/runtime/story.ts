import { RICH_MILESTONES, type RichMilestoneDef } from '../core/config/richList';
import { awaitsHandover, heroAge, isLifeOver, richListRank } from '../core/formulas';
import { CONTENT } from '../core/config/content';
import { RETIREMENT_AGE } from '../core/config/life';
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
  /** The granddaughter's name (the heir), asked after she is born; '' = not asked yet. */
  grandchildName: string;
  /** Old Ray's guide (plan 1.12): steps whose line was shown, and steps finished by an action. */
  guideSeen: string[];
  guideDone: string[];
  /** When the last event card was answered (ms; 0 = never): reopening the game does not bring the next call sooner. */
  eventAnsweredAt: number;
  /** The event deck (runtime/eventDeck.ts): cards answered in this round, and today's calls (day key). */
  eventsHeard: string[];
  eventDay: string;
  eventsToday: number;
  /** Rich List cards already shown (discussion-notes §10). */
  richSeen: string[];
  /** The store's review dialog (runtime/review.ts): how many times it was asked for, and when last (ms; 0 = never). */
  reviewAsks: number;
  reviewAskedAt: number;
  /** The "grandchild's story is coming" card at 80 was shown (only while the hand-over is off). */
  sequelSeen: boolean;
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
  /** A message that answers a life moment: it shows once that moment has played, ahead of the class's own. */
  afterMoment?: LifeMomentId;
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
  // Mom's warning about Brad (story §6a), after the partnership and before it turns. Off with his story.
  ...(CONTENT.bradStory ? [{ id: 'partner', classIndex: 6, afterMoment: 'partner' as const, untilMoment: 'betrayal' as const }] : []),
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
    grandchildName: '',
    guideSeen: [],
    guideDone: [],
    eventAnsweredAt: 0,
    eventsHeard: [],
    eventDay: '',
    eventsToday: 0,
    richSeen: [],
    reviewAsks: 0,
    reviewAskedAt: 0,
    sequelSeen: false,
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

export type AgeMomentId = 'date' | 'wedding' | 'birth' | 'partner' | 'grandchild' | 'grandpa' | 'betrayal' | 'handover';
export type LuxuryMomentId = 'boat' | 'yacht' | 'heli' | 'jet';
export type LifeMomentId = AgeMomentId | LuxuryMomentId;

export interface LifeMomentDef {
  id: AgeMomentId;
  /** The hero's age (whole years) from which the moment plays. */
  age: number;
  /** The class ceremony that has to be seen first: the moment builds on what it showed. */
  afterCeremony: number;
  /** The moment closes with a gift (default). The betrayal and the hand-over do not. */
  gift?: boolean;
  /**
   * The moment steps aside if its ceremony is still unseen when the next moment's age comes, and it
   * still plays late for a save whose later moments came before it existed (the partnership, added
   * 2026-10-16), but never after the hand-over. Any other moment never plays after a later one.
   */
  optional?: boolean;
  /** The moment only plays after this one did. */
  needs?: AgeMomentId;
}

/**
 * The hero's life, told by age (story §4c): class ceremonies follow money and crowd into the first
 * hours, age runs evenly through the whole life. In order; each one waits for the one before it.
 * The date needs Defne (Working Class ceremony), the wedding the old house's garden (Middle Class).
 * The last three lead to the heir (story §6): the granddaughter is born, learns her first job, and at
 * the end of life the hero hands over; the retirement panel waits for them.
 */
const ALL_LIFE_MOMENTS: LifeMomentDef[] = [
  { id: 'date', age: 25, afterCeremony: 2 },
  { id: 'wedding', age: 28, afterCeremony: 3 },
  { id: 'birth', age: 31, afterCeremony: 3 },
  // Brad's line (story §6a): the partnership once the hero owns a group of companies, the betrayal
  // on the morning of the hand-over. The heir's story is getting it back.
  { id: 'partner', age: 45, afterCeremony: 6, optional: true },
  { id: 'grandchild', age: 63, afterCeremony: 3 },
  { id: 'grandpa', age: 70, afterCeremony: 3 },
  { id: 'betrayal', age: RETIREMENT_AGE, afterCeremony: 3, gift: false, needs: 'partner' },
  { id: 'handover', age: RETIREMENT_AGE, afterCeremony: 3, gift: false },
];

/** Moments that belong to switched-off content (config/content.ts): kept as saved ids, never played. */
const SWITCHED_OFF = new Set<AgeMomentId>([
  ...(CONTENT.bradStory ? [] : (['partner', 'betrayal'] as const)),
  ...(CONTENT.handover ? [] : (['handover'] as const)),
]);

export const LIFE_MOMENTS: LifeMomentDef[] = ALL_LIFE_MOMENTS.filter((moment) => !SWITCHED_OFF.has(moment.id));

/** The first age moment not seen that can still play (see `optional` and `needs`). */
function nextAgeMoment(game: GameStateV2, story: StoryProgress): LifeMomentDef | undefined {
  const age = heroAge(game).years;
  const seen = (id: string) => story.lifeSeen.includes(id);
  return LIFE_MOMENTS.find((moment, index) => {
    if (seen(moment.id)) return false;
    const later = LIFE_MOMENTS.slice(index + 1);
    if (moment.needs && !seen(moment.needs)) return false;
    if (moment.optional) {
      if (later.length === 0 || seen(later[later.length - 1].id)) return false;
      return story.ceremonySeen >= moment.afterCeremony || age < later[0].age;
    }
    return !later.some((entry) => seen(entry.id));
  });
}

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
  ...ALL_LIFE_MOMENTS.map((moment) => moment.id),
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
  const next = nextAgeMoment(game, story);
  if (next && heroAge(game).years >= next.age && story.ceremonySeen >= next.afterCeremony) return next;
  const owned = LUXURY_MOMENTS.filter((moment) => game.lifestyleOwned.includes(moment.item));
  const newest = owned[owned.length - 1];
  return newest && !story.lifeSeen.includes(newest.id) ? newest : null;
}

/** She was born but the app closed before the player named her: the question is still open. */
export function daughterNeedsName(story: StoryProgress) {
  return story.lifeSeen.includes('birth') && !story.daughterName;
}

/** The same for the granddaughter. */
export function grandchildNeedsName(story: StoryProgress) {
  return story.lifeSeen.includes('grandchild') && !story.grandchildName;
}

/** A name question is open (daughter or granddaughter). */
export function nameNeeded(story: StoryProgress) {
  return daughterNeedsName(story) || grandchildNeedsName(story);
}

/**
 * At the end of life the retirement panel waits while the story still has something to tell: a
 * ceremony, the last life moments (after "Hand over now" they play one after another) or a name.
 */
export function retirementWaits(game: GameStateV2, story: StoryProgress) {
  return (
    storyRuns(game) &&
    awaitsHandover(game) &&
    (pendingCeremony(game, story) !== null || pendingLifeMoment(game, story) !== null || nameNeeded(story))
  );
}

/** The message Mom has for the current class that has not been shown yet. */
export function nextMomMessage(game: GameStateV2, story: StoryProgress): MomMessageDef | null {
  if (!storyRuns(game)) return null;
  const unseen = MOM_MESSAGES.filter((message) => !story.momSeen.includes(message.id));
  const bound = (message: MomMessageDef) => message.untilMoment !== undefined || message.afterMoment !== undefined;
  const bridge = unseen.find(
    (message) =>
      bound(message) &&
      story.ceremonySeen >= message.classIndex &&
      (!message.afterMoment || story.lifeSeen.includes(message.afterMoment)) &&
      (!message.untilMoment || !story.lifeSeen.includes(message.untilMoment)),
  );
  return bridge ?? unseen.find((message) => !bound(message) && message.classIndex === game.classIndex) ?? null;
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

/**
 * At launch the hand-over is not in the game yet (config/content.ts): at 80 the hero stays, a card
 * says the grandchild's story is coming, once, and the game goes on.
 */
export function sequelDue(game: GameStateV2, story: StoryProgress) {
  return !CONTENT.handover && storyRuns(game) && isLifeOver(game) && !story.sequelSeen && pendingLifeMoment(game, story) === null;
}

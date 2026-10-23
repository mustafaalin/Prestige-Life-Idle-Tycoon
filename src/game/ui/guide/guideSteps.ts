import { useSyncExternalStore } from 'react';
import { BUSINESSES } from '../../core/config/businesses';
import { FIRST_JOB } from '../../core/config/careers';
import type { GameStateV2 } from '../../core/types';
import type { RuntimeState } from '../../runtime/engine';
import { storyRuns } from '../../runtime/story';
import type { TabId } from '../home/tabs';

// Old Ray's guide for the first minutes (plan 1.12, story-v2.md §3): bottles → claim the first goal →
// a job → the Flower Stand → the hero's name → the first run → Old Ray as manager. Each step is read
// from the game state, so a save that is past a step never sees it. Old Ray says one short line per
// step (the feeling); a pointing hand shows the action (story §2: a character is not a help text).
// The hand waits until the step can be done (enough cash), so it never points at a grey button.

export type GuideStepId = 'bottles' | 'claim' | 'job' | 'stand' | 'name' | 'run' | 'manager';

/** What the hand points at: a <Focusable> key, inside `tab` when it is set (the menu button first). */
export interface GuideTarget {
  tab?: TabId;
  key: string;
  /**
   * A feature's first look (FeatureIntro.tsx), not one of Old Ray's steps: the dimmed screen does not
   * hold the player, a tap on it closes the intro (Spotlight.tsx).
   */
  soft?: boolean;
}

export interface GuideStep {
  id: GuideStepId;
  /** Old Ray's line (i18n `guide.<id>`), if this step has one. */
  talks: boolean;
  /** The step can be done now; the hand shows (and a waiting line is spoken). */
  ready: boolean;
  target: GuideTarget | null;
}

const STAND = BUSINESSES[0];
/** Bottles before the first goal is done (quests.ts `collect-5`). */
const FIRST_BOTTLES = 5;
export const FIRST_QUEST = 'collect-5';

/** The step the player is on, or null when the guide is over (or for an heir, who knows the way). */
export function guideStep(state: RuntimeState): GuideStep | null {
  const { game, story } = state;
  if (!storyRuns(game)) return null;
  const stand = game.businesses[STAND.id];
  if (stand.managed) return null;

  const step = (id: GuideStepId, ready: boolean, target: GuideTarget | null, talks = true): GuideStep => ({
    id,
    talks,
    ready,
    target: ready ? target : null,
  });

  if (!game.questsDone.includes(FIRST_QUEST)) {
    return game.bottles < FIRST_BOTTLES
      ? step('bottles', true, { key: 'scene:item' })
      : step('claim', true, { key: `quest:${FIRST_QUEST}:claim` }, false);
  }
  if (game.careerId === null) {
    return step('job', true, { tab: 'career', key: `career:take:${FIRST_JOB.id}` });
  }
  if (stand.level === 0) {
    return step('stand', canAffordStand(game), { tab: 'businesses', key: `business:${STAND.id}:level` });
  }
  if (!story.heroName) return step('name', true, null);
  if (!story.guideDone.includes('run')) {
    return step('run', !state.cycles[STAND.id].running, { tab: 'businesses', key: `business:${STAND.id}:run` });
  }
  return step('manager', game.cash >= STAND.managerCost, { tab: 'businesses', key: `business:${STAND.id}:manager` });
}

function canAffordStand(game: GameStateV2) {
  return game.cash >= STAND.levels[0].cost;
}

/** Old Ray speaks right away on these steps, before they can be done (what to save up for). */
export const TALKS_EARLY: GuideStepId[] = ['job', 'stand', 'run'];

// The hand's target, shared with the screens: <Focusable>, the menu, the scene and the goal card.
// Old Ray's step and a feature's intro set it apart; the step wins (an intro only waits for the guide).

let guide: GuideTarget | null = null;
let intro: GuideTarget | null = null;
let current: GuideTarget | null = null;
const listeners = new Set<() => void>();

const same = (a: GuideTarget | null, b: GuideTarget | null) => a?.key === b?.key && a?.tab === b?.tab && a?.soft === b?.soft;

function update() {
  const next = guide ?? intro;
  if (same(current, next)) return;
  current = next;
  for (const listener of listeners) listener();
}

export function setGuideTarget(target: GuideTarget | null) {
  guide = target;
  update();
}

export function setIntroTarget(target: GuideTarget | null) {
  intro = target ? { ...target, soft: true } : null;
  update();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGuideTarget() {
  return useSyncExternalStore(subscribe, () => current);
}

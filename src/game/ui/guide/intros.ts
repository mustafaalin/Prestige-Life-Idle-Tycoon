import { availableCourses } from '../../core/formulas';
import { canBuyAnythingInShop } from '../../core/state';
import type { MessageKey } from '../../i18n/translate';
import type { RuntimeState } from '../../runtime/engine';
import { investTabOpen } from '../../runtime/investment';
import type { GuideTarget } from './guideSteps';

// A feature's first look (2026-10-23, user, after Idle Guy's onboarding): Old Ray's guide ends with the
// first manager, so the screens that open later get one line from someone the hero knows and the hand
// on their button, once. One row per feature; FeatureIntro.tsx plays them. Saved in story.guideSeen as
// `intro:<id>`, so a save keeps what it was shown.

export interface FeatureIntroDef {
  id: string;
  speaker: 'riza' | 'mom';
  face: string;
  /** i18n `intro.<id>`. */
  line: MessageKey;
  target: GuideTarget;
  /** The feature is open and still new to this player. */
  ready: (state: RuntimeState, albumStarted: boolean) => boolean;
}

export const FEATURE_INTROS: FeatureIntroDef[] = [
  {
    id: 'shop',
    speaker: 'mom',
    face: 'smile',
    line: 'intro.shop',
    target: { tab: 'shop', key: 'tab:shop' },
    ready: ({ game, story }) => story.ceremonySeen >= 1 && canBuyAnythingInShop(game),
  },
  {
    id: 'courses',
    speaker: 'riza',
    face: 'warm',
    line: 'intro.courses',
    target: { tab: 'career', key: 'tab:career' },
    ready: ({ game }) => game.coursesDone.length === 0 && game.course === null && availableCourses(game).some((course) => game.cash >= course.cost),
  },
  {
    id: 'invest',
    speaker: 'riza',
    face: 'laugh',
    line: 'intro.invest',
    target: { tab: 'invest', key: 'tab:invest' },
    ready: (state) => investTabOpen(state) && state.invest.made === 0,
  },
  {
    id: 'album',
    speaker: 'mom',
    face: 'smile',
    line: 'intro.album',
    target: { key: 'home:album' },
    ready: (_state, albumStarted) => albumStarted,
  },
];

export const introSeenId = (id: string) => `intro:${id}`;

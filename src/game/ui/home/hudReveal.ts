import type { RuntimeState } from '../../runtime/engine';
import { storyRuns } from '../../runtime/story';
import { FIRST_QUEST } from '../guide/guideSteps';

// The screen fills in as the first minutes go (2026-10-23, user, after Idle Guy's onboarding): at first
// only the money and the scene, so the eye goes to the bottles. Each part comes with the step that gives
// it a meaning, and never leaves again; everything is read from the save, so a save past a step shows it.
// Hidden parts keep their room (CSS `invisible`), so nothing jumps when they come. An heir sees it all.

export interface HudReveal {
  /** The income line under the money: with the first job or business. */
  income: boolean;
  /** Class, age and the bar to the next class: with the first ceremony (Day Laborer, ~4 minutes). */
  status: boolean;
  /** The bottom menu and the dreams board: once the first goal is claimed (the guide's next step is the Career tab). */
  menu: boolean;
  /** The hero's face (the profile): once he has a name. */
  avatar: boolean;
}

export function hudReveal({ game, story }: RuntimeState): HudReveal {
  if (!storyRuns(game)) return { income: true, status: true, menu: true, avatar: true };
  return {
    income: game.careerId !== null || Object.values(game.businesses).some((business) => business.level > 0),
    status: story.ceremonySeen >= 1,
    menu: game.questsDone.includes(FIRST_QUEST),
    avatar: story.heroName !== '',
  };
}

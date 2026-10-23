import { OUTFITS } from '../../core/config/lifestyle';
import { GRANDPA_AGE } from '../../core/config/life';
import { heroAge } from '../../core/formulas';
import { bestOwnedLifestyle } from '../../core/state';
import type { GameStateV2 } from '../../core/types';
import { GRANDPA_LOOK, portraitOf } from '../story/ceremonyScript';

/** The hero's face as the scene shows him now: the best outfit he owns, or the grandfather after 60. */
export function heroPortrait(game: GameStateV2, face: 'happy' | 'soft' = 'happy') {
  const grandpa = game.generation === 1 && heroAge(game).years >= GRANDPA_AGE;
  const outfit = OUTFITS.findIndex((item) => item.id === bestOwnedLifestyle(game, 'outfit')?.id);
  return portraitOf('hero', face, grandpa ? GRANDPA_LOOK : Math.max(outfit, 0)) ?? '';
}

import { WEALTH_CLASSES } from '../../core/config/classes';
import { HEIRLOOMS } from '../../core/config/heirlooms';
import { heirloomCap, heirloomLevel, heirloomPrice, legacyAvailable } from '../../core/formulas';
import type { GameStateV2 } from '../../core/types';

// When the family tab (FamilyScreen) is open and when it asks for a look.

/** The tab opens with the top class (the hand-over choice), or once the family has legacy points. */
export function familyTabOpen(game: GameStateV2) {
  return game.classIndex === WEALTH_CLASSES.length - 1 || game.generation > 1 || game.legacyPoints > 0;
}

/** Something to do there: a heirloom level the points can buy. */
export function familyAttention(game: GameStateV2) {
  const available = legacyAvailable(game);
  return HEIRLOOMS.some((def) => {
    const level = heirloomLevel(game, def.id);
    return level < heirloomCap(def, game.generation) && heirloomPrice(def, level) <= available;
  });
}

import { COIN_RAIN_SECONDS } from '../../core/config/ads';
import type { GameStateV2 } from '../../core/types';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { classLook, type ItemKind } from './stages';

// The ad shower pours whatever lies on the ground in this class (2026-10-23, user: it said "coin shower"
// over bottles, and players looked for coins): bottles and cans on the street, coins from Working Class.
// One place for its name, picture and words, so the scene button, its card, the Store tile and the
// countdown always agree.

const PICTURE: Record<ItemKind, string> = {
  bottles: '/assets/scene/bottle-green.webp',
  coins: '/assets/scene/coin-pile.webp',
};

export const rainKind = (game: GameStateV2): ItemKind => classLook(game.classIndex).itemKind;

export function useRainLook() {
  const { game } = useGameV2();
  const { t, duration } = useT();
  const kind = rainKind(game);
  return {
    image: PICTURE[kind],
    title: t(`ads.rain.${kind}.title`),
    body: t(`ads.rain.${kind}.body`, { duration: duration(COIN_RAIN_SECONDS) }),
    /** Under the countdown: what to tap. */
    tap: t(`ads.rain.${kind}.tap`),
  };
}

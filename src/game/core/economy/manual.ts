import { BOTTLE_VALUE_BY_CLASS, COLLECT_END_CLASS, FETCH_BOTTLES, FETCH_EARLY_MAX_SECONDS, FETCH_EARLY_MIN_SECONDS, FETCH_INCOME_SECONDS, FETCH_MAX_SECONDS, FETCH_MIN_SECONDS } from '../config/scene';
import type { GameStateV2 } from '../types';
import { incomePerSecond } from './income';
import { heirloomEffect, legacyMultiplier } from './legacy';

// Money the player picks up by hand on the scene: bottles and Şans's finds (game-design-v2 §4.7).
// A bottle has a fixed small value by class (decided 2026-10-20): it matters before the first job and
// the first stand, then fades, instead of growing with income.

/** What one collected bottle or can pays. */
export function tapValue(state: GameStateV2) {
  const value = BOTTLE_VALUE_BY_CLASS[Math.min(state.classIndex, BOTTLE_VALUE_BY_CLASS.length - 1)];
  return value * legacyMultiplier(state);
}

/** Whether there is still something on the ground to collect (config/scene.ts). */
export function canCollect(state: GameStateV2) {
  return state.classIndex < COLLECT_END_CLASS;
}

/** What Şans's find pays when the player catches it: a handful of bottles plus a little income. */
export function fetchReward(state: GameStateV2) {
  const reward = FETCH_BOTTLES * tapValue(state) + incomePerSecond(state, 'active') * FETCH_INCOME_SECONDS;
  return reward * (1 + heirloomEffect(state, 'collar'));
}

/** How long Şans stays away between finds: much shorter until the first manager is hired (config/scene.ts). */
export function fetchSeconds(state: GameStateV2) {
  const early = !Object.values(state.businesses).some((business) => business.managed);
  return early
    ? { min: FETCH_EARLY_MIN_SECONDS, max: FETCH_EARLY_MAX_SECONDS }
    : { min: FETCH_MIN_SECONDS, max: FETCH_MAX_SECONDS };
}

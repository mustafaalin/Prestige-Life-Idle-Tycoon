import { LEGACY_BASE, LEGACY_EXPONENT, LEGACY_SCALE } from '../config/economy';
import { HEIRLOOMS, HEIRLOOM_PRICE_GROWTH, JAM_FIRST_CASH, heirloomDef, type HeirloomDef, type HeirloomId } from '../config/heirlooms';
import type { GameStateV2 } from '../types';

// Family legacy points and heirlooms (game-design-v2 §4.10). Hidden at launch (docs/game-design-v2.md
// §6), kept so saves and the generation-2 update can build on them.

export function heirloomLevel(state: GameStateV2, id: HeirloomId) {
  return state.heirlooms[id] ?? 0;
}

/** Levels the family can own now: the first heir's cap, a little more each generation. */
export function heirloomCap(def: HeirloomDef, generation: number) {
  return Math.min(def.maxLevel, def.firstCap + Math.max(0, generation - 2) * def.capGrowth);
}

/** What the next level costs when `level` are owned. */
export function heirloomPrice(def: HeirloomDef, level: number) {
  return Math.round(def.firstCost * HEIRLOOM_PRICE_GROWTH ** level);
}

/** Legacy points spent on heirlooms so far (worked out from their levels). */
export function legacySpent(state: GameStateV2) {
  let spent = 0;
  for (const def of HEIRLOOMS) {
    for (let level = 0; level < heirloomLevel(state, def.id); level += 1) spent += heirloomPrice(def, level);
  }
  return spent;
}

/** Legacy points left to spend. */
export function legacyAvailable(state: GameStateV2) {
  return Math.max(0, state.legacyPoints - legacySpent(state));
}

/** What an heirloom adds at its current level (0.3 = +30%). */
export function heirloomEffect(state: GameStateV2, id: HeirloomId) {
  return heirloomLevel(state, id) * (heirloomDef(id)?.perLevel ?? 0);
}

/** The family legacy's income multiplier: Grandfather's watch. */
export function legacyMultiplier(state: GameStateV2) {
  return 1 + heirloomEffect(state, 'watch');
}

/** The cash an heir starts with from Mom's plum jam at `level`. */
export function jamCash(level: number) {
  return level > 0 ? JAM_FIRST_CASH * (heirloomDef('jam')?.perLevel ?? 10) ** (level - 1) : 0;
}

/** Legacy points a generation leaves, from what it earned. */
export function legacyPointsFor(earnings: number) {
  if (earnings <= 0) return 0;
  return Math.floor(LEGACY_SCALE * (earnings / LEGACY_BASE) ** LEGACY_EXPONENT);
}

/**
 * Points gained by retiring now: from this generation's own earnings (2026-10-16; was all-time earnings
 * minus points held, which shrank every generation's share).
 */
export function pendingLegacyPoints(state: GameStateV2) {
  return legacyPointsFor(state.generationEarnings);
}

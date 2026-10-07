import { BUSINESSES } from '../core/config/businesses';
import { cycleRevenue, globalMultiplier, offlineEarnings, steadyIncomePerSecond, tapValue } from '../core/formulas';
import {
  buyBusinessUnits as coreBuyBusinessUnits,
  buyHome as coreBuyHome,
  buyLifestyle as coreBuyLifestyle,
  createInitialState,
  earn,
  hireManager as coreHireManager,
  moveHome as coreMoveHome,
  promote as corePromote,
  rentHome as coreRentHome,
} from '../core/state';
import type { GameStateV2 } from '../core/types';

// Runtime layer on top of the economy core: real-time production cycles, taps and offline time.
// Pure functions — time comes in as an argument, so the store and any test can drive it.

/** A visible production cycle. Managed lines loop forever; unmanaged lines run one cycle per tap. */
export interface CycleState {
  /** 0–1, how full the progress bar is. */
  progress: number;
  /** Unmanaged lines only: a cycle was started by the player and is still running. */
  running: boolean;
}

export interface PendingOffline {
  amount: number;
  awaySeconds: number;
}

export interface RuntimeState {
  game: GameStateV2;
  cycles: Record<string, CycleState>;
  /** Offline earnings waiting for the player to collect them. */
  offline: PendingOffline | null;
  /** Wall-clock ms up to which time has been simulated. */
  lastActiveAt: number;
}

export interface Payout {
  businessId: string;
  amount: number;
  /** Cycles completed in this step (can be > 1 for fast lines or long frames). */
  cycles: number;
}

/** A gap between ticks longer than this means the app was suspended; it is treated as offline time. */
export const MAX_TICK_GAP_SECONDS = 10;
/** Shorter absences are credited silently instead of becoming a "welcome back" claim. */
export const OFFLINE_MIN_SECONDS = 60;

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));

export function emptyCycles(): Record<string, CycleState> {
  return Object.fromEntries(BUSINESSES.map((def) => [def.id, { progress: 0, running: false }]));
}

export function createRuntimeState(now: number, game: GameStateV2 = createInitialState()): RuntimeState {
  return { game, cycles: emptyCycles(), offline: null, lastActiveAt: now };
}

/** Runs production cycles for `seconds`. Offline time skips managed lines; their income comes from offlineEarnings. */
function advanceCycles(state: RuntimeState, seconds: number, includeManaged: boolean) {
  const cycles = { ...state.cycles };
  const payouts: Payout[] = [];
  let earned = 0;

  for (const def of BUSINESSES) {
    const business = state.game.businesses[def.id];
    const cycle = cycles[def.id];
    if (!business || business.owned <= 0) continue;
    if (business.managed ? !includeManaged : !cycle.running) continue;

    let progress = cycle.progress + seconds / def.cycleSeconds;
    let completed = 0;
    if (business.managed) {
      completed = Math.floor(progress);
      progress -= completed;
    } else if (progress >= 1) {
      completed = 1;
      progress = 0;
    }
    cycles[def.id] = { progress, running: business.managed || (cycle.running && completed === 0) };

    if (completed > 0) {
      const amount = cycleRevenue(state.game, def) * completed;
      payouts.push({ businessId: def.id, amount, cycles: completed });
      earned += amount;
    }
  }

  return { cycles, payouts, earned };
}

/** Advances the game while the app is open. `speed` is a dev-only time multiplier. */
export function tick(state: RuntimeState, now: number, speed = 1): { state: RuntimeState; payouts: Payout[] } {
  const elapsed = (now - state.lastActiveAt) / 1000;
  if (elapsed <= 0) return { state: elapsed < 0 ? { ...state, lastActiveAt: now } : state, payouts: [] };
  if (elapsed > MAX_TICK_GAP_SECONDS) return resume(state, now);

  const seconds = elapsed * speed;
  const { cycles, payouts, earned } = advanceCycles(state, seconds, true);
  const steady = steadyIncomePerSecond(state.game) * globalMultiplier(state.game) * seconds;
  return {
    state: { ...state, game: earn(state.game, earned + steady), cycles, lastActiveAt: now },
    payouts,
  };
}

/**
 * Catches up after the app was closed or backgrounded. Managers, salary and rent earn at the offline
 * rate; a cycle the player started by hand still finishes. Long absences become a pending claim.
 */
export function resume(state: RuntimeState, now: number): { state: RuntimeState; payouts: Payout[] } {
  const away = (now - state.lastActiveAt) / 1000;
  if (away <= 0) return { state: { ...state, lastActiveAt: now }, payouts: [] };

  const { cycles, payouts, earned } = advanceCycles(state, away, false);
  const offlineAmount = offlineEarnings(state.game, away);
  const base = { ...state, game: earn(state.game, earned), cycles, lastActiveAt: now };

  if (away < OFFLINE_MIN_SECONDS || offlineAmount <= 0) {
    return { state: { ...base, game: earn(base.game, offlineAmount) }, payouts };
  }
  const offline = {
    amount: (state.offline?.amount ?? 0) + offlineAmount,
    awaySeconds: (state.offline?.awaySeconds ?? 0) + away,
  };
  return { state: { ...base, offline }, payouts };
}

// ── Player actions: return the new state, or null when not allowed ────────────

function withGame(state: RuntimeState, game: GameStateV2 | null): RuntimeState | null {
  return game ? { ...state, game } : null;
}

export function tap(state: RuntimeState): RuntimeState {
  return { ...state, game: earn(state.game, tapValue(state.game)) };
}

export function buyBusinessUnits(state: RuntimeState, businessId: string, count: number) {
  return withGame(state, coreBuyBusinessUnits(state.game, businessId, count));
}

export function hireManager(state: RuntimeState, businessId: string): RuntimeState | null {
  const next = withGame(state, coreHireManager(state.game, businessId));
  if (!next) return null;
  // A cycle already in progress keeps its bar; from now on it loops by itself.
  const cycle = next.cycles[businessId];
  return { ...next, cycles: { ...next.cycles, [businessId]: { ...cycle, running: true } } };
}

/** Player taps an unmanaged business to run one production cycle. */
export function startCycle(state: RuntimeState, businessId: string): RuntimeState | null {
  const business = state.game.businesses[businessId];
  const cycle = state.cycles[businessId];
  if (!BUSINESS_BY_ID.has(businessId) || !business || business.owned <= 0 || business.managed || cycle.running) {
    return null;
  }
  return { ...state, cycles: { ...state.cycles, [businessId]: { progress: 0, running: true } } };
}

export function promote(state: RuntimeState) {
  return withGame(state, corePromote(state.game));
}

export function buyLifestyle(state: RuntimeState, itemId: string) {
  return withGame(state, coreBuyLifestyle(state.game, itemId));
}

export function rentHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreRentHome(state.game, houseId));
}

export function buyHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreBuyHome(state.game, houseId));
}

export function moveHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreMoveHome(state.game, houseId));
}

/** Collects pending offline earnings; `multiplier` is 2 after a rewarded ad. */
export function claimOffline(state: RuntimeState, multiplier = 1): RuntimeState | null {
  if (!state.offline) return null;
  return { ...state, game: earn(state.game, state.offline.amount * multiplier), offline: null };
}

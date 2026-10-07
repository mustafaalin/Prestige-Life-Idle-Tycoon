// Balance simulator: a bot plays the v2 economy on a realistic session schedule and records
// when each milestone happens. Runs headless (no React, no storage). Entry: scripts/sim-economy.ts.

import { BUSINESSES } from '../core/config/businesses';
import { WEALTH_CLASSES } from '../core/config/classes';
import {
  businessBaseIncomePerSecond,
  careerBonus,
  globalMultiplier,
  legacyMultiplier,
  salaryPerSecond,
  statusBonus,
  costForUnits,
  incomePerSecond,
  nextMilestone,
  offlineEarnings,
  pendingLegacyPoints,
  rentPerSecond,
  tapValue,
} from '../core/formulas';
import { HOUSES } from '../core/config/housing';
import {
  buyBusinessUnits,
  buyHome,
  buyLifestyle,
  canRetire,
  createInitialState,
  earn,
  hireManager,
  housePrice,
  LIFESTYLE_KINDS,
  nextCareer,
  nextHome,
  nextLifestyle,
  ownsHouse,
  promote,
  rentHome,
  retire,
  live,
} from '../core/state';
import type { GameStateV2 } from '../core/types';

export interface Session {
  /** Hour of day the session starts (0–24). */
  startHour: number;
  minutes: number;
}

export interface PlayerProfile {
  name: string;
  /** Sessions for a given day (day 1 = install day). */
  sessionsForDay: (day: number) => Session[];
  /** Taps per second while playing, given active seconds spent in the current generation. */
  tapsPerSecond: (generationActiveSeconds: number) => number;
}

export type SimEventKind =
  | 'purchase'
  | 'business'
  | 'manager'
  | 'career'
  | 'lifestyle'
  | 'home'
  | 'class'
  | 'retire'
  | 'session';

export interface SimEvent {
  kind: SimEventKind;
  label: string;
  generation: number;
  /** Seconds since install (wall clock). */
  clock: number;
  /** Seconds of actual play since install. */
  activeTotal: number;
  /** Seconds of actual play in the current generation. */
  activeGeneration: number;
  /** Active income per second right after the event. */
  income: number;
}

export interface SimResult {
  profile: string;
  days: number;
  events: SimEvent[];
  finalState: GameStateV2;
}

interface Candidate {
  label: string;
  kind: SimEventKind;
  cost: number;
  apply: (state: GameStateV2) => GameStateV2 | null;
}

/** How much the bot values income that keeps flowing while the app is closed. */
const IDLE_VALUE_WEIGHT = 0.5;

function candidates(state: GameStateV2): Candidate[] {
  const list: Candidate[] = [];

  for (const def of BUSINESSES) {
    const { owned, managed } = state.businesses[def.id];
    list.push({
      label: `${def.name} #${owned + 1}`,
      kind: owned === 0 ? 'business' : 'purchase',
      cost: costForUnits(def, owned, 1),
      apply: (s) => buyBusinessUnits(s, def.id, 1),
    });
    const milestone = nextMilestone(owned);
    if (milestone !== null && milestone - owned > 1) {
      const count = milestone - owned;
      list.push({
        label: `${def.name} → ${milestone}`,
        kind: owned === 0 ? 'business' : 'purchase',
        cost: costForUnits(def, owned, count),
        apply: (s) => buyBusinessUnits(s, def.id, count),
      });
    }
    if (owned > 0 && !managed) {
      list.push({
        label: `Manager: ${def.name}`,
        kind: 'manager',
        cost: def.managerCost,
        apply: (s) => hireManager(s, def.id),
      });
    }
  }

  const career = nextCareer(state);
  if (career) {
    list.push({ label: `Job: ${career.name}`, kind: 'career', cost: career.cost, apply: promote });
  }

  for (const kind of LIFESTYLE_KINDS) {
    const next = nextLifestyle(state, kind);
    if (next) {
      list.push({ label: next.name, kind: 'lifestyle', cost: next.cost, apply: (s) => buyLifestyle(s, next.id) });
    }
  }

  // Homes: rent the next one; buy any house allowed (the next one moves you in, lower ones pay rent).
  const next = nextHome(state);
  if (next && !ownsHouse(state, next.id)) {
    list.push({ label: `Rent: ${next.name}`, kind: 'home', cost: next.moveInCost, apply: (s) => rentHome(s, next.id) });
  }
  for (const house of HOUSES) {
    const price = housePrice(state, house);
    if (price !== null) {
      list.push({ label: `Buy: ${house.name}`, kind: 'home', cost: price, apply: (s) => buyHome(s, house.id) });
    }
  }

  return list;
}

/** Value of a purchase = gain in active income + weighted gain in idle (offline) income. */
function incomeGain(state: GameStateV2, candidate: Candidate) {
  const after = candidate.apply({ ...state, cash: Number.POSITIVE_INFINITY });
  if (!after) return 0;
  const active = incomePerSecond(after, 'active') - incomePerSecond(state, 'active');
  const idle = incomePerSecond(after, 'idle') - incomePerSecond(state, 'idle');
  return active + IDLE_VALUE_WEIGHT * idle;
}

interface Clock {
  clock: number;
  activeTotal: number;
  activeGeneration: number;
}

export interface SimOptions {
  /** Overrides OFFLINE_CAP_HOURS, to compare offline caps. */
  offlineCapHours?: number;
}

export function simulate(profile: PlayerProfile, days: number, options: SimOptions = {}): SimResult {
  let state = createInitialState();
  const events: SimEvent[] = [];
  const time: Clock = { clock: 0, activeTotal: 0, activeGeneration: 0 };

  const log = (kind: SimEventKind, label: string) => {
    events.push({ kind, label, generation: state.generation, ...time, income: incomePerSecond(state, 'active') });
  };

  const earnTracked = (amount: number) => {
    const before = state.classIndex;
    state = earn(state, amount);
    for (let index = before + 1; index <= state.classIndex; index += 1) {
      log('class', WEALTH_CLASSES[index].name);
    }
  };

  const activeRate = () => incomePerSecond(state, 'active') + profile.tapsPerSecond(time.activeGeneration) * tapValue(state);

  const playFor = (seconds: number) => {
    // Income is piecewise constant between purchases, but taps change with generation time,
    // so long waits are advanced in slices.
    let left = seconds;
    while (left > 0) {
      const step = Math.min(left, 30);
      const amount = activeRate() * step;
      // Advance the clock first so milestones are logged at the end of the slice, never before it.
      time.clock += step;
      time.activeTotal += step;
      time.activeGeneration += step;
      earnTracked(amount);
      // The hero ages only while playing; retirement comes at the end of life.
      state = live(state, step);
      maybeRetire();
      left -= step;
    }
  };

  const maybeRetire = () => {
    if (!canRetire(state)) return;
    log('retire', `Life ends, gen ${state.generation} (+${pendingLegacyPoints(state)} legacy)`);
    const next = retire(state);
    if (next) {
      state = next;
      time.activeGeneration = 0;
    }
  };

  const playSession = (sessionSeconds: number) => {
    const end = time.clock + sessionSeconds;
    maybeRetire();
    while (time.clock < end) {
      const rate = activeRate();
      let best: { candidate: Candidate; wait: number; score: number } | null = null;
      for (const candidate of candidates(state)) {
        const gain = incomeGain(state, candidate);
        if (gain <= 0) continue;
        const wait = Math.max(0, candidate.cost - state.cash) / rate;
        const score = wait + candidate.cost / gain;
        if (!best || score < best.score) best = { candidate, wait, score };
      }
      if (!best) {
        playFor(end - time.clock);
        break;
      }
      if (best.wait > 0) {
        // Floor the wait so float rounding can't leave the bot waiting forever for a few cents.
        playFor(Math.min(Math.max(best.wait, 0.05), end - time.clock));
        const shortfall = best.candidate.cost - state.cash;
        if (shortfall > best.candidate.cost * 1e-9) continue;
        if (shortfall > 0) state = { ...state, cash: best.candidate.cost };
      }
      const next = best.candidate.apply(state);
      if (!next) {
        // Should not happen; never spin in place.
        playFor(Math.min(1, end - time.clock));
        continue;
      }
      const isFirstPurchase = !events.some((event) => event.kind !== 'class');
      state = next;
      if (isFirstPurchase) log('purchase', `First purchase: ${best.candidate.label}`);
      if (best.candidate.kind !== 'purchase') log(best.candidate.kind, best.candidate.label);
      maybeRetire();
    }
  };

  for (let day = 1; day <= days; day += 1) {
    for (const session of profile.sessionsForDay(day)) {
      const start = (day - 1) * 86400 + session.startHour * 3600;
      if (start > time.clock) {
        // Offline earnings arrive when the player returns, so milestones they cause belong to this session.
        const amount = offlineEarnings(state, start - time.clock, options.offlineCapHours);
        time.clock = start;
        earnTracked(amount);
      }
      playSession(session.minutes * 60);
      log('session', sessionSummary(state));
    }
  }

  return { profile: profile.name, days, events, finalState: state };
}

// ── Player profiles ──────────────────────────────────────────────────────────

const earlyTapping = (generationActiveSeconds: number) => (generationActiveSeconds < 180 ? 3 : 0.3);

/** Plays like a top-10% idle player: ~5–6 sessions a day, ~7 minutes each. */
export const ENGAGED_PLAYER: PlayerProfile = {
  name: 'engaged',
  sessionsForDay: (day) =>
    day === 1
      ? [
          { startHour: 18, minutes: 30 },
          { startHour: 20.5, minutes: 10 },
          { startHour: 23, minutes: 7 },
        ]
      : [8, 12, 15, 18, 21, 23].map((startHour) => ({ startHour, minutes: 7 })),
  tapsPerSecond: earlyTapping,
};

/** Checks in three times a day for a few minutes. */
export const CASUAL_PLAYER: PlayerProfile = {
  name: 'casual',
  sessionsForDay: (day) =>
    day === 1
      ? [
          { startHour: 18, minutes: 20 },
          { startHour: 22, minutes: 5 },
        ]
      : [9, 13, 21].map((startHour) => ({ startHour, minutes: 5 })),
  tapsPerSecond: earlyTapping,
};

export const PROFILES = [ENGAGED_PLAYER, CASUAL_PLAYER];

/** Exposed for reports: total base income of every business line (no multipliers). */
export function businessBreakdown(state: GameStateV2) {
  return BUSINESSES.map((def) => ({
    name: def.name,
    owned: state.businesses[def.id].owned,
    managed: state.businesses[def.id].managed,
    baseIncome: businessBaseIncomePerSecond(def, state.businesses[def.id].owned),
  }));
}

/** One-line diagnosis of where income comes from (used by `npm run sim -- --sessions`). */
export function sessionSummary(state: GameStateV2) {
  const lines = businessBreakdown(state)
    .filter((line) => line.owned > 0)
    .map((line) => ({ ...line, share: line.baseIncome }))
    .sort((a, b) => b.share - a.share);
  const salary = salaryPerSecond(state);
  const rent = rentPerSecond(state);
  const total = lines.reduce((sum, line) => sum + line.share, salary + rent) || 1;
  const top = lines
    .slice(0, 3)
    .map((line) => `${line.name} ${line.owned}${line.managed ? 'm' : ''} ${Math.round((line.share / total) * 100)}%`)
    .join(', ');
  return [
    `cash ${state.cash.toExponential(2)}`,
    `x${globalMultiplier(state).toFixed(1)} (career +${Math.round(careerBonus(state) * 100)}%, status +${Math.round(statusBonus(state) * 100)}%, legacy x${legacyMultiplier(state.legacyPoints).toFixed(2)})`,
    `items ${state.lifestyleOwned.length}`,
    `home ${state.home}${state.homesOwned.includes(state.home) ? ' (owned)' : ''}, owns ${state.homesOwned.length}`,
    `salary ${Math.round((salary / total) * 100)}%`,
    `rent ${Math.round((rent / total) * 100)}%`,
    top,
  ].join(' | ');
}

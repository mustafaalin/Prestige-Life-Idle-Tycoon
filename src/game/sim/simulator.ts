// Balance simulator: a bot plays the v2 economy on a realistic session schedule and records
// when each milestone happens. Runs headless (no React, no storage). Entry: scripts/sim-economy.ts.

import { BUSINESSES } from '../core/config/businesses';
import { WEALTH_CLASSES } from '../core/config/classes';
import { RICH_MILESTONES } from '../core/config/richList';
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
  autoIncomePerSecond,
  canCollect,
  eventAverageReward,
  eventCardsFor,
  fetchReward,
  fetchSeconds,
  rentPerSecond,
  steadyIncomePerSecond,
  tapValue,
  richListRank,
} from '../core/formulas';
import {
  AD_OFFLINE_MIN_SECONDS,
  AD_FIND_MULTIPLIER,
  AD_OFFLINE_MULTIPLIER,
  BOOST_FACTOR,
  BOOST_MAX_SECONDS,
  BOOST_SECONDS,
  HELP_INCOME_SECONDS,
} from '../core/config/ads';
import { EVENT_MAX_SECONDS, EVENT_MIN_SECONDS } from '../core/config/events';
import { COLLECT_SPAWN_SECONDS } from '../core/config/scene';
import { HOUSES } from '../core/config/housing';
import {
  LIFESTYLE_KINDS,
  activeQuests,
  buyBusinessUnits,
  buyHome,
  buyLifestyle,
  buyUpgrade,
  canBuyUpgrade,
  canRetire,
  claimQuest,
  createInitialState,
  earn,
  hireManager,
  housePrice,
  isQuestComplete,
  lifestyleNeedsHome,
  live,
  moveUpNeedsVehicle,
  nextCareer,
  nextHome,
  nextLifestyle,
  nextUpgrade,
  ownsHouse,
  promote,
  rentHome,
  retire,
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
  /** Share of Şans's finds the player catches in time. */
  fetchCatchRate: number;
  /** Share of the event cards the player answers (a call waits, but a session may end first). */
  eventAnswerRate: number;
  /**
   * Rewarded ads this player watches (config/ads.ts; left out: none). Offers start as in the game:
   * after a manager is hired and the player has come back once.
   */
  ads?: {
    /** Income boosts a day, one at the start of a session. */
    boostsPerDay: number;
    /** "A little help" ads a day, one a session. */
    helpsPerDay: number;
    /** Doubles offline earnings and Şans's finds. */
    doubles: boolean;
  };
}

/** On average Şans brings a find this often while the game is open (more often before the first manager). */
const fetchAverageSeconds = (state: GameStateV2) => {
  const { min, max } = fetchSeconds(state);
  return (min + max) / 2;
};
/** Event cards come about this often from Middle Class on (the quick first call of a session is not counted). */
const EVENT_AVERAGE_SECONDS = (EVENT_MIN_SECONDS + EVENT_MAX_SECONDS) / 2;

/** Rich List places worth a timeline row: the cards' places plus top 20 and #1 (their ceremonies). */
const RICH_LIST_PLACES = [...RICH_MILESTONES.map((milestone) => milestone.rank), 20, 1].sort((a, b) => b - a);

export type SimEventKind =
  | 'purchase'
  | 'business'
  | 'manager'
  | 'career'
  | 'lifestyle'
  | 'home'
  | 'upgrade'
  | 'class'
  | 'rank'
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
  /** Share of that income coming from businesses (the rest is salary and rent). */
  businessShare: number;
  /** Income per second that keeps coming while away (managers, salary, rent), before the offline rate. */
  idleIncome: number;
  /** Money earned so far while playing and while away (offline earnings), since install. */
  earnedPlaying: number;
  earnedOffline: number;
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
    const upgrade = nextUpgrade(state, def.id);
    if (upgrade && canBuyUpgrade(state, upgrade)) {
      list.push({
        label: `Upgrade: ${upgrade.id}`,
        kind: 'upgrade',
        cost: upgrade.cost,
        apply: (s) => buyUpgrade(s, upgrade.id),
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
    if (next && !lifestyleNeedsHome(state, next)) {
      list.push({ label: next.name, kind: 'lifestyle', cost: next.cost, apply: (s) => buyLifestyle(s, next.id) });
    }
  }

  // Homes: rent the next one; buy any house allowed (the next one moves you in, lower ones pay rent).
  const next = nextHome(state);
  if (next && !ownsHouse(state, next.id) && !moveUpNeedsVehicle(state)) {
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
    events.push({
      kind,
      label,
      generation: state.generation,
      ...time,
      income: incomePerSecond(state, 'active'),
      businessShare: businessShare(state),
      idleIncome: incomePerSecond(state, 'idle'),
      earnedPlaying: earned.playing,
      earnedOffline: earned.offline,
    });
  };

  /** Where the money came from: play time or time away. */
  const earned = { playing: 0, offline: 0 };

  const earnTracked = (amount: number, source: keyof typeof earned = 'playing') => {
    earned[source] += amount;
    const before = state.classIndex;
    const rankBefore = richListRank(state.generationEarnings);
    state = earn(state, amount);
    for (let index = before + 1; index <= state.classIndex; index += 1) {
      log('class', WEALTH_CLASSES[index].name);
    }
    // Rich List places that bring a card (or a ceremony), discussion-notes §10.
    const rank = richListRank(state.generationEarnings);
    if (rank === null) return;
    for (const place of RICH_LIST_PLACES) {
      if (rank <= place && (rankBefore === null || rankBefore > place)) log('rank', `Rich List #${place === 3400 ? rank : place}`);
    }
  };

  // ── Rewarded ads (runtime/adRewards.ts rules, with the simulator's own clock) ──
  const ads = profile.ads;
  const watched = { returned: false, boostUntil: 0, day: 0, boosts: 0, helps: 0 };
  const adsOpen = () =>
    ads !== undefined && watched.returned && Object.values(state.businesses).some((business) => business.managed);
  const boost = () => (time.clock < watched.boostUntil ? BOOST_FACTOR : 1);
  const doubles = () => adsOpen() && ads?.doubles === true;

  /** Coming back: offline earnings (the boost keeps running while away), then this session's ads. */
  const comeBack = (start: number, day: number) => {
    const away = start - time.clock;
    if (away > 0) {
      const boostedShare = Math.min(Math.max(watched.boostUntil - time.clock, 0), away) / away;
      let amount = offlineEarnings(state, away, options.offlineCapHours) * (1 + (BOOST_FACTOR - 1) * boostedShare);
      if (away >= AD_OFFLINE_MIN_SECONDS && doubles()) amount *= AD_OFFLINE_MULTIPLIER;
      time.clock = start;
      earnTracked(amount, 'offline');
      if (amount > 0) watched.returned = true;
    }
    if (day !== watched.day) Object.assign(watched, { day, boosts: 0, helps: 0 });
    if (!ads || !adsOpen()) return;
    const left = Math.max(0, watched.boostUntil - time.clock);
    if (watched.boosts < ads.boostsPerDay && left + BOOST_SECONDS <= BOOST_MAX_SECONDS) {
      watched.boostUntil = time.clock + left + BOOST_SECONDS;
      watched.boosts += 1;
    }
    if (watched.helps < ads.helpsPerDay) {
      earnTracked(autoIncomePerSecond(state) * HELP_INCOME_SECONDS);
      watched.helps += 1;
    }
  };

  /** Bottles a second: none once the ground is empty (Middle Class on). */
  const tapRate = () => (canCollect(state) ? profile.tapsPerSecond(time.activeGeneration) : 0);

  const activeRate = () =>
    incomePerSecond(state, 'active') * boost() +
    tapRate() * tapValue(state) +
    (profile.fetchCatchRate * fetchReward(state) * (doubles() ? AD_FIND_MULTIPLIER : 1)) / fetchAverageSeconds(state) +
    (eventCardsFor(state).length > 0 ? (profile.eventAnswerRate * eventAverageReward(state)) / EVENT_AVERAGE_SECONDS : 0);

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
      // Goal counters: collected bottles and returned wallets.
      state = {
        ...state,
        bottles: state.bottles + tapRate() * step,
        finds: state.finds + (profile.fetchCatchRate * step) / fetchAverageSeconds(state),
      };
      claimGoals();
      // The hero ages only while playing; retirement comes at the end of life.
      state = live(state, step);
      maybeRetire();
      left -= step;
    }
  };

  /** The bot claims every finished goal right away. */
  const claimGoals = () => {
    for (let guard = 0; guard < 20; guard += 1) {
      const done = activeQuests(state).find((quest) => isQuestComplete(state, quest));
      if (!done) return;
      const before = state.classIndex;
      const next = claimQuest(state, done.id);
      if (!next) return;
      state = next;
      for (let index = before + 1; index <= state.classIndex; index += 1) log('class', WEALTH_CLASSES[index].name);
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
      claimGoals();
      if (isFirstPurchase) log('purchase', `First purchase: ${best.candidate.label}`);
      else if (best.candidate.kind === 'purchase') log('purchase', best.candidate.label);
      if (best.candidate.kind !== 'purchase') log(best.candidate.kind, best.candidate.label);
      maybeRetire();
    }
  };

  for (let day = 1; day <= days; day += 1) {
    for (const session of profile.sessionsForDay(day)) {
      const start = (day - 1) * 86400 + session.startHour * 3600;
      // Offline earnings arrive when the player returns, so milestones they cause belong to this session.
      comeBack(start, day);
      playSession(session.minutes * 60);
      log('session', sessionSummary(state));
    }
  }

  return { profile: profile.name, days, events, finalState: state };
}

// ── Player profiles ──────────────────────────────────────────────────────────

/** Collecting bottles is capped by how fast they appear in the alley. */
const MAX_COLLECT_RATE = 1 / COLLECT_SPAWN_SECONDS;
/** Collects everything in the first 3 minutes, then a bottle now and then (~1 per 7 s). */
const earlyTapping = (generationActiveSeconds: number) =>
  generationActiveSeconds < 180 ? MAX_COLLECT_RATE : Math.min(0.15, MAX_COLLECT_RATE);

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
  fetchCatchRate: 0.8,
  eventAnswerRate: 0.9,
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
  fetchCatchRate: 0.5,
  eventAnswerRate: 0.7,
};

/**
 * The engaged player who also watches ads: a boost at the first three sessions of the day, doubled
 * offline earnings and finds, a little help twice a day. Shown for comparison (monetization-v2 §2.1:
 * ads should bring the classes some 20–30% sooner, not halve the game); the targets stay the
 * ad-free engaged player's.
 */
export const AD_WATCHER: PlayerProfile = {
  ...ENGAGED_PLAYER,
  name: 'engaged + ads',
  ads: { boostsPerDay: 3, helpsPerDay: 2, doubles: true },
};

export const PROFILES = [ENGAGED_PLAYER, CASUAL_PLAYER, AD_WATCHER];

/** Share of active income (bottles excluded) that comes from businesses rather than salary and rent. */
export function businessShare(state: GameStateV2) {
  const total = incomePerSecond(state, 'active');
  if (total <= 0) return 0;
  return 1 - (steadyIncomePerSecond(state) * globalMultiplier(state)) / total;
}

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

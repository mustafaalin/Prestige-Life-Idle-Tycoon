// Balance simulator: a bot plays the v2 economy on a realistic session schedule and records
// when each milestone happens. Runs headless (no React, no storage). Entry: scripts/sim-economy.ts.

import { BUSINESSES } from '../core/config/businesses';
import { WEALTH_CLASSES } from '../core/config/classes';
import { PRODUCTS, SPECIAL_SHOP_CEREMONY } from '../core/config/iap';
import { RICH_MILESTONES } from '../core/config/richList';
import {
  baseBusinessIncomePerSecond,
  branchCost,
  businessStage,
  businessState,
  uptime,
  canOpenBranch,
  canOpenBusiness,
  availableCourses,
  canLeaveCareer,
  careersNeedingCourse,
  currentCareer,
  currentSalary,
  globalMultiplier,
  hasWorked,
  heirloomLevel,
  heirloomPrice,
  legacyMultiplier,
  managerCost,
  salaryPerSecond,
  statusBonus,
  autoIncomePerSecond,
  incomePerSecond,
  isLifeOver,
  isOpened,
  locations,
  nextLevel,
  offlineEarnings,
  pendingLegacyPoints,
  canCollect,
  eventAverageReward,
  eventCardsFor,
  fetchReward,
  fetchSeconds,
  rentPerSecond,
  steadyIncomePerSecond,
  tapValue,
  richListRank,
  heroAge,
  storyGift,
  dailyReward,
} from '../core/formulas';
import {
  AD_OFFLINE_MIN_SECONDS,
  AD_FIND_MULTIPLIER,
  AD_OFFLINE_MULTIPLIER,
  AD_STORY_GIFT_MULTIPLIER,
  BOOST_FACTOR,
  BOOST_MAX_SECONDS,
  BOOST_SECONDS,
  HELP_MAX_INCOME_SECONDS,
  HELP_MAX_SHARE,
} from '../core/config/ads';
import { STORY_GIFT_FROM_CLASS } from '../core/config/economy';
import { SECONDS_PER_MONTH } from '../core/config/life';
import { expectedGain, INVEST_CAP_MONTHS, INVEST_FROM_CLASS, INVEST_PLANS } from '../core/config/investments';
import { dailyMonths } from '../core/config/daily';
import { EVENT_DAILY_MAX, EVENT_MAX_SECONDS, EVENT_MIN_SECONDS } from '../core/config/events';
import { LIFE_MOMENTS, storyRuns } from '../runtime/story';
import { COLLECT_SPAWN_SECONDS } from '../core/config/scene';
import { HOUSES } from '../core/config/housing';
import {
  LIFESTYLE_KINDS,
  activeQuests,
  buyHome,
  buyLifestyle,
  buyHeirloom,
  canHandOverEarly,
  canRetire,
  claimQuest,
  createInitialState,
  earn,
  hireManager,
  housePrice,
  levelUpBusiness,
  openBranch,
  isQuestComplete,
  lifestyleLocked,
  live,
  moveUpNeedsVehicle,
  nextHome,
  nextLifestyle,
  ownsHouse,
  startCourse,
  takeCareer,
  rentHome,
  handOverEarly,
  retire,
} from '../core/state';
import { HEIRLOOMS } from '../core/config/heirlooms';
import {
  AD_PLACEMENTS,
  CAMPAIGN_FACTOR,
  CAMPAIGN_SECONDS,
  COURSE_RUSH_PER_COURSE,
  EVENT_AD_MULTIPLIER,
  EXPERIENCE_RUSH_MONTHS,
  INVEST_RUSH_SHARE,
} from '../core/config/ads';
import { adGift, courseRushSeconds, firstSalaryBonus, opportunityReward, questAdExtra } from '../runtime/adRewards';
import { CONTENT } from '../core/config/content';
import { CAREERS } from '../core/config/careers';
import { LIFESTYLE_ITEMS, VEHICLES } from '../core/config/lifestyle';
import { isMastered, unmet } from '../core/requirements';

const ITEM_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));

/** How many new looks the businesses have taken on in all (shop, store). */
const totalStages = (state: GameStateV2) =>
  BUSINESSES.reduce((sum, def) => sum + businessStage(def, businessState(state, def.id).level), 0);
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
    /**
     * Uses the places added 2026-10-21 (config/ads.ts): course and experience rushes, halved deals,
     * a campaign on the best business, goals ×3, event bonuses, gifts on new looks, diplomas and new
     * jobs, Şans on call and the balloon, at most once a session each and within the daily limits.
     */
    extras?: boolean;
  };
  /**
   * Şans's paid accessories this player buys as soon as the store opens (Day Laborer), as one income
   * multiplier (config/iap.ts incomeBonus; left out: none). The packs' one-time boost and income are
   * left out: small next to a bonus that stays for good.
   */
  accessoryMultiplier?: number;
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
  | 'course'
  | 'lifestyle'
  | 'home'
  | 'branch'
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
  /** Money the daily reward paid. */
  dailyPaid: number;
  /** Each daily claim: calendar day, money paid, class at the time. */
  dailyClaims: { day: number; amount: number; className: string }[];
  /** Old Ray's deals: return paid and deals made. */
  investProfit: number;
  investCount: number;
  /** All money earned, by where it came from (shares show which systems carry the economy). */
  sources: Record<MoneySource, number>;
  /** Money the places added 2026-10-21 paid, by place (time rushes and event bonuses are not money here). */
  adPaid: Record<string, number>;
}

export type MoneySource = 'work' | 'bottles' | 'finds' | 'events' | 'quests' | 'gifts' | 'daily' | 'deals' | 'offline' | 'help' | 'adExtras';

interface Candidate {
  label: string;
  kind: SimEventKind;
  cost: number;
  apply: (state: GameStateV2) => GameStateV2 | null;
}

/** The purchases whose cards offer "a little help" (managers, promotions, the next item, the next home). */
const HELP_KINDS = new Set<SimEventKind>(['manager', 'career', 'lifestyle', 'home']);

/** How much the bot values income that keeps flowing while the app is closed. */
const IDLE_VALUE_WEIGHT = 0.5;

function candidates(state: GameStateV2): Candidate[] {
  const list: Candidate[] = [];

  for (const def of BUSINESSES) {
    const business = businessState(state, def.id);
    const opened = isOpened(business);
    // A line opens with its class (docs/game-design-v2.md §4.3); later levels only cost money.
    const level = nextLevel(def, business);
    if (level && (opened || canOpenBusiness(state, def))) {
      list.push({
        label: opened ? `${def.name} level ${business.level + 1}` : `${def.name} opened`,
        kind: opened ? 'purchase' : 'business',
        cost: level.cost,
        apply: (s) => levelUpBusiness(s, def.id),
      });
    }
    if (canOpenBranch(state, def)) {
      list.push({
        label: `${def.name} branch ${business.branches + 1}`,
        kind: 'branch',
        cost: branchCost(def, business.branches),
        apply: (s) => openBranch(s, def.id),
      });
    }
    if (opened && !business.managed) {
      list.push({
        label: `Manager: ${def.name}`,
        kind: 'manager',
        cost: managerCost(state, def),
        apply: (s) => hireManager(s, def.id),
      });
    }
  }

  // Jobs (docs/game-design-v2.md §4.4): once the job held is mastered, any better-paying job whose missing
  // conditions are only items or a vehicle the bot can buy now; they are bought with it. Courses are
  // started separately (maybeStudy).
  const salary = currentSalary(state);
  for (const career of CAREERS) {
    if (career.salaryPerSecond <= salary || hasWorked(state, career.id) || !canLeaveCareer(state)) continue;
    const missing = unmet(state, career.requires);
    const items = missing.flatMap((requirement) =>
      requirement.type === 'item' ? [ITEM_BY_ID.get(requirement.itemId)] : requirement.type === 'vehicle' ? [VEHICLES[requirement.index]] : [],
    );
    if (items.length !== missing.length || items.some((item) => !item || lifestyleLocked(state, item))) continue;
    const gear = items.filter((item) => item !== undefined);
    list.push({
      label: `Job: ${career.name}${gear.length ? ` (+ ${gear.map((item) => item.name).join(', ')})` : ''}`,
      kind: 'career',
      cost: gear.reduce((sum, item) => sum + item.cost, 0),
      apply: (s) => {
        let next: GameStateV2 | null = s;
        for (const item of gear) next = next && buyLifestyle(next, item.id);
        return next && takeCareer(next, career.id);
      },
    });
  }

  for (const kind of LIFESTYLE_KINDS) {
    const next = nextLifestyle(state, kind);
    if (next && !lifestyleLocked(state, next)) {
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
  /** Trial (plan 2.12): hand over as soon as the top class is reached, without waiting for 80. */
  retireAtTop?: boolean;
  /** Trial (plan 2.12): the first life starts with this family legacy, to see how an income bonus shortens a life. */
  startLegacyPoints?: number;
}

export function simulate(profile: PlayerProfile, days: number, options: SimOptions = {}): SimResult {
  let state = createInitialState();
  if (options.startLegacyPoints) state = buyHeirlooms({ ...state, legacyPoints: options.startLegacyPoints });
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
  const sources: Record<MoneySource, number> = {
    work: 0, bottles: 0, finds: 0, events: 0, quests: 0, gifts: 0, daily: 0, deals: 0, offline: 0, help: 0, adExtras: 0,
  };

  const earnTracked = (amount: number, source: keyof typeof earned = 'playing') => {
    earned[source] += amount;
    const before = state.classIndex;
    const rankBefore = richListRank(state.generationEarnings);
    state = earn(state, amount);
    const paid = profile.accessoryMultiplier ?? 1;
    if (state.classIndex >= SPECIAL_SHOP_CEREMONY && state.accessoryMultiplier !== paid) state = { ...state, accessoryMultiplier: paid };
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
  const calls = { day: 0, count: 0 };
  const ads = profile.ads;
  const watched = {
    returned: false, boostUntil: 0, day: 0, boosts: 0, helps: 0,
    // The places added 2026-10-21: today's counts, the campaign running and the courses rushed.
    experience: 0, courses: 0, balloons: 0, sans: 0, campaigns: 0, quests: 0, events: 0,
    campaignUntil: 0, campaignBusiness: '', rushed: {} as Record<string, number>,
  };
  // Ads have no lock since 2026-10-21: a button is there whenever its place is on screen.
  const adsOpen = () => ads !== undefined;
  const extras = () => ads?.extras === true;
  /** Money the places added 2026-10-21 paid, by place. */
  const adPaid: Record<string, number> = {};
  /** An ad money reward of the places added 2026-10-21. */
  const adExtra = (amount: number, placement: string) => {
    if (amount <= 0) return;
    sources.adExtras += amount;
    adPaid[placement] = (adPaid[placement] ?? 0) + amount;
    earnTracked(amount);
  };
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
      sources.offline += amount;
      if (amount > 0) watched.returned = true;
    }
    if (day !== calls.day) Object.assign(calls, { day, count: 0 });
    if (day !== watched.day) {
      Object.assign(watched, { day, boosts: 0, helps: 0, experience: 0, courses: 0, balloons: 0, sans: 0, campaigns: 0, quests: 0, events: 0 });
    }
    if (!ads || !adsOpen()) return;
    const left = Math.max(0, watched.boostUntil - time.clock);
    if (watched.boosts < ads.boostsPerDay && left + BOOST_SECONDS <= BOOST_MAX_SECONDS) {
      watched.boostUntil = time.clock + left + BOOST_SECONDS;
      watched.boosts += 1;
    }
    if (!extras()) return;
    const limit = (placement: keyof typeof AD_PLACEMENTS) => AD_PLACEMENTS[placement].perDay ?? Infinity;
    // Time: a few months of experience and a course pushed ahead.
    // Experience: once per job, while it is not mastered (runtime/adRewards.ts canRushExperience).
    if (state.careerId !== null && watched.experience < limit('experience_rush') && !isMastered(state, state.careerId) && !watched.rushed[`job:${state.careerId}`]) {
      const careerId = state.careerId;
      watched.rushed[`job:${careerId}`] = 1;
      state = { ...state, jobSeconds: { ...state.jobSeconds, [careerId]: (state.jobSeconds[careerId] ?? 0) + EXPERIENCE_RUSH_MONTHS * SECONDS_PER_MONTH } };
      watched.experience += 1;
    }
    const course = state.course;
    if (course && watched.courses < limit('course_rush') && (watched.rushed[course.id] ?? 0) < COURSE_RUSH_PER_COURSE) {
      state = { ...state, course: { ...course, seconds: course.seconds + courseRushSeconds(state) } };
      watched.rushed[course.id] = (watched.rushed[course.id] ?? 0) + 1;
      watched.courses += 1;
    }
    // Money: the balloon and Şans on call, once a session.
    if (watched.balloons < limit('opportunity')) {
      adExtra(opportunityReward(state), 'opportunity');
      watched.balloons += 1;
    }
    if (watched.sans < limit('call_sans')) {
      adExtra(fetchReward(state) * AD_FIND_MULTIPLIER, 'call_sans');
      watched.sans += 1;
    }
    // A campaign on the business that earns the most, for the session.
    if (watched.campaigns < limit('business_campaign')) {
      const best = BUSINESSES.map((def) => ({ def, income: baseBusinessIncomePerSecond(def, businessState(state, def.id)) }))
        .sort((a, b) => b.income - a.income)[0];
      if (best && best.income > 0) {
        watched.campaignBusiness = best.def.id;
        watched.campaignUntil = time.clock + CAMPAIGN_SECONDS;
        watched.campaigns += 1;
      }
    }
  };

  /** "A little help" is on offer for this purchase today (cards that show it, daily limit). */
  const helpOffered = (candidate: Candidate) =>
    ads !== undefined && adsOpen() && watched.helps < ads.helpsPerDay && HELP_KINDS.has(candidate.kind);

  /** The most the help pays: 10% of the price, at most 5 minutes of income. */
  const helpCap = (candidate: Candidate) =>
    Math.min(candidate.cost * HELP_MAX_SHARE, autoIncomePerSecond(state) * HELP_MAX_INCOME_SECONDS);

  /** The help pays what is missing once that is within the cap. */
  const helpWith = (candidate: Candidate) => {
    const missing = candidate.cost - state.cash;
    if (!helpOffered(candidate) || missing <= 0 || missing > helpCap(candidate)) return false;
    earnTracked(missing);
    sources.help += missing;
    if (state.cash < candidate.cost) state = { ...state, cash: candidate.cost };
    watched.helps += 1;
    return true;
  };

  /**
   * The gifts that close each class ceremony and the life moments told by age (first life only, as
   * the story): paid when the bot is playing, doubled when it watches ads.
   */
  const giftsPaid = { classes: 0, moments: new Set<string>() };
  const payStoryGifts = () => {
    for (let guard = 0; guard < 20 && storyRuns(state); guard += 1) {
      const multiplier = doubles() ? AD_STORY_GIFT_MULTIPLIER : 1;
      if (giftsPaid.classes < state.classIndex) {
        giftsPaid.classes += 1;
        if (giftsPaid.classes >= STORY_GIFT_FROM_CLASS) {
          const gift = storyGift(state) * multiplier;
          sources.gifts += gift;
          earnTracked(gift);
        }
        continue;
      }
      const moment = LIFE_MOMENTS.find(
        (entry) => entry.gift !== false && !giftsPaid.moments.has(entry.id) && heroAge(state).years >= entry.age && state.classIndex >= entry.afterCeremony,
      );
      if (!moment) return;
      giftsPaid.moments.add(moment.id);
      const gift = storyGift(state) * multiplier;
      sources.gifts += gift;
      earnTracked(gift);
    }
  };

  /**
   * The daily reward (runtime/daily.ts): offered from the first return with a manager, once a calendar
   * day; the amount is fixed when the day's first session opens, doubled when the bot watches ads.
   */
  const daily = { day: 0, claimed: 0, paid: 0, claims: [] as { day: number; amount: number; className: string }[] };
  const claimDaily = () => {
    const day = Math.floor(time.clock / 86400) + 1;
    if (daily.day === day || !watched.returned) return;
    if (!Object.values(state.businesses).some((business) => business.managed)) return;
    daily.day = day;
    const amount = dailyReward(state, dailyMonths(daily.claimed)) * (doubles() ? 2 : 1);
    daily.claimed += 1;
    daily.paid += amount;
    daily.claims.push({ day, amount, className: WEALTH_CLASSES[state.classIndex].name });
    earnTracked(amount);
  };

  /** Event cards answered today: a day has at most EVENT_DAILY_MAX calls (runtime/eventDeck.ts). */
  const callsOpen = () => eventCardsFor(state).length > 0 && calls.count < EVENT_DAILY_MAX;

  /** Bottles a second: none once the ground is empty (Middle Class on). */
  const tapRate = () => (canCollect(state) ? profile.tapsPerSecond(time.activeGeneration) : 0);

  /** Money a second while playing, by source. */
  const rateParts = () => ({
    work: incomePerSecond(state, 'active') * boost(),
    bottles: tapRate() * tapValue(state),
    finds: (profile.fetchCatchRate * fetchReward(state) * (doubles() ? AD_FIND_MULTIPLIER : 1)) / fetchAverageSeconds(state),
    events:
      (callsOpen() ? (profile.eventAnswerRate * eventAverageReward(state)) / EVENT_AVERAGE_SECONDS : 0) *
      (extras() ? EVENT_AD_MULTIPLIER : 1),
    // The campaign's extra runs on its business (managed or run by hand while playing).
    campaign:
      extras() && time.clock < watched.campaignUntil
        ? (() => {
            const def = BUSINESSES.find((entry) => entry.id === watched.campaignBusiness);
            if (!def) return 0;
            const business = businessState(state, def.id);
            return baseBusinessIncomePerSecond(def, business) * uptime(business.managed, 'active') * globalMultiplier(state) * (CAMPAIGN_FACTOR - 1) * boost();
          })()
        : 0,
  });
  const activeRate = () => {
    const parts = rateParts();
    return parts.work + parts.bottles + parts.finds + parts.events + parts.campaign;
  };

  const playFor = (seconds: number) => {
    // Income is piecewise constant between purchases, but taps change with generation time,
    // so long waits are advanced in slices.
    let left = seconds;
    while (left > 0) {
      const step = Math.min(left, 30);
      const amount = activeRate() * step;
      const parts = rateParts();
      sources.work += parts.work * step;
      sources.bottles += parts.bottles * step;
      sources.finds += parts.finds * step;
      sources.events += parts.events * step;
      if (callsOpen()) calls.count += (profile.eventAnswerRate * step) / EVENT_AVERAGE_SECONDS;
      sources.adExtras += parts.campaign * step;
      adPaid.business_campaign = (adPaid.business_campaign ?? 0) + parts.campaign * step;
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
      payStoryGifts();
      claimDaily();
      // The hero ages only while playing; retirement comes at the end of life.
      const coursesBefore = state.coursesDone.length;
      state = live(state, step);
      // A finished course: its diploma gift (an ad).
      if (extras() && state.coursesDone.length > coursesBefore) adExtra(adGift(state), 'diploma_gift');
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
      const extra = extras() && watched.quests < (AD_PLACEMENTS.quest_x3.perDay ?? Infinity) ? questAdExtra(state, done) : 0;
      const next = claimQuest(state, done.id);
      if (!next) return;
      if (extra > 0) watched.quests += 1;
      sources.quests += next.generationEarnings - state.generationEarnings;
      state = next;
      adExtra(extra, 'quest_x3');
      for (let index = before + 1; index <= state.classIndex; index += 1) log('class', WEALTH_CLASSES[index].name);
    }
  };

  /** At launch the hero stays at 80 and plays on (config/content.ts): the end of life is logged once. */
  let reached80 = false;
  const maybeRetire = () => {
    if (!CONTENT.handover) {
      if (!reached80 && isLifeOver(state)) {
        reached80 = true;
        log('retire', 'Life reaches 80 (hand-over comes with generation 2)');
      }
      return;
    }
    // "Hand over now" at the top class skips the remaining years.
    if (options.retireAtTop === true && canHandOverEarly(state)) state = handOverEarly(state) ?? state;
    if (!canRetire(state)) return;
    // A running deal is paid out to the life that ends (runtime/engine.ts retire).
    if (investing.stake > 0) {
      const profit = investing.stake * investing.rate;
      investing.profit += profit;
      investing.stake = 0;
      earnTracked(profit);
    }
    log('retire', `Life ends, gen ${state.generation} (+${pendingLegacyPoints(state)} legacy)`);
    const next = retire(state);
    if (next) {
      state = buyHeirlooms(next);
      time.activeGeneration = 0;
    }
  };

  /**
   * Courses: with none running, the bot starts the cheapest one that opens a job paying more than its
   * own, once it has the money (a real player studies for the job they want, not for every job).
   */
  const maybeStudy = () => {
    if (state.course) return;
    const salary = currentSalary(state);
    const worth = availableCourses(state)
      .filter((course) => careersNeedingCourse(course.id).some((career) => career.salaryPerSecond > salary))
      .sort((a, b) => a.cost - b.cost)[0];
    if (!worth || state.cash < worth.cost) return;
    const next = startCourse(state, worth.id);
    if (next) {
      state = next;
      log('course', `Course: ${worth.name}`);
    }
  };

  const playSession = (sessionSeconds: number) => {
    const end = time.clock + sessionSeconds;
    maybeRetire();
    while (time.clock < end) {
      maybeStudy();
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
      if (best.wait > 0 && helpOffered(best.candidate)) {
        if (!helpWith(best.candidate)) {
          // Play until the gap is within the cap, when the help appears, then choose again.
          const helpAt = best.candidate.cost - helpCap(best.candidate);
          playFor(Math.min(Math.max((helpAt - state.cash) / rate, 0.05), end - time.clock));
          continue;
        }
      } else if (best.wait > 0) {
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
      const looksBefore = totalStages(state);
      const jobBefore = state.careerId;
      state = next;
      if (extras()) {
        // A business took on a new look: the opening party; a new job: the first-pay bonus.
        if (totalStages(state) > looksBefore) adExtra(adGift(state), 'grown_bonus');
        if (state.careerId !== jobBefore) adExtra(firstSalaryBonus(currentCareer(state)), 'first_salary');
      }
      claimGoals();
      if (isFirstPurchase) log('purchase', `First purchase: ${best.candidate.label}`);
      else if (best.candidate.kind === 'purchase') log('purchase', best.candidate.label);
      if (best.candidate.kind !== 'purchase') log(best.candidate.kind, best.candidate.label);
      maybeRetire();
    }
  };

  /**
   * Old Ray's deals (runtime/investment.ts): when a session ends, the bot puts its savings (up to the
   * cap) into the longest deal that is due by the next session; the bold deal pays its average. The
   * stake and return come back at the first session after the term.
   */
  const investing = { stake: 0, rate: 0, until: 0, profit: 0, count: 0 };
  const collectInvestment = () => {
    if (investing.stake <= 0 || time.clock < investing.until) return;
    const profit = investing.stake * investing.rate;
    state = { ...state, cash: state.cash + investing.stake };
    investing.profit += profit;
    investing.stake = 0;
    earnTracked(profit);
  };
  const invest = (gapSeconds: number) => {
    if (investing.stake > 0 || state.classIndex < INVEST_FROM_CLASS) return;
    // A halved deal (an ad) lets a longer one fit before the next session.
    const length = (hours: number) => hours * 3600 * (extras() ? 1 - INVEST_RUSH_SHARE : 1);
    const plan = [...INVEST_PLANS].sort((a, b) => b.hours - a.hours).find((entry) => length(entry.hours) <= gapSeconds);
    const stake = Math.min(state.cash, autoIncomePerSecond(state) * SECONDS_PER_MONTH * INVEST_CAP_MONTHS);
    if (!plan || stake <= 0) return;
    state = { ...state, cash: state.cash - stake };
    Object.assign(investing, { stake, rate: expectedGain(plan), until: time.clock + length(plan.hours), count: investing.count + 1 });
  };
  const schedule: { start: number; minutes: number; day: number }[] = [];
  for (let day = 1; day <= days; day += 1) {
    for (const session of profile.sessionsForDay(day)) {
      schedule.push({ start: (day - 1) * 86400 + session.startHour * 3600, minutes: session.minutes, day });
    }
  }

  for (const [index, { start, minutes, day }] of schedule.entries()) {
    {
      const session = { minutes };
      // Offline earnings arrive when the player returns, so milestones they cause belong to this session.
      comeBack(start, day);
      collectInvestment();
      // The day's reward is fixed when the day's first session opens (before any purchase).
      claimDaily();
      playSession(session.minutes * 60);
      log('session', sessionSummary(state));
      const next = schedule[index + 1];
      if (next) invest(next.start - time.clock);
    }
  }

  return {
    profile: profile.name,
    days,
    events,
    finalState: state,
    dailyPaid: daily.paid,
    dailyClaims: daily.claims,
    investProfit: investing.profit,
    investCount: investing.count,
    sources: { ...sources, daily: daily.paid, deals: investing.profit },
    adPaid,
  };
}

/** The bot spends legacy points at once: the watch (income) first, then always the cheapest level it can. */
function buyHeirlooms(start: GameStateV2) {
  let state = start;
  for (let guard = 0; guard < 100; guard += 1) {
    const options = HEIRLOOMS.map((def) => ({ def, price: heirloomPrice(def, heirloomLevel(state, def.id)) })).sort(
      (a, b) => (a.def.id === 'watch' ? -1 : b.def.id === 'watch' ? 1 : a.price - b.price),
    );
    const next = options.map(({ def }) => buyHeirloom(state, def.id)).find((bought) => bought !== null);
    if (!next) return state;
    state = next;
  }
  return state;
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
  ads: { boostsPerDay: 3, helpsPerDay: 4, doubles: true, extras: true },
};

/** Buys the Starter Pack: Şans's red scarf, +10% income for good (config/iap.ts). */
export const SCARF_BUYER: PlayerProfile = {
  ...ENGAGED_PLAYER,
  name: 'engaged + scarf',
  accessoryMultiplier: 1 + PRODUCTS.starter.incomeBonus,
};

/** The ruby collar's bonus (decided 2026-10-15); it moves to config/iap.ts when the product is built (step 2). */
export const RUBY_COLLAR_TRIAL = 0.5;

/**
 * The paying player of step 2 (monetization-v2 §5, not on sale yet): watches ads, wears the scarf and
 * the ruby collar (+50%). Shown to watch the late game of the fastest player.
 */
export const RUBY_PAYER: PlayerProfile = {
  ...AD_WATCHER,
  name: 'engaged + ads + scarf + ruby',
  accessoryMultiplier: (1 + PRODUCTS.starter.incomeBonus) * (1 + RUBY_COLLAR_TRIAL),
};


export const PROFILES = [ENGAGED_PLAYER, CASUAL_PLAYER, AD_WATCHER, SCARF_BUYER, RUBY_PAYER];

/** Share of active income (bottles excluded) that comes from businesses rather than salary and rent. */
export function businessShare(state: GameStateV2) {
  const total = incomePerSecond(state, 'active');
  if (total <= 0) return 0;
  return 1 - (steadyIncomePerSecond(state) * globalMultiplier(state)) / total;
}

/** Exposed for reports: total base income of every business line (no multipliers). */
export function businessBreakdown(state: GameStateV2) {
  return BUSINESSES.map((def) => {
    const business = businessState(state, def.id);
    return {
      name: def.name,
      level: business.level,
      locations: locations(business),
      managed: business.managed,
      baseIncome: baseBusinessIncomePerSecond(def, business),
    };
  });
}

/** One-line diagnosis of where income comes from (used by `npm run sim -- --sessions`). */
export function sessionSummary(state: GameStateV2) {
  const lines = businessBreakdown(state)
    .filter((line) => line.level > 0)
    .map((line) => ({ ...line, share: line.baseIncome }))
    .sort((a, b) => b.share - a.share);
  const salary = salaryPerSecond(state);
  const rent = rentPerSecond(state);
  const total = lines.reduce((sum, line) => sum + line.share, salary + rent) || 1;
  const top = lines
    .slice(0, 3)
    .map((line) => `${line.name} L${line.level}×${line.locations}${line.managed ? 'm' : ''} ${Math.round((line.share / total) * 100)}%`)
    .join(', ');
  return [
    `cash ${state.cash.toExponential(2)}`,
    `x${globalMultiplier(state).toFixed(1)} (status +${Math.round(statusBonus(state) * 100)}%, legacy x${legacyMultiplier(state).toFixed(2)})`,
    `job ${state.careerId ?? '-'}, courses ${state.coursesDone.length}`,
    `items ${state.lifestyleOwned.length}`,
    `home ${state.home}${state.homesOwned.includes(state.home) ? ' (owned)' : ''}, owns ${state.homesOwned.length}`,
    `salary ${Math.round((salary / total) * 100)}%`,
    `rent ${Math.round((rent / total) * 100)}%`,
    top,
  ].join(' | ');
}

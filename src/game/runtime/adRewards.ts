import {
  AD_GIFT_SECONDS,
  AD_PLACEMENTS,
  BOOST_FACTOR,
  BOOST_MAX_SECONDS,
  BOOST_SECONDS,
  CAMPAIGN_SECONDS,
  COIN_RAIN_SECONDS,
  COURSE_RUSH_PER_COURSE,
  COURSE_RUSH_SHARE,
  EVENT_AD_MULTIPLIER,
  EXPERIENCE_RUSH_MONTHS,
  FIRST_SALARY_MONTHS,
  HELP_MAX_INCOME_SECONDS,
  HELP_MAX_SHARE,
  INVEST_RUSH_SHARE,
  OPPORTUNITY_SECONDS,
  QUEST_AD_MULTIPLIER,
  TEMP_MANAGER_SECONDS,
  type AdPlacement,
} from '../core/config/ads';
import { courseDef } from '../core/config/courses';
import type { EventOutcome } from '../core/config/events';
import { SECONDS_PER_MONTH } from '../core/config/life';
import { autoIncomePerSecond, businessState, currentCareer, eventReward, incomePerSecond, isOpened, questReward } from '../core/formulas';
import { earn } from '../core/state';
import type { CareerDef, GameStateV2, QuestDef } from '../core/types';
import type { InvestProgress } from './investment';

// What rewarded ads give and when they can be watched (docs/monetization-v2.md §4). Every place has
// one line in config/ads.ts AD_PLACEMENTS (daily limit, cooldown); this file holds the counters they
// share and one reward per place. Pure rules: the store calls them after showRewardedAd() returned
// 'rewarded' (or at once with the Comfort Pack). Days are calendar days on the player's phone.
//
// There is no lock in front of the ads (decided 2026-10-21, user): a button is there whenever its
// place is on screen, from the first minutes on. Nothing opens by itself and nothing is forced.

export interface AdProgress {
  /** Wall-clock ms until which the income boost runs (0 = never). */
  boostUntil: number;
  /** The day the counters in `today` belong to (local YYYY-MM-DD). */
  day: string;
  /** Ads watched today, by place. */
  today: Partial<Record<AdPlacement, number>>;
  /** When each place's last ad was watched (ms), for cooldowns. */
  lastAt: Partial<Record<AdPlacement, number>>;
  /** Ads watched for one thing ("course_rush:mba", "first_salary:waiter"): how many, ever. */
  marks: Record<string, number>;
  /** Businesses run by a stand-in manager, until (ms). */
  tempManagers: Record<string, number>;
  /** Businesses on a campaign (×3), until (ms). */
  campaigns: Record<string, number>;
  /** Coins rain on the ground until (ms). */
  coinRainUntil: number;
  /** An offline card was collected once (the daily reward starts after it). */
  returned: boolean;
}

export function createAdProgress(): AdProgress {
  return { boostUntil: 0, day: '', today: {}, lastAt: {}, marks: {}, tempManagers: {}, campaigns: {}, coinRainUntil: 0, returned: false };
}

/** What the rules read; the runtime state fits it. */
interface AdContext {
  game: GameStateV2;
  ads: AdProgress;
}

export function dayKey(now: number) {
  const date = new Date(now);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The counters as of today: a new day starts them over. */
function asOfToday(ads: AdProgress, now: number): AdProgress {
  const day = dayKey(now);
  return ads.day === day ? ads : { ...ads, day, today: {} };
}

/**
 * The daily reward (runtime/daily.ts) starts once the player has hired a manager and come back to
 * offline earnings once. Ads no longer wait for it (2026-10-21).
 */
export function rewardsStarted({ game, ads }: AdContext) {
  return ads.returned && Object.values(game.businesses).some((business) => business.managed);
}

// ── Shared limits ──

/** Ads left today at a place (Infinity when it has no daily limit). */
export function adsLeft(ads: AdProgress, placement: AdPlacement, now: number) {
  const limit = AD_PLACEMENTS[placement].perDay;
  return limit === undefined ? Infinity : Math.max(0, limit - (asOfToday(ads, now).today[placement] ?? 0));
}

/** Seconds until the place's cooldown is over (0 = ready). */
export function adCooldownLeft(ads: AdProgress, placement: AdPlacement, now: number) {
  const cooldown = AD_PLACEMENTS[placement].cooldownSeconds ?? 0;
  const last = ads.lastAt[placement] ?? 0;
  return Math.max(0, (last + cooldown * 1000 - now) / 1000);
}

/** The place can show its button now: ads left today and no cooldown. */
export function canWatch(ads: AdProgress, placement: AdPlacement, now: number) {
  return adsLeft(ads, placement, now) > 0 && adCooldownLeft(ads, placement, now) === 0;
}

/** How many ads were watched for one thing (`mark` like "course_rush:mba"). */
export function marked(ads: AdProgress, mark: string) {
  return ads.marks[mark] ?? 0;
}

/** Counts one ad at a place (and for a thing, if any). */
function counted(ads: AdProgress, placement: AdPlacement, now: number, mark?: string): AdProgress {
  const current = asOfToday(ads, now);
  return {
    ...current,
    today: { ...current.today, [placement]: (current.today[placement] ?? 0) + 1 },
    lastAt: { ...current.lastAt, [placement]: now },
    marks: mark ? { ...current.marks, [mark]: marked(current, mark) + 1 } : current.marks,
  };
}

/** Pays `amount` for an ad at `placement`; null when the place has nothing left today or nothing to pay. */
function payFor<T extends AdContext>(state: T, placement: AdPlacement, now: number, amount: number, mark?: string): T | null {
  if (!canWatch(state.ads, placement, now) || amount <= 0) return null;
  return { ...state, game: earn(state.game, amount), ads: counted(state.ads, placement, now, mark) };
}

/** A watched ad that changes the state some other way (time, a stand-in manager...). */
function grant<T extends AdContext>(state: T, placement: AdPlacement, now: number, change: (state: T) => T | null, mark?: string): T | null {
  if (!canWatch(state.ads, placement, now)) return null;
  const next = change(state);
  return next ? { ...next, ads: counted(next.ads, placement, now, mark) } : null;
}

// ── Income boost ──

export function boostSecondsLeft(ads: AdProgress, now: number) {
  return Math.max(0, (ads.boostUntil - now) / 1000);
}

/** What all earnings are multiplied by right now. */
export function boostFactor(ads: AdProgress, now: number) {
  return ads.boostUntil > now ? BOOST_FACTOR : 1;
}

/** The share of the time from `from` to `to` (ms) that the boost covers. */
export function boostShare(ads: AdProgress, from: number, to: number) {
  if (to <= from) return 0;
  return Math.min(Math.max(ads.boostUntil - from, 0), to - from) / (to - from);
}

export function boostsLeft(ads: AdProgress, now: number) {
  return adsLeft(ads, 'income_boost', now);
}

/** Another hour still fits under the cap. */
export function boostHasRoom(ads: AdProgress, now: number) {
  return boostSecondsLeft(ads, now) + BOOST_SECONDS <= BOOST_MAX_SECONDS;
}

export function canBoost(context: AdContext, now: number) {
  return canWatch(context.ads, 'income_boost', now) && boostHasRoom(context.ads, now);
}

/** A boost ad was watched: an hour more, from now or on top of what is left. */
export function applyBoost<T extends AdContext>(state: T, now: number): T | null {
  if (!boostHasRoom(state.ads, now)) return null;
  return grant(state, 'income_boost', now, (s) => ({
    ...s,
    ads: { ...s.ads, boostUntil: Math.max(s.ads.boostUntil, now) + BOOST_SECONDS * 1000 },
  }));
}

// ── A little help (every buy button) ──

/** How much is missing for something that costs `cost`. */
export function helpMissing(game: GameStateV2, cost: number) {
  return Math.max(0, cost - game.cash);
}

/** The most a help can pay toward something that costs `cost`: 10% of it, at most 5 minutes of income. */
function helpCap(game: GameStateV2, cost: number) {
  return Math.min(cost * HELP_MAX_SHARE, autoIncomePerSecond(game) * HELP_MAX_INCOME_SECONDS);
}

/** Offered on something that costs `cost` only when what is missing is within the cap above. */
export function canHelp(context: AdContext, now: number, cost: number) {
  const missing = helpMissing(context.game, cost);
  return canWatch(context.ads, 'dream_help', now) && missing > 0 && missing <= helpCap(context.game, cost);
}

/** Pays `amount`, the figure the button showed (what was missing when it appeared), never more than the cap. */
export function applyHelp<T extends AdContext>(state: T, now: number, cost: number, amount: number): T | null {
  return payFor(state, 'dream_help', now, Math.min(amount, helpCap(state.game, cost)));
}

// ── Time: courses, experience, deals ──

/** What one ad takes off the running course (seconds): a quarter of it, at least a month, never past the end. */
export function courseRushSeconds(game: GameStateV2) {
  const running = game.course ? courseDef(game.course.id) : undefined;
  if (!game.course || !running) return 0;
  const length = running.months * SECONDS_PER_MONTH;
  return Math.min(Math.max(length * COURSE_RUSH_SHARE, SECONDS_PER_MONTH), length - game.course.seconds);
}

export function canRushCourse({ game, ads }: AdContext, now: number) {
  return (
    game.course !== null &&
    courseRushSeconds(game) > 0 &&
    marked(ads, `course_rush:${game.course.id}`) < COURSE_RUSH_PER_COURSE &&
    canWatch(ads, 'course_rush', now)
  );
}

/** The course moves on; a course pushed past its length finishes with the next tick (core/state.ts live). */
export function applyCourseRush<T extends AdContext>(state: T, now: number): T | null {
  const course = state.game.course;
  if (!course || !canRushCourse(state, now)) return null;
  const seconds = courseRushSeconds(state.game);
  return grant(
    state,
    'course_rush',
    now,
    (s) => ({ ...s, game: { ...s.game, course: { ...course, seconds: course.seconds + seconds } } }),
    `course_rush:${course.id}`,
  );
}

export function canRushExperience({ game, ads }: AdContext, now: number) {
  return game.careerId !== null && canWatch(ads, 'experience_rush', now);
}

/** Months of experience in the job held. */
export function applyExperienceRush<T extends AdContext>(state: T, now: number): T | null {
  const careerId = state.game.careerId;
  if (careerId === null) return null;
  const add = EXPERIENCE_RUSH_MONTHS * SECONDS_PER_MONTH;
  return grant(state, 'experience_rush', now, (s) => ({
    ...s,
    game: { ...s.game, jobSeconds: { ...s.game.jobSeconds, [careerId]: (s.game.jobSeconds[careerId] ?? 0) + add } },
  }));
}

type InvestContext = AdContext & { invest: InvestProgress };

/** A running deal can be halved once. */
export function canRushInvest({ ads, invest }: InvestContext, now: number) {
  const deal = invest.active;
  return deal !== null && deal.until > now && marked(ads, `invest_rush:${deal.startedAt}`) === 0 && canWatch(ads, 'invest_rush', now);
}

export function applyInvestRush<T extends InvestContext>(state: T, now: number): T | null {
  const deal = state.invest.active;
  if (!deal || !canRushInvest(state, now)) return null;
  const until = now + (deal.until - now) * (1 - INVEST_RUSH_SHARE);
  return grant(state, 'invest_rush', now, (s) => ({ ...s, invest: { ...s.invest, active: { ...deal, until } } }), `invest_rush:${deal.startedAt}`);
}

// ── Businesses: a stand-in manager, a campaign ──

export function tempManagerLeft(ads: AdProgress, businessId: string, now: number) {
  return Math.max(0, ((ads.tempManagers[businessId] ?? 0) - now) / 1000);
}

export function campaignLeft(ads: AdProgress, businessId: string, now: number) {
  return Math.max(0, ((ads.campaigns[businessId] ?? 0) - now) / 1000);
}

/** What a business's runs are multiplied by right now (a campaign). */
export function campaignFactor(ads: AdProgress, businessId: string, now: number, factor: number) {
  return campaignLeft(ads, businessId, now) > 0 ? factor : 1;
}

/** An opened business without a manager, not already covered. */
export function canTempManage({ game, ads }: AdContext, businessId: string, now: number) {
  const business = businessState(game, businessId);
  return isOpened(business) && !business.managed && tempManagerLeft(ads, businessId, now) === 0 && canWatch(ads, 'temp_manager', now);
}

export function applyTempManager<T extends AdContext>(state: T, businessId: string, now: number): T | null {
  if (!canTempManage(state, businessId, now)) return null;
  return grant(state, 'temp_manager', now, (s) => ({
    ...s,
    ads: { ...s.ads, tempManagers: { ...s.ads.tempManagers, [businessId]: now + TEMP_MANAGER_SECONDS * 1000 } },
  }));
}

export function canCampaign({ game, ads }: AdContext, businessId: string, now: number) {
  return isOpened(businessState(game, businessId)) && campaignLeft(ads, businessId, now) === 0 && canWatch(ads, 'business_campaign', now);
}

export function applyCampaign<T extends AdContext>(state: T, businessId: string, now: number): T | null {
  if (!canCampaign(state, businessId, now)) return null;
  return grant(state, 'business_campaign', now, (s) => ({
    ...s,
    ads: { ...s.ads, campaigns: { ...s.ads.campaigns, [businessId]: now + CAMPAIGN_SECONDS * 1000 } },
  }));
}

// ── Money on cards ──

/** The gift an ad brings on a card with none of its own ("has grown", a diploma, the balloon's is OPPORTUNITY_SECONDS). */
export function adGift(game: GameStateV2, seconds = AD_GIFT_SECONDS) {
  return incomePerSecond(game, 'active') * seconds;
}

/** What the ad adds to a goal's reward (the reward is paid as usual; this is the extra). */
export function questAdExtra(game: GameStateV2, quest: QuestDef) {
  return questReward(game, quest) * (QUEST_AD_MULTIPLIER - 1);
}

/** What the ad adds after an answered event card: the result again, or a loss taken back plus the safe answer. */
export function eventAdExtra(game: GameStateV2, outcome: EventOutcome) {
  const result = eventReward(game, outcome);
  return result >= 0 ? result * (EVENT_AD_MULTIPLIER - 1) : -result + eventReward(game, 'safe');
}

/** The welcome bonus for a new job: months of its salary. */
export function firstSalaryBonus(career: CareerDef | undefined) {
  return (career?.salaryPerSecond ?? 0) * SECONDS_PER_MONTH * FIRST_SALARY_MONTHS;
}

/** The welcome bonus is for the job held, once per job. */
export function canFirstSalary({ game, ads }: AdContext, now: number) {
  return game.careerId !== null && marked(ads, `first_salary:${game.careerId}`) === 0 && canWatch(ads, 'first_salary', now);
}

/** Pays a card's ad: `placement` with its amount, once per `mark` when there is one. */
export function applyCardAd<T extends AdContext>(state: T, placement: AdPlacement, now: number, amount: number, mark?: string): T | null {
  if (mark && marked(state.ads, mark) > 0) return null;
  return payFor(state, placement, now, amount, mark);
}

export function applyFirstSalary<T extends AdContext>(state: T, now: number): T | null {
  if (!canFirstSalary(state, now)) return null;
  return applyCardAd(state, 'first_salary', now, firstSalaryBonus(currentCareer(state.game)), `first_salary:${state.game.careerId}`);
}

// ── The scene: Şans, coins, the balloon ──

/** Coins rain now (taps pay more and the ground fills faster). */
export function coinRainActive(ads: AdProgress, now: number) {
  return ads.coinRainUntil > now;
}

export function applyCoinRain<T extends AdContext>(state: T, now: number): T | null {
  return grant(state, 'coin_rain', now, (s) => ({ ...s, ads: { ...s.ads, coinRainUntil: now + COIN_RAIN_SECONDS * 1000 } }));
}

/** Şans goes looking at once: the scene starts the find when this returns a state. */
export function applyCallSans<T extends AdContext>(state: T, now: number): T | null {
  return grant(state, 'call_sans', now, (s) => s);
}

export function opportunityReward(game: GameStateV2) {
  return adGift(game, OPPORTUNITY_SECONDS);
}

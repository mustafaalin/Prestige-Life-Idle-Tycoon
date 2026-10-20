import { BUSINESSES } from '../core/config/businesses';
import { BOTTLE_VALUE_BY_CLASS } from '../core/config/scene';
import { RETIREMENT_AGE, SECONDS_PER_YEAR, START_AGE } from '../core/config/life';
import { formatDuration, formatMoney } from '../core/format';
import type { SimEvent, SimResult } from './simulator';

// Pacing targets from docs/game-design-v2.md §5, checked against the engaged player profile.
// The bot buys optimally; real players are typically 1.3–1.8× slower, so late-game windows
// for the bot sit earlier than the design targets for real players.

type Clockish = Pick<SimEvent, 'clock' | 'activeTotal'>;

export interface PacingTarget {
  label: string;
  find: (events: SimEvent[]) => SimEvent | undefined;
  measure: 'active' | 'clock';
  min: number;
  max: number;
  /** Not reaching it at all also passes (a class the first life need not reach). */
  optional?: boolean;
}

const firstClass = (name: string, generation?: number) => (events: SimEvent[]) =>
  events.find((event) => event.kind === 'class' && event.label === name && (generation === undefined || event.generation === generation));

const DAY = 86400;

const HOUR = 3600;
const lifeAge = (age: number) => (age - START_AGE) * SECONDS_PER_YEAR;

// New targets with the economy rebuild (2026-10-21, docs/game-design-v2.md §4.2): the in-game calendar
// is realistic, so the classes are pinned to the hero's age (16 minutes of play = 1 year). Millionaire
// in the late twenties to mid thirties, Billionaire in the second half of life; the first life need not
// reach the top two classes (decided 2026-10-20).
export const PACING_TARGETS: PacingTarget[] = [
  { label: 'First purchase', find: (e) => e.find((x) => x.kind === 'purchase'), measure: 'active', min: 0, max: 60 },
  { label: 'First business', find: (e) => e.find((x) => x.kind === 'business'), measure: 'active', min: 2 * 60, max: 6 * 60 },
  { label: 'First manager', find: (e) => e.find((x) => x.kind === 'manager'), measure: 'active', min: 8 * 60, max: 25 * 60 },
  { label: 'Day Laborer (gen 1)', find: firstClass('Day Laborer', 1), measure: 'active', min: 4 * 60, max: 15 * 60 },
  { label: 'Working Class (gen 1)', find: firstClass('Working Class', 1), measure: 'active', min: 20 * 60, max: HOUR },
  { label: 'Middle Class (gen 1, age 21–26)', find: firstClass('Middle Class', 1), measure: 'active', min: lifeAge(21), max: lifeAge(26) },
  { label: 'Millionaire (gen 1, age 26–35)', find: firstClass('Millionaire', 1), measure: 'active', min: lifeAge(26), max: lifeAge(35) },
  { label: 'Billionaire (gen 1, age 50–72)', find: firstClass('Billionaire', 1), measure: 'active', min: lifeAge(50), max: lifeAge(72) },
  { label: 'Multibillionaire (gen 1, not before 70)', find: firstClass('Multibillionaire', 1), measure: 'active', min: lifeAge(70), max: Infinity, optional: true },
  { label: 'Richest (not in gen 1)', find: firstClass('Richest Person Alive', 1), measure: 'active', min: Infinity, max: Infinity, optional: true },
  { label: `First life ends (age ${RETIREMENT_AGE})`, find: (e) => e.find((x) => x.kind === 'retire'), measure: 'clock', min: 18 * DAY, max: 30 * DAY },
];

export function formatClock(seconds: number) {
  const day = Math.floor(seconds / DAY) + 1;
  const rest = seconds % DAY;
  const hours = String(Math.floor(rest / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((rest % 3600) / 60)).padStart(2, '0');
  return `D${day} ${hours}:${minutes}`;
}

function describe(event: Clockish) {
  return `${formatClock(event.clock)}  (played ${formatDuration(event.activeTotal)})`;
}

export function checkTargets(result: SimResult) {
  return PACING_TARGETS.map((target) => {
    const event = target.find(result.events);
    const value = event ? (target.measure === 'active' ? event.activeTotal : event.clock) : Number.POSITIVE_INFINITY;
    const pass = (event === undefined && target.optional === true) || (value >= target.min && value <= target.max);
    const bound = (seconds: number) => (target.measure === 'active' ? formatDuration(seconds) : formatClock(seconds));
    const range = !Number.isFinite(target.min)
      ? 'never'
      : !Number.isFinite(target.max)
        ? `${bound(target.min)} or later${target.measure === 'active' ? ' played' : ''}`
        : `${bound(target.min)}–${bound(target.max)}${target.measure === 'active' ? ' played' : ''}`;
    return { label: target.label, pass, got: event ? describe(event) : 'never', range };
  });
}

// Feel checks (2026-10-08): pacing targets alone let businesses shrink to a side income while every
// class still arrived on time (a Flower Stand run paid $0.01). These keep the core loop the core.

/**
 * A business's first run must pay at least this many bottles (decided 2026-10-20: one stand's "Run"
 * must clearly beat a bottle; the Flower Stand pays ~12).
 */
export const MIN_RUN_BOTTLES = 5;
/** Businesses should earn at least this share of income (bottles excluded) early in the first life. */
export const MIN_BUSINESS_SHARE = 0.5;

const percent = (share: number) => `${Math.round(share * 100)}%`;

export function checkFeel(result: SimResult) {
  const firstRun = (def: (typeof BUSINESSES)[number]) => def.levels[0].revenue;
  const lowest = BUSINESSES.reduce((low, def) => (firstRun(def) < firstRun(low) ? def : low));
  const minRun = MIN_RUN_BOTTLES * BOTTLE_VALUE_BY_CLASS[0];
  const share = (event: SimEvent | undefined) => event?.businessShare ?? 0;
  const dayLaborer = firstClass('Day Laborer', 1)(result.events);
  const firstSession = result.events.find((event) => event.kind === 'session');
  const sessions = result.events.filter((event) => event.kind === 'session' && event.generation === 1);
  const sorted = sessions.map((event) => event.businessShare).sort((a, b) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  return [
    {
      label: 'A first run beats a bottle',
      pass: firstRun(lowest) >= minRun,
      got: `lowest ${formatMoney(firstRun(lowest))} (${lowest.name})`,
      range: `>= ${formatMoney(minRun)} per run (${MIN_RUN_BOTTLES} bottles)`,
    },
    {
      label: 'Business share at Day Laborer',
      pass: share(dayLaborer) >= MIN_BUSINESS_SHARE,
      got: percent(share(dayLaborer)),
      range: `>= ${percent(MIN_BUSINESS_SHARE)}`,
    },
    {
      label: 'Business share, 1st session end',
      pass: share(firstSession) >= MIN_BUSINESS_SHARE,
      got: percent(share(firstSession)),
      range: `>= ${percent(MIN_BUSINESS_SHARE)}`,
    },
    {
      label: 'Business share, gen 1 median',
      pass: median >= MIN_BUSINESS_SHARE,
      got: percent(median),
      range: `>= ${percent(MIN_BUSINESS_SHARE)}`,
    },
  ];
}

const TIMELINE_KINDS = new Set(['class', 'rank', 'manager', 'career', 'course', 'retire', 'business', 'session']);

export function timeline(result: SimResult, maxRows = 200, kinds: Set<string> = TIMELINE_KINDS) {
  return result.events
    .filter((event) => kinds.has(event.kind))
    .slice(0, maxRows)
    .map(
      (event) =>
        `${formatClock(event.clock).padEnd(10)} ${formatDuration(event.activeTotal).padStart(8)}  g${event.generation}  ${event.kind.padEnd(9)} ${event.label.padEnd(40)} ${formatMoney(event.income)}/s  biz ${percent(event.businessShare)}`
    );
}

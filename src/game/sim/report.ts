import { BUSINESSES } from '../core/config/businesses';
import { RETIREMENT_AGE } from '../core/config/life';
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
}

const firstClass = (name: string, generation?: number) => (events: SimEvent[]) =>
  events.find((event) => event.kind === 'class' && event.label === name && (generation === undefined || event.generation === generation));

const DAY = 86400;

export const PACING_TARGETS: PacingTarget[] = [
  // A job comes first, the Flower Stand ($120) is bought from savings (2026-10-09; price 2026-10-13).
  { label: 'First purchase', find: (e) => e.find((x) => x.kind === 'purchase'), measure: 'active', min: 0, max: 60 },
  { label: 'First business', find: (e) => e.find((x) => x.kind === 'business'), measure: 'active', min: 2 * 60, max: 6 * 60 },
  // The stand's manager costs $1K and Day Laborer comes sooner since 2026-10-13 (a faster first ten minutes).
  { label: 'First manager', find: (e) => e.find((x) => x.kind === 'manager'), measure: 'active', min: 5 * 60, max: 25 * 60 },
  { label: 'Day Laborer (gen 1)', find: firstClass('Day Laborer', 1), measure: 'active', min: 4 * 60, max: 10 * 60 },
  { label: 'Working Class (gen 1)', find: firstClass('Working Class', 1), measure: 'active', min: 18 * 60, max: 35 * 60 },
  { label: 'Middle Class (gen 1)', find: firstClass('Middle Class', 1), measure: 'active', min: 25 * 60, max: 50 * 60 },
  // Millionaire (10M) should land on a return session, after Middle Class's session.
  { label: 'Millionaire (gen 1)', find: firstClass('Millionaire', 1), measure: 'active', min: 35 * 60, max: 75 * 60 },
  // Classes spread over more days since 2026-10-09 (slower ageing, life.ts).
  { label: 'First Billionaire', find: firstClass('Billionaire'), measure: 'clock', min: 2 * DAY, max: 6 * DAY },
  { label: 'First Multibillionaire', find: firstClass('Multibillionaire'), measure: 'clock', min: 7 * DAY, max: 13 * DAY },
  { label: 'First Richest Person Alive', find: firstClass('Richest Person Alive'), measure: 'clock', min: 13 * DAY, max: 20 * DAY },
  // Single life (§4.9): the first hand-over to the heir comes when the hero's life ends (~17 h played).
  { label: `First life ends (age ${RETIREMENT_AGE})`, find: (e) => e.find((x) => x.kind === 'retire'), measure: 'clock', min: 20 * DAY, max: 36 * DAY },
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
    const pass = value >= target.min && value <= target.max;
    const range =
      target.measure === 'active'
        ? `${formatDuration(target.min)}–${formatDuration(target.max)} played`
        : `${formatClock(target.min)}–${formatClock(target.max)}`;
    return { label: target.label, pass, got: event ? describe(event) : 'never', range };
  });
}

// Feel checks (2026-10-08): pacing targets alone let businesses shrink to a side income while every
// class still arrived on time (a Flower Stand run paid $0.01). These keep the core loop the core.

/** Lowest acceptable money per run of a business's first unit, so "Run" always shows a real amount. */
export const MIN_RUN_REVENUE = 1;
/** Businesses should earn at least this share of income (bottles excluded) early in the first life. */
export const MIN_BUSINESS_SHARE = 0.5;

const percent = (share: number) => `${Math.round(share * 100)}%`;

export function checkFeel(result: SimResult) {
  const lowest = BUSINESSES.reduce((low, def) => (def.baseRevenue < low.baseRevenue ? def : low));
  const share = (event: SimEvent | undefined) => event?.businessShare ?? 0;
  const dayLaborer = firstClass('Day Laborer', 1)(result.events);
  const firstSession = result.events.find((event) => event.kind === 'session');
  const sessions = result.events.filter((event) => event.kind === 'session' && event.generation === 1);
  const sorted = sessions.map((event) => event.businessShare).sort((a, b) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  return [
    {
      label: 'Every run pays a real amount',
      pass: lowest.baseRevenue >= MIN_RUN_REVENUE,
      got: `lowest ${formatMoney(lowest.baseRevenue)} (${lowest.name})`,
      range: `>= ${formatMoney(MIN_RUN_REVENUE)} per run`,
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

const TIMELINE_KINDS = new Set(['class', 'rank', 'manager', 'career', 'retire', 'business', 'session']);

export function timeline(result: SimResult, maxRows = 200, kinds: Set<string> = TIMELINE_KINDS) {
  return result.events
    .filter((event) => kinds.has(event.kind))
    .slice(0, maxRows)
    .map(
      (event) =>
        `${formatClock(event.clock).padEnd(10)} ${formatDuration(event.activeTotal).padStart(8)}  g${event.generation}  ${event.kind.padEnd(9)} ${event.label.padEnd(40)} ${formatMoney(event.income)}/s  biz ${percent(event.businessShare)}`
    );
}

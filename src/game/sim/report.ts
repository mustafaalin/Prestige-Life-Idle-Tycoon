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
  { label: 'First purchase', find: (e) => e.find((x) => x.kind === 'purchase'), measure: 'active', min: 0, max: 60 },
  { label: 'First business', find: (e) => e.find((x) => x.kind === 'business'), measure: 'active', min: 0, max: 120 },
  { label: 'First manager', find: (e) => e.find((x) => x.kind === 'manager'), measure: 'active', min: 120, max: 300 },
  { label: 'Millionaire (gen 1)', find: firstClass('Millionaire', 1), measure: 'active', min: 20 * 60, max: 30 * 60 },
  { label: 'Retirement unlocked (gen 1)', find: firstClass('Multimillionaire', 1), measure: 'clock', min: 0, max: 1.5 * DAY },
  { label: 'First retirement', find: (e) => e.find((x) => x.kind === 'retire'), measure: 'clock', min: 0.75 * DAY, max: 2 * DAY },
  { label: 'First Billionaire', find: firstClass('Billionaire'), measure: 'clock', min: 2 * DAY, max: 5 * DAY },
  { label: 'First Richest Person Alive', find: firstClass('Richest Person Alive'), measure: 'clock', min: 6 * DAY, max: 16 * DAY },
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

const TIMELINE_KINDS = new Set(['class', 'manager', 'career', 'retire', 'business', 'session']);

export function timeline(result: SimResult, maxRows = 200, kinds: Set<string> = TIMELINE_KINDS) {
  return result.events
    .filter((event) => kinds.has(event.kind))
    .slice(0, maxRows)
    .map(
      (event) =>
        `${formatClock(event.clock).padEnd(10)} ${formatDuration(event.activeTotal).padStart(8)}  g${event.generation}  ${event.kind.padEnd(9)} ${event.label.padEnd(40)} ${formatMoney(event.income)}/s`
    );
}

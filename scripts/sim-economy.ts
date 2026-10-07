// Usage: npm run sim [-- --days 30 --timeline --offline-cap 8 --life 60]
//   --offline-cap <hours>  try another offline cap (default: OFFLINE_CAP_HOURS)
//   --life <seconds/month> single-hero test: no retirement; prints the hero's age at each class
//                          (age 17 at install, aging only while playing)
// Bundled with esbuild and run in Node; logic lives in src/game/sim.

import { BUSINESSES } from '../src/game/core/config/businesses';
import { CAREERS } from '../src/game/core/config/careers';
import { formatDuration, formatMoney } from '../src/game/core/format';
import { WEALTH_CLASSES } from '../src/game/core/config/classes';
import { checkTargets, formatClock, timeline } from '../src/game/sim/report';
import { PROFILES, simulate } from '../src/game/sim/simulator';

const args = process.argv.slice(2);
const daysArg = args.indexOf('--days');
const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 30;
const showTimeline = args.includes('--timeline');
const showSessions = args.includes('--sessions');
const numberArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? Number(args[index + 1]) : undefined;
};
const offlineCapHours = numberArg('--offline-cap');
const secondsPerMonth = numberArg('--life');
const START_AGE = 17;

if (args.includes('--config')) {
  console.log('Businesses: name | first unit | growth | cycle | revenue/cycle | first-unit payback | manager');
  for (const b of BUSINESSES) {
    const payback = b.baseCost / (b.baseRevenue / b.cycleSeconds);
    console.log(
      `  ${b.name.padEnd(20)} ${formatMoney(b.baseCost).padStart(8)}  x${b.costGrowth}  ${String(b.cycleSeconds).padStart(4)}s  ${formatMoney(b.baseRevenue).padStart(8)}  ${formatDuration(payback).padStart(8)}  ${formatMoney(b.managerCost)}`
    );
  }
  console.log('Careers: name | cost | salary/s | income bonus');
  for (const c of CAREERS) {
    console.log(`  ${c.name.padEnd(22)} ${formatMoney(c.cost).padStart(8)}  ${formatMoney(c.salaryPerSecond).padStart(8)}/s  +${Math.round(c.incomeBonus * 100)}%`);
  }
}

let failures = 0;

for (const profile of PROFILES) {
  const started = Date.now();
  const result = simulate(profile, days, { offlineCapHours, retire: secondsPerMonth === undefined });
  const variant = [
    offlineCapHours !== undefined ? `offline cap ${offlineCapHours}h` : '',
    secondsPerMonth !== undefined ? `single life, 1 month = ${secondsPerMonth}s played` : '',
  ].filter(Boolean).join(', ');
  console.log(`\n=== ${profile.name} player, ${days} days${variant ? `, ${variant}` : ''} (${Date.now() - started} ms) ===`);

  if (secondsPerMonth !== undefined) {
    const ageAt = (activeSeconds: number) => START_AGE + activeSeconds / (secondsPerMonth * 12);
    for (const wealthClass of WEALTH_CLASSES.slice(1)) {
      const event = result.events.find((x) => x.kind === 'class' && x.label === wealthClass.name);
      console.log(
        `  ${wealthClass.name.padEnd(22)} ${event ? `${formatClock(event.clock)}  played ${formatDuration(event.activeTotal).padStart(8)}  age ${ageAt(event.activeTotal).toFixed(1)}` : 'not reached'}`
      );
    }
    const played = result.events.at(-1)?.activeTotal ?? 0;
    console.log(`  after ${days} days: played ${formatDuration(played)}, age ${ageAt(played).toFixed(1)}, class ${result.finalState.classIndex}`);
    continue;
  }

  if (showTimeline || showSessions) {
    const kinds = showSessions ? new Set(['session', 'retire', 'class']) : undefined;
    console.log(timeline(result, 400, kinds).join('\n'));
    console.log('');
  }

  for (const check of checkTargets(result)) {
    if (profile.name === 'engaged' && !check.pass) failures += 1;
    const mark = profile.name === 'engaged' ? (check.pass ? 'PASS' : 'FAIL') : 'info';
    console.log(`${mark.padEnd(5)} ${check.label.padEnd(30)} ${check.got.padEnd(36)} target ${check.range}`);
  }

  const final = result.finalState;
  console.log(
    `final: generation ${final.generation}, legacy ${final.legacyPoints}, class ${final.classIndex}, job ${final.careerIndex + 1}`
  );
}

console.log(failures === 0 ? '\nAll engaged-player pacing targets met.' : `\n${failures} engaged-player target(s) missed.`);

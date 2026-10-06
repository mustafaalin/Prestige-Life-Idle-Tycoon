// Usage: npm run sim [-- --days 30 --timeline]
// Bundled with esbuild and run in Node; logic lives in src/game/sim.

import { BUSINESSES } from '../src/game/core/config/businesses';
import { CAREERS } from '../src/game/core/config/careers';
import { formatDuration, formatMoney } from '../src/game/core/format';
import { checkTargets, timeline } from '../src/game/sim/report';
import { PROFILES, simulate } from '../src/game/sim/simulator';

const args = process.argv.slice(2);
const daysArg = args.indexOf('--days');
const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 30;
const showTimeline = args.includes('--timeline');
const showSessions = args.includes('--sessions');

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
  const result = simulate(profile, days);
  console.log(`\n=== ${profile.name} player, ${days} days (${Date.now() - started} ms) ===`);

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

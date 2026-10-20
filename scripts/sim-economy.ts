import { SECONDS_PER_MONTH } from '../src/game/core/config/life';
// Usage: npm run sim [-- --days 45 --timeline --purchases --sessions --offline-cap 8 --daily-claims]
//   --purchases            add every purchase to the timeline
//   --offline-cap <hours>  try another offline cap (default: OFFLINE_CAP_HOURS)
//   --daily-claims         list the first daily rewards (day, amount, class)
// Bundled with esbuild and run in Node; logic lives in src/game/sim.

import { BUSINESSES } from '../src/game/core/config/businesses';
import { CAREERS } from '../src/game/core/config/careers';
import { formatDuration, formatMoney } from '../src/game/core/format';
import { WEALTH_CLASSES } from '../src/game/core/config/classes';
import { SECONDS_PER_YEAR, START_AGE } from '../src/game/core/config/life';
import { checkFeel, checkTargets, timeline } from '../src/game/sim/report';
import { PROFILES, simulate } from '../src/game/sim/simulator';

const args = process.argv.slice(2);
const daysArg = args.indexOf('--days');
const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 45;
const showTimeline = args.includes('--timeline');
const showSessions = args.includes('--sessions');
const showPurchases = args.includes('--purchases');
const numberArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? Number(args[index + 1]) : undefined;
};
const offlineCapHours = numberArg('--offline-cap');
// --retire-at-top  trial: hand over at the top class instead of at 80 (plan 2.12)
const retireAtTop = args.includes('--retire-at-top');


if (args.includes('--config')) {
  console.log('Businesses: name | open | run L1 → L10 | /month L1 → L10 | open payback | first branch | manager');
  for (const b of BUSINESSES) {
    const first = b.levels[0];
    const last = b.levels[b.levels.length - 1];
    const monthly = (revenue: number) => formatMoney((revenue / b.cycleSeconds) * SECONDS_PER_MONTH);
    const payback = first.cost / (first.revenue / b.cycleSeconds);
    console.log(
      `  ${b.name.padEnd(20)} ${formatMoney(first.cost).padStart(8)}  ${formatMoney(first.revenue).padStart(7)} → ${formatMoney(last.revenue).padStart(7)}  ${monthly(first.revenue).padStart(7)} → ${monthly(last.revenue).padStart(7)}  ${formatDuration(payback).padStart(8)}  ${formatMoney(b.branchCost).padStart(8)}  ${formatMoney(b.managerCost)}`
    );
  }
  console.log(`Careers: ${CAREERS.length} jobs | name | cost | salary/month`);
  for (const c of CAREERS) {
    console.log(`  ${c.name.padEnd(30)} ${formatMoney(c.cost).padStart(8)}  ${formatMoney(c.salaryPerSecond * SECONDS_PER_MONTH).padStart(8)}/mo`);
  }
}

let failures = 0;

for (const profile of PROFILES) {
  const started = Date.now();
  const result = simulate(profile, days, { offlineCapHours, retireAtTop });
  const variant = offlineCapHours !== undefined ? `, offline cap ${offlineCapHours}h` : '';
  console.log(`\n=== ${profile.name} player, ${days} days${variant} (${Date.now() - started} ms) ===`);

  if (showTimeline || showSessions || showPurchases) {
    const kinds = showSessions
      ? new Set(['session', 'retire', 'class', 'rank'])
      : showPurchases
        ? new Set(['class', 'manager', 'career', 'retire', 'business', 'purchase', 'branch', 'lifestyle', 'home'])
        : undefined;
    console.log(timeline(result, 400, kinds).join('\n'));
    console.log('');
  }

  for (const check of checkTargets(result)) {
    if (profile.name === 'engaged' && !check.pass) failures += 1;
    const mark = profile.name === 'engaged' ? (check.pass ? 'PASS' : 'FAIL') : 'info';
    console.log(`${mark.padEnd(5)} ${check.label.padEnd(30)} ${check.got.padEnd(36)} target ${check.range}`);
  }

  for (const check of checkFeel(result)) {
    if (profile.name === 'engaged' && !check.pass) failures += 1;
    const mark = profile.name === 'engaged' ? (check.pass ? 'PASS' : 'FAIL') : 'info';
    console.log(`${mark.padEnd(5)} ${check.label.padEnd(30)} ${check.got.padEnd(36)} target ${check.range}`);
  }

  // The hero's age at each class in the first life (age moves only while playing).
  const ages = WEALTH_CLASSES.slice(1).map((wealthClass) => {
    const event = result.events.find((x) => x.kind === 'class' && x.label === wealthClass.name && x.generation === 1);
    return `${wealthClass.name} ${event ? Math.floor(START_AGE + event.activeGeneration / SECONDS_PER_YEAR) : '–'}`;
  });
  console.log(`ages (gen 1): ${ages.join(' · ')}`);

  {
    const earnedTotal = result.events.at(-1);
    const total = earnedTotal ? earnedTotal.earnedPlaying + earnedTotal.earnedOffline : 0;
    if (args.includes('--daily-claims')) {
      console.log(result.dailyClaims.slice(0, 16).map((c) => `D${c.day} ${formatMoney(c.amount)} (${c.className})`).join(' · '));
    }
    const sum = Object.values(result.sources).reduce((a, b) => a + b, 0) || 1;
    console.log(`money by source: ${Object.entries(result.sources).sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key} ${((value / sum) * 100).toFixed(1)}%`).join(' · ')}`);
    const paidByAds = Object.entries(result.adPaid).sort((a, b) => b[1] - a[1]);
    if (paidByAds.length > 0) console.log(`new ad places: ${paidByAds.map(([key, value]) => `${key} ${((value / sum) * 100).toFixed(1)}%`).join(' · ')}`);
    console.log(`money earned while away (offline cards): ${((earnedTotal ? earnedTotal.earnedOffline / Math.max(total, 1) : 0) * 100).toFixed(0)}%`);
    console.log(`Old Ray's deals ${result.investCount}, profit ${formatMoney(result.investProfit)} (${((result.investProfit / Math.max(total, 1)) * 100).toFixed(1)}% of all money earned)`);
    console.log(`daily reward paid ${formatMoney(result.dailyPaid)} (${((result.dailyPaid / Math.max(total, 1)) * 100).toFixed(1)}% of all money earned)`);
  }
  const final = result.finalState;
  console.log(
    `final: generation ${final.generation}, legacy ${final.legacyPoints}, class ${final.classIndex}, job ${final.careerId ?? "-"}, courses ${final.coursesDone.length}`
  );
}

console.log(failures === 0 ? '\nAll engaged-player pacing and feel targets met.' : `\n${failures} engaged-player target(s) missed.`);

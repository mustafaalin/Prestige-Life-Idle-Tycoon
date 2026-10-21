// Usage: npm run savecheck [-- --snapshot <name>]
//   (no flag)             load every save in scripts/save-fixtures/ with today's code and check that
//                         the player's progress is all there (docs/session-handoff.md "Kayıt uyumluluğu")
//   --snapshot <name>     write a mid-game save in today's format as a new fixture (once per schema;
//                         fixtures are never edited afterwards, they are what old phones hold)
// Bundled with esbuild and run in Node, like the simulator.

import './save-check-env';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUSINESSES } from '../src/game/core/config/businesses';
import { COURSES } from '../src/game/core/config/courses';
import { HOUSES } from '../src/game/core/config/housing';
import { SECONDS_PER_MONTH } from '../src/game/core/config/life';
import type { GameStateV2 } from '../src/game/core/types';
import { createRuntimeState, type RuntimeState } from '../src/game/runtime/engine';
import { parseRuntime, SAVE_SCHEMA } from '../src/game/runtime/storage';

const DIR = 'scripts/save-fixtures';
const NOW = Date.parse('2026-10-21T12:00:00Z');

interface Fixture {
  note: string;
  /** The save text exactly as the game wrote it. */
  save: string;
}

/** A player a few days in: businesses at all stages, a job with experience, things bought, ceremonies seen. */
function midGame(): RuntimeState {
  const runtime = createRuntimeState(NOW);
  const businesses = { ...runtime.game.businesses };
  const [stand, cart, third] = BUSINESSES;
  businesses[stand.id] = { level: stand.levels.length, branches: 2, managed: true };
  businesses[cart.id] = { level: 5, branches: 0, managed: true };
  businesses[third.id] = { level: 1, branches: 0, managed: false };
  const game: GameStateV2 = {
    ...runtime.game,
    cash: 123_456,
    generationEarnings: 1_500_000,
    totalEarnings: 1_500_000,
    classIndex: 3,
    businesses,
    careerId: 'waiter',
    jobSeconds: {
      'flyer-distributor': 7 * SECONDS_PER_MONTH,
      dishwasher: 10 * SECONDS_PER_MONTH,
      waiter: 2 * SECONDS_PER_MONTH,
    },
    coursesDone: [COURSES[0].id],
    lifestyleOwned: [...runtime.game.lifestyleOwned, 'vehicle-bike', 'vehicle-scooter', 'outfit-work', 'gadget-phone'],
    home: HOUSES[3].id,
    lifeSeconds: 5 * 16 * 60,
    questsDone: ['first-bottle'],
    bottles: 240,
    finds: 6,
  };
  return {
    ...runtime,
    game,
    story: { ...runtime.story, ceremonySeen: 3, heroName: 'Deniz', momSeen: [], lifeSeen: [] },
    purchases: { owned: ['v2_starter_pack'], offersFrom: NOW - 86_400_000, offerCardShown: true },
  };
}

function snapshot(name: string) {
  const file = { schema: SAVE_SCHEMA, savedAt: NOW, runtime: midGame() };
  const fixture: Fixture = {
    note: `Mid-game save written by schema ${SAVE_SCHEMA} (${new Date().toISOString().slice(0, 10)}).`,
    save: JSON.stringify(file),
  };
  const path = join(DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(fixture, null, 2) + '\n');
  console.log(`wrote ${path}`);
}

/** What the player had must still be there (a migration may map ids, never lose them). */
function check(name: string, fixture: Fixture): string[] {
  const saved = (JSON.parse(fixture.save) as { runtime: RuntimeState }).runtime;
  const loaded = parseRuntime(fixture.save, NOW);
  const before = saved.game;
  const after = loaded.game;
  const problems: string[] = [];
  const expect = (ok: boolean, what: string) => {
    if (!ok) problems.push(`${name}: ${what}`);
  };

  expect(after.cash >= before.cash, `cash ${before.cash} → ${after.cash}`);
  expect(after.generationEarnings >= before.generationEarnings, `earnings ${before.generationEarnings} → ${after.generationEarnings}`);
  expect(after.classIndex >= before.classIndex, `class ${before.classIndex} → ${after.classIndex}`);
  expect(after.lifeSeconds >= before.lifeSeconds, `age ${before.lifeSeconds} s → ${after.lifeSeconds} s`);
  expect(before.careerId === null || after.careerId !== null, `job ${before.careerId} lost`);
  const months = (game: GameStateV2) => Object.values(game.jobSeconds).reduce((sum, seconds) => sum + seconds, 0);
  expect(months(after) >= months(before), `job experience ${months(before)} s → ${months(after)} s`);
  expect(after.coursesDone.length >= before.coursesDone.length, `courses ${before.coursesDone.length} → ${after.coursesDone.length}`);
  for (const [id, business] of Object.entries(before.businesses)) {
    const now = after.businesses[id];
    if (business.level === 0) continue;
    expect(now !== undefined && now.level > 0, `business ${id} closed`);
    expect(!business.managed || now?.managed === true, `business ${id} lost its manager`);
    expect((now?.branches ?? 0) >= business.branches, `business ${id} branches ${business.branches} → ${now?.branches}`);
  }
  expect(after.lifestyleOwned.length >= before.lifestyleOwned.length, `items ${before.lifestyleOwned.length} → ${after.lifestyleOwned.length}`);
  expect(after.homesOwned.length >= before.homesOwned.length, `homes owned ${before.homesOwned.length} → ${after.homesOwned.length}`);
  expect(after.bottles >= before.bottles && after.finds >= before.finds, `bottle or find count went down`);
  expect(loaded.story.ceremonySeen >= saved.story.ceremonySeen, `ceremonies seen ${saved.story.ceremonySeen} → ${loaded.story.ceremonySeen}`);
  expect(loaded.story.heroName === saved.story.heroName, `hero name "${saved.story.heroName}" → "${loaded.story.heroName}"`);
  for (const product of saved.purchases.owned) {
    expect(loaded.purchases.owned.includes(product), `purchase ${product} lost`);
  }
  return problems;
}

const args = process.argv.slice(2);
const snapshotArg = args.indexOf('--snapshot');
if (snapshotArg >= 0) {
  const name = args[snapshotArg + 1];
  if (!name) throw new Error('--snapshot needs a name, e.g. schema2-midgame');
  snapshot(name);
} else {
  const files = readdirSync(DIR).filter((file) => file.endsWith('.json')).sort();
  const problems = files.flatMap((file) => check(file, JSON.parse(readFileSync(join(DIR, file), 'utf8')) as Fixture));
  if (problems.length > 0) {
    console.error(`savecheck: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`savecheck: ${files.length} save(s) load with every bit of progress (schema ${SAVE_SCHEMA})`);
}

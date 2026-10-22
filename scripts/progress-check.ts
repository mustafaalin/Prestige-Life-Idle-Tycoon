// Usage: npm run progresscheck
// Can a player get stuck? Plays many lives with today's rules and unlimited money (money is never the
// lock here) and checks that every job, course, home, vehicle, outfit, luxury and item can still be had,
// whatever the player chose before: random jobs (also lower-paid ones), random courses, getting rich
// early or late, or ignoring the career until 80. A run that cannot move on any more is printed with
// what it was missing. Bundled with esbuild and run in Node, like the simulator.

import { BUSINESSES } from '../src/game/core/config/businesses';
import { CAREERS } from '../src/game/core/config/careers';
import { WEALTH_CLASSES } from '../src/game/core/config/classes';
import { COURSES } from '../src/game/core/config/courses';
import { HOUSES } from '../src/game/core/config/housing';
import { SECONDS_PER_MONTH } from '../src/game/core/config/life';
import { LIFESTYLE_ITEMS } from '../src/game/core/config/lifestyle';
import { canLeaveCareer, canTakeCareer, heroAge } from '../src/game/core/formulas';
import {
  buyHome,
  buyLifestyle,
  createInitialState,
  earn,
  hireManager,
  houseIndex,
  levelUpBusiness,
  live,
  nextHome,
  rentHome,
  startCourse,
  takeCareer,
} from '../src/game/core/state';
import type { GameStateV2 } from '../src/game/core/types';

interface Profile {
  name: string;
  /** Turns between two class-ups (0: the top class of the first life at once). */
  classEvery: number;
  /** The highest class this player reaches. */
  topClass: number;
  /** The career waits until 80. */
  lateCareer?: boolean;
  /** Share of job picks made at random (the rest take the best-paid open job). */
  randomJobs: number;
}

const GEN1_TOP_CLASS = WEALTH_CLASSES.findIndex((wealthClass) => wealthClass.id === 'billionaire');
const PROFILES: Profile[] = [
  { name: 'rich at once', classEvery: 0, topClass: GEN1_TOP_CLASS, randomJobs: 0.3 },
  { name: 'rich slowly', classEvery: 40, topClass: GEN1_TOP_CLASS, randomJobs: 0.3 },
  { name: 'random choices', classEvery: 15, topClass: GEN1_TOP_CLASS, randomJobs: 1 },
  { name: 'career after 80', classEvery: 5, topClass: GEN1_TOP_CLASS, lateCareer: true, randomJobs: 0.3 },
];
const RUNS = 60;
/** One turn is three game months. */
const TURN_SECONDS = 3 * SECONDS_PER_MONTH;
const MAX_TURNS = 4000;
/** A run is stuck when nothing new comes for this many turns (the longest course is 24 months). */
const QUIET_TURNS = 40;

let seed = 1;
function random() {
  seed = (seed * 1103515245 + 12345) % 2 ** 31;
  return seed / 2 ** 31;
}
const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];

/** Money is not the lock: the wallet is refilled every turn without touching the class. */
const rich = (state: GameStateV2): GameStateV2 => ({ ...state, cash: 1e18 });

function classUp(state: GameStateV2, profile: Profile, turn: number): GameStateV2 {
  const target = profile.classEvery === 0 ? profile.topClass : Math.min(profile.topClass, Math.floor(turn / profile.classEvery));
  if (target <= state.classIndex) return state;
  return earn(state, WEALTH_CLASSES[target].threshold - state.generationEarnings + 1);
}

/** Everything a turn can buy or open, in a fixed order; returns the state and how many things it got. */
function shop(state: GameStateV2): [GameStateV2, number] {
  let got = 0;
  const attempt = (next: GameStateV2 | null) => {
    if (next) {
      state = rich(next);
      got += 1;
    }
  };
  for (const business of BUSINESSES) {
    for (let level = 0; level < 15; level += 1) attempt(levelUpBusiness(state, business.id));
    attempt(hireManager(state, business.id));
  }
  for (const item of LIFESTYLE_ITEMS) if (!state.lifestyleOwned.includes(item.id)) attempt(buyLifestyle(state, item.id));
  for (let moves = 0; moves < HOUSES.length; moves += 1) {
    const home = nextHome(state);
    if (!home) break;
    const moved = rentHome(state, home.id);
    if (!moved) break;
    attempt(moved);
  }
  for (const house of HOUSES) if (house.buyCost !== null && !state.homesOwned.includes(house.id)) attempt(buyHome(state, house.id));
  return [state, got];
}

function work(state: GameStateV2, profile: Profile): GameStateV2 {
  if (profile.lateCareer && heroAge(state).years < 80) return state;
  if (!canLeaveCareer(state)) return state;
  const open = CAREERS.filter((career) => career.id !== state.careerId && canTakeCareer(state, career));
  if (open.length === 0) return state;
  const best = open.reduce((a, b) => (b.salaryPerSecond > a.salaryPerSecond ? b : a));
  return takeCareer(state, (random() < profile.randomJobs ? pick(open) : best).id) ?? state;
}

function study(state: GameStateV2): GameStateV2 {
  if (state.course !== null) return state;
  const startable = COURSES.filter((course) => startCourse(state, course.id) !== null);
  return startable.length > 0 ? (startCourse(state, pick(startable).id) ?? state) : state;
}

interface Missing {
  jobs: string[];
  courses: string[];
  homes: number;
  items: string[];
}

function missing(state: GameStateV2): Missing {
  const worked = (id: string) => state.careerId === id || (state.jobSeconds[id] ?? 0) > 0;
  const top = CAREERS[CAREERS.length - 1];
  return {
    // Every job cannot be held in one life (a row has two), but the top of the tree must be reached.
    jobs: worked(top.id) ? [] : [top.id],
    courses: COURSES.filter((course) => !state.coursesDone.includes(course.id)).map((course) => course.id),
    homes: HOUSES.length - 1 - houseIndex(state.home),
    items: LIFESTYLE_ITEMS.filter((item) => !state.lifestyleOwned.includes(item.id)).map((item) => item.id),
  };
}

const complete = (m: Missing) => m.jobs.length === 0 && m.courses.length === 0 && m.homes === 0 && m.items.length === 0;

function play(profile: Profile): { state: GameStateV2; turns: number; missing: Missing } {
  let state = rich(createInitialState());
  let quiet = 0;
  let turn = 0;
  for (; turn < MAX_TURNS; turn += 1) {
    state = rich(classUp(state, profile, turn));
    const before = JSON.stringify([state.careerId, state.coursesDone, state.course?.id, state.home, state.lifestyleOwned.length]);
    let got: number;
    [state, got] = shop(state);
    state = study(work(state, profile));
    state = rich(live(state, TURN_SECONDS));
    const changed = got > 0 || JSON.stringify([state.careerId, state.coursesDone, state.course?.id, state.home, state.lifestyleOwned.length]) !== before;
    quiet = changed || heroAge(state).years < 80 ? 0 : quiet + 1;
    if (complete(missing(state))) break;
    // Waiting is not being stuck: quiet turns only count once the life clock has run out.
    if (quiet >= QUIET_TURNS && state.course === null) break;
  }
  return { state, turns: turn, missing: missing(state) };
}

let stuck = 0;
for (const profile of PROFILES) {
  let done = 0;
  const failures: string[] = [];
  for (let run = 0; run < RUNS; run += 1) {
    const result = play(profile);
    if (complete(result.missing)) {
      done += 1;
      continue;
    }
    stuck += 1;
    if (failures.length < 3) {
      const career = CAREERS.find((job) => job.id === result.state.careerId);
      failures.push(
        `  run ${run}: age ${heroAge(result.state).years}, class ${result.state.classIndex}, job ${career?.id ?? '-'} (row ${career?.level ?? 0}), home ${houseIndex(result.state.home) + 1}/${HOUSES.length}` +
          `\n    missing jobs: ${result.missing.jobs.join(', ') || '-'}; courses: ${result.missing.courses.join(', ') || '-'}; homes left: ${result.missing.homes}; items: ${result.missing.items.join(', ') || '-'}`,
      );
    }
  }
  console.log(`${profile.name.padEnd(16)} ${done}/${RUNS} lives got everything`);
  for (const failure of failures) console.log(failure);
}
if (stuck > 0) {
  console.log(`\nprogresscheck: ${stuck} stuck run(s)`);
  process.exit(1);
}
console.log('\nprogresscheck: nobody gets stuck');

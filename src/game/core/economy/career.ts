import { CAREERS, careerDef, YEARLY_RAISE } from '../config/careers';
import { COURSES, courseDef } from '../config/courses';
import { SECONDS_PER_MONTH } from '../config/life';
import { allMet, isMastered, jobMonths } from '../requirements';
import type { CareerDef, CourseDef, GameStateV2, Requirement } from '../types';

// Jobs and courses (docs/game-design-v2.md §4.4): pure reads; state.ts holds the actions.

/** The job held now, or undefined. */
export function currentCareer(state: GameStateV2): CareerDef | undefined {
  return careerDef(state.careerId);
}

/** Yearly raises earned in a job: one per full game year worked, none after mastery. */
export function raisesEarned(state: GameStateV2, career: CareerDef) {
  return Math.floor(Math.min(jobMonths(state, career.id), career.masteryMonths) / 12);
}

/** What a job pays per second for this hero: its starting salary plus the raises earned in it. */
export function salaryOf(state: GameStateV2, career: CareerDef | undefined) {
  if (!career) return 0;
  return career.salaryPerSecond * (1 + YEARLY_RAISE) ** raisesEarned(state, career);
}

/** What the job held now pays per second. */
export function currentSalary(state: GameStateV2) {
  return salaryOf(state, currentCareer(state));
}

/** Whether a job has been held, now or before (a job once left is never taken again). */
export function hasWorked(state: GameStateV2, careerId: string) {
  return state.careerId === careerId || (state.jobSeconds[careerId] ?? 0) > 0;
}

/** The job held now is mastered (or there is none): only then can the hero move on. */
export function canLeaveCareer(state: GameStateV2) {
  return state.careerId === null || isMastered(state, state.careerId);
}

/** Whether a job can be taken now: never held, the job held now mastered, its conditions met. */
export function canTakeCareer(state: GameStateV2, career: CareerDef) {
  return !hasWorked(state, career.id) && canLeaveCareer(state) && allMet(state, career.requires);
}

/** Jobs that pay more than the one held now and can be taken now. */
export function betterOpenCareers(state: GameStateV2): CareerDef[] {
  const salary = currentSalary(state);
  return CAREERS.filter((career) => career.salaryPerSecond > salary && canTakeCareer(state, career));
}

/** A better job can be taken right now: the career tab's "!". */
export function canTakeBetterCareer(state: GameStateV2) {
  return betterOpenCareers(state).length > 0;
}

/** Jobs that follow a job in the tree (one row up). */
export function careersAfter(careerId: string): CareerDef[] {
  return CAREERS.filter((career) => career.after.includes(careerId));
}

/** Courses that can be started: not done, not running, prerequisites finished. */
export function availableCourses(state: GameStateV2): CourseDef[] {
  return COURSES.filter(
    (course) => !state.coursesDone.includes(course.id) && state.course?.id !== course.id && allMet(state, course.requires),
  );
}

/** Share of the running course done (0–1), or null when none runs. */
export function courseProgress(state: GameStateV2): number | null {
  const running = state.course ? courseDef(state.course.id) : undefined;
  if (!state.course || !running) return null;
  return Math.min(1, state.course.seconds / (running.months * SECONDS_PER_MONTH));
}

/** Every requirement inside a list, anyOf options included (for "what opens what"). */
function flatten(requirements: readonly Requirement[]): Requirement[] {
  return requirements.flatMap((requirement) => (requirement.type === 'anyOf' ? flatten(requirement.options) : [requirement]));
}

/** Jobs an item opens (shop cards: "Opens: Bike Courier"). */
export function careersNeedingItem(itemId: string): CareerDef[] {
  return CAREERS.filter((career) => flatten(career.requires).some((r) => r.type === 'item' && r.itemId === itemId));
}

/** Jobs a home opens (an address for a contract). */
export function careersNeedingHome(homeIndex: number): CareerDef[] {
  return CAREERS.filter((career) => flatten(career.requires).some((r) => r.type === 'home' && r.index === homeIndex));
}

/** Jobs a course opens. */
export function careersNeedingCourse(courseId: string): CareerDef[] {
  return CAREERS.filter((career) => flatten(career.requires).some((r) => r.type === 'course' && r.courseId === courseId));
}

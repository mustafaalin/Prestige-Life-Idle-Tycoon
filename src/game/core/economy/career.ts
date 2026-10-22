import { CAREERS, careerDef } from '../config/careers';
import { COURSES, courseDef } from '../config/courses';
import { SECONDS_PER_MONTH } from '../config/life';
import { allMet, isMastered, jobRowReached } from '../requirements';
import type { CareerDef, CourseDef, GameStateV2, Requirement } from '../types';

// Jobs and courses (docs/game-design-v2.md §4.4): pure reads; state.ts holds the actions.

/** The job held now, or undefined. */
export function currentCareer(state: GameStateV2): CareerDef | undefined {
  return careerDef(state.careerId);
}

/** What a job pays per second. */
export function salaryOf(career: CareerDef | undefined) {
  return career?.salaryPerSecond ?? 0;
}

/** What the job held now pays per second. */
export function currentSalary(state: GameStateV2) {
  return salaryOf(currentCareer(state));
}

/** The job pays less than the one held now: taking it asks first (a job left is never taken again). */
export function paysLess(state: GameStateV2, career: CareerDef) {
  return career.salaryPerSecond < currentSalary(state);
}

/** Whether a job has been held, now or before (a job once left is never taken again). */
export function hasWorked(state: GameStateV2, careerId: string) {
  return state.careerId === careerId || (state.jobSeconds[careerId] ?? 0) > 0;
}

/** The job held now is mastered (or there is none): only then can the hero move on. */
export function canLeaveCareer(state: GameStateV2) {
  return state.careerId === null || isMastered(state, state.careerId);
}

/**
 * Whether a job can be taken now: never held, the job held now mastered, its conditions met, and no
 * further than one row past the way walked (careerFrontier).
 */
export function canTakeCareer(state: GameStateV2, career: CareerDef) {
  return (
    !hasWorked(state, career.id) &&
    canLeaveCareer(state) &&
    career.level <= careerFrontier(state) + 1 &&
    allMet(state, career.requires)
  );
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

/** The highest row of the tree reached, counting only jobs reached row by row (requirements.ts). */
export function careerFrontier(state: GameStateV2) {
  return jobRowReached(state);
}

/**
 * How the job tree shows a job (2026-10-21, user): the one held, one held before, one whose conditions
 * are met ("Take" once the job held is mastered; a skipped job beside it stays open), the rows up to
 * the next one in full (name, pay, what it needs), one row after that as "???", nothing further.
 */
export type JobView = 'held' | 'done' | 'open' | 'next' | 'hidden' | 'beyond';

export function jobView(state: GameStateV2, career: CareerDef): JobView {
  if (state.careerId === career.id) return 'held';
  if (hasWorked(state, career.id)) return 'done';
  const frontier = careerFrontier(state);
  if (career.level <= frontier + 1 && allMet(state, career.requires)) return 'open';
  if (career.level <= frontier + 1) return 'next';
  return career.level === frontier + 2 ? 'hidden' : 'beyond';
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

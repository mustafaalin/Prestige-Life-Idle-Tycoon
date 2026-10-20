import { CAREERS, careerDef } from '../config/careers';
import { COURSES, courseDef } from '../config/courses';
import { SECONDS_PER_MONTH } from '../config/life';
import { allMet } from '../requirements';
import type { CareerDef, CourseDef, GameStateV2, Requirement } from '../types';

// Jobs and courses (docs/economy-rebuild.md §5): pure reads; state.ts holds the actions.

/** The job held now, or undefined. */
export function currentCareer(state: GameStateV2): CareerDef | undefined {
  return careerDef(state.careerId);
}

export function salaryOf(career: CareerDef | undefined) {
  return career?.salaryPerSecond ?? 0;
}

/** Whether a job's conditions are met, money aside. The job held now is never "open" again. */
export function canTakeCareer(state: GameStateV2, career: CareerDef) {
  return career.id !== state.careerId && allMet(state, career.requires);
}

/** Jobs that pay more than the one held now and whose conditions are met. */
export function betterOpenCareers(state: GameStateV2): CareerDef[] {
  const salary = salaryOf(currentCareer(state));
  return CAREERS.filter((career) => career.salaryPerSecond > salary && canTakeCareer(state, career));
}

/** A better job can be taken right now (money included): the career tab's "!". */
export function canTakeBetterCareer(state: GameStateV2) {
  return betterOpenCareers(state).some((career) => state.cash >= career.cost);
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

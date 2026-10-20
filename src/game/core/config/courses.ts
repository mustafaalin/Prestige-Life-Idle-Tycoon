import type { CourseDef, Requirement } from '../types';

// Courses (docs/game-design-v2.md §4.4): taken one at a time alongside work, paid up front, finished
// after game months of play (like age: time away does not count). Each one opens jobs (careers.ts).
// Ids are saved (finished and running courses): never rename one.

const course = (id: string, name: string, cost: number, months: number, requires: Requirement[] = []): CourseDef => ({
  id,
  name,
  cost,
  months,
  requires,
});

export const COURSES: CourseDef[] = [
  course('first-aid', 'First Aid Certificate', 300, 1),
  course('driving-license', 'Driving License', 800, 2),
  course('heavy-license', 'Heavy Vehicle License', 2_500, 4, [{ type: 'course', courseId: 'driving-license' }]),
  course('it-certificate', 'IT Certificate', 1_500, 12),
  course('coding-bootcamp', 'Coding Bootcamp', 6_000, 6),
  course('journalism', 'Journalism Course', 4_000, 9),
  course('accounting-certificate', 'Accounting Certificate', 3_000, 9),
  course('culinary-school', 'Culinary School', 8_000, 12),
  course('electrician-certificate', 'Electrician Certificate', 2_000, 12),
  course('hospitality-degree', 'Hospitality Management Degree', 20_000, 24),
  course('mba', 'MBA', 80_000, 24),
  course('nursing-school', 'Nursing School', 15_000, 36),
  course('computer-science', 'Computer Science Degree', 40_000, 48),
  course('economics-degree', 'Economics Degree', 30_000, 48),
  course('engineering-degree', 'Engineering Degree', 35_000, 48),
  course('medical-school', 'Medical School', 150_000, 72),
];

const COURSE_BY_ID = new Map(COURSES.map((entry) => [entry.id, entry]));

export function courseDef(id: string): CourseDef | undefined {
  return COURSE_BY_ID.get(id);
}

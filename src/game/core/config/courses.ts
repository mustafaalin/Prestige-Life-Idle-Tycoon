import type { CourseDef, Requirement } from '../types';

// Courses (docs/game-design-v2.md §4.4): taken one at a time alongside work, paid up front, finished
// after game months of play (like age: time away does not count). Each one opens jobs (careers.ts).
// Since jobs take 3–9 months to master (2026-10-21) no course takes more than two game years.
// Ids are saved (finished and running courses): never rename one.

const course = (id: string, name: string, cost: number, months: number, requires: Requirement[] = []): CourseDef => ({
  id,
  name,
  cost,
  months,
  requires,
});

const after = (courseId: string): Requirement => ({ type: 'course', courseId });

export const COURSES: CourseDef[] = [
  course('first-aid', 'First Aid Certificate', 300, 1),
  course('driving-license', 'Driving License', 800, 2),
  course('heavy-license', 'Heavy Vehicle License', 2_500, 4, [after('driving-license')]),
  course('it-certificate', 'IT Certificate', 1_500, 6),
  course('coding-bootcamp', 'Coding Bootcamp', 6_000, 4),
  course('journalism', 'Journalism Course', 4_000, 6),
  course('accounting-certificate', 'Accounting Certificate', 3_000, 6),
  course('culinary-school', 'Culinary School', 8_000, 6),
  course('electrician-certificate', 'Electrician Certificate', 2_000, 6),
  course('hospitality-degree', 'Hospitality Management Degree', 20_000, 12),
  course('mba', 'MBA', 80_000, 12),
  course('nursing-school', 'Nursing School', 15_000, 12),
  course('computer-science', 'Computer Science Degree', 40_000, 18),
  course('economics-degree', 'Economics Degree', 30_000, 18),
  course('engineering-degree', 'Engineering Degree', 35_000, 18),
  course('medical-school', 'Medical School', 150_000, 24),
  // The job tree (2026-10-21): night school is the door to most office and expert jobs.
  course('night-school', 'Night School', 500, 6),
  course('education-degree', 'Education Degree', 12_000, 12, [after('night-school')]),
  course('law-school', 'Law School', 60_000, 18, [after('night-school')]),
  course('architecture', 'Architecture Degree', 50_000, 18, [after('night-school')]),
  course('veterinary-school', 'Veterinary School', 70_000, 18, [after('night-school')]),
  course('flight-school', 'Flight School', 90_000, 12),
  course('doctorate', 'Doctorate', 40_000, 12, [after('night-school')]),
  course('surgical-residency', 'Surgical Residency', 200_000, 12, [after('medical-school')]),
];

const COURSE_BY_ID = new Map(COURSES.map((entry) => [entry.id, entry]));

export function courseDef(id: string): CourseDef | undefined {
  return COURSE_BY_ID.get(id);
}

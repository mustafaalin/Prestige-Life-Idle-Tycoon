import type { CareerDef } from '../types';
import { SECONDS_PER_MONTH } from './life';

// One job at a time. Salaries follow the in-game calendar (one month = 80 s): what the job pays a
// month is close to real life (docs/economy-rebuild.md §2). Jobs are not bought with big money and give
// no income bonus any more (decided 2026-10-20): a job opens after enough months in the one before
// (`experience`, played time like age) and costs a little (clothes, a course, a licence). Plan Faz E4
// adds the other conditions (items, home, courses) and many more jobs.
const ART = '/assets/jobs/v2';
// experience: months in the job before (16 minutes of play = 1 year); the whole ladder is ~21 years.
const JOBS: { id: string; name: string; monthly: number; cost: number; experience: number }[] = [
  { id: 'flyer-distributor', name: 'Flyer Distributor', monthly: 300, cost: 20, experience: 0 },
  { id: 'dishwasher', name: 'Dishwasher', monthly: 900, cost: 50, experience: 3 },
  { id: 'cashier', name: 'Cashier', monthly: 1_400, cost: 150, experience: 6 },
  { id: 'waiter', name: 'Waiter', monthly: 1_800, cost: 300, experience: 6 },
  { id: 'delivery-driver', name: 'Delivery Driver', monthly: 2_500, cost: 600, experience: 12 },
  { id: 'sales-representative', name: 'Sales Representative', monthly: 3_500, cost: 1_500, experience: 12 },
  { id: 'it-support', name: 'IT Support', monthly: 4_500, cost: 3_000, experience: 18 },
  { id: 'web-developer', name: 'Web Developer', monthly: 6_000, cost: 6_000, experience: 24 },
  { id: 'software-engineer', name: 'Software Engineer', monthly: 9_000, cost: 10_000, experience: 24 },
  { id: 'team-leader', name: 'Team Leader', monthly: 13_000, cost: 15_000, experience: 36 },
  { id: 'director', name: 'Director', monthly: 25_000, cost: 30_000, experience: 48 },
  { id: 'ceo', name: 'CEO', monthly: 60_000, cost: 60_000, experience: 60 },
];

export const CAREERS: CareerDef[] = JOBS.map(({ monthly, experience, ...job }) => ({
  ...job,
  requires: experience > 0 ? [{ type: 'experience', months: experience }] : [],
  image: `${ART}/${job.id}.webp`,
  salaryPerSecond: monthly / SECONDS_PER_MONTH,
  incomeBonus: 0,
}));

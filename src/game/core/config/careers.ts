import type { CareerDef } from '../types';
import { roundNice } from './businesses';

// One job at a time. A promotion is bought with money (training, clothes, licence) and lasts the
// whole generation. Early on the salary matters; later the stacking income bonus keeps
// promotions worth buying.
export const CAREER_TUNING = {
  firstCost: 10,
  costStep: 9,
  /** Seconds for the first job's salary to repay its price. */
  firstPaybackSeconds: 30,
  /** Salary payback grows fast so late jobs matter for their income bonus, not their salary. */
  paybackStep: 2.2,
};

const JOBS: { id: string; name: string; image: string; incomeBonus: number }[] = [
  { id: 'flyer-distributor', name: 'Flyer Distributor', image: '/assets/jobs/workers/Flyer-Distributor.png', incomeBonus: 0.05 },
  { id: 'dishwasher', name: 'Dishwasher', image: '/assets/jobs/workers/Dishwasher.png', incomeBonus: 0.05 },
  { id: 'cashier', name: 'Cashier', image: '/assets/jobs/workers/Cashier.png', incomeBonus: 0.05 },
  { id: 'waiter', name: 'Waiter', image: '/assets/jobs/workers/Waiter.png', incomeBonus: 0.05 },
  { id: 'delivery-driver', name: 'Delivery Driver', image: '/assets/jobs/workers/Delivery-Driver.png', incomeBonus: 0.1 },
  { id: 'sales-representative', name: 'Sales Representative', image: '/assets/jobs/workers/Sales-Representative.png', incomeBonus: 0.1 },
  { id: 'it-support', name: 'IT Support', image: '/assets/jobs/specialist/1-IT Support Assistant.png', incomeBonus: 0.1 },
  { id: 'web-developer', name: 'Web Developer', image: '/assets/jobs/specialist/12-Web Developer.png', incomeBonus: 0.1 },
  { id: 'software-engineer', name: 'Software Engineer', image: '/assets/jobs/specialist/13-Software Developer.png', incomeBonus: 0.15 },
  { id: 'team-leader', name: 'Team Leader', image: '/assets/jobs/manager/1-Team-Leader.png', incomeBonus: 0.15 },
  { id: 'director', name: 'Director', image: '/assets/jobs/manager/18-Director.png', incomeBonus: 0.2 },
  { id: 'ceo', name: 'CEO', image: '/assets/jobs/manager/20-Ceo.png', incomeBonus: 0.25 },
];

export const CAREERS: CareerDef[] = JOBS.map((job, index) => {
  const t = CAREER_TUNING;
  const cost = roundNice(t.firstCost * t.costStep ** index);
  return {
    ...job,
    cost,
    salaryPerSecond: roundNice(cost / (t.firstPaybackSeconds * t.paybackStep ** index)),
  };
});

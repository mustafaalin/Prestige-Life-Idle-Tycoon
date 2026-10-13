import type { CareerDef } from '../types';
import { roundNice } from './businesses';

// One job at a time. A promotion is bought with money (training, clothes, licence) and lasts the
// whole generation. Early on the salary matters; later the stacking income bonus keeps
// promotions worth buying.
export const CAREER_TUNING = {
  firstCost: 10,
  costStep: 9,
  /** Seconds for the first job's salary to repay its price (slower than the Flower Stand: jobs are a side income). */
  firstPaybackSeconds: 90,
  /** Salary payback grows fast so late jobs matter for their income bonus, not their salary. */
  paybackStep: 2.2,
};

// salaryFactor / costFactor shape the single-life pacing (game-design-v2 §5). The job is the main
// income at the very start; from mid-career on salaries are cut hard (2026-10-09) so businesses carry
// the mid and late game and promotions are bought for their income bonus. Top jobs are cheaper so
// the hero reaches the top in mid-life.
// Art: one object per job, its own composition (docs/design-art-production-plan.md §2).
const ART = '/assets/jobs/v2';
const JOBS: { id: string; name: string; image: string; incomeBonus: number; salaryFactor?: number; costFactor?: number }[] = [
  { id: 'flyer-distributor', name: 'Flyer Distributor', image: `${ART}/flyer-distributor.webp`, incomeBonus: 0.05 },
  { id: 'dishwasher', name: 'Dishwasher', image: `${ART}/dishwasher.webp`, incomeBonus: 0.05 },
  { id: 'cashier', name: 'Cashier', image: `${ART}/cashier.webp`, incomeBonus: 0.05 },
  { id: 'waiter', name: 'Waiter', image: `${ART}/waiter.webp`, incomeBonus: 0.05 },
  { id: 'delivery-driver', name: 'Delivery Driver', image: `${ART}/delivery-driver.webp`, incomeBonus: 0.1 },
  { id: 'sales-representative', name: 'Sales Representative', image: `${ART}/sales-representative.webp`, incomeBonus: 0.1, salaryFactor: 0.4 },
  { id: 'it-support', name: 'IT Support', image: `${ART}/it-support.webp`, incomeBonus: 0.1, salaryFactor: 0.2 },
  { id: 'web-developer', name: 'Web Developer', image: `${ART}/web-developer.webp`, incomeBonus: 0.1, salaryFactor: 0.1 },
  { id: 'software-engineer', name: 'Software Engineer', image: `${ART}/software-engineer.webp`, incomeBonus: 0.15, salaryFactor: 0.06 },
  { id: 'team-leader', name: 'Team Leader', image: `${ART}/team-leader.webp`, incomeBonus: 0.15, salaryFactor: 0.06, costFactor: 0.8 },
  { id: 'director', name: 'Director', image: `${ART}/director.webp`, incomeBonus: 0.2, salaryFactor: 0.06, costFactor: 0.6 },
  { id: 'ceo', name: 'CEO', image: `${ART}/ceo.webp`, incomeBonus: 0.25, salaryFactor: 0.08, costFactor: 0.5 },
];

export const CAREERS: CareerDef[] = JOBS.map(({ salaryFactor = 1, costFactor = 1, ...job }, index) => {
  const t = CAREER_TUNING;
  const baseCost = roundNice(t.firstCost * t.costStep ** index);
  return {
    ...job,
    cost: roundNice(baseCost * costFactor),
    salaryPerSecond: roundNice((baseCost / (t.firstPaybackSeconds * t.paybackStep ** index)) * salaryFactor),
  };
});

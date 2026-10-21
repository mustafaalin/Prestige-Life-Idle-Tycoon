import type { CareerDef, CareerTrack, Requirement } from '../types';
import { SECONDS_PER_MONTH } from './life';
import { VEHICLES } from './lifestyle';

// The job tree (docs/game-design-v2.md §4.4, decided 2026-10-21): four tabs, jobs in rows. A job opens
// when one of the jobs before it (one row lower) is mastered, plus two or three extras (a course, an
// item, an address, a business, a class). The job held has to be mastered before moving on, and a job
// once left is never taken again. Pay is set by the row: every move pays nextJobStep() more than the
// job before it paid at mastery, with a yearly raise while working towards mastery. There is no fee.
// Ids are saved (current job, months per job): never rename one.

/** The tabs in the order the career screen shows them. */
export const CAREER_TRACKS: CareerTrack[] = ['worker', 'office', 'expert', 'top'];

/** What the first job pays a month. */
export const FIRST_JOB_MONTHLY = 300;

/**
 * A new job pays this many times what the job before it (one row lower) paid at mastery: within the
 * user's +10–25%. Small while the first jobs take under a year to master, so they don't outrun the
 * first businesses; bigger from row 6, where each job takes years.
 */
export function nextJobStep(level: number) {
  return level <= 5 ? 1.1 : 1.25;
}

/** Each full game year in a job raises its pay this much, until the job is mastered. */
export const YEARLY_RAISE = 0.2;

/** Months to master a job in this row: under a year for the first two rows (no raise there), at most 36. */
export function masteryMonthsAt(level: number) {
  return Math.min(36, 6 * level - 3);
}

/** Raises a job in this row gives on the way to mastery (one per full year). */
export function raisesAt(level: number) {
  return Math.floor(masteryMonthsAt(level) / 12);
}

/** Starting pay a month in this row: the row below at mastery, times the step. */
export function monthlyAt(level: number) {
  let monthly = FIRST_JOB_MONTHLY;
  for (let row = 2; row <= level; row += 1) monthly *= (1 + YEARLY_RAISE) ** raisesAt(row - 1) * nextJobStep(row);
  return monthly;
}

const ART = '/assets/jobs/v2';

// Shorthands for the extras.
const course = (courseId: string): Requirement => ({ type: 'course', courseId });
const item = (itemId: string): Requirement => ({ type: 'item', itemId });
/** Live at this home or a better one (index into HOUSES): 2 = the rented room. */
const home = (index: number): Requirement => ({ type: 'home', index });
const wealth = (index: number): Requirement => ({ type: 'class', index });
/** This vehicle or a better one. */
const vehicle = (itemId: string): Requirement => ({ type: 'vehicle', index: VEHICLES.findIndex((entry) => entry.id === itemId) });
const business = (businessId: string, level = 1): Requirement => ({ type: 'businessLevel', businessId, level });
const managers = (count: number): Requirement => ({ type: 'managers', count });

// Wealth classes by index (classes.ts).
const DAY_LABORER = 1;
const WORKING_CLASS = 2;
const MIDDLE_CLASS = 3;
const MILLIONAIRE = 4;
const BILLIONAIRE = 5;

interface JobSpec {
  id: string;
  name: string;
  track: CareerTrack;
  after: string[];
  requires?: Requirement[];
}

const job = (id: string, name: string, track: CareerTrack, after: string[], requires: Requirement[] = []): JobSpec => ({
  id,
  name,
  track,
  after,
  requires,
});

// Listed by row; every job's `after` sits in the row above it in this list.
const JOBS: JobSpec[] = [
  // Row 1: anyone can hand out flyers.
  job('flyer-distributor', 'Flyer Distributor', 'worker', []),

  // Row 2
  job('porter', 'Porter', 'worker', ['flyer-distributor']),
  job('dishwasher', 'Dishwasher', 'worker', ['flyer-distributor'], [wealth(DAY_LABORER)]),
  job('cleaner', 'Cleaner', 'worker', ['flyer-distributor'], [item('outfit-work')]),

  // Row 3
  job('bike-courier', 'Bike Courier', 'worker', ['porter'], [item('vehicle-bike')]),
  job('warehouse-worker', 'Warehouse Worker', 'worker', ['porter'], [item('outfit-work')]),
  job('construction-laborer', 'Construction Laborer', 'worker', ['porter'], [wealth(DAY_LABORER)]),
  job('waiter', 'Waiter', 'worker', ['dishwasher'], [item('outfit-work'), home(1)]),
  job('carpenter-apprentice', 'Carpenter\'s Apprentice', 'worker', ['porter', 'cleaner'], [item('gadget-toolbox')]),
  job('hospital-porter', 'Hospital Porter', 'worker', ['cleaner'], [home(2)]),
  job('cashier', 'Cashier', 'office', ['dishwasher', 'cleaner'], [item('outfit-work')]),

  // Row 4
  job('delivery-driver', 'Delivery Driver', 'worker', ['bike-courier'], [item('vehicle-scooter'), course('driving-license')]),
  job('security-guard', 'Security Guard', 'worker', ['warehouse-worker', 'hospital-porter'], [course('first-aid')]),
  job('apprentice-electrician', 'Apprentice Electrician', 'worker', ['construction-laborer'], [item('gadget-toolbox')]),
  job('line-cook', 'Line Cook', 'worker', ['waiter'], [home(2)]),
  job('carpenter', 'Carpenter', 'worker', ['carpenter-apprentice'], [business('flower-stand', 5)]),
  job('nursing-assistant', 'Nursing Assistant', 'expert', ['hospital-porter'], [course('first-aid')]),
  job('shop-assistant', 'Shop Assistant', 'office', ['cashier'], [item('gadget-phone')]),
  job('call-center-agent', 'Call Center Agent', 'office', ['cashier'], [item('gadget-phone'), home(2)]),
  job('street-photographer', 'Street Photographer', 'expert', ['cashier', 'waiter'], [item('gadget-camera')]),

  // Row 5
  job('taxi-driver', 'Taxi Driver', 'worker', ['delivery-driver'], [item('vehicle-old-sedan')]),
  job('senior-security-guard', 'Senior Security Guard', 'worker', ['security-guard'], [wealth(WORKING_CLASS)]),
  job('electrician', 'Electrician', 'worker', ['apprentice-electrician'], [course('electrician-certificate')]),
  job('sous-chef', 'Sous Chef', 'worker', ['line-cook'], [course('culinary-school')]),
  job('master-carpenter', 'Master Carpenter', 'worker', ['carpenter'], [wealth(WORKING_CLASS), item('outfit-work')]),
  job('nurse', 'Nurse', 'expert', ['nursing-assistant'], [course('nursing-school')]),
  job('sales-representative', 'Sales Representative', 'office', ['shop-assistant', 'call-center-agent'], [item('vehicle-old-sedan')]),
  job('office-clerk', 'Office Clerk', 'office', ['call-center-agent', 'shop-assistant'], [course('night-school')]),
  job('social-media-assistant', 'Social Media Assistant', 'office', ['street-photographer', 'call-center-agent'], [item('gadget-laptop')]),
  job('it-support', 'IT Support', 'expert', ['call-center-agent'], [course('it-certificate'), item('gadget-laptop')]),

  // Row 6
  job('truck-driver', 'Truck Driver', 'worker', ['taxi-driver'], [course('heavy-license')]),
  job('warehouse-supervisor', 'Warehouse Supervisor', 'worker', ['senior-security-guard', 'taxi-driver'], [item('gadget-phone')]),
  job('master-electrician', 'Master Electrician', 'worker', ['electrician'], [vehicle('vehicle-hatchback')]),
  job('head-chef', 'Head Chef', 'worker', ['sous-chef'], [business('restaurant')]),
  job('furniture-workshop-chief', 'Furniture Workshop Chief', 'worker', ['master-carpenter'], [wealth(MIDDLE_CLASS), business('bakery', 5)]),
  job('paramedic', 'Paramedic', 'expert', ['nurse'], [course('driving-license')]),
  job('senior-sales', 'Senior Sales Representative', 'office', ['sales-representative'], [vehicle('vehicle-hatchback')]),
  job('bank-teller', 'Bank Teller', 'office', ['office-clerk'], [item('outfit-smart')]),
  job('executive-assistant', 'Executive Assistant', 'office', ['office-clerk'], [item('outfit-smart')]),
  job('junior-web-developer', 'Junior Web Developer', 'expert', ['it-support'], [course('coding-bootcamp')]),
  job('content-creator', 'Content Creator', 'office', ['social-media-assistant'], [item('gadget-camera')]),

  // Row 7
  job('dispatcher', 'Dispatcher', 'worker', ['truck-driver', 'warehouse-supervisor'], [wealth(MIDDLE_CLASS)]),
  job('site-foreman', 'Site Foreman', 'worker', ['master-electrician', 'furniture-workshop-chief'], [home(3)]),
  job('restaurant-manager', 'Restaurant Manager', 'office', ['head-chef'], [business('restaurant', 5)]),
  job('head-nurse', 'Head Nurse', 'expert', ['paramedic'], [home(5)]),
  job('store-manager', 'Store Manager', 'office', ['senior-sales'], [wealth(MIDDLE_CLASS)]),
  job('real-estate-agent', 'Real Estate Agent', 'office', ['senior-sales'], [wealth(MIDDLE_CLASS), business('real-estate-office')]),
  job('accountant', 'Accountant', 'office', ['bank-teller'], [course('accounting-certificate')]),
  job('hr-specialist', 'HR Specialist', 'office', ['executive-assistant'], [item('gadget-laptop')]),
  job('teacher', 'Teacher', 'expert', ['executive-assistant', 'paramedic'], [course('education-degree')]),
  job('web-developer', 'Web Developer', 'expert', ['junior-web-developer'], [home(4)]),
  job('journalist', 'Journalist', 'expert', ['content-creator'], [course('journalism')]),

  // Row 8
  job('logistics-coordinator', 'Logistics Coordinator', 'office', ['dispatcher'], [item('gadget-laptop'), business('logistics-warehouse')]),
  job('site-manager', 'Site Manager', 'worker', ['site-foreman'], [vehicle('vehicle-pickup')]),
  job('food-beverage-manager', 'Food & Beverage Manager', 'office', ['restaurant-manager'], [home(5)]),
  job('doctor', 'Doctor', 'expert', ['head-nurse'], [course('medical-school')]),
  job('regional-sales-manager', 'Regional Sales Manager', 'office', ['store-manager', 'real-estate-agent'], [vehicle('vehicle-suv')]),
  job('financial-analyst', 'Financial Analyst', 'office', ['accountant'], [course('economics-degree')]),
  job('office-manager', 'Office Manager', 'office', ['hr-specialist'], [item('outfit-coat')]),
  job('lawyer', 'Lawyer', 'expert', ['teacher', 'hr-specialist'], [course('law-school')]),
  job('software-engineer', 'Software Engineer', 'expert', ['web-developer'], [course('computer-science')]),
  job('editor', 'Editor', 'expert', ['journalist'], [wealth(MILLIONAIRE)]),

  // Row 9
  job('operations-manager', 'Operations Manager', 'office', ['logistics-coordinator', 'office-manager', 'food-beverage-manager'], [business('mini-market')]),
  job('contractor', 'Contractor', 'worker', ['site-manager'], [business('construction')]),
  job('architect', 'Architect', 'expert', ['site-manager', 'software-engineer'], [course('architecture')]),
  job('specialist-doctor', 'Specialist Doctor', 'expert', ['doctor'], [home(6)]),
  job('veterinarian', 'Veterinarian', 'expert', ['doctor'], [course('veterinary-school')]),
  job('national-sales-manager', 'National Sales Manager', 'office', ['regional-sales-manager'], [vehicle('vehicle-executive')]),
  job('finance-manager', 'Finance Manager', 'office', ['financial-analyst'], [home(6)]),
  job('hr-manager', 'HR Manager', 'office', ['office-manager'], [item('outfit-suit')]),
  job('senior-lawyer', 'Senior Lawyer', 'expert', ['lawyer'], [home(6)]),
  job('senior-engineer', 'Senior Software Engineer', 'expert', ['software-engineer'], [vehicle('vehicle-suv')]),
  job('pilot', 'Pilot', 'expert', ['software-engineer', 'logistics-coordinator'], [course('flight-school')]),
  job('editor-in-chief', 'Editor-in-Chief', 'expert', ['editor'], [item('outfit-suit')]),

  // Row 10
  job('hotel-manager', 'Hotel Manager', 'office', ['operations-manager'], [course('hospitality-degree')]),
  job('supply-chain-manager', 'Supply Chain Manager', 'office', ['operations-manager'], [managers(3)]),
  job('construction-project-manager', 'Construction Project Manager', 'expert', ['contractor', 'architect'], [course('engineering-degree')]),
  job('surgeon', 'Surgeon', 'expert', ['specialist-doctor'], [course('surgical-residency')]),
  job('marketing-manager', 'Marketing Manager', 'office', ['national-sales-manager', 'hr-manager', 'editor-in-chief'], [managers(3)]),
  job('investment-banker', 'Investment Banker', 'office', ['finance-manager'], [course('mba')]),
  job('judge', 'Judge', 'expert', ['senior-lawyer'], [home(7)]),
  job('professor', 'Professor', 'expert', ['senior-lawyer', 'veterinarian'], [course('doctorate')]),
  job('team-leader', 'Team Leader', 'expert', ['senior-engineer'], [item('outfit-suit')]),
  job('captain', 'Captain', 'expert', ['pilot'], [vehicle('vehicle-coupe')]),
  job('tv-producer', 'TV Producer', 'expert', ['editor-in-chief'], [managers(3)]),

  // Row 11: the directors
  job('hospitality-director', 'Hospitality Director', 'top', ['hotel-manager'], [home(8), business('hotel')]),
  job('logistics-director', 'Logistics Director', 'top', ['supply-chain-manager'], [course('mba')]),
  job('chief-architect', 'Chief Architect', 'expert', ['construction-project-manager'], [business('factory')]),
  job('hospital-director', 'Hospital Director', 'expert', ['surgeon'], [course('mba')]),
  job('director', 'Sales Director', 'top', ['marketing-manager'], [course('mba')]),
  job('portfolio-manager', 'Portfolio Manager', 'top', ['investment-banker'], [item('outfit-threepiece')]),
  job('legal-director', 'Legal Director', 'top', ['judge'], [item('outfit-threepiece')]),
  job('rector', 'Rector', 'expert', ['professor'], [home(8)]),
  job('engineering-manager', 'Engineering Manager', 'expert', ['team-leader'], [business('tech-startup')]),
  job('airline-ops-director', 'Airline Operations Director', 'top', ['captain'], [vehicle('vehicle-offroader')]),
  job('media-director', 'Media Director', 'top', ['tv-producer', 'marketing-manager'], [business('media')]),

  // Row 12: the chiefs
  job('cto', 'Chief Technology Officer', 'top', ['engineering-manager'], [vehicle('vehicle-executive'), managers(4)]),
  job('cfo', 'Chief Financial Officer', 'top', ['portfolio-manager'], [item('outfit-tux'), managers(4)]),
  job('chief-commercial-officer', 'Chief Commercial Officer', 'top', ['director', 'media-director'], [managers(4)]),
  job(
    'coo',
    'Chief Operating Officer',
    'top',
    ['logistics-director', 'hospitality-director', 'legal-director', 'airline-ops-director', 'hospital-director', 'chief-architect', 'rector'],
    [managers(4)],
  ),

  // Row 13 and up: the top of a company
  job('ceo', 'CEO', 'top', ['cto', 'cfo', 'chief-commercial-officer', 'coo'], [wealth(MILLIONAIRE), course('mba'), managers(5)]),
  job('board-member', 'Board Member', 'top', ['ceo'], [wealth(BILLIONAIRE)]),
  job('fund-founder', 'Investment Fund Founder', 'top', ['ceo'], [wealth(BILLIONAIRE), business('tech-startup', 5)]),
  job('board-chair', 'Chair of the Board', 'top', ['board-member', 'fund-founder'], [wealth(BILLIONAIRE), item('toy-4')]),
];

/** Each job's row: one above the highest job it follows. */
function levels(specs: JobSpec[]) {
  const level = new Map<string, number>();
  for (const spec of specs) {
    level.set(spec.id, spec.after.length === 0 ? 1 : 1 + Math.max(...spec.after.map((id) => level.get(id) ?? 0)));
  }
  return level;
}

const LEVEL = levels(JOBS);

export const CAREERS: CareerDef[] = JOBS.map(({ id, name, track, after, requires = [] }) => {
  const level = LEVEL.get(id) ?? 1;
  return {
    id,
    name,
    track,
    level,
    after,
    image: `${ART}/${id}.webp`,
    masteryMonths: masteryMonthsAt(level),
    salaryPerSecond: monthlyAt(level) / SECONDS_PER_MONTH,
    requires: after.length === 0 ? requires : [{ type: 'anyOf', options: after.map((careerId) => ({ type: 'mastered', careerId })) }, ...requires],
  };
});

const CAREER_BY_ID = new Map(CAREERS.map((career) => [career.id, career]));

export function careerDef(id: string | null): CareerDef | undefined {
  return id === null ? undefined : CAREER_BY_ID.get(id);
}

/** The job a new life starts looking for (the guide and the first goal point at it). */
export const FIRST_JOB = CAREERS[0];

/** The twelve jobs of the old single ladder, by its index: saves from before the job board (2026-10-21). */
export const LEGACY_CAREER_IDS = [
  'flyer-distributor', 'dishwasher', 'cashier', 'waiter', 'delivery-driver', 'sales-representative',
  'it-support', 'web-developer', 'software-engineer', 'team-leader', 'director', 'ceo',
];

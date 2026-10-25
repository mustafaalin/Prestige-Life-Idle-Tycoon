import type { CareerDef, CareerTrack, Requirement } from '../types';
import { jobSkillRequirements } from './jobSkills';
import { SECONDS_PER_MONTH } from './life';
import { VEHICLES } from './lifestyle';

// The job tree (docs/game-design-v2.md §4.4, decided 2026-10-21): jobs in rows of at most two, the
// four tabs one after another (Worker, Office, Expert, The top). A job opens when a job of the row
// above it is mastered, plus one to three extras (a course, an item, an address, a business, a class)
// and skill levels (jobSkills.ts, 2026-10-25).
// The job held has to be mastered before moving on; a job once left is never taken again. Pay is set
// by the row: each row pays nextJobStep() more than the one above it, so a promotion comes about every
// eight game months. There is no fee and no yearly raise. Ids are saved (current job, months per job):
// never rename one.

/** The tabs in the order the career screen shows them, which is also the order they are reached in. */
export const CAREER_TRACKS: CareerTrack[] = ['worker', 'office', 'expert', 'top'];

/** What the first job pays a month. */
export const FIRST_JOB_MONTHLY = 300;

/**
 * A row pays this many times the row above it: within the user's +10–25%. Small for the first rows so
 * the jobs don't outrun the first businesses, bigger at the top.
 */
export function nextJobStep(level: number) {
  return level <= 5 ? 1.1 : level <= 45 ? 1.13 : 1.25;
}

/** Months to master a job in this row: 3 for the first job, half a month more every row, at most 8. */
export function masteryMonthsAt(level: number) {
  return Math.min(8, 3 + Math.floor((level - 1) / 2));
}

/** Pay a month in this row. */
export function monthlyAt(level: number) {
  let monthly = FIRST_JOB_MONTHLY;
  for (let row = 2; row <= level; row += 1) monthly *= nextJobStep(row);
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


const JOBS: JobSpec[] = [
// Listed by row, the four tabs one after another (2026-10-21, user: Worker first, then Office, Expert,
// The top; at most two jobs a row). Every job follows both jobs of the row above it.

  // ── Worker (İşçi): rows 1–15 ──
  // Row 1
  job('flyer-distributor', 'Flyer Distributor', 'worker', []),
  // Row 2
  job('porter', 'Porter', 'worker', ['flyer-distributor']),
  job('dishwasher', 'Dishwasher', 'worker', ['flyer-distributor'], [wealth(DAY_LABORER)]),
  // Row 3
  job('cleaner', 'Cleaner', 'worker', ['porter', 'dishwasher'], [item('outfit-work')]),
  job('bike-courier', 'Bike Courier', 'worker', ['porter', 'dishwasher'], [item('vehicle-bike')]),
  // Row 4
  job('warehouse-worker', 'Warehouse Worker', 'worker', ['cleaner', 'bike-courier'], [item('outfit-work')]),
  job('waiter', 'Waiter', 'worker', ['cleaner', 'bike-courier'], [item('outfit-work'), home(1)]),
  // Row 5
  job('construction-laborer', 'Construction Laborer', 'worker', ['warehouse-worker', 'waiter'], [wealth(DAY_LABORER)]),
  job('hospital-porter', 'Hospital Porter', 'worker', ['warehouse-worker', 'waiter'], [home(2)]),
  // Row 6
  job('carpenter-apprentice', 'Carpenter\'s Apprentice', 'worker', ['construction-laborer', 'hospital-porter'], [item('gadget-toolbox')]),
  job('delivery-driver', 'Delivery Driver', 'worker', ['construction-laborer', 'hospital-porter'], [item('vehicle-scooter'), course('driving-license')]),
  // Row 7
  job('security-guard', 'Security Guard', 'worker', ['carpenter-apprentice', 'delivery-driver'], [course('first-aid')]),
  job('line-cook', 'Line Cook', 'worker', ['carpenter-apprentice', 'delivery-driver'], [home(2)]),
  // Row 8
  job('apprentice-electrician', 'Apprentice Electrician', 'worker', ['security-guard', 'line-cook'], [item('gadget-toolbox')]),
  job('carpenter', 'Carpenter', 'worker', ['security-guard', 'line-cook'], [business('flower-stand', 5)]),
  // Row 9
  job('taxi-driver', 'Taxi Driver', 'worker', ['apprentice-electrician', 'carpenter'], [item('vehicle-old-sedan')]),
  job('senior-security-guard', 'Senior Security Guard', 'worker', ['apprentice-electrician', 'carpenter'], [wealth(WORKING_CLASS)]),
  // Row 10
  job('electrician', 'Electrician', 'worker', ['taxi-driver', 'senior-security-guard'], [course('electrician-certificate')]),
  job('sous-chef', 'Sous Chef', 'worker', ['taxi-driver', 'senior-security-guard'], [course('culinary-school')]),
  // Row 11
  job('master-carpenter', 'Master Carpenter', 'worker', ['electrician', 'sous-chef'], [wealth(WORKING_CLASS), item('outfit-work')]),
  job('truck-driver', 'Truck Driver', 'worker', ['electrician', 'sous-chef'], [course('heavy-license')]),
  // Row 12
  job('warehouse-supervisor', 'Warehouse Supervisor', 'worker', ['master-carpenter', 'truck-driver'], [item('gadget-phone')]),
  job('master-electrician', 'Master Electrician', 'worker', ['master-carpenter', 'truck-driver'], [vehicle('vehicle-hatchback')]),
  // Row 13
  job('head-chef', 'Head Chef', 'worker', ['warehouse-supervisor', 'master-electrician'], [business('restaurant')]),
  job('furniture-workshop-chief', 'Furniture Workshop Chief', 'worker', ['warehouse-supervisor', 'master-electrician'], [wealth(MIDDLE_CLASS), business('bakery', 5)]),
  // Row 14
  job('dispatcher', 'Dispatcher', 'worker', ['head-chef', 'furniture-workshop-chief'], [wealth(MIDDLE_CLASS)]),
  job('site-foreman', 'Site Foreman', 'worker', ['head-chef', 'furniture-workshop-chief'], [home(3)]),
  // Row 15
  job('site-manager', 'Site Manager', 'worker', ['dispatcher', 'site-foreman'], [vehicle('vehicle-pickup')]),
  job('contractor', 'Contractor', 'worker', ['dispatcher', 'site-foreman'], [business('construction')]),

  // ── Office (Ofis): rows 16–29 ──
  // Row 16
  job('cashier', 'Cashier', 'office', ['site-manager', 'contractor'], [item('outfit-work')]),
  job('call-center-agent', 'Call Center Agent', 'office', ['site-manager', 'contractor'], [item('gadget-phone'), home(2)]),
  // Row 17
  job('shop-assistant', 'Shop Assistant', 'office', ['cashier', 'call-center-agent'], [item('gadget-phone')]),
  job('office-clerk', 'Office Clerk', 'office', ['cashier', 'call-center-agent'], [course('night-school')]),
  // Row 18
  job('sales-representative', 'Sales Representative', 'office', ['shop-assistant', 'office-clerk'], [item('vehicle-old-sedan')]),
  job('bank-teller', 'Bank Teller', 'office', ['shop-assistant', 'office-clerk'], [item('outfit-smart')]),
  // Row 19
  job('executive-assistant', 'Executive Assistant', 'office', ['sales-representative', 'bank-teller'], [item('outfit-smart')]),
  job('social-media-assistant', 'Social Media Assistant', 'office', ['sales-representative', 'bank-teller'], [item('gadget-laptop')]),
  // Row 20
  job('senior-sales', 'Senior Sales Representative', 'office', ['executive-assistant', 'social-media-assistant'], [vehicle('vehicle-hatchback')]),
  job('accountant', 'Accountant', 'office', ['executive-assistant', 'social-media-assistant'], [course('accounting-certificate')]),
  // Row 21
  job('hr-specialist', 'HR Specialist', 'office', ['senior-sales', 'accountant'], [item('gadget-laptop')]),
  job('content-creator', 'Content Creator', 'office', ['senior-sales', 'accountant'], [item('gadget-camera')]),
  // Row 22
  job('store-manager', 'Store Manager', 'office', ['hr-specialist', 'content-creator'], [wealth(MIDDLE_CLASS)]),
  job('real-estate-agent', 'Real Estate Agent', 'office', ['hr-specialist', 'content-creator'], [wealth(MIDDLE_CLASS), business('real-estate-office')]),
  // Row 23
  job('logistics-coordinator', 'Logistics Coordinator', 'office', ['store-manager', 'real-estate-agent'], [item('gadget-laptop'), business('logistics-warehouse')]),
  job('financial-analyst', 'Financial Analyst', 'office', ['store-manager', 'real-estate-agent'], [course('economics-degree')]),
  // Row 24
  job('office-manager', 'Office Manager', 'office', ['logistics-coordinator', 'financial-analyst'], [item('outfit-coat')]),
  job('restaurant-manager', 'Restaurant Manager', 'office', ['logistics-coordinator', 'financial-analyst'], [business('restaurant', 5)]),
  // Row 25
  job('regional-sales-manager', 'Regional Sales Manager', 'office', ['office-manager', 'restaurant-manager'], [vehicle('vehicle-suv')]),
  job('food-beverage-manager', 'Food & Beverage Manager', 'office', ['office-manager', 'restaurant-manager'], [home(5)]),
  // Row 26
  job('operations-manager', 'Operations Manager', 'office', ['regional-sales-manager', 'food-beverage-manager'], [business('mini-market')]),
  job('finance-manager', 'Finance Manager', 'office', ['regional-sales-manager', 'food-beverage-manager'], [home(6)]),
  // Row 27
  job('hr-manager', 'HR Manager', 'office', ['operations-manager', 'finance-manager'], [item('outfit-suit')]),
  job('national-sales-manager', 'National Sales Manager', 'office', ['operations-manager', 'finance-manager'], [vehicle('vehicle-executive')]),
  // Row 28
  job('supply-chain-manager', 'Supply Chain Manager', 'office', ['hr-manager', 'national-sales-manager'], [managers(3)]),
  job('marketing-manager', 'Marketing Manager', 'office', ['hr-manager', 'national-sales-manager'], [managers(3)]),
  // Row 29
  job('hotel-manager', 'Hotel Manager', 'office', ['supply-chain-manager', 'marketing-manager'], [course('hospitality-degree')]),
  job('investment-banker', 'Investment Banker', 'office', ['supply-chain-manager', 'marketing-manager'], [course('mba')]),

  // ── Expert (Uzman): rows 30–45 ──
  // Row 30
  job('street-photographer', 'Street Photographer', 'expert', ['hotel-manager', 'investment-banker'], [item('gadget-camera')]),
  job('it-support', 'IT Support', 'expert', ['hotel-manager', 'investment-banker'], [course('it-certificate'), item('gadget-laptop')]),
  // Row 31
  job('nursing-assistant', 'Nursing Assistant', 'expert', ['street-photographer', 'it-support'], [course('first-aid')]),
  job('junior-web-developer', 'Junior Web Developer', 'expert', ['street-photographer', 'it-support'], [course('coding-bootcamp')]),
  // Row 32
  job('nurse', 'Nurse', 'expert', ['nursing-assistant', 'junior-web-developer'], [course('nursing-school')]),
  job('journalist', 'Journalist', 'expert', ['nursing-assistant', 'junior-web-developer'], [course('journalism')]),
  // Row 33
  job('paramedic', 'Paramedic', 'expert', ['nurse', 'journalist'], [course('driving-license')]),
  job('web-developer', 'Web Developer', 'expert', ['nurse', 'journalist'], [home(4)]),
  // Row 34
  job('teacher', 'Teacher', 'expert', ['paramedic', 'web-developer'], [course('education-degree')]),
  job('editor', 'Editor', 'expert', ['paramedic', 'web-developer'], [wealth(MILLIONAIRE)]),
  // Row 35
  job('head-nurse', 'Head Nurse', 'expert', ['teacher', 'editor'], [home(5)]),
  job('software-engineer', 'Software Engineer', 'expert', ['teacher', 'editor'], [course('computer-science')]),
  // Row 36
  job('lawyer', 'Lawyer', 'expert', ['head-nurse', 'software-engineer'], [course('law-school')]),
  job('editor-in-chief', 'Editor-in-Chief', 'expert', ['head-nurse', 'software-engineer'], [item('outfit-suit')]),
  // Row 37
  job('doctor', 'Doctor', 'expert', ['lawyer', 'editor-in-chief'], [course('medical-school')]),
  job('senior-engineer', 'Senior Software Engineer', 'expert', ['lawyer', 'editor-in-chief'], [vehicle('vehicle-suv')]),
  // Row 38
  job('senior-lawyer', 'Senior Lawyer', 'expert', ['doctor', 'senior-engineer'], [home(6)]),
  job('architect', 'Architect', 'expert', ['doctor', 'senior-engineer'], [course('architecture')]),
  // Row 39
  job('specialist-doctor', 'Specialist Doctor', 'expert', ['senior-lawyer', 'architect'], [home(6)]),
  job('pilot', 'Pilot', 'expert', ['senior-lawyer', 'architect'], [course('flight-school')]),
  // Row 40
  job('veterinarian', 'Veterinarian', 'expert', ['specialist-doctor', 'pilot'], [course('veterinary-school')]),
  job('team-leader', 'Team Leader', 'expert', ['specialist-doctor', 'pilot'], [item('outfit-suit')]),
  // Row 41
  job('judge', 'Judge', 'expert', ['veterinarian', 'team-leader'], [home(7)]),
  job('construction-project-manager', 'Construction Project Manager', 'expert', ['veterinarian', 'team-leader'], [course('engineering-degree')]),
  // Row 42
  job('surgeon', 'Surgeon', 'expert', ['judge', 'construction-project-manager'], [course('surgical-residency')]),
  job('captain', 'Captain', 'expert', ['judge', 'construction-project-manager'], [vehicle('vehicle-coupe')]),
  // Row 43
  job('professor', 'Professor', 'expert', ['surgeon', 'captain'], [course('doctorate')]),
  job('tv-producer', 'TV Producer', 'expert', ['surgeon', 'captain'], [managers(3)]),
  // Row 44
  job('hospital-director', 'Hospital Director', 'expert', ['professor', 'tv-producer'], [course('mba')]),
  job('engineering-manager', 'Engineering Manager', 'expert', ['professor', 'tv-producer'], [managers(4)]),
  // Row 45
  job('rector', 'Rector', 'expert', ['hospital-director', 'engineering-manager'], [home(8)]),
  job('chief-architect', 'Chief Architect', 'expert', ['hospital-director', 'engineering-manager'], [business('factory')]),

  // ── The top (Zirve): rows 46–54 ──
  // Row 46
  job('director', 'Sales Director', 'top', ['rector', 'chief-architect'], [course('mba')]),
  job('logistics-director', 'Logistics Director', 'top', ['rector', 'chief-architect'], [course('mba')]),
  // Row 47
  job('hospitality-director', 'Hospitality Director', 'top', ['director', 'logistics-director'], [home(8)]),
  job('media-director', 'Media Director', 'top', ['director', 'logistics-director'], [managers(5)]),
  // Row 48
  job('legal-director', 'Legal Director', 'top', ['hospitality-director', 'media-director'], [item('outfit-suit')]),
  job('airline-ops-director', 'Airline Operations Director', 'top', ['hospitality-director', 'media-director'], [vehicle('vehicle-executive')]),
  // Row 49
  job('portfolio-manager', 'Portfolio Manager', 'top', ['legal-director', 'airline-ops-director'], [item('outfit-threepiece')]),
  job('chief-commercial-officer', 'Chief Commercial Officer', 'top', ['legal-director', 'airline-ops-director'], [managers(4)]),
  // Row 50
  job('cto', 'Chief Technology Officer', 'top', ['portfolio-manager', 'chief-commercial-officer'], [vehicle('vehicle-executive'), managers(4)]),
  job('cfo', 'Chief Financial Officer', 'top', ['portfolio-manager', 'chief-commercial-officer'], [item('outfit-tux'), managers(4)]),
  // Row 51
  job('coo', 'Chief Operating Officer', 'top', ['cto', 'cfo'], [managers(4)]),
  // Row 52
  job('ceo', 'CEO', 'top', ['coo'], [wealth(MILLIONAIRE), course('mba'), managers(5)]),
  // Row 53
  job('board-member', 'Board Member', 'top', ['ceo'], [wealth(BILLIONAIRE)]),
  job('fund-founder', 'Investment Fund Founder', 'top', ['ceo'], [wealth(BILLIONAIRE), business('tech-startup', 5)]),
  // Row 54
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
    requires: [
      ...(after.length === 0 ? [] : [{ type: 'anyOf' as const, options: after.map((careerId) => ({ type: 'mastered' as const, careerId })) }]),
      ...requires,
      ...jobSkillRequirements(id, level),
    ],
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

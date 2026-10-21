import type { CareerDef, CareerTrack, Requirement } from '../types';
import { SECONDS_PER_MONTH } from './life';

// Jobs (docs/game-design-v2.md §4.4, decided 2026-10-20): many jobs in a few fields, one held at a
// time. A job is never bought with big money: it opens when its conditions are met (months in an
// earlier job, a course, an item, an address) and costs only a small fee. Salaries follow the in-game
// calendar (one month = 80 s): what a job pays a month is close to real life. Jobs give no income
// bonus. Ids are saved (current job, months per job): never rename one.

/** The fields in the order the career screen lists them. */
export const CAREER_TRACKS: CareerTrack[] = ['start', 'food', 'sales', 'transport', 'tech', 'finance', 'trades', 'media', 'health', 'top'];

const ART = '/assets/jobs/v2';

// Shorthands for the conditions.
const job = (careerId: string, months: number): Requirement => ({ type: 'job', careerId, months });
const course = (courseId: string): Requirement => ({ type: 'course', courseId });
const item = (itemId: string): Requirement => ({ type: 'item', itemId });
/** Live at this home or a better one (index into HOUSES): 2 = the rented room, an address for a contract. */
const home = (index: number): Requirement => ({ type: 'home', index });
const anyOf = (...options: Requirement[]): Requirement => ({ type: 'anyOf', options });

const JOBS: { id: string; name: string; track: CareerTrack; monthly: number; cost: number; requires: Requirement[] }[] = [
  // The first job: anyone can hand out flyers.
  { id: 'flyer-distributor', name: 'Flyer Distributor', track: 'start', monthly: 300, cost: 20, requires: [] },

  // Food and hospitality
  { id: 'dishwasher', name: 'Dishwasher', track: 'food', monthly: 900, cost: 50, requires: [job('flyer-distributor', 6)] },
  { id: 'waiter', name: 'Waiter', track: 'food', monthly: 1_800, cost: 150, requires: [job('dishwasher', 6), item('outfit-work')] },
  { id: 'line-cook', name: 'Line Cook', track: 'food', monthly: 2_400, cost: 200, requires: [job('dishwasher', 12)] },
  { id: 'sous-chef', name: 'Sous Chef', track: 'food', monthly: 4_000, cost: 500, requires: [job('line-cook', 24), course('culinary-school')] },
  { id: 'head-chef', name: 'Head Chef', track: 'food', monthly: 7_000, cost: 1_000, requires: [job('sous-chef', 36)] },
  { id: 'restaurant-manager', name: 'Restaurant Manager', track: 'food', monthly: 6_000, cost: 1_000, requires: [anyOf(job('waiter', 36), job('head-chef', 12))] },
  { id: 'hotel-manager', name: 'Hotel Manager', track: 'food', monthly: 15_000, cost: 3_000, requires: [job('restaurant-manager', 48), course('hospitality-degree')] },
  { id: 'hospitality-director', name: 'Hospitality Director', track: 'food', monthly: 30_000, cost: 10_000, requires: [job('hotel-manager', 60)] },

  // Retail and sales
  { id: 'cashier', name: 'Cashier', track: 'sales', monthly: 1_400, cost: 100, requires: [job('flyer-distributor', 6)] },
  { id: 'shop-assistant', name: 'Shop Assistant', track: 'sales', monthly: 1_700, cost: 150, requires: [job('cashier', 6), item('outfit-work')] },
  { id: 'sales-representative', name: 'Sales Representative', track: 'sales', monthly: 3_500, cost: 500, requires: [job('shop-assistant', 12), item('gadget-phone')] },
  { id: 'senior-sales', name: 'Senior Sales Representative', track: 'sales', monthly: 5_000, cost: 1_000, requires: [job('sales-representative', 24), item('vehicle-old-sedan'), course('driving-license')] },
  { id: 'store-manager', name: 'Store Manager', track: 'sales', monthly: 5_500, cost: 1_000, requires: [job('shop-assistant', 36)] },
  { id: 'regional-sales-manager', name: 'Regional Sales Manager', track: 'sales', monthly: 9_000, cost: 2_000, requires: [anyOf(job('senior-sales', 36), job('store-manager', 48))] },
  { id: 'director', name: 'Sales Director', track: 'sales', monthly: 18_000, cost: 5_000, requires: [job('regional-sales-manager', 48), course('mba')] },
  { id: 'chief-commercial-officer', name: 'Chief Commercial Officer', track: 'sales', monthly: 35_000, cost: 10_000, requires: [job('director', 60)] },

  // Transport and logistics
  { id: 'bike-courier', name: 'Bike Courier', track: 'transport', monthly: 1_200, cost: 50, requires: [job('flyer-distributor', 6), item('vehicle-bike')] },
  { id: 'delivery-driver', name: 'Delivery Driver', track: 'transport', monthly: 2_500, cost: 300, requires: [job('bike-courier', 12), item('vehicle-scooter')] },
  { id: 'taxi-driver', name: 'Taxi Driver', track: 'transport', monthly: 2_800, cost: 500, requires: [course('driving-license'), item('vehicle-old-sedan')] },
  { id: 'truck-driver', name: 'Truck Driver', track: 'transport', monthly: 4_000, cost: 800, requires: [anyOf(job('delivery-driver', 12), job('taxi-driver', 12)), course('heavy-license')] },
  { id: 'dispatcher', name: 'Dispatcher', track: 'transport', monthly: 3_800, cost: 500, requires: [anyOf(job('delivery-driver', 24), job('taxi-driver', 24)), item('gadget-phone')] },
  { id: 'warehouse-supervisor', name: 'Warehouse Supervisor', track: 'transport', monthly: 5_000, cost: 800, requires: [job('truck-driver', 24)] },
  { id: 'logistics-coordinator', name: 'Logistics Coordinator', track: 'transport', monthly: 7_000, cost: 1_500, requires: [anyOf(job('dispatcher', 36), job('warehouse-supervisor', 24)), item('gadget-laptop')] },
  { id: 'operations-manager', name: 'Operations Manager', track: 'transport', monthly: 12_000, cost: 3_000, requires: [job('logistics-coordinator', 36)] },
  { id: 'logistics-director', name: 'Logistics Director', track: 'transport', monthly: 22_000, cost: 8_000, requires: [job('operations-manager', 48), course('mba')] },

  // Technology
  { id: 'it-support', name: 'IT Support', track: 'tech', monthly: 3_500, cost: 300, requires: [course('it-certificate'), item('gadget-laptop')] },
  { id: 'junior-web-developer', name: 'Junior Web Developer', track: 'tech', monthly: 4_500, cost: 500, requires: [course('coding-bootcamp'), item('gadget-laptop')] },
  { id: 'web-developer', name: 'Web Developer', track: 'tech', monthly: 6_500, cost: 800, requires: [anyOf(job('junior-web-developer', 18), job('it-support', 36))] },
  { id: 'software-engineer', name: 'Software Engineer', track: 'tech', monthly: 9_000, cost: 1_500, requires: [anyOf(job('web-developer', 24), course('computer-science'))] },
  { id: 'senior-engineer', name: 'Senior Software Engineer', track: 'tech', monthly: 12_000, cost: 2_000, requires: [job('software-engineer', 36)] },
  { id: 'team-leader', name: 'Team Leader', track: 'tech', monthly: 14_000, cost: 2_500, requires: [job('senior-engineer', 24)] },
  { id: 'engineering-manager', name: 'Engineering Manager', track: 'tech', monthly: 18_000, cost: 4_000, requires: [job('team-leader', 36)] },
  { id: 'cto', name: 'Chief Technology Officer', track: 'tech', monthly: 40_000, cost: 10_000, requires: [job('engineering-manager', 60)] },

  // Office and finance
  { id: 'office-clerk', name: 'Office Clerk', track: 'finance', monthly: 2_000, cost: 150, requires: [job('flyer-distributor', 6), home(2)] },
  { id: 'bank-teller', name: 'Bank Teller', track: 'finance', monthly: 2_400, cost: 200, requires: [job('office-clerk', 12)] },
  { id: 'accountant', name: 'Accountant', track: 'finance', monthly: 4_500, cost: 800, requires: [anyOf(job('bank-teller', 12), job('office-clerk', 24)), course('accounting-certificate')] },
  { id: 'financial-analyst', name: 'Financial Analyst', track: 'finance', monthly: 7_000, cost: 1_500, requires: [course('economics-degree'), item('gadget-laptop')] },
  { id: 'finance-manager', name: 'Finance Manager', track: 'finance', monthly: 11_000, cost: 3_000, requires: [anyOf(job('accountant', 36), job('financial-analyst', 36))] },
  { id: 'investment-banker', name: 'Investment Banker', track: 'finance', monthly: 20_000, cost: 5_000, requires: [job('financial-analyst', 36), course('mba')] },
  { id: 'cfo', name: 'Chief Financial Officer', track: 'finance', monthly: 45_000, cost: 12_000, requires: [anyOf(job('finance-manager', 60), job('investment-banker', 48))] },

  // Construction and trades
  { id: 'construction-laborer', name: 'Construction Laborer', track: 'trades', monthly: 1_600, cost: 100, requires: [job('flyer-distributor', 6), item('outfit-work')] },
  { id: 'apprentice-electrician', name: 'Apprentice Electrician', track: 'trades', monthly: 1_900, cost: 150, requires: [job('construction-laborer', 12), item('gadget-toolbox')] },
  { id: 'electrician', name: 'Electrician', track: 'trades', monthly: 3_800, cost: 500, requires: [job('apprentice-electrician', 24), course('electrician-certificate')] },
  { id: 'master-electrician', name: 'Master Electrician', track: 'trades', monthly: 5_500, cost: 1_000, requires: [job('electrician', 48)] },
  { id: 'site-foreman', name: 'Site Foreman', track: 'trades', monthly: 6_000, cost: 1_000, requires: [anyOf(job('construction-laborer', 48), job('electrician', 24))] },
  { id: 'site-manager', name: 'Site Manager', track: 'trades', monthly: 9_000, cost: 2_000, requires: [job('site-foreman', 36)] },
  { id: 'construction-project-manager', name: 'Construction Project Manager', track: 'trades', monthly: 15_000, cost: 4_000, requires: [job('site-manager', 48), course('engineering-degree')] },

  // Media and creative work
  { id: 'street-photographer', name: 'Street Photographer', track: 'media', monthly: 1_000, cost: 50, requires: [job('flyer-distributor', 6), item('gadget-camera')] },
  { id: 'social-media-assistant', name: 'Social Media Assistant', track: 'media', monthly: 2_000, cost: 150, requires: [item('gadget-phone'), home(2)] },
  { id: 'content-creator', name: 'Content Creator', track: 'media', monthly: 3_500, cost: 500, requires: [anyOf(job('social-media-assistant', 12), job('street-photographer', 24)), item('gadget-laptop')] },
  { id: 'journalist', name: 'Journalist', track: 'media', monthly: 4_000, cost: 500, requires: [course('journalism'), item('gadget-phone')] },
  { id: 'editor', name: 'Editor', track: 'media', monthly: 6_000, cost: 1_000, requires: [job('journalist', 36)] },
  { id: 'tv-producer', name: 'TV Producer', track: 'media', monthly: 10_000, cost: 2_000, requires: [anyOf(job('editor', 36), job('content-creator', 48))] },
  { id: 'media-director', name: 'Media Director', track: 'media', monthly: 25_000, cost: 6_000, requires: [job('tv-producer', 48)] },

  // Health
  { id: 'hospital-porter', name: 'Hospital Porter', track: 'health', monthly: 1_800, cost: 100, requires: [job('flyer-distributor', 6), home(2)] },
  { id: 'nursing-assistant', name: 'Nursing Assistant', track: 'health', monthly: 2_400, cost: 200, requires: [job('hospital-porter', 6), course('first-aid')] },
  { id: 'nurse', name: 'Nurse', track: 'health', monthly: 4_500, cost: 500, requires: [course('nursing-school')] },
  { id: 'head-nurse', name: 'Head Nurse', track: 'health', monthly: 7_000, cost: 1_000, requires: [job('nurse', 48)] },
  { id: 'doctor', name: 'Doctor', track: 'health', monthly: 15_000, cost: 3_000, requires: [course('medical-school')] },
  { id: 'surgeon', name: 'Surgeon', track: 'health', monthly: 30_000, cost: 8_000, requires: [job('doctor', 60)] },
  { id: 'hospital-director', name: 'Hospital Director', track: 'health', monthly: 40_000, cost: 12_000, requires: [anyOf(job('surgeon', 36), job('head-nurse', 96)), course('mba')] },

  // The top: any field's chief can run a company.
  {
    id: 'ceo',
    name: 'CEO',
    track: 'top',
    monthly: 60_000,
    cost: 20_000,
    requires: [
      anyOf(
        job('chief-commercial-officer', 24),
        job('cto', 24),
        job('cfo', 24),
        job('logistics-director', 24),
        job('media-director', 36),
        job('hospitality-director', 36),
        job('hospital-director', 24),
      ),
    ],
  },
];

export const CAREERS: CareerDef[] = JOBS.map(({ monthly, ...job }) => ({
  ...job,
  image: `${ART}/${job.id}.webp`,
  salaryPerSecond: monthly / SECONDS_PER_MONTH,
}));

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

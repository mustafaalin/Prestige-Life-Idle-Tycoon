import type { Job, JobCategory } from '../../types/game';
import { createJobRequirements, getJobUnlockRequirementSeconds } from './jobRequirements';

const now = new Date().toISOString();
const WORKER_HEALTH_DRAIN_PER_HOUR = [
  -5.0, -4.8, -4.9, -4.6, -4.7, -4.5, -4.6, -4.3, -4.4, -4.2,
  -4.3, -4.1, -4.2, -4.0, -4.1, -3.9, -4.0, -3.8, -3.9, -3.7,
] as const;
const SPECIALIST_HEALTH_DRAIN_PER_HOUR = [
  -4.2, -4.0, -4.1, -3.9, -4.0, -3.8, -3.9, -3.6, -3.7, -3.5,
  -3.6, -3.4, -3.5, -3.3, -3.4, -3.2, -3.3, -3.1, -3.2, -3.0,
] as const;
const MANAGER_HEALTH_DRAIN_PER_HOUR = [
  -3.9, -3.7, -3.8, -3.5, -3.6, -3.4, -3.5, -3.3, -3.4, -3.2,
  -3.3, -3.1, -3.2, -3.0, -3.1, -2.9, -3.0, -2.8, -2.9, -2.7,
] as const;
const WORKER_HAPPINESS_EFFECT_PER_HOUR = [
  -4.0, -3.8, -3.9, -3.5, -3.6, -3.2, -3.3, -2.9, -3.0, -2.6,
  -2.7, -2.3, -2.4, -1.9, -2.0, -1.5, -1.6, -1.0, -1.1, -0.5,
] as const;
const SPECIALIST_HAPPINESS_EFFECT_PER_HOUR = [
  -1.2, -0.8, -1.0, -0.5, -0.7, -0.2, 0.0, 0.4, 0.2, 0.7,
  0.5, 1.0, 0.8, 1.3, 1.1, 1.6, 1.4, 2.0, 1.8, 2.4,
] as const;
const MANAGER_HAPPINESS_EFFECT_PER_HOUR = [
  0.2, 0.6, 0.3, 0.9, 0.7, 1.2, 0.9, 1.5, 1.3, 1.8,
  1.5, 2.1, 1.8, 2.4, 2.1, 2.7, 2.4, 3.0, 2.7, 3.4,
] as const;

type JobSeed = Omit<
  Job,
  'id' | 'level' | 'created_at' | 'icon_name' | 'category' | 'tier' | 'order' | 'requirements'
> & {
  slug: string;
};

function createJobCollection(
  category: JobCategory,
  startingLevel: number,
  seeds: JobSeed[]
): Job[] {
  return seeds.map((seed, index) => ({
    ...seed,
    id: `${category}-${String(index + 1).padStart(2, '0')}-${seed.slug}`,
    category,
    tier: index + 1,
    order: startingLevel + index,
    level: startingLevel + index,
    health_effect_per_hour: getJobHealthEffectPerHour(category, index + 1),
    happiness_effect_per_hour: getJobHappinessEffectPerHour(category, index + 1),
    requirements: createJobRequirements({
      category,
      order: startingLevel + index,
    }),
    icon_name: 'Briefcase',
    created_at: now,
  }));
}

function getJobHealthEffectPerHour(category: JobCategory, tier: number) {
  const normalizedTier = Math.max(1, Math.floor(tier)) - 1;
  const drainTables = {
    worker: WORKER_HEALTH_DRAIN_PER_HOUR,
    specialist: SPECIALIST_HEALTH_DRAIN_PER_HOUR,
    manager: MANAGER_HEALTH_DRAIN_PER_HOUR,
  } as const;
  const table = drainTables[category];
  return table[Math.min(normalizedTier, table.length - 1)];
}

function getJobHappinessEffectPerHour(category: JobCategory, tier: number) {
  const normalizedTier = Math.max(1, Math.floor(tier)) - 1;
  const effectTables = {
    worker: WORKER_HAPPINESS_EFFECT_PER_HOUR,
    specialist: SPECIALIST_HAPPINESS_EFFECT_PER_HOUR,
    manager: MANAGER_HAPPINESS_EFFECT_PER_HOUR,
  } as const;
  const table = effectTables[category];
  return table[Math.min(normalizedTier, table.length - 1)];
}

export const WORKER_JOBS: Job[] = createJobCollection('worker', 1, [
  { slug: 'flyer-distributor', name: 'Flyer Distributor', description: 'Hand out promotional materials', hourly_income: 700, is_default_unlocked: true, icon_url: '/assets/jobs/workers/Flyer-Distributor.png', prestige_points: 2 },
  { slug: 'dishwasher', name: 'Dishwasher', description: 'Wash dishes and clean kitchen equipment', hourly_income: 850, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Dishwasher.png', prestige_points: 4 },
  { slug: 'shelf-stocker', name: 'Shelf Stocker', description: 'Stock shelves and organize inventory', hourly_income: 1000, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Shelf-Stocker.png', prestige_points: 7 },
  { slug: 'cleaner', name: 'Cleaner', description: 'Keep buildings and facilities clean', hourly_income: 1200, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Cleaner.png', prestige_points: 10 },
  { slug: 'cashier', name: 'Cashier', description: 'Handle transactions and customer service', hourly_income: 1400, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Cashier.png', prestige_points: 13 },
  { slug: 'waiter', name: 'Waiter', description: 'Serve customers at restaurants', hourly_income: 1650, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Waiter.png', prestige_points: 17 },
  { slug: 'bicycle-courier', name: 'Bicycle Courier', description: 'Deliver packages around the city', hourly_income: 1900, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Bicycle-Courier.png', prestige_points: 22 },
  { slug: 'car-wash-attendant', name: 'Car Wash Attendant', description: 'Clean and detail vehicles', hourly_income: 2200, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Car-Wash-Attendant.png', prestige_points: 27 },
  { slug: 'warehouse-packer', name: 'Warehouse Packer', description: 'Pack and prepare shipments', hourly_income: 2500, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Warehouse-Packer.png', prestige_points: 33 },
  { slug: 'parcel-sorter', name: 'Parcel Sorter', description: 'Sort and organize packages efficiently', hourly_income: 2900, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Parcel-Sorter.png', prestige_points: 40 },
  { slug: 'security-guard', name: 'Security Guard', description: 'Protect property and ensure safety', hourly_income: 3300, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Security-Guard.png', prestige_points: 48 },
  { slug: 'bakery-assistant', name: 'Bakery Assistant', description: 'Prepare and bake fresh goods', hourly_income: 3800, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Bakery-Assistant.png', prestige_points: 55 },
  { slug: 'construction-laborer', name: 'Construction Laborer', description: 'Build and repair structures', hourly_income: 4250, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Construction-Laborer.png', prestige_points: 66 },
  { slug: 'landscaping-worker', name: 'Landscaping Worker', description: 'Maintain gardens and outdoor spaces', hourly_income: 4750, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Landscaping-Worker.png', prestige_points: 75 },
  { slug: 'factory-line-worker', name: 'Factory Line Worker', description: 'Operate machinery and assemble products', hourly_income: 5000, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Factory-Line-Worker.png', prestige_points: 87 },
  { slug: 'call-center-agent', name: 'Call Center Agent', description: 'Handle customer support and service calls', hourly_income: 5400, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Call-Center-Agent.png', prestige_points: 100 },
  { slug: 'delivery-driver', name: 'Delivery Driver', description: 'Deliver goods on larger city routes', hourly_income: 5850, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Delivery-Driver.png', prestige_points: 120 },
  { slug: 'machine-operator', name: 'Machine Operator', description: 'Operate heavy equipment and production machines', hourly_income: 6250, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Machine-Operator.png', prestige_points: 135 },
  { slug: 'field-technician', name: 'Field Technician', description: 'Handle on-site technical service and repairs', hourly_income: 6600, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Field-Technician.png', prestige_points: 145 },
  { slug: 'sales-representative', name: 'Sales Representative', description: 'Represent products and close in-person sales', hourly_income: 7000, is_default_unlocked: false, icon_url: '/assets/jobs/workers/Sales-Representative.png', prestige_points: 165 },
]);

export const SPECIALIST_JOBS: Job[] = createJobCollection('specialist', 21, [
  { slug: 'it-support-assistant', name: 'IT Support Assistant', description: 'Support users with routine systems and device issues', hourly_income: 8000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/1-IT Support Assistant.png', prestige_points: 180 },
  { slug: 'junior-mechanic', name: 'Junior Mechanic', description: 'Maintain and repair vehicle and machine components', hourly_income: 8500, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/2-Junior Mechanic.png', prestige_points: 188 },
  { slug: 'electronics-repair-technician', name: 'Electronics Repair Technician', description: 'Diagnose and fix consumer electronic devices', hourly_income: 9000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/3-Electronics Repair Technician.png', prestige_points: 196 },
  { slug: 'cad-technician', name: 'CAD Technician', description: 'Prepare technical drawings and design documentation', hourly_income: 9500, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/4-CAD Technician.png', prestige_points: 204 },
  { slug: 'laboratory-technician', name: 'Laboratory Technician', description: 'Run lab procedures and support test workflows', hourly_income: 10000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/5-Laboratory Technician.png', prestige_points: 212 },
  { slug: 'mechanical-technician', name: 'Mechanical Technician', description: 'Service mechanical systems and production tools', hourly_income: 10600, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/6-Mechanical Technician.png', prestige_points: 221 },
  { slug: 'network-technician', name: 'Network Technician', description: 'Set up and maintain office and field networks', hourly_income: 11200, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/7-Network Technician.png', prestige_points: 230 },
  { slug: 'qa-technician', name: 'QA Technician', description: 'Check product quality and document defects', hourly_income: 11800, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/8-QA Technician.png', prestige_points: 239 },
  { slug: 'field-service-technician', name: 'Field Service Technician', description: 'Handle technical service work on client sites', hourly_income: 12400, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/9-Field Service Technician.png', prestige_points: 248 },
  { slug: 'junior-accountant', name: 'Junior Accountant', description: 'Support bookkeeping, records, and financial reporting', hourly_income: 13000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/10-Junior Accountant.png', prestige_points: 258 },
  { slug: 'graphic-designer', name: 'Graphic Designer', description: 'Create visual assets for brands and campaigns', hourly_income: 13600, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/11-Graphic Designer.png', prestige_points: 268 },
  { slug: 'web-developer', name: 'Web Developer', description: 'Build and maintain user-facing web experiences', hourly_income: 14300, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/12-Web Developer.png', prestige_points: 279 },
  { slug: 'software-developer', name: 'Software Developer', description: 'Design and ship application features and systems', hourly_income: 15000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/13-Software Developer.png', prestige_points: 290 },
  { slug: 'data-analyst', name: 'Data Analyst', description: 'Turn data into reports, dashboards, and insights', hourly_income: 15700, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/14-Data Analyst.png', prestige_points: 301 },
  { slug: 'systems-administrator', name: 'Systems Administrator', description: 'Maintain servers, access, and internal infrastructure', hourly_income: 16400, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/15-Systems Administrator.png', prestige_points: 313 },
  { slug: 'civil-engineer', name: 'Civil Engineer', description: 'Plan and support structural and public works projects', hourly_income: 17100, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/16-Civil Engineer.png', prestige_points: 325 },
  { slug: 'mechanical-engineer', name: 'Mechanical Engineer', description: 'Develop, test, and improve mechanical systems', hourly_income: 17800, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/17-Mechanical Engineer.png', prestige_points: 337 },
  { slug: 'industrial-engineer', name: 'Industrial Engineer', description: 'Optimize operations, tooling, and production workflows', hourly_income: 18500, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/18-Industrial Engineer.png', prestige_points: 350 },
  { slug: 'computer-engineer', name: 'Computer Engineer', description: 'Bridge hardware and software in technical systems', hourly_income: 19200, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/19-Computer Engineer.png', prestige_points: 363 },
  { slug: 'solutions-architect', name: 'Solutions Architect', description: 'Design larger-scale technical solutions and systems', hourly_income: 20000, is_default_unlocked: false, icon_url: '/assets/jobs/specialist/20-Solutions Architect.png', prestige_points: 377 },
]);

export const MANAGER_JOBS: Job[] = createJobCollection('manager', 41, [
  { slug: 'team-leader', name: 'Team Leader', description: 'Lead a small team, coordinate delivery, and keep daily work on track.', hourly_income: 22000, is_default_unlocked: false, icon_url: '/assets/jobs/manager/1-Team-Leader.png', prestige_points: 392 },
  { slug: 'shift-supervisor', name: 'Shift Supervisor', description: 'Oversee shift performance, staffing, and daily operational flow.', hourly_income: 23000, is_default_unlocked: false, icon_url: '/assets/jobs/manager/2-Shift-Supervisor.png', prestige_points: 406 },
  { slug: 'operations-supervisor', name: 'Operations Supervisor', description: 'Monitor workflows, quality, and cross-team execution standards.', hourly_income: 24300, is_default_unlocked: false, icon_url: '/assets/jobs/manager/3-Operations-Supervisor.png', prestige_points: 420 },
  { slug: 'office-manager', name: 'Office Manager', description: 'Run office operations, schedules, and administrative systems smoothly.', hourly_income: 25600, is_default_unlocked: false, icon_url: '/assets/jobs/manager/4-Office-Manager.png', prestige_points: 435 },
  { slug: 'project-coordinator', name: 'Project Coordinator', description: 'Coordinate timelines, owners, and milestones across active projects.', hourly_income: 26900, is_default_unlocked: false, icon_url: '/assets/jobs/manager/5-Project-Coordinator.png', prestige_points: 450 },
  { slug: 'assistant-manager', name: 'Assistant Manager', description: 'Support department performance, hiring, and day-to-day team decisions.', hourly_income: 28300, is_default_unlocked: false, icon_url: '/assets/jobs/manager/6-Assistant-Manager.png', prestige_points: 466 },
  { slug: 'department-supervisor', name: 'Department Supervisor', description: 'Supervise a larger unit, improve output, and handle escalations.', hourly_income: 29700, is_default_unlocked: false, icon_url: '/assets/jobs/manager/7-Department-Supervisor.png', prestige_points: 482 },
  { slug: 'service-manager', name: 'Service Manager', description: 'Own service quality, customer outcomes, and team accountability.', hourly_income: 31100, is_default_unlocked: false, icon_url: '/assets/jobs/manager/8-Service-Manager.png', prestige_points: 499 },
  { slug: 'production-manager', name: 'Production Manager', description: 'Manage production targets, efficiency, and resource planning.', hourly_income: 32500, is_default_unlocked: false, icon_url: '/assets/jobs/manager/9-Production Manager.png', prestige_points: 516 },
  { slug: 'sales-manager', name: 'Sales Manager', description: 'Drive revenue strategy, coach sales reps, and grow regional targets.', hourly_income: 34000, is_default_unlocked: false, icon_url: '/assets/jobs/manager/10-Sales-Manager.png', prestige_points: 534 },
  { slug: 'marketing-manager', name: 'Marketing Manager', description: 'Lead campaigns, positioning, and brand growth across channels.', hourly_income: 35500, is_default_unlocked: false, icon_url: '/assets/jobs/manager/11-Marketing-Manager.png', prestige_points: 552 },
  { slug: 'hr-manager', name: 'HR Manager', description: 'Manage recruiting, people operations, and long-term talent health.', hourly_income: 37000, is_default_unlocked: false, icon_url: '/assets/jobs/manager/12-HR-Manager.png', prestige_points: 571 },
  { slug: 'finance-manager', name: 'Finance Manager', description: 'Own budgets, controls, and financial planning for the business.', hourly_income: 38500, is_default_unlocked: false, icon_url: '/assets/jobs/manager/13-Finance-Manager.png', prestige_points: 590 },
  { slug: 'it-manager', name: 'IT Manager', description: 'Lead infrastructure, support operations, and systems reliability.', hourly_income: 40100, is_default_unlocked: false, icon_url: '/assets/jobs/manager/14-IT-Manager.png', prestige_points: 610 },
  { slug: 'operations-manager', name: 'Operations Manager', description: 'Scale operational systems and align teams around execution goals.', hourly_income: 41700, is_default_unlocked: false, icon_url: '/assets/jobs/manager/15-Operations-Manager.png', prestige_points: 630 },
  { slug: 'engineering-manager', name: 'Engineering Manager', description: 'Guide technical teams, planning, and delivery of larger initiatives.', hourly_income: 43300, is_default_unlocked: false, icon_url: '/assets/jobs/manager/16-Engineering-Manager.png', prestige_points: 651 },
  { slug: 'senior-manager', name: 'Senior Manager', description: 'Own multi-team performance and make higher-level strategic calls.', hourly_income: 44900, is_default_unlocked: false, icon_url: '/assets/jobs/manager/17-Senior Manager.png', prestige_points: 672 },
  { slug: 'director', name: 'Director', description: 'Set organizational direction and lead entire functions at scale.', hourly_income: 46600, is_default_unlocked: false, icon_url: '/assets/jobs/manager/18-Director.png', prestige_points: 694 },
  { slug: 'general-manager', name: 'General Manager', description: 'Run a major business unit with full performance responsibility.', hourly_income: 48300, is_default_unlocked: false, icon_url: '/assets/jobs/manager/19-General-Manager.png', prestige_points: 717 },
  { slug: 'ceo', name: 'CEO', description: 'Lead the company vision, strategy, and top-level business outcomes.', hourly_income: 50000, is_default_unlocked: false, icon_url: '/assets/jobs/manager/20-Ceo.png', prestige_points: 740 },
]);

export const JOBS_BY_CATEGORY: Record<JobCategory, Job[]> = {
  worker: WORKER_JOBS,
  specialist: SPECIALIST_JOBS,
  manager: MANAGER_JOBS,
};

export const LOCAL_JOBS: Job[] = [...WORKER_JOBS, ...SPECIALIST_JOBS, ...MANAGER_JOBS];
export { getJobUnlockRequirementSeconds };

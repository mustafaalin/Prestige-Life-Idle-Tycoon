import type { Car, House, Job, JobCategory, JobRequirement, PlayerJob, PlayerProfile } from '../../types/game';

export type JobRequirementRouteTarget =
  | 'jobs'
  | 'quest_list'
  | 'health'
  | 'happiness'
  | 'houses'
  | 'cars';

export interface JobRequirementStatus {
  requirement: JobRequirement;
  label: string;
  targetValueLabel: string;
  isMet: boolean;
  routeTarget: JobRequirementRouteTarget;
}

function getRequirementRamp(order: number, divisor: number, step: number, base = 0, cap?: number) {
  const value = base + Math.floor(Math.max(0, order - 1) / divisor) * step;
  return typeof cap === 'number' ? Math.min(value, cap) : value;
}

function getWellbeingRequirement(order: number, offset = 0) {
  const requirementCycle = [75, 80, 85] as const;
  return requirementCycle[(Math.max(1, order) - 1 + offset) % requirementCycle.length];
}

export function getJobUnlockRequirementSeconds(jobOrOrder: Pick<Job, 'order'> | number) {
  const order = typeof jobOrOrder === 'number' ? jobOrOrder : jobOrOrder.order;
  const normalizedIndex = Math.max(1, Math.floor(order)) - 1;
  const fiveSecondSteps = Math.floor(normalizedIndex / 3) * 2 + Math.min(normalizedIndex % 3, 2);
  return 150 + fiveSecondSteps * 5;
}

function getJobCarRequirement(order: number) {
  if (order < 5) {
    return 0;
  }

  return Math.min(8, 1 + Math.floor((order - 5) / 5));
}

function getJobHouseRequirement(order: number) {
  return Math.min(10, 1 + Math.floor((order - 1) / 4));
}

export function createJobRequirements(params: { category: JobCategory; order: number }): JobRequirement[] {
  const { order } = params;

  if (order <= 1) {
    return [];
  }

  const requirements: JobRequirement[] = [
    { type: 'work_seconds', minimum: getJobUnlockRequirementSeconds(order - 1) },
    { type: 'prestige_points', minimum: getRequirementRamp(order, 3, 2, 0, 28) },
    { type: 'health', minimum: getWellbeingRequirement(order) },
    { type: 'happiness', minimum: getWellbeingRequirement(order, 1) },
    { type: 'house_level', minimum: getJobHouseRequirement(order) },
  ];

  const minimumCarLevel = getJobCarRequirement(order);
  if (minimumCarLevel > 0) {
    requirements.push({ type: 'car_level', minimum: minimumCarLevel });
  }

  return requirements;
}

function getSelectedHouseLevel(profile: PlayerProfile | null, houses: House[]) {
  return houses.find((house) => house.id === profile?.selected_house_id)?.level || 0;
}

function getSelectedCarLevel(profile: PlayerProfile | null, cars: Car[]) {
  return cars.find((car) => car.id === profile?.selected_car_id)?.level || 0;
}

function getTrackedJobSeconds(
  playerJob: PlayerJob | undefined,
  activeJobId: string | undefined,
  unsavedSeconds: number
) {
  if (!playerJob) {
    return 0;
  }

  return Number(playerJob.total_time_worked_seconds || 0) + (playerJob.job_id === activeJobId ? unsavedSeconds : 0);
}

export function evaluateJobRequirements(params: {
  job: Job;
  jobs: Job[];
  playerJobs: PlayerJob[];
  profile: PlayerProfile | null;
  houses: House[];
  cars: Car[];
  activeJobId?: string;
  unsavedJobWorkSeconds: number;
}): JobRequirementStatus[] {
  const { job, jobs, playerJobs, profile, houses, cars, activeJobId, unsavedJobWorkSeconds } = params;
  const previousJob = jobs.find((entry) => entry.order === job.order - 1);
  const previousPlayerJob = previousJob
    ? playerJobs.find((entry) => entry.job_id === previousJob.id)
    : undefined;
  const previousTrackedSeconds = getTrackedJobSeconds(previousPlayerJob, activeJobId, unsavedJobWorkSeconds);
  const prestigePoints = Number(profile?.prestige_points || 0);
  const health = Math.max(0, Math.min(100, Number(profile?.health ?? 100)));
  const happiness = Math.max(0, Math.min(100, Number(profile?.happiness ?? 100)));
  const selectedHouseLevel = getSelectedHouseLevel(profile, houses);
  const selectedCarLevel = getSelectedCarLevel(profile, cars);

  return job.requirements.map((requirement) => {
    switch (requirement.type) {
      case 'work_seconds':
        return {
          requirement,
          label: 'Time',
          targetValueLabel: `${requirement.minimum}s`,
          isMet: previousTrackedSeconds >= requirement.minimum,
          routeTarget: 'jobs',
        };
      case 'prestige_points':
        return {
          requirement,
          label: 'Prestige',
          targetValueLabel: `${requirement.minimum}`,
          isMet: prestigePoints >= requirement.minimum,
          routeTarget: 'quest_list',
        };
      case 'health':
        return {
          requirement,
          label: 'Health',
          targetValueLabel: `${requirement.minimum}%`,
          isMet: health >= requirement.minimum,
          routeTarget: 'health',
        };
      case 'happiness':
        return {
          requirement,
          label: 'Happiness',
          targetValueLabel: `${requirement.minimum}%`,
          isMet: happiness >= requirement.minimum,
          routeTarget: 'happiness',
        };
      case 'house_level':
        return {
          requirement,
          label: 'House',
          targetValueLabel: `Lv ${requirement.minimum}`,
          isMet: selectedHouseLevel >= requirement.minimum,
          routeTarget: 'houses',
        };
      case 'car_level':
        return {
          requirement,
          label: 'Car',
          targetValueLabel: `Lv ${requirement.minimum}`,
          isMet: selectedCarLevel >= requirement.minimum,
          routeTarget: 'cars',
        };
    }
  });
}

import type { Car, House, Job, JobCategory, JobRequirement, PlayerJob, PlayerProfile } from '../../types/game';
import { getCarProgressionLevel } from './cars';

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

const JOB_PRESTIGE_REQUIREMENTS = [
  0, 2, 4, 7, 10, 13, 16, 19, 22, 25,
  28, 31, 35, 39, 43, 47, 51, 55, 60, 65,
  70, 75, 80, 86, 92, 98, 104, 110, 117, 124,
  131, 138, 146, 154, 162, 170, 179, 188, 197, 206,
] as const;

function getWellbeingRequirement(order: number, offset = 0) {
  const requirementCycle = [75, 80, 85] as const;
  return requirementCycle[(Math.max(1, order) - 1 + offset) % requirementCycle.length];
}

function getJobPrestigeRequirement(order: number) {
  const normalizedIndex = Math.max(1, Math.floor(order)) - 1;
  return JOB_PRESTIGE_REQUIREMENTS[Math.min(normalizedIndex, JOB_PRESTIGE_REQUIREMENTS.length - 1)];
}

export function getJobUnlockRequirementSeconds(jobOrOrder: Pick<Job, 'order'> | number) {
  const order = typeof jobOrOrder === 'number' ? jobOrOrder : jobOrOrder.order;
  const normalizedIndex = Math.max(1, Math.floor(order)) - 1;
  const fiveSecondSteps = Math.floor(normalizedIndex / 3) * 2 + Math.min(normalizedIndex % 3, 2);
  return 150 + fiveSecondSteps * 5;
}

export function getJobRequirementMinimum(
  job: Pick<Job, 'requirements'> | null | undefined,
  type: JobRequirement['type']
) {
  if (!job) {
    return 0;
  }

  const requirement = job.requirements.find((entry) => entry.type === type);
  return requirement?.minimum ?? 0;
}

// Toplam job sayısı ve eşya limitleri — ileride artırılırsa sadece bu sabitleri güncelle
const TOTAL_JOB_COUNT = 60;
const MAX_CAR_LEVEL = 20;
const MAX_HOUSE_LEVEL = 25;

function getJobCarRequirement(order: number) {
  if (order <= 1) return 0;
  return Math.min(MAX_CAR_LEVEL, Math.ceil((order * MAX_CAR_LEVEL) / TOTAL_JOB_COUNT));
}

function getJobHouseRequirement(order: number) {
  if (order <= 1) return 0;
  return Math.min(MAX_HOUSE_LEVEL, Math.ceil((order * MAX_HOUSE_LEVEL) / TOTAL_JOB_COUNT));
}

export function createJobRequirements(params: { category: JobCategory; order: number }): JobRequirement[] {
  const { category, order } = params;

  if (order <= 1) {
    return [];
  }

  const requirements: JobRequirement[] = [
    { type: 'work_seconds', minimum: getJobUnlockRequirementSeconds(order - 1) },
    { type: 'health', minimum: getWellbeingRequirement(order) },
    { type: 'happiness', minimum: getWellbeingRequirement(order, 1) },
    { type: 'house_level', minimum: getJobHouseRequirement(order) },
  ];

  if (category === 'worker') {
    requirements.splice(1, 0, { type: 'prestige_points', minimum: getJobPrestigeRequirement(order) });
  }

  const minimumCarLevel = getJobCarRequirement(order);
  if (minimumCarLevel > 0) {
    requirements.push({ type: 'car_level', minimum: minimumCarLevel });
  }

  return requirements;
}

function getSelectedHouseLevel(profile: PlayerProfile | null, houses: House[]) {
  const selectedHouse = houses.find((house) => house.id === profile?.selected_house_id);
  if (!selectedHouse) return 0;
  // Premium ev: progression_level_equivalent ile karşıladığı maksimum house_level'ı döndür
  if (selectedHouse.is_premium) return Number(selectedHouse.progression_level_equivalent || MAX_HOUSE_LEVEL);
  return selectedHouse.level || 0;
}

function getSelectedCarLevel(profile: PlayerProfile | null, cars: Car[]) {
  const selectedCar = cars.find((car) => car.id === profile?.selected_car_id);
  return selectedCar ? getCarProgressionLevel(selectedCar) : 0;
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

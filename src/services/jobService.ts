import type { PlayerJob } from '../types/game';
import {
  getLocalBusinesses,
  getLocalJobs,
  getLocalPlayerJobs,
  getLocalProfile,
  saveLocalGameState,
} from '../data/local/storage';
import { recalculateLocalIncome, recalculateLocalPrestige } from '../data/local/economy';

function createPlayerJob(playerId: string, jobId: string, now: string, overrides?: Partial<PlayerJob>): PlayerJob {
  return {
    id: `player-job-${jobId}`,
    player_id: playerId,
    job_id: jobId,
    is_unlocked: true,
    is_active: false,
    is_completed: false,
    times_worked: 0,
    total_earned: 0,
    unlocked_at: now,
    created_at: now,
    total_time_worked_seconds: 0,
    last_work_started_at: null,
    ...overrides,
  };
}

export async function getJobs() {
  return getLocalJobs();
}

export async function getPlayerJobs(playerId: string) {
  return getLocalPlayerJobs().filter((job) => job.player_id === playerId);
}

export async function unlockJob(playerId: string, jobId: string) {
  const playerJobs = getLocalPlayerJobs();
  const now = new Date().toISOString();
  const existing = playerJobs.find((job) => job.player_id === playerId && job.job_id === jobId);

  const nextJobs = existing
    ? playerJobs.map((job) =>
        job.player_id === playerId && job.job_id === jobId
          ? { ...job, is_unlocked: true, unlocked_at: now }
          : job
      )
    : [...playerJobs, createPlayerJob(playerId, jobId, now)];

  saveLocalGameState({ playerJobs: nextJobs });
  return true;
}

export async function selectJob(
  playerId: string,
  jobId: string,
  currentActiveJob?: PlayerJob,
  unsavedSeconds = 0
) {
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const profile = getLocalProfile();
  const businesses = getLocalBusinesses();

  if (!profile) {
    throw new Error('Player not found');
  }

  const now = new Date().toISOString();
  let nextJobs = playerJobs.map((job) => ({ ...job }));

  if (currentActiveJob) {
    nextJobs = nextJobs.map((job) =>
      job.id === currentActiveJob.id
        ? {
            ...job,
            is_active: false,
            is_completed: true,
            total_time_worked_seconds: (job.total_time_worked_seconds || 0) + unsavedSeconds,
          }
        : { ...job, is_active: false }
    );
  }

  const existingJob = nextJobs.find((job) => job.player_id === playerId && job.job_id === jobId);
  if (existingJob) {
    nextJobs = nextJobs.map((job) =>
      job.player_id === playerId && job.job_id === jobId
        ? { ...job, is_active: true, is_unlocked: true, last_work_started_at: now }
        : job
    );
  } else {
    nextJobs.push(
      createPlayerJob(playerId, jobId, now, {
        is_active: true,
        last_work_started_at: now,
      })
    );
  }

  const nextProfile = recalculateLocalIncome({
    profile,
    jobs,
    playerJobs: nextJobs,
    businesses,
  });
  const finalProfile = recalculateLocalPrestige({
    profile: nextProfile,
    jobs,
    playerJobs: nextJobs,
    businesses,
  });

  saveLocalGameState({
    profile: finalProfile,
    playerJobs: nextJobs,
  });

  return { success: true, lockedUntil: Date.now() + 120000 };
}

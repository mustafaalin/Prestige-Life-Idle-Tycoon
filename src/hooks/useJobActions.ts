import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { getJobUnlockRequirementSeconds } from '../data/local/jobs';
import type { GameState } from '../types/game';
import * as jobService from '../services/jobService';

interface UseJobActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
  loadGameData: (shouldCalculateOfflineEarnings?: boolean) => Promise<void>;
}

export function useJobActions({
  gameState,
  setGameState,
  gameStateRef,
  saveToLocalStorage,
  loadGameData,
}: UseJobActionsParams) {
  const unlockJob = useCallback(async (jobId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      await jobService.unlockJob(activeId, jobId);
      await loadGameData(false);
      return true;
    } catch {
      return false;
    }
  }, [gameState.profile?.id, loadGameData]);

  const selectJob = useCallback(async (jobId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    if (gameState.jobChangeLockedUntil && Date.now() < gameState.jobChangeLockedUntil) return false;

    const currentActiveJob = gameState.playerJobs.find((pj) => pj.is_active);
    const unsaved = gameState.unsavedJobWorkSeconds;

    try {
      const result = await jobService.selectJob(activeId, jobId, currentActiveJob, unsaved);
      gameStateRef.current = {
        ...gameStateRef.current,
        jobChangeLockedUntil: result.lockedUntil,
        unsavedJobWorkSeconds: 0,
      };
      setGameState((prev) => ({
        ...prev,
        jobChangeLockedUntil: result.lockedUntil,
        unsavedJobWorkSeconds: 0,
      }));
      saveToLocalStorage({ jobChangeLockedUntil: result.lockedUntil });
      await loadGameData(false);
      return true;
    } catch {
      return false;
    }
  }, [
    gameState.profile?.id,
    gameState.playerJobs,
    gameState.jobChangeLockedUntil,
    gameState.unsavedJobWorkSeconds,
    gameStateRef,
    loadGameData,
    saveToLocalStorage,
    setGameState,
  ]);

  const skipJobCooldown = useCallback(async () => {
    if (!gameState.profile?.id) return false;

    const activePlayerJob = gameState.playerJobs.find((job) => job.is_active);
    if (!activePlayerJob) return false;

    const activeJob = gameState.jobs.find((job) => job.id === activePlayerJob.job_id);
    if (!activeJob) return false;

    const requiredSeconds = getJobUnlockRequirementSeconds(activeJob);
    const currentWorkedSeconds =
      Number(activePlayerJob.total_time_worked_seconds || 0) +
      Number(gameState.unsavedJobWorkSeconds || 0);
    const missingSeconds = Math.max(0, requiredSeconds - currentWorkedSeconds);
    const syncTimestamp = new Date().toISOString();
    const nextPlayerJobs = gameState.playerJobs.map((job) =>
      job.id === activePlayerJob.id
        ? {
            ...job,
            total_time_worked_seconds: (job.total_time_worked_seconds || 0) + missingSeconds,
            last_work_started_at: syncTimestamp,
          }
        : job
    );

    gameStateRef.current = {
      ...gameStateRef.current,
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
      unsavedJobWorkSeconds: 0,
    };

    setGameState((prev) => ({
      ...prev,
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
      unsavedJobWorkSeconds: 0,
    }));

    saveToLocalStorage({
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
    });

    return true;
  }, [
    gameState.profile?.id,
    gameState.playerJobs,
    gameState.jobs,
    gameState.unsavedJobWorkSeconds,
    gameStateRef,
    saveToLocalStorage,
    setGameState,
  ]);

  return {
    unlockJob,
    selectJob,
    skipJobCooldown,
  };
}

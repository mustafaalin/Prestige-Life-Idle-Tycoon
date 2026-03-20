import { useEffect, useRef, useCallback } from 'react';
import type { Job, PlayerJob } from '../types/game';

interface UseJobTrackingOptions {
  userId: string | null;
  jobs: Job[];
  playerJobs: PlayerJob[];
  isTabVisible: React.MutableRefObject<boolean>;
  onJobWorkTimeSync?: (jobId: string, secondsToAdd: number) => void;
  onJobWorkSecondsUpdate: (seconds: number) => void;
}

const AUTO_SAVE_INTERVAL_MS = 30000;

export function useJobTracking({
  userId,
  jobs,
  playerJobs,
  isTabVisible,
  onJobWorkTimeSync,
  onJobWorkSecondsUpdate,
}: UseJobTrackingOptions) {
  const jobWorkTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const jobWorkTimeAutoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const unsavedJobWorkSecondsRef = useRef<number>(0);
  const activeJobIdRef = useRef<string | null>(null);
  const workSessionStartedAtRef = useRef<number | null>(null);

  const activePlayerJob = playerJobs.find(pj => pj.is_active);
  const activeJob = activePlayerJob
    ? jobs.find(j => j.id === activePlayerJob.job_id)
    : undefined;

  useEffect(() => {
    if (activePlayerJob) {
      if (activeJobIdRef.current !== activePlayerJob.job_id) {
        const parsedStartedAt = activePlayerJob.last_work_started_at
          ? new Date(activePlayerJob.last_work_started_at).getTime()
          : Date.now();
        const safeStartedAt = Number.isFinite(parsedStartedAt) ? parsedStartedAt : Date.now();
        const elapsedSinceStart = Math.max(0, Math.floor((Date.now() - safeStartedAt) / 1000));

        workSessionStartedAtRef.current = safeStartedAt;
        unsavedJobWorkSecondsRef.current = elapsedSinceStart;
        onJobWorkSecondsUpdate(elapsedSinceStart);
      }
      activeJobIdRef.current = activePlayerJob.job_id;
    } else {
      unsavedJobWorkSecondsRef.current = 0;
      workSessionStartedAtRef.current = null;
      onJobWorkSecondsUpdate(0);
      activeJobIdRef.current = null;
    }
  }, [activePlayerJob, onJobWorkSecondsUpdate]);

  const saveJobWorkTime = useCallback(async () => {
    const currentJobId = activeJobIdRef.current;
    const secondsToSave = unsavedJobWorkSecondsRef.current;

    if (!userId || !currentJobId || secondsToSave === 0) return;

    if (onJobWorkTimeSync) {
      onJobWorkTimeSync(currentJobId, secondsToSave);
    }

    workSessionStartedAtRef.current = Date.now();
    unsavedJobWorkSecondsRef.current = 0;
    onJobWorkSecondsUpdate(0);
  }, [userId, onJobWorkTimeSync, onJobWorkSecondsUpdate]);

  const startJobTracking = useCallback(() => {
    if (jobWorkTimeIntervalRef.current) clearInterval(jobWorkTimeIntervalRef.current);
    if (jobWorkTimeAutoSaveIntervalRef.current) clearInterval(jobWorkTimeAutoSaveIntervalRef.current);

    jobWorkTimeIntervalRef.current = setInterval(() => {
      if (!activeJobIdRef.current || !isTabVisible.current || document.hidden) return;

      if (!workSessionStartedAtRef.current) {
        workSessionStartedAtRef.current = Date.now();
      }

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - workSessionStartedAtRef.current) / 1000)
      );

      if (elapsedSeconds === unsavedJobWorkSecondsRef.current) return;

      unsavedJobWorkSecondsRef.current = elapsedSeconds;
      onJobWorkSecondsUpdate(elapsedSeconds);
    }, 1000);

    jobWorkTimeAutoSaveIntervalRef.current = setInterval(() => {
      saveJobWorkTime();
    }, AUTO_SAVE_INTERVAL_MS);
    
  }, [isTabVisible, saveJobWorkTime, onJobWorkSecondsUpdate]);

  const stopJobTracking = useCallback(() => {
    if (jobWorkTimeIntervalRef.current) {
      clearInterval(jobWorkTimeIntervalRef.current);
      jobWorkTimeIntervalRef.current = null;
    }
    if (jobWorkTimeAutoSaveIntervalRef.current) {
      clearInterval(jobWorkTimeAutoSaveIntervalRef.current);
      jobWorkTimeAutoSaveIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (activePlayerJob && isTabVisible.current) {
      startJobTracking();
    } else {
      stopJobTracking();
    }

    return () => stopJobTracking();
  }, [activePlayerJob?.job_id, isTabVisible, startJobTracking, stopJobTracking]);

  useEffect(() => {
    return () => {
      if (unsavedJobWorkSecondsRef.current > 0) {
        saveJobWorkTime();
      }
    };
  }, [saveJobWorkTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveJobWorkTime();
        return;
      }

      if (!activeJobIdRef.current) return;

      workSessionStartedAtRef.current = Date.now();
      unsavedJobWorkSecondsRef.current = 0;
      onJobWorkSecondsUpdate(0);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onJobWorkSecondsUpdate, saveJobWorkTime]);

  return {
    activeJob,
    activePlayerJob,
    saveJobWorkTime,
    startJobTracking,
    stopJobTracking,
  };
}

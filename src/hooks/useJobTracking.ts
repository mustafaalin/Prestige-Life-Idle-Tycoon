import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Job, PlayerJob } from '../types/game';

interface UseJobTrackingOptions {
  userId: string | null;
  jobs: Job[];
  playerJobs: PlayerJob[];
  isTabVisible: boolean;
  onJobComplete: (jobId: string, salary: number) => void;
  onWorkTimeUpdate: (seconds: number) => void;
}

export function useJobTracking({
  userId,
  jobs,
  playerJobs,
  isTabVisible,
  onJobComplete,
  onWorkTimeUpdate,
}: UseJobTrackingOptions) {
  const jobWorkTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const jobWorkTimeAutoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unsavedJobWorkSecondsRef = useRef<number>(0);

  const activePlayerJob = playerJobs.find(pj => pj.is_active && !pj.is_completed);
  const activeJob = activePlayerJob
    ? jobs.find(j => j.id === activePlayerJob.job_id)
    : undefined;

  const saveJobWorkTime = useCallback(async () => {
    if (!userId || !activePlayerJob || unsavedJobWorkSecondsRef.current === 0) return;

    const secondsToSave = unsavedJobWorkSecondsRef.current;
    const newTotalSeconds = (activePlayerJob.total_time_worked_seconds || 0) + secondsToSave;

    try {
      await supabase
        .from('player_jobs')
        .update({ total_time_worked_seconds: newTotalSeconds })
        .eq('player_id', userId)
        .eq('job_id', activePlayerJob.job_id);

      unsavedJobWorkSecondsRef.current = 0;
      onWorkTimeUpdate(0);
    } catch (error) {
      console.error('Error saving job work time:', error);
    }
  }, [userId, activePlayerJob, onWorkTimeUpdate]);

  const checkJobCompletion = useCallback(async () => {
    if (!activePlayerJob || !activeJob || !userId) return;

    const totalWorkedSeconds = (activePlayerJob.total_time_worked_seconds || 0) + unsavedJobWorkSecondsRef.current;

    if (totalWorkedSeconds >= activeJob.work_duration_seconds) {
      await supabase
        .from('player_jobs')
        .update({
          is_active: false,
          is_completed: true,
        })
        .eq('player_id', userId)
        .eq('job_id', activeJob.id);

      unsavedJobWorkSecondsRef.current = 0;
      onWorkTimeUpdate(0);

      onJobComplete(activeJob.id, activeJob.salary);
    }
  }, [activePlayerJob, activeJob, userId, onJobComplete, onWorkTimeUpdate]);

  const startJobTracking = useCallback(() => {
    if (jobWorkTimeIntervalRef.current) {
      clearInterval(jobWorkTimeIntervalRef.current);
    }
    if (jobWorkTimeAutoSaveIntervalRef.current) {
      clearInterval(jobWorkTimeAutoSaveIntervalRef.current);
    }

    jobWorkTimeIntervalRef.current = setInterval(() => {
      if (!activePlayerJob || !isTabVisible) return;

      unsavedJobWorkSecondsRef.current += 1;
      onWorkTimeUpdate(unsavedJobWorkSecondsRef.current);

      checkJobCompletion();
    }, 1000);

    jobWorkTimeAutoSaveIntervalRef.current = setInterval(() => {
      saveJobWorkTime();
    }, 5000);
  }, [activePlayerJob, isTabVisible, checkJobCompletion, saveJobWorkTime, onWorkTimeUpdate]);

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
    if (activePlayerJob && isTabVisible && !activePlayerJob.is_completed) {
      startJobTracking();
    } else {
      stopJobTracking();
    }

    return () => {
      stopJobTracking();
    };
  }, [activePlayerJob, isTabVisible, startJobTracking, stopJobTracking]);

  useEffect(() => {
    return () => {
      if (unsavedJobWorkSecondsRef.current > 0) {
        saveJobWorkTime();
      }
    };
  }, [saveJobWorkTime]);

  return {
    activeJob,
    activePlayerJob,
    unsavedJobWorkSeconds: unsavedJobWorkSecondsRef.current,
    saveJobWorkTime,
    startJobTracking,
    stopJobTracking,
  };
}

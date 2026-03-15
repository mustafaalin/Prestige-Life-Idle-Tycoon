import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
  const totalTimeWorkedRef = useRef<number>(0);

  const activePlayerJob = playerJobs.find(pj => pj.is_active);
  const activeJob = activePlayerJob
    ? jobs.find(j => j.id === activePlayerJob.job_id)
    : undefined;

  useEffect(() => {
    if (activePlayerJob) {
      activeJobIdRef.current = activePlayerJob.job_id;
      totalTimeWorkedRef.current = activePlayerJob.total_time_worked_seconds || 0;
    } else {
      activeJobIdRef.current = null;
    }
  }, [activePlayerJob]);

  const saveJobWorkTime = useCallback(async () => {
    const currentJobId = activeJobIdRef.current;
    const secondsToSave = unsavedJobWorkSecondsRef.current;

    if (!userId || !currentJobId || secondsToSave === 0) return;

    const newTotalSeconds = totalTimeWorkedRef.current + secondsToSave;

    try {
      const { error } = await supabase
        .from('player_jobs')
        .update({ total_time_worked_seconds: newTotalSeconds })
        .eq('player_id', userId)
        .eq('job_id', currentJobId);

      if (error) throw error;

      if (onJobWorkTimeSync) {
         onJobWorkTimeSync(currentJobId, secondsToSave);
      }
      
      unsavedJobWorkSecondsRef.current = 0;
      onJobWorkSecondsUpdate(0);
      
    } catch (error) {
      console.error('Error saving job work time:', error);
    }
  }, [userId, onJobWorkTimeSync, onJobWorkSecondsUpdate]);

  const startJobTracking = useCallback(() => {
    if (jobWorkTimeIntervalRef.current) clearInterval(jobWorkTimeIntervalRef.current);
    if (jobWorkTimeAutoSaveIntervalRef.current) clearInterval(jobWorkTimeAutoSaveIntervalRef.current);

    jobWorkTimeIntervalRef.current = setInterval(() => {
      if (!activeJobIdRef.current || !isTabVisible.current || document.hidden) return;

      unsavedJobWorkSecondsRef.current += 1;
      onJobWorkSecondsUpdate(unsavedJobWorkSecondsRef.current);
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

  return {
    activeJob,
    activePlayerJob,
    saveJobWorkTime,
    startJobTracking,
    stopJobTracking,
  };
}

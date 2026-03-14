import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Job, PlayerJob } from '../types/game';

interface UseJobTrackingOptions {
  userId: string | null;
  jobs: Job[];
  playerJobs: PlayerJob[];
  isTabVisible: React.MutableRefObject<boolean>;
  // Yeni eklenen sync callback'i: Saniyeleri sıfırlarken toplam süreyi de artırır
  onJobWorkTimeSync: (jobId: string, secondsToAdd: number) => void;
  onJobWorkSecondsUpdate: (seconds: number) => void;
}

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

  // Aktif işi bul
  const activePlayerJob = playerJobs.find(pj => pj.is_active);
  const activeJob = activePlayerJob
    ? jobs.find(j => j.id === activePlayerJob.job_id)
    : undefined;

  const saveJobWorkTime = useCallback(async () => {
    // Kaydedilecek veri yoksa veya kullanıcı yoksa çık
    if (!userId || !activePlayerJob || unsavedJobWorkSecondsRef.current === 0) return;

    const secondsToSave = unsavedJobWorkSecondsRef.current;
    const currentJobId = activePlayerJob.job_id;
    const newTotalSeconds = (activePlayerJob.total_time_worked_seconds || 0) + secondsToSave;

    try {
      // 1. Veritabanını güncelle (Sadece süre kaydı - Performans için RPC değil direkt update)
      const { error } = await supabase
        .from('player_jobs')
        .update({ total_time_worked_seconds: newTotalSeconds })
        .eq('player_id', userId)
        .eq('job_id', currentJobId);

      if (error) throw error;

      onJobWorkTimeSync(currentJobId, secondsToSave);
      
      unsavedJobWorkSecondsRef.current = 0;
      onJobWorkSecondsUpdate(0);
      
    } catch (error) {
      console.error('Error saving job work time:', error);
      // Hata durumunda saniyeleri sıfırlamıyoruz, bir sonraki denemede tekrar deneyecek.
    }
  }, [userId, activePlayerJob, onJobWorkTimeSync, onJobWorkSecondsUpdate]);

  const startJobTracking = useCallback(() => {
    // Mevcut zamanlayıcıları temizle
    if (jobWorkTimeIntervalRef.current) clearInterval(jobWorkTimeIntervalRef.current);
    if (jobWorkTimeAutoSaveIntervalRef.current) clearInterval(jobWorkTimeAutoSaveIntervalRef.current);

    // 1 saniyelik UI sayacı
    jobWorkTimeIntervalRef.current = setInterval(() => {
      // Sekme görünür değilse veya aktif iş yoksa sayma
      if (!activePlayerJob || !isTabVisible.current || document.hidden) return;

      unsavedJobWorkSecondsRef.current += 1;
      onJobWorkSecondsUpdate(unsavedJobWorkSecondsRef.current);
    }, 1000);

    // 5 saniyelik veritabanı oto-kayıt döngüsü
    jobWorkTimeAutoSaveIntervalRef.current = setInterval(() => {
      saveJobWorkTime();
    }, 5000);
  }, [activePlayerJob, isTabVisible, saveJobWorkTime, onJobWorkSecondsUpdate]);

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
    saveJobWorkTime,
    startJobTracking,
    stopJobTracking,
  };
}
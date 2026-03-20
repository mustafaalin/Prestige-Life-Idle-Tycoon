import { useEffect, useRef, useCallback } from 'react';
import type { PlayerProfile } from '../types/game';

interface UseAutoSaveOptions {
  profile: PlayerProfile | null;
  userId: string | null;
  pendingMoneyDelta: number;
  moneyMutationInFlight: boolean;
  onSaveComplete: () => void;
  onMutationStart: () => void;
  onMutationEnd: () => void;
}

export function useAutoSave({
  profile,
  userId,
  pendingMoneyDelta,
  moneyMutationInFlight,
  onSaveComplete,
  onMutationStart,
  onMutationEnd,
}: UseAutoSaveOptions) {
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushPendingIfNeeded = useCallback(async () => {
    if (pendingMoneyDelta === 0) return;
    if (!profile || !userId || moneyMutationInFlight) return;

    onMutationStart();
    try {
      onSaveComplete();
    } finally {
      onMutationEnd();
    }
  }, [pendingMoneyDelta, profile, userId, moneyMutationInFlight, onSaveComplete, onMutationStart, onMutationEnd]);

  const startAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      flushPendingIfNeeded();
    }, 3000);
  }, [flushPendingIfNeeded]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (profile && userId) {
      startAutoSave();
    } else {
      stopAutoSave();
    }

    return () => {
      stopAutoSave();
    };
  }, [profile, userId, startAutoSave, stopAutoSave]);

  return {
    flushPendingIfNeeded,
    startAutoSave,
    stopAutoSave,
  };
}

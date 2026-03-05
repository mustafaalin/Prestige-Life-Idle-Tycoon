import { useEffect, useRef, useCallback } from 'react';
import type { PlayerProfile } from '../types/game';

interface UsePassiveIncomeOptions {
  profile: PlayerProfile | null;
  incomePerSecond: number;
  isTabVisible: boolean;
  onMoneyUpdate: (moneyDelta: number, lifetimeDelta: number) => void;
}

export function usePassiveIncome({
  profile,
  incomePerSecond,
  isTabVisible,
  onMoneyUpdate,
}: UsePassiveIncomeOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const moneyRemainderRef = useRef<number>(0);

  const startPassiveIncome = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!profile || !isTabVisible) return;

      const raw = incomePerSecond + moneyRemainderRef.current;

      const moneyDeltaInt = raw >= 0 ? Math.floor(raw) : Math.ceil(raw);

      moneyRemainderRef.current = raw - moneyDeltaInt;

      if (moneyDeltaInt === 0) return;

      onMoneyUpdate(moneyDeltaInt, moneyDeltaInt);
    }, 1000);
  }, [profile, incomePerSecond, isTabVisible, onMoneyUpdate]);

  const stopPassiveIncome = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (profile && isTabVisible && incomePerSecond > 0) {
      startPassiveIncome();
    } else {
      stopPassiveIncome();
    }

    return () => {
      stopPassiveIncome();
    };
  }, [profile, incomePerSecond, isTabVisible, startPassiveIncome, stopPassiveIncome]);

  return {
    startPassiveIncome,
    stopPassiveIncome,
  };
}

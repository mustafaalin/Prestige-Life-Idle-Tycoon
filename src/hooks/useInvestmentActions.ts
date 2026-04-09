import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { GameState, InvestmentUpgradeKey } from '../types/game';
import * as investmentService from '../services/investmentService';

interface UseInvestmentActionsParams {
  gameState: GameState;
  moneyMutationInFlightRef: MutableRefObject<boolean>;
  flushPendingIfNeeded: () => Promise<void>;
  loadGameData: (shouldCalculateOfflineEarnings?: boolean) => Promise<void>;
}

export function useInvestmentActions({
  gameState,
  moneyMutationInFlightRef,
  flushPendingIfNeeded,
  loadGameData,
}: UseInvestmentActionsParams) {
  const purchaseInvestment = useCallback(async (investmentId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await investmentService.purchaseInvestment(activeId, investmentId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded, loadGameData]);

  const upgradeInvestment = useCallback(async (investmentId: string, upgradeKey: InvestmentUpgradeKey) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await investmentService.upgradeInvestment(activeId, investmentId, upgradeKey);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded, loadGameData]);

  return {
    purchaseInvestment,
    upgradeInvestment,
  };
}

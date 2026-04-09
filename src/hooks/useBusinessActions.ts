import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { GameState } from '../types/game';
import * as businessService from '../services/businessService';
import type { BusinessMutationResult } from '../services/businessService';

interface UseBusinessActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
  moneyMutationInFlightRef: MutableRefObject<boolean>;
  flushPendingIfNeeded: () => Promise<void>;
}

export function useBusinessActions({
  gameState,
  setGameState,
  gameStateRef,
  saveToLocalStorage,
  moneyMutationInFlightRef,
  flushPendingIfNeeded,
}: UseBusinessActionsParams) {
  const applyBusinessMutation = useCallback((result: BusinessMutationResult) => {
    gameStateRef.current = {
      ...gameStateRef.current,
      profile: result.profile,
      businesses: result.businesses,
      businessesPrestige: result.businessesPrestige,
      businessesLoading: false,
      pendingMoneyDelta: 0,
    };

    setGameState((prev) => ({
      ...prev,
      profile: result.profile,
      businesses: result.businesses,
      businessesPrestige: result.businessesPrestige,
      businessesLoading: false,
      pendingMoneyDelta: 0,
    }));

    saveToLocalStorage({
      profile: result.profile,
      businesses: result.businesses,
      businessesPrestige: result.businessesPrestige,
      pendingMoneyDelta: 0,
    });
  }, [gameStateRef, saveToLocalStorage, setGameState]);

  const purchaseBusiness = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.purchaseBusiness(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded]);

  const upgradeBusiness = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.upgradeBusiness(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded]);

  const upgradeBusinessWithAdDiscount = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.upgradeBusinessWithAdDiscount(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded]);

  return {
    purchaseBusiness,
    upgradeBusiness,
    upgradeBusinessWithAdDiscount,
  };
}

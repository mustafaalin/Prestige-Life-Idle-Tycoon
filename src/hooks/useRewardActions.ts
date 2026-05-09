import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { GameState } from '../types/game';
import * as rewardService from '../services/rewardService';

interface UseRewardActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
  loadGameData: (shouldCalculateOfflineEarnings?: boolean) => Promise<void>;
}

export function useRewardActions({
  gameState,
  setGameState,
  gameStateRef,
  saveToLocalStorage,
  loadGameData,
}: UseRewardActionsParams) {
  const claimDailyReward = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      await rewardService.claimDailyReward(activeId);
      await loadGameData();
      return true;
    } catch {
      return false;
    }
  }, [gameState.profile?.id, loadGameData]);

  const rescueDailyRewardStreak = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return { success: false, cooldown: 0 };

    try {
      const result = await rewardService.rescueDailyRewardStreak(activeId);
      await loadGameData();
      return result;
    } catch {
      return { success: false, cooldown: 0 };
    }
  }, [gameState.profile?.id, loadGameData]);

  const claimAccumulatedMoney = useCallback(async (isTriple: boolean) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return { success: false, claimedAmount: 0 };

    try {
      const result = await rewardService.claimAccumulatedMoney(activeId, isTriple);
      setGameState((prev) => {
        const nextQuestProgress = {
          ...prev.questProgress,
          accumulatedMoneyClaimCount: prev.questProgress.accumulatedMoneyClaimCount + 1,
        };

        saveToLocalStorage({ questProgress: nextQuestProgress });

        return {
          ...prev,
          questProgress: nextQuestProgress,
        };
      });
      await loadGameData(false);

      return {
        success: true,
        claimedAmount: Number(result.claimed_amount || 0),
      };
    } catch {
      return { success: false, claimedAmount: 0 };
    }
  }, [gameState.profile?.id, loadGameData, saveToLocalStorage, setGameState]);

  const claimOfflineEarnings = useCallback(async (multiplier = 1) => {
    const pendingOfflineEarnings = gameStateRef.current.offlineEarnings;
    const currentProfile = gameStateRef.current.profile;

    if (!currentProfile || !pendingOfflineEarnings || pendingOfflineEarnings.amount <= 0) {
      return false;
    }

    const normalizedMultiplier = multiplier > 1 ? 2 : 1;
    const claimedAmount = pendingOfflineEarnings.amount * normalizedMultiplier;

    const updatedProfile = {
      ...currentProfile,
      total_money: Number(currentProfile.total_money || 0) + claimedAmount,
      lifetime_earnings: Number(currentProfile.lifetime_earnings || 0) + claimedAmount,
      last_played_at: new Date().toISOString(),
    };

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
      offlineEarnings: null,
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      offlineEarnings: null,
    }));

    saveToLocalStorage({ profile: updatedProfile });
    return true;
  }, [gameStateRef, saveToLocalStorage, setGameState]);

  const dismissOfflineEarnings = useCallback(() => {
    gameStateRef.current = {
      ...gameStateRef.current,
      offlineEarnings: null,
    };
    setGameState((prev) => ({ ...prev, offlineEarnings: null }));
  }, [gameStateRef, setGameState]);

  const BOOST_DURATION_MS = 60 * 60 * 1000; // 1 saat

  const activateBoost = useCallback((type: 'business' | 'investment' | 'total') => {
    const currentProfile = gameStateRef.current.profile;
    if (!currentProfile) return false;

    const field =
      type === 'business' ? 'business_boost_expires_at' :
      type === 'investment' ? 'investment_boost_expires_at' :
      'income_boost_expires_at';
    const expiresAt = new Date(Date.now() + BOOST_DURATION_MS).toISOString();

    const updatedProfile = { ...currentProfile, [field]: expiresAt };

    gameStateRef.current = { ...gameStateRef.current, profile: updatedProfile };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });
    return true;
  }, [gameStateRef, saveToLocalStorage, setGameState]);

  const watchAd = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return { success: false, reward: 0, cooldown: 0 };

    try {
      const result = await rewardService.watchAd(activeId);
      await loadGameData(false);
      return result;
    } catch {
      return { success: false, reward: 0, cooldown: 0 };
    }
  }, [gameState.profile?.id, loadGameData]);

  return {
    claimDailyReward,
    rescueDailyRewardStreak,
    claimAccumulatedMoney,
    claimOfflineEarnings,
    dismissOfflineEarnings,
    watchAd,
    activateBoost,
  };
}

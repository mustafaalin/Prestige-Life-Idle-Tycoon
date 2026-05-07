import { useState, useEffect, useCallback, useRef } from 'react';
import {
  calculatePrestigeFromQuestProgress,
  createInitialQuestProgress,
  getQuestChapterByIndex,
} from '../data/local/quests';
import {
  DEFAULT_HAPPINESS,
  DEFAULT_HEALTH,
  normalizeProfileWellbeing,
} from '../data/local/healthActions';
import { calculateWellbeingDeltaFromSources } from '../data/local/wellbeing';
import type {
  GameState,
  PlayerProfile,
} from '../types/game';
import { calculateOfflineEarnings, calculateOfflineWellbeingDecay } from '../utils/game/calculations';
import { getCurrentQuestFromProgress, syncQuestPrestige } from '../utils/game/gameStateHelpers';
import { usePassiveIncome } from './usePassiveIncome';
import { useAutoSave } from './useAutoSave';
import { useJobTracking } from './useJobTracking';
import { useGameLoader } from './useGameLoader';
import { useBusinessActions } from './useBusinessActions';
import { useJobActions } from './useJobActions';
import { useBankActions } from './useBankActions';
import { useQuestDetection } from './useQuestDetection';
import { useQuestActions } from './useQuestActions';
import { useRewardActions } from './useRewardActions';
import { useStuffActions } from './useStuffActions';
import { useWellbeingActions } from './useWellbeingActions';
import { useInvestmentActions } from './useInvestmentActions';
import * as profileService from '../services/profileService';

export function useGameState(deviceId: string, userId: string | null) {
  const [gameState, setGameState] = useState<GameState>({
    profile: null,
    characters: [],
    houses: [],
    cars: [],
    jobs: [],
    playerJobs: [],
    businesses: [],
    investments: [],
    businessesPrestige: 0,
    gameStats: null,
    ownedCharacters: [],
    ownedHouses: [],
    ownedCars: [],
    playerOutfits: [],
    selectedOutfit: null,
    questProgress: createInitialQuestProgress(),
    loading: true,
    error: null,
    offlineEarnings: null,
    jobChangeLockedUntil: null,
    claimLockedUntil: null,
    dailyClaimedTotal: 0,
    businessesLoading: true,
    unsavedJobWorkSeconds: 0,
    pendingMoneyDelta: 0,
    bankDeposits: [],
  });

  const isTabVisible = useRef<boolean>(true);
  const hiddenAtRef = useRef<string | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const moneyMutationInFlightRef = useRef<boolean>(false);
  const isCreatingProfileRef = useRef<boolean>(false);
  const questRewardInFlightRef = useRef<boolean>(false);
  const premiumBankCardMutationInFlightRef = useRef<boolean>(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const { saveToLocalStorage, loadGameData, bootstrapLocalState } = useGameLoader({
    deviceId,
    userId,
    setGameState,
    gameStateRef,
  });

  useEffect(() => {
    if (!gameState.profile) return;

    const expectedPrestige = calculatePrestigeFromQuestProgress(gameState.questProgress);
    const currentPrestige = Number(gameState.profile.prestige_points || 0);
    const currentBonusPrestige = Number(
      (gameState.profile as PlayerProfile).bonus_prestige_points || 0
    );

    if (currentPrestige === expectedPrestige && currentBonusPrestige === expectedPrestige) {
      return;
    }

    const syncedProfile = syncQuestPrestige(gameState.profile as PlayerProfile, gameState.questProgress);
    setGameState((prev) => ({
      ...prev,
      profile: syncedProfile,
    }));
    saveToLocalStorage({ profile: syncedProfile });
  }, [gameState.profile, gameState.questProgress, saveToLocalStorage]);

  const incomePerSecond = gameState.profile ? Number(gameState.profile.hourly_income || 0) / 3600 : 0;

  const handleMoneyUpdate = useCallback((moneyToAdd: number) => {
    setGameState((prev) => {
      if (!prev.profile) return prev;
      const updatedProfile = {
        ...prev.profile,
        total_money: prev.profile.total_money + moneyToAdd,
        lifetime_earnings: prev.profile.hourly_income && prev.profile.hourly_income > 0 
           ? prev.profile.lifetime_earnings + moneyToAdd 
           : prev.profile.lifetime_earnings
      };
      saveToLocalStorage({ profile: updatedProfile });
      return {
        ...prev,
        profile: updatedProfile,
        pendingMoneyDelta: prev.pendingMoneyDelta + moneyToAdd,
      };
    });
  }, [saveToLocalStorage]);

  const handleJobWorkSecondsUpdate = useCallback((seconds: number) => {
    setGameState((prev) => ({ ...prev, unsavedJobWorkSeconds: seconds }));
  }, []);

  const handleJobWorkTimeSync = useCallback((jobId: string, secondsToAdd: number) => {
    if (secondsToAdd <= 0) return;

    setGameState((prev) => {
      const syncTimestamp = new Date().toISOString();
      const activeJob = prev.jobs.find((job) => job.id === jobId);
      const selectedCar = prev.cars.find((car) => car.id === prev.profile?.selected_car_id) ?? null;
      const selectedHouse = prev.houses.find((house) => house.id === prev.profile?.selected_house_id) ?? null;
      // Yeni kaynak eklemek için sources array'ine eklemek yeterli (OCP)
      const wellbeingDelta = calculateWellbeingDeltaFromSources(
        [activeJob, selectedCar, selectedHouse],
        secondsToAdd
      );
      const nextPlayerJobs = prev.playerJobs.map((job) =>
        job.job_id === jobId && job.is_active
          ? {
              ...job,
              total_time_worked_seconds: (job.total_time_worked_seconds || 0) + secondsToAdd,
              last_work_started_at: syncTimestamp,
          }
          : job
      );
      const nextProfile = prev.profile
        ? normalizeProfileWellbeing({
            ...prev.profile,
            health: Number(prev.profile.health ?? DEFAULT_HEALTH) + Number(wellbeingDelta?.health || 0),
            happiness: Number(prev.profile.happiness ?? DEFAULT_HAPPINESS) + Number(wellbeingDelta?.happiness || 0),
          })
        : prev.profile;

      saveToLocalStorage({ playerJobs: nextPlayerJobs, profile: nextProfile || undefined });
      return {
        ...prev,
        profile: nextProfile,
        playerJobs: nextPlayerJobs,
      };
    });
  }, [saveToLocalStorage]);

  usePassiveIncome({
    profile: gameState.profile,
    incomePerSecond,
    isTabVisible: isTabVisible.current,
    onMoneyUpdate: handleMoneyUpdate,
  });

  useAutoSave({
  profile: gameState.profile,
  userId: gameState.profile?.id || userId,
  pendingMoneyDelta: gameState.pendingMoneyDelta,
  moneyMutationInFlight: moneyMutationInFlightRef.current,
  onSaveComplete: () => { setGameState((prev) => ({ ...prev, pendingMoneyDelta: 0 })); },
  onMutationStart: () => { moneyMutationInFlightRef.current = true; },
  onMutationEnd: () => { moneyMutationInFlightRef.current = false; },
});

  useJobTracking({
    userId: gameState.profile?.id || userId,
    jobs: gameState.jobs,
    playerJobs: gameState.playerJobs,
    isTabVisible,
    onJobWorkTimeSync: handleJobWorkTimeSync,
    onJobWorkSecondsUpdate: handleJobWorkSecondsUpdate,
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;

      const currentProfile = gameStateRef.current.profile;
      if (!currentProfile) return;

      if (document.hidden) {
        const hiddenAt = new Date().toISOString();
        hiddenAtRef.current = hiddenAt;

        const updatedProfile = {
          ...currentProfile,
          last_played_at: hiddenAt,
        };

        gameStateRef.current = {
          ...gameStateRef.current,
          profile: updatedProfile,
        };
        saveToLocalStorage({ profile: updatedProfile });
        return;
      }

      const lastPlayedAt = hiddenAtRef.current || currentProfile.last_played_at;
      const offlineReward = calculateOfflineEarnings({
        ...currentProfile,
        last_played_at: lastPlayedAt,
      });

      // Arka planda geçirilen süre için wellbeing decay
      const { jobs, playerJobs, cars, houses } = gameStateRef.current;
      const activePlayerJob = playerJobs.find((pj) => pj.is_active);
      const activeJob = activePlayerJob ? jobs.find((j) => j.id === activePlayerJob.job_id) ?? null : null;
      const selectedCar = cars.find((c) => c.id === currentProfile.selected_car_id) ?? null;
      const selectedHouse = houses.find((h) => h.id === currentProfile.selected_house_id) ?? null;
      const wellbeingDecay = calculateOfflineWellbeingDecay(
        [activeJob, selectedCar, selectedHouse],
        lastPlayedAt,
      );

      const resumedAt = new Date().toISOString();
      const updatedProfile = normalizeProfileWellbeing({
        ...currentProfile,
        health: Number(currentProfile.health ?? DEFAULT_HEALTH) + (wellbeingDecay?.health ?? 0),
        happiness: Number(currentProfile.happiness ?? DEFAULT_HAPPINESS) + (wellbeingDecay?.happiness ?? 0),
        last_played_at: resumedAt,
      });

      hiddenAtRef.current = null;
      setGameState((prev) => ({
        ...prev,
        profile: updatedProfile,
        offlineEarnings:
          offlineReward && offlineReward.amount > 0
            ? offlineReward
            : prev.offlineEarnings,
      }));
      gameStateRef.current = {
        ...gameStateRef.current,
        profile: updatedProfile,
        offlineEarnings:
          offlineReward && offlineReward.amount > 0
            ? offlineReward
            : gameStateRef.current.offlineEarnings,
      };
      saveToLocalStorage({ profile: updatedProfile });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveToLocalStorage]);

  const flushPendingIfNeeded = useCallback(async () => {
    setGameState((prev) => ({ ...prev, pendingMoneyDelta: 0 }));
  }, []);

  useQuestDetection({
    gameState,
    setGameState,
    questRewardInFlightRef,
    saveToLocalStorage,
  });
  const { claimQuestReward, claimQuestChapterReward } = useQuestActions({
    gameState,
    setGameState,
    saveToLocalStorage,
  });

  useEffect(() => {
    if (userId) {
      loadGameData(true);
    }
  }, [userId, loadGameData]);

  const saveProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    const activeId = gameStateRef.current.profile?.id;
    if (!activeId) return;
    try {
      await profileService.updateProfile(activeId, updates);
      const updatedProfile = { ...gameStateRef.current.profile!, ...updates };
      gameStateRef.current = {
        ...gameStateRef.current,
        profile: updatedProfile,
      };
      setGameState(prev => ({ ...prev, profile: updatedProfile }));
      saveToLocalStorage({ profile: updatedProfile });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [gameStateRef, saveToLocalStorage]);

  const {
    applyHealthAction,
    applyHealthAdBoost,
    applyHappinessAction,
    applyHappinessAdBoost,
  } = useWellbeingActions({
    gameState,
    setGameState,
    gameStateRef,
    saveToLocalStorage,
  });
  const {
    claimDailyReward,
    rescueDailyRewardStreak,
    claimAccumulatedMoney,
    claimOfflineEarnings,
    dismissOfflineEarnings,
    watchAd,
  } = useRewardActions({
    gameState,
    setGameState,
    gameStateRef,
    saveToLocalStorage,
    loadGameData,
  });
  const {
    startBankDeposit,
    claimBankDeposit,
    claimCashback,
    purchasePremiumBankCard,
  } = useBankActions({
    gameState,
    setGameState,
    gameStateRef,
    saveToLocalStorage,
    premiumBankCardMutationInFlightRef,
  });
  const { unlockJob, selectJob, skipJobCooldown } = useJobActions({
    gameState,
    setGameState,
    gameStateRef,
    saveToLocalStorage,
    loadGameData,
  });
  const {
    purchaseitem,
    selectCar,
    sellCar,
    selectHouse,
    selectCharacter,
  } = useStuffActions({
    gameState,
    moneyMutationInFlightRef,
    flushPendingIfNeeded,
    loadGameData,
    saveProfile,
  });
  const {
    purchaseBusiness,
    upgradeBusiness,
    upgradeBusinessWithAdDiscount,
  } = useBusinessActions({
    gameState,
    setGameState,
    gameStateRef,
    saveToLocalStorage,
    moneyMutationInFlightRef,
    flushPendingIfNeeded,
  });

  const createProfile = useCallback(async () => {
    if (!userId || !deviceId || isCreatingProfileRef.current) return;
    
    isCreatingProfileRef.current = true;
    try {
      const newProfile = await profileService.createProfile(userId, deviceId);
      if (newProfile) {
        await loadGameData(false);
      } else {
        bootstrapLocalState('missing_profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      bootstrapLocalState('load_error');
    } finally {
      isCreatingProfileRef.current = false;
    }
  }, [userId, deviceId, loadGameData, bootstrapLocalState]);

  const handleClick = useCallback(() => {
    if (!gameState.profile) return;

    const earnedMoney = gameState.profile.money_per_click;
    const newTotalMoney = gameState.profile.total_money + earnedMoney;
    const newLifetimeEarnings = gameState.profile.lifetime_earnings + earnedMoney;
    const newTotalClicks = gameState.profile.total_clicks + 1;

    const updatedProfile = {
      ...gameState.profile,
      total_money: newTotalMoney,
      lifetime_earnings: newLifetimeEarnings,
      total_clicks: newTotalClicks,
    };

    setGameState(prev => ({
      ...prev,
      profile: updatedProfile,
      pendingMoneyDelta: prev.pendingMoneyDelta + earnedMoney,
    }));

    saveToLocalStorage({ profile: updatedProfile });
    return earnedMoney;
  }, [gameState.profile, saveToLocalStorage]);

  const { purchaseInvestment, upgradeInvestment } = useInvestmentActions({
    gameState,
    moneyMutationInFlightRef,
    flushPendingIfNeeded,
    loadGameData,
  });

  const updatePlayerName = useCallback(async (newName: string) => {
    await saveProfile({ display_name: newName, username: newName });
  }, [saveProfile]);

  const resetProgress = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      const claimedCount = gameStateRef.current.questProgress.claimedQuestIds.length;
      gameStateRef.current = {
        ...gameStateRef.current,
        pendingMoneyDelta: 0,
        offlineEarnings: null,
        unsavedJobWorkSeconds: 0,
        bankDeposits: [],
        jobChangeLockedUntil: null,
      };
      setGameState((prev) => ({
        ...prev,
        pendingMoneyDelta: 0,
        offlineEarnings: null,
        unsavedJobWorkSeconds: 0,
        bankDeposits: [],
        jobChangeLockedUntil: null,
      }));
      await profileService.resetProgress(activeId, claimedCount);
      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  }, [gameState.profile?.id, loadGameData]);

  const reload = useCallback(() => { loadGameData(false); }, [loadGameData]);

  return {
    ...gameState,
    currentQuest: getCurrentQuestFromProgress(gameState.questProgress),
    currentQuestClaimable: Boolean(
      getCurrentQuestFromProgress(gameState.questProgress)?.id &&
      gameState.questProgress.claimableQuestIds.includes(getCurrentQuestFromProgress(gameState.questProgress)!.id)
    ),
    hasClaimableQuestRewards: gameState.questProgress.claimableQuestIds.length > 0,
    claimableChapterReward:
      gameState.questProgress.claimableChapterRewardId
        ? getQuestChapterByIndex(gameState.questProgress.unlockedChapterIndex)
        : null,
    claimQuestReward,
    claimQuestChapterReward,
    createProfile,
    saveProfile,
    handleClick,
    purchaseitem,
    sellCar,
    selectCharacter,
    selectHouse,
    selectCar,
    unlockJob,
    selectJob,
    skipJobCooldown,
    purchaseBusiness,
    upgradeBusiness,
    upgradeBusinessWithAdDiscount,
    purchaseInvestment,
    upgradeInvestment,
    claimDailyReward,
    rescueDailyRewardStreak,
    claimAccumulatedMoney,
    watchAd,
    applyHealthAction,
    applyHealthAdBoost,
    applyHappinessAction,
    applyHappinessAdBoost,
    startBankDeposit,
    claimBankDeposit,
    claimCashback,
    purchasePremiumBankCard,
    updatePlayerName,
    resetProgress,
    claimOfflineEarnings,
    dismissOfflineEarnings,
    reload,
  };
}

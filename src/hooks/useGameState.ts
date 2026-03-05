import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Database, BusinessWithPlayerData } from '../lib/database.types';
import { usePassiveIncome } from './usePassiveIncome';
import { useAutoSave } from './useAutoSave';
import { useJobTracking } from './useJobTracking';
import * as profileService from '../services/profileService';
import * as itemService from '../services/itemService';
import * as jobService from '../services/jobService';
import * as businessService from '../services/businessService';
import * as purchaseService from '../services/purchaseService';
import * as rewardService from '../services/rewardService';
import * as statsService from '../services/statsService';

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];
type House = Database['public']['Tables']['houses']['Row'];
type Car = Database['public']['Tables']['cars']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];
type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];
type GameStats = Database['public']['Tables']['game_stats']['Row'];
type CharacterOutfit = Database['public']['Tables']['character_outfits']['Row'];

interface GameState {
  profile: PlayerProfile | null;
  characters: Character[];
  houses: House[];
  cars: Car[];
  jobs: Job[];
  playerJobs: PlayerJob[];
  businesses: BusinessWithPlayerData[];
  businessesPrestige: number;
  gameStats: GameStats | null;
  ownedCharacters: string[];
  ownedHouses: string[];
  ownedCars: string[];
  selectedOutfit: CharacterOutfit | null;
  loading: boolean;
  error: string | null;
  offlineEarnings: {
    amount: number;
    minutes: number;
  } | null;
  jobChangeLockedUntil: number | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
  pendingMoneyDelta: number;
}

export function useGameState(deviceId: string, userId: string | null) {
  const [gameState, setGameState] = useState<GameState>({
    profile: null,
    characters: [],
    houses: [],
    cars: [],
    jobs: [],
    playerJobs: [],
    businesses: [],
    businessesPrestige: 0,
    gameStats: null,
    ownedCharacters: [],
    ownedHouses: [],
    ownedCars: [],
    selectedOutfit: null,
    loading: true,
    error: null,
    offlineEarnings: null,
    jobChangeLockedUntil: null,
    claimLockedUntil: null,
    dailyClaimedTotal: 0,
    businessesLoading: true,
    unsavedJobWorkSeconds: 0,
    pendingMoneyDelta: 0,
  });

  const isTabVisible = useRef<boolean>(true);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Calculate income per second
  const incomePerSecond = gameState.profile
    ? Number(gameState.profile.hourly_income || 0) / 3600
    : 0;

  // Handle money updates from passive income
  const handleMoneyUpdate = useCallback((moneyToAdd: number) => {
    setGameState((prev) => {
      if (!prev.profile) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          total_money: prev.profile.total_money + moneyToAdd,
        },
        pendingMoneyDelta: prev.pendingMoneyDelta + moneyToAdd,
      };
    });
  }, []);

  // Handle unsaved job work seconds update
  const handleJobWorkSecondsUpdate = useCallback((seconds: number) => {
    setGameState((prev) => ({
      ...prev,
      unsavedJobWorkSeconds: seconds,
    }));
  }, []);

  // Use passive income hook
  usePassiveIncome({
    profile: gameState.profile,
    incomePerSecond,
    isTabVisible,
    onMoneyUpdate: handleMoneyUpdate,
  });

  // Use auto-save hook
  useAutoSave({
    profile: gameState.profile,
    userId,
    pendingMoneyDelta: gameState.pendingMoneyDelta,
    onSaveComplete: () => {
      setGameState((prev) => ({ ...prev, pendingMoneyDelta: 0 }));
    },
  });

  // Use job tracking hook
  useJobTracking({
    userId,
    jobs: gameState.jobs,
    playerJobs: gameState.playerJobs,
    isTabVisible,
    onJobWorkSecondsUpdate: handleJobWorkSecondsUpdate,
  });

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load game data
  const loadGameData = useCallback(async () => {
    if (!userId) return;

    try {
      setGameState((prev) => ({ ...prev, loading: true, error: null }));

      const profile = await profileService.getProfile(userId);
      if (!profile) {
        setGameState((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Calculate offline earnings
      const lastPlayedAt = profile.last_played_at
        ? new Date(profile.last_played_at).getTime()
        : Date.now();
      const now = Date.now();
      const minutesOffline = Math.floor((now - lastPlayedAt) / 60000);
      const hourlyIncome = Number(profile.hourly_income || 0);
      const offlineAmount =
        minutesOffline > 0 ? Math.floor((hourlyIncome / 60) * minutesOffline) : 0;

      // Load all data in parallel
      const [
        characters,
        houses,
        cars,
        jobs,
        playerJobs,
        gameStats,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        selectedOutfit,
        claimStatus,
      ] = await Promise.all([
        itemService.getCharacters(),
        itemService.getHouses(),
        itemService.getCars(),
        jobService.getJobs(),
        jobService.getPlayerJobs(userId),
        statsService.getGameStats(userId),
        itemService.getOwnedCharacters(userId),
        itemService.getOwnedHouses(userId),
        itemService.getOwnedCars(userId),
        itemService.getSelectedOutfit(userId),
        rewardService.getClaimStatus(userId),
      ]);

      // Update last played time
      await profileService.updateProfile(userId, {
        last_played_at: new Date().toISOString(),
      });

      setGameState((prev) => ({
        ...prev,
        profile,
        characters,
        houses,
        cars,
        jobs,
        playerJobs,
        gameStats,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        selectedOutfit,
        offlineEarnings:
          minutesOffline > 5 && offlineAmount > 0
            ? { amount: offlineAmount, minutes: minutesOffline }
            : null,
        claimLockedUntil: claimStatus.claimLockedUntil,
        dailyClaimedTotal: claimStatus.dailyClaimedTotal,
        loading: false,
      }));

      // Load businesses separately
      loadBusinesses();
    } catch (error) {
      console.error('Error loading game data:', error);
      setGameState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load game data',
      }));
    }
  }, [userId]);

  // Load businesses
  const loadBusinesses = useCallback(async () => {
    if (!userId) return;

    try {
      setGameState((prev) => ({ ...prev, businessesLoading: true }));
      const result = await businessService.getBusinesses(userId);
      setGameState((prev) => ({
        ...prev,
        businesses: result.businesses,
        businessesPrestige: result.prestigePoints,
        businessesLoading: false,
      }));
    } catch (error) {
      console.error('Error loading businesses:', error);
      setGameState((prev) => ({ ...prev, businessesLoading: false }));
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadGameData();
    }
  }, [userId, loadGameData]);

  // Create profile
  const createProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const newProfile = await profileService.createProfile(userId, deviceId);
      if (newProfile) {
        await loadGameData();
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [userId, deviceId, loadGameData]);

  // Save profile updates
  const saveProfile = useCallback(
    async (updates: Partial<PlayerProfile>) => {
      if (!userId || !gameState.profile) return;

      try {
        await profileService.updateProfile(userId, updates);
        setGameState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, ...updates } : null,
        }));
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    },
    [userId, gameState.profile]
  );

  // Handle click
  const handleClick = useCallback(async () => {
    if (!userId || !gameState.profile) return;

    const clickValue = 1;
    const newTotalMoney = gameState.profile.total_money + clickValue;
    const newTotalClicks = gameState.profile.total_clicks + 1;

    setGameState((prev) => ({
      ...prev,
      profile: prev.profile
        ? {
            ...prev.profile,
            total_money: newTotalMoney,
            total_clicks: newTotalClicks,
          }
        : null,
      pendingMoneyDelta: prev.pendingMoneyDelta + clickValue,
    }));

    try {
      await profileService.updateProfile(userId, {
        total_clicks: newTotalClicks,
      });
    } catch (error) {
      console.error('Error updating clicks:', error);
    }
  }, [userId, gameState.profile]);

  // Purchase item
  const purchaseitem = useCallback(
    async (type: 'character' | 'house' | 'car', itemId: string, price: number) => {
      if (!userId) return;

      try {
        await purchaseService.purchaseItem(userId, type, itemId, price);
        await loadGameData();
      } catch (error) {
        console.error('Error purchasing item:', error);
        throw error;
      }
    },
    [userId, loadGameData]
  );

  // Select character
  const selectCharacter = useCallback(
    async (characterId: string) => {
      if (!userId) return;

      try {
        await itemService.selectCharacter(userId, characterId);
        setGameState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, selected_character_id: characterId }
            : null,
        }));
      } catch (error) {
        console.error('Error selecting character:', error);
      }
    },
    [userId]
  );

  // Select house
  const selectHouse = useCallback(
    async (houseId: string) => {
      if (!userId) return;

      try {
        await itemService.selectHouse(userId, houseId);
        setGameState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, selected_house_id: houseId } : null,
        }));
      } catch (error) {
        console.error('Error selecting house:', error);
      }
    },
    [userId]
  );

  // Select car
  const selectCar = useCallback(
    async (carId: string) => {
      if (!userId) return;

      try {
        await itemService.selectCar(userId, carId);
        setGameState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, selected_car_id: carId } : null,
        }));
      } catch (error) {
        console.error('Error selecting car:', error);
      }
    },
    [userId]
  );

  // Unlock job
  const unlockJob = useCallback(
    async (jobId: string, unlockCost: number) => {
      if (!userId) return;

      try {
        await jobService.unlockJob(userId, jobId, unlockCost);
        await loadGameData();
      } catch (error) {
        console.error('Error unlocking job:', error);
        throw error;
      }
    },
    [userId, loadGameData]
  );

  // Select job
  const selectJob = useCallback(
    async (jobId: string) => {
      if (!userId) return;

      try {
        const result = await jobService.selectJob(userId, jobId);
        setGameState((prev) => ({
          ...prev,
          jobChangeLockedUntil: result.lockedUntil,
          unsavedJobWorkSeconds: 0,
        }));
        await loadGameData();
      } catch (error) {
        console.error('Error selecting job:', error);
        throw error;
      }
    },
    [userId, loadGameData]
  );

  // Purchase business
  const purchaseBusiness = useCallback(
    async (businessId: string) => {
      if (!userId) return;

      try {
        await businessService.purchaseBusiness(userId, businessId);
        await Promise.all([loadGameData(), loadBusinesses()]);
      } catch (error) {
        console.error('Error purchasing business:', error);
        throw error;
      }
    },
    [userId, loadGameData, loadBusinesses]
  );

  // Upgrade business
  const upgradeBusiness = useCallback(
    async (businessId: string) => {
      if (!userId) return;

      try {
        await businessService.upgradeBusiness(userId, businessId);
        await Promise.all([loadGameData(), loadBusinesses()]);
      } catch (error) {
        console.error('Error upgrading business:', error);
        throw error;
      }
    },
    [userId, loadGameData, loadBusinesses]
  );

  // Claim daily reward
  const claimDailyReward = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await rewardService.claimDailyReward(userId);
      setGameState((prev) => ({
        ...prev,
        claimLockedUntil: result.claimLockedUntil,
        dailyClaimedTotal: result.dailyClaimedTotal,
      }));
      await loadGameData();
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      throw error;
    }
  }, [userId, loadGameData]);

  // Claim accumulated money
  const claimAccumulatedMoney = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await rewardService.claimAccumulatedMoney(userId);
      setGameState((prev) => ({
        ...prev,
        claimLockedUntil: result.claimLockedUntil,
        dailyClaimedTotal: result.dailyClaimedTotal,
      }));
      await loadGameData();
    } catch (error) {
      console.error('Error claiming accumulated money:', error);
      throw error;
    }
  }, [userId, loadGameData]);

  // Watch ad
  const watchAd = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await rewardService.watchAd(userId);
      setGameState((prev) => ({
        ...prev,
        claimLockedUntil: result.claimLockedUntil,
        dailyClaimedTotal: result.dailyClaimedTotal,
      }));
      await loadGameData();
    } catch (error) {
      console.error('Error watching ad:', error);
      throw error;
    }
  }, [userId, loadGameData]);

  // Update player name
  const updatePlayerName = useCallback(
    async (newName: string) => {
      if (!userId) return;

      try {
        await profileService.updateProfile(userId, { display_name: newName });
        setGameState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, display_name: newName } : null,
        }));
      } catch (error) {
        console.error('Error updating player name:', error);
      }
    },
    [userId]
  );

  // Reset progress
  const resetProgress = useCallback(async () => {
    if (!userId) return;

    try {
      await profileService.resetProgress(userId);
      await loadGameData();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [userId, loadGameData]);

  // Clear offline earnings
  const clearOfflineEarnings = useCallback(() => {
    setGameState((prev) => ({ ...prev, offlineEarnings: null }));
  }, []);

  // Reload
  const reload = useCallback(() => {
    loadGameData();
  }, [loadGameData]);

  return {
    ...gameState,
    createProfile,
    saveProfile,
    handleClick,
    purchaseitem,
    selectCharacter,
    selectHouse,
    selectCar,
    unlockJob,
    selectJob,
    purchaseBusiness,
    upgradeBusiness,
    claimDailyReward,
    claimAccumulatedMoney,
    watchAd,
    updatePlayerName,
    resetProgress,
    clearOfflineEarnings,
    reload,
  };
}

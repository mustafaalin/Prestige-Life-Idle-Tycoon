import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';
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
  offlineEarnings: { amount: number; minutes: number } | null;
  jobChangeLockedUntil: number | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
  pendingMoneyDelta: number;
}

const GAME_STATE_KEY = 'idle_guy_game_state';

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
  const moneyMutationInFlightRef = useRef<boolean>(false);
  const isCreatingProfileRef = useRef<boolean>(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const saveToLocalStorage = useCallback((state: Partial<GameState>) => {
    try {
      const existing = localStorage.getItem(GAME_STATE_KEY);
      const current = existing ? JSON.parse(existing) : {};
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ ...current, ...state }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): Partial<GameState> | null => {
    try {
      const stored = localStorage.getItem(GAME_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }, []);

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

  usePassiveIncome({
    profile: gameState.profile,
    incomePerSecond,
    isTabVisible,
    onMoneyUpdate: handleMoneyUpdate,
  });

  useAutoSave({
    profile: gameState.profile,
    userId,
    pendingMoneyDelta: gameState.pendingMoneyDelta,
    onSaveComplete: () => { setGameState((prev) => ({ ...prev, pendingMoneyDelta: 0 })); },
  });

  useJobTracking({
    userId,
    jobs: gameState.jobs,
    playerJobs: gameState.playerJobs,
    isTabVisible,
    onJobWorkTimeSync: () => {}, 
    onJobWorkSecondsUpdate: handleJobWorkSecondsUpdate,
  });

  useEffect(() => {
    const handleVisibilityChange = () => { isTabVisible.current = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, []);

  const flushPendingIfNeeded = useCallback(async () => {
    const pending = gameStateRef.current.pendingMoneyDelta;
    if (pending === 0) return;
    if (!gameStateRef.current.profile || !userId) return;

    moneyMutationInFlightRef.current = true;
    try {
      await supabase
        .from('player_profiles')
        .update({ total_money: gameStateRef.current.profile.total_money })
        .eq('id', userId);
      setGameState(prev => ({ ...prev, pendingMoneyDelta: 0 }));
    } catch (error) {
      console.error('Error flushing pending money:', error);
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [userId]);

  const loadBusinesses = useCallback(async (profileId: string) => {
    if (!profileId) return setGameState(prev => ({ ...prev, businessesLoading: false }));
    try {
      setGameState(prev => ({ ...prev, businessesLoading: true }));
      const result = await businessService.getBusinesses(profileId);
      setGameState(prev => ({
        ...prev,
        businesses: result.businesses,
        businessesPrestige: result.businessesPrestige,
        businessesLoading: false,
      }));
    } catch (error) {
      setGameState(prev => ({ ...prev, businessesLoading: false }));
    }
  }, []);

  const loadGameData = useCallback(async (shouldCalculateOfflineEarnings: boolean = true) => {
    if (!userId) return setGameState(prev => ({ ...prev, loading: false }));

    try {
      const [profileRes, charactersRes, housesRes, carsRes, purchasesRes, jobsRes, playerJobsRes, gameStatsRes] = await Promise.all([
        supabase.from('player_profiles').select('*').eq('id', userId).maybeSingle(),
        itemService.getCharacters(),
        itemService.getHouses(),
        itemService.getCars(),
        supabase.from('player_purchases').select('*').eq('player_id', userId),
        jobService.getJobs(),
        jobService.getPlayerJobs(userId),
        supabase.from('game_stats').select('*').eq('player_id', userId).maybeSingle(),
      ]);

      let profile = profileRes.data;
      const localData = loadFromLocalStorage();
      if (!profile && localData?.profile) { profile = localData.profile; }

      let selectedOutfit = null;
      if (profile?.selected_outfit_id) {
        selectedOutfit = await itemService.getSelectedOutfit(profile.selected_outfit_id);
      }

      const purchases = purchasesRes.data || [];
      const ownedCharacters = purchases.filter(p => p.item_type === 'character').map(p => p.item_id);
      const ownedHouses = purchases.filter(p => p.item_type === 'house').map(p => p.item_id);
      const ownedCars = purchases.filter(p => p.item_type === 'car').map(p => p.item_id);

      if (profile?.selected_character_id && !ownedCharacters.includes(profile.selected_character_id)) ownedCharacters.push(profile.selected_character_id);
      if (profile?.selected_house_id && !ownedHouses.includes(profile.selected_house_id)) ownedHouses.push(profile.selected_house_id);
      if (profile?.selected_car_id && !ownedCars.includes(profile.selected_car_id)) ownedCars.push(profile.selected_car_id);

      const currentPending = gameStateRef.current.pendingMoneyDelta;
      let offlineEarnings = null;

      if (profile && shouldCalculateOfflineEarnings && profile.last_played_at) {
        const now = new Date();
        const lastPlayed = new Date(profile.last_played_at);
        const minutesOffline = Math.floor((now.getTime() - lastPlayed.getTime()) / 1000 / 60);

        if (minutesOffline >= 1 && profile.hourly_income) {
          const actualMinutes = Math.min(minutesOffline, 12 * 60);
          const offlineAmount = Math.floor((profile.hourly_income / 60) * actualMinutes * 0.20);
          
          if (offlineAmount > 0) {
            offlineEarnings = { amount: offlineAmount, minutes: minutesOffline };
            profile = {
              ...profile,
              total_money: profile.total_money + offlineAmount,
              lifetime_earnings: profile.lifetime_earnings + offlineAmount,
            };
            await supabase.from('player_profiles').update({
              total_money: profile.total_money,
              lifetime_earnings: profile.lifetime_earnings,
              last_played_at: new Date().toISOString(),
            }).eq('id', userId);
          }
        }
      }

      if (profile) { profile = { ...profile, total_money: profile.total_money + currentPending }; }

      const activePlayerJob = (playerJobsRes.data || []).find(pj => pj.is_active);
      if (activePlayerJob) {
        await supabase.from('player_jobs').update({ last_work_started_at: new Date().toISOString() })
          .eq('player_id', userId).eq('id', activePlayerJob.id);
      }

      setGameState({
        profile,
        characters: charactersRes || [],
        houses: housesRes || [],
        cars: carsRes || [],
        jobs: jobsRes || [],
        playerJobs: playerJobsRes.data || [],
        businesses: [],
        businessesPrestige: 0,
        gameStats: gameStatsRes.data || null,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        selectedOutfit,
        loading: false,
        error: null,
        offlineEarnings,
        jobChangeLockedUntil: null,
        claimLockedUntil: profile?.claim_locked_until || null,
        dailyClaimedTotal: profile?.daily_claimed_total || 0,
        businessesLoading: true,
        unsavedJobWorkSeconds: 0,
        pendingMoneyDelta: currentPending,
      });

      loadBusinesses(userId);
    } catch (error) {
      console.error('Error loading game data:', error);
      setGameState(prev => ({ ...prev, loading: false, error: 'Failed to load game data' }));
    }
  }, [userId, loadFromLocalStorage, loadBusinesses]);

  const saveProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    if (!gameState.profile || !userId) return;
    try {
      await profileService.updateProfile(userId, updates);
      const updatedProfile = { ...gameState.profile, ...updates };
      setGameState(prev => ({ ...prev, profile: updatedProfile }));
      saveToLocalStorage({ profile: updatedProfile });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [userId, gameState.profile, saveToLocalStorage]);

  const createProfile = useCallback(async () => {
    if (!userId || !deviceId || isCreatingProfileRef.current) return;
    
    isCreatingProfileRef.current = true;
    try {
      const newProfile = await profileService.createProfile(userId, deviceId);
      if (newProfile) await loadGameData(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      isCreatingProfileRef.current = false;
    }
  }, [userId, deviceId, loadGameData]);

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

  const purchaseitem = useCallback(async (itemType: 'character' | 'house' | 'car', itemId: string, price: number) => {
    if (!gameState.profile || !userId) return false;
    if (gameState.profile.total_money < price) return false;

    try {
      if (itemType === 'car') {
        moneyMutationInFlightRef.current = true;
        await flushPendingIfNeeded();
        await purchaseService.purchaseCarViaRPC(userId, itemId, price);
        moneyMutationInFlightRef.current = false;
        await loadGameData(false);
        return true;
      } else {
        await purchaseService.purchaseGeneralItem(userId, itemType, itemId, price);
        
        const newTotalMoney = gameState.profile.total_money - price;
        const updateData: any = { total_money: newTotalMoney };
        if (itemType === 'character') updateData.selected_character_id = itemId;
        
        await saveProfile(updateData);
        setGameState(prev => {
          const newOwned = itemType === 'character' ? [...prev.ownedCharacters, itemId] : [...prev.ownedHouses, itemId];
          return {
            ...prev,
            [itemType === 'character' ? 'ownedCharacters' : 'ownedHouses']: newOwned,
          };
        });
        return true;
      }
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile, userId, saveProfile, loadGameData, flushPendingIfNeeded]);

  const selectCar = useCallback(async (carId: string) => {
    if (!userId) return false;
    try {
      await itemService.selectCar(userId, carId);
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [userId, loadGameData]);

  const selectHouse = useCallback(async (houseId: string) => {
    if (!userId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await itemService.selectHouse(userId, houseId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false; 
    }
  }, [userId, loadGameData, flushPendingIfNeeded]);

  const selectCharacter = useCallback(async (characterId: string) => {
    await saveProfile({ selected_character_id: characterId });
  }, [saveProfile]);

  // Yeni mantığa göre unlockJob sadece jobId alıyor, para gereksinimi yok
  const unlockJob = useCallback(async (jobId: string) => {
    if (!userId) return false;
    try {
      await jobService.unlockJob(userId, jobId);
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [userId, loadGameData]);

  const selectJob = useCallback(async (jobId: string) => {
    if (!userId) return false;
    if (gameState.jobChangeLockedUntil && Date.now() < gameState.jobChangeLockedUntil) return false;

    const currentActiveJob = gameState.playerJobs.find(pj => pj.is_active);
    const unsaved = gameState.unsavedJobWorkSeconds;

    try {
      await jobService.selectJob(userId, jobId, currentActiveJob, unsaved);
      setGameState(prev => ({ ...prev, jobChangeLockedUntil: Date.now() + 120000, unsavedJobWorkSeconds: 0 }));
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [gameState.playerJobs, gameState.jobChangeLockedUntil, gameState.unsavedJobWorkSeconds, userId, loadGameData]);

  const purchaseBusiness = useCallback(async (businessId: string) => {
    if (!userId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await businessService.purchaseBusiness(userId, businessId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [userId, loadGameData, flushPendingIfNeeded]);

  const upgradeBusiness = useCallback(async (businessId: string) => {
    if (!userId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await businessService.upgradeBusiness(userId, businessId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [userId, loadGameData, flushPendingIfNeeded]);

  const claimDailyReward = useCallback(async () => {
    if (!userId) return false;
    try {
      await rewardService.claimDailyReward(userId);
      await loadGameData();
      return true;
    } catch (error) { return false; }
  }, [userId, loadGameData]);

  const claimAccumulatedMoney = useCallback(async (isTriple: boolean) => {
    if (!userId) return false;
    try {
      const result = await rewardService.claimAccumulatedMoney(userId, isTriple);
      if(result && gameState.profile) {
          saveToLocalStorage({
             profile: { ...gameState.profile, total_money: result.new_total, last_claim_time: new Date().toISOString() }
          });
      }
      await loadGameData();
      return true;
    } catch (error) { return false; }
  }, [userId, gameState.profile, loadGameData, saveToLocalStorage]);

  const watchAd = useCallback(async () => {
    if (!userId) return { success: false, reward: 0, cooldown: 0 };
    try {
      const result = await rewardService.watchAd(userId);
      if(result.success && gameState.profile) {
          saveToLocalStorage({
             profile: { ...gameState.profile, total_money: result.new_total }
          });
      }
      await loadGameData();
      return result;
    } catch (error) { return { success: false, reward: 0, cooldown: 0 }; }
  }, [userId, gameState.profile, loadGameData, saveToLocalStorage]);

  const updatePlayerName = useCallback(async (newName: string) => {
    await saveProfile({ display_name: newName, username: newName });
  }, [saveProfile]);

  const resetProgress = useCallback(async () => {
    if (!userId) return;
    try {
      await profileService.resetProgress(userId);
      localStorage.removeItem(GAME_STATE_KEY);
      window.location.reload();
    } catch (error) { console.error('Error resetting progress:', error); }
  }, [userId]);

  const clearOfflineEarnings = useCallback(() => {
    setGameState(prev => ({ ...prev, offlineEarnings: null }));
  }, []);

  const reload = useCallback(() => { loadGameData(false); }, [loadGameData]);

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

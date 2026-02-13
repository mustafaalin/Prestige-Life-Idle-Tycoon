import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';
import type { Database } from '../lib/database.types';

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];
type House = Database['public']['Tables']['houses']['Row'];
type Car = Database['public']['Tables']['cars']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];
type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];
type GameStats = Database['public']['Tables']['game_stats']['Row'];

interface GameState {
  profile: PlayerProfile | null;
  characters: Character[];
  houses: House[];
  cars: Car[];
  jobs: Job[];
  playerJobs: PlayerJob[];
  gameStats: GameStats | null;
  ownedCharacters: string[];
  ownedHouses: string[];
  ownedCars: string[];
  loading: boolean;
  error: string | null;
  offlineEarnings: {
    amount: number;
    minutes: number;
  } | null;
  jobChangeLockedUntil: number | null;
}

const GAME_STATE_KEY = 'idle_guy_game_state';

export function useGameState(deviceId: string) {
  const [gameState, setGameState] = useState<GameState>({
    profile: null,
    characters: [],
    houses: [],
    cars: [],
    jobs: [],
    playerJobs: [],
    gameStats: null,
    ownedCharacters: [],
    ownedHouses: [],
    ownedCars: [],
    loading: true,
    error: null,
    offlineEarnings: null,
    jobChangeLockedUntil: null,
  });

  const passiveIncomeInterval = useRef<NodeJS.Timeout | null>(null);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const playTimeInterval = useRef<NodeJS.Timeout | null>(null);

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
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }, []);

  const calculateOfflineEarnings = useCallback((profile: PlayerProfile): { amount: number; minutes: number } | null => {
    if (!profile.last_played_at || !profile.hourly_income) return null;

    const now = new Date();
    const lastPlayed = new Date(profile.last_played_at);
    const minutesOffline = Math.floor((now.getTime() - lastPlayed.getTime()) / 1000 / 60);

    if (minutesOffline < 1) return null;

    const maxOfflineMinutes = 12 * 60;
    const actualMinutes = Math.min(minutesOffline, maxOfflineMinutes);
    const offlineRate = 0.20;
    const offlineEarnings = (profile.hourly_income / 60) * actualMinutes * offlineRate;

    return {
      amount: Math.floor(offlineEarnings),
      minutes: minutesOffline,
    };
  }, []);

  const loadGameData = useCallback(async (shouldCalculateOfflineEarnings: boolean = true) => {
    if (!deviceId) {
      setGameState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const profileId = deviceIdentity.getProfileId();
      if (!profileId) {
        setGameState(prev => ({ ...prev, loading: false }));
        return;
      }

      const [profileRes, charactersRes, housesRes, carsRes, purchasesRes, jobsRes, playerJobsRes, gameStatsRes] = await Promise.all([
        supabase.from('player_profiles').select('*').eq('id', profileId).maybeSingle(),
        supabase.from('characters').select('*').order('unlock_order'),
        supabase.from('houses').select('*').order('level'),
        supabase.from('cars').select('*').order('level'),
        supabase.from('player_purchases').select('*').eq('player_id', profileId),
        supabase.from('jobs').select('*').order('level'),
        supabase.from('player_jobs').select('*').eq('player_id', profileId),
        supabase.from('game_stats').select('*').eq('player_id', profileId).maybeSingle(),
      ]);

      if (charactersRes.error) throw charactersRes.error;
      if (housesRes.error) throw housesRes.error;
      if (carsRes.error) throw carsRes.error;
      if (jobsRes.error) throw jobsRes.error;

      let profile = profileRes.data;
      const localData = loadFromLocalStorage();

      if (!profile && localData?.profile) {
        profile = localData.profile;
      }

      const purchases = purchasesRes.data || [];
      const ownedCharacters = purchases
        .filter(p => p.item_type === 'character')
        .map(p => p.item_id);
      const ownedHouses = purchases
        .filter(p => p.item_type === 'house')
        .map(p => p.item_id);
      const ownedCars = purchases
        .filter(p => p.item_type === 'car')
        .map(p => p.item_id);

      if (profile?.selected_character_id && !ownedCharacters.includes(profile.selected_character_id)) {
        ownedCharacters.push(profile.selected_character_id);
      }
      if (profile?.selected_house_id && !ownedHouses.includes(profile.selected_house_id)) {
        ownedHouses.push(profile.selected_house_id);
      }
      if (profile?.selected_car_id && !ownedCars.includes(profile.selected_car_id)) {
        ownedCars.push(profile.selected_car_id);
      }

      let offlineEarnings = null;
      if (profile && shouldCalculateOfflineEarnings) {
        offlineEarnings = calculateOfflineEarnings(profile);
        if (offlineEarnings && offlineEarnings.amount > 0) {
          profile = {
            ...profile,
            total_money: profile.total_money + offlineEarnings.amount,
            lifetime_earnings: profile.lifetime_earnings + offlineEarnings.amount,
          };

          await supabase
            .from('player_profiles')
            .update({
              total_money: profile.total_money,
              lifetime_earnings: profile.lifetime_earnings,
              last_played_at: new Date().toISOString(),
            })
            .eq('id', profileId);
        }
      }

      setGameState({
        profile,
        characters: charactersRes.data || [],
        houses: housesRes.data || [],
        cars: carsRes.data || [],
        jobs: jobsRes.data || [],
        playerJobs: playerJobsRes.data || [],
        gameStats: gameStatsRes.data || null,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        loading: false,
        error: null,
        offlineEarnings,
        jobChangeLockedUntil: null,
      });
    } catch (error) {
      console.error('Error loading game data:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load game data',
      }));
    }
  }, [deviceId, loadFromLocalStorage, calculateOfflineEarnings]);

  const saveProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return;

    try {
      const { error } = await supabase
        .from('player_profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) throw error;

      const updatedProfile = { ...gameState.profile, ...updates };
      setGameState(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
      saveToLocalStorage({ profile: updatedProfile });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [gameState.profile, saveToLocalStorage]);

  const createProfile = useCallback(async (characterId: string) => {
    const profileId = deviceIdentity.getProfileId();
    const playerName = deviceIdentity.getPlayerName();
    if (!profileId || !deviceId) return;

    try {
      const firstHouse = gameState.houses.find(h => h.price === 0);
      const firstCar = gameState.cars.find(c => c.price === 0);

      const newProfile = {
        id: profileId,
        device_id: deviceId,
        display_name: playerName,
        username: playerName,
        total_money: 0,
        lifetime_earnings: 0,
        money_per_click: 1,
        money_per_second: 0,
        hourly_income: 1000,
        total_clicks: 0,
        prestige_points: 0,
        gems: 0,
        last_claim_time: new Date().toISOString(),
        selected_character_id: characterId,
        selected_house_id: firstHouse?.id || null,
        selected_car_id: firstCar?.id || null,
        created_at: new Date().toISOString(),
        last_played_at: new Date().toISOString(),
      } as PlayerProfile;

      const { error } = await supabase
        .from('player_profiles')
        .insert(newProfile);

      if (error) throw error;

      await supabase.from('game_stats').insert({
        player_id: profileId,
      });

      const defaultJob = gameState.jobs.find(j => j.is_default_unlocked);
      if (defaultJob) {
        await supabase.from('player_jobs').insert({
          player_id: profileId,
          job_id: defaultJob.id,
          is_unlocked: true,
          is_active: true,
          unlocked_at: new Date().toISOString(),
        });
      }

      setGameState(prev => ({
        ...prev,
        profile: newProfile,
        ownedCharacters: [characterId],
        ownedHouses: firstHouse ? [firstHouse.id] : [],
        ownedCars: firstCar ? [firstCar.id] : [],
      }));

      saveToLocalStorage({ profile: newProfile });
      deviceIdentity.setCharacterSelected(true);

      await loadGameData(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [deviceId, gameState.houses, gameState.cars, gameState.jobs, saveToLocalStorage, loadGameData]);

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
    }));

    saveToLocalStorage({ profile: updatedProfile });

    return earnedMoney;
  }, [gameState.profile, saveToLocalStorage]);

  const purchaseItem = useCallback(async (
    itemType: 'character' | 'house' | 'car',
    itemId: string,
    price: number
  ) => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return false;

    if (gameState.profile.total_money < price) {
      return false;
    }

    try {
      const { error: purchaseError } = await supabase
        .from('player_purchases')
        .insert({
          player_id: profileId,
          item_type: itemType,
          item_id: itemId,
          purchase_price: price,
        });

      if (purchaseError) throw purchaseError;

      const newTotalMoney = gameState.profile.total_money - price;
      const updateData: any = { total_money: newTotalMoney };

      if (itemType === 'character') {
        updateData.selected_character_id = itemId;
      } else if (itemType === 'house') {
        updateData.selected_house_id = itemId;
        const house = gameState.houses.find(h => h.id === itemId);
        if (house) {
          updateData.money_per_second = house.passive_income_bonus;
        }
      } else if (itemType === 'car') {
        updateData.selected_car_id = itemId;
        const car = gameState.cars.find(c => c.id === itemId);
        if (car) {
          updateData.prestige_points = gameState.profile.prestige_points + car.prestige_points;
        }
      }

      await saveProfile(updateData);

      setGameState(prev => {
        const newOwned = itemType === 'character'
          ? [...prev.ownedCharacters, itemId]
          : itemType === 'house'
          ? [...prev.ownedHouses, itemId]
          : [...prev.ownedCars, itemId];

        return {
          ...prev,
          [itemType === 'character' ? 'ownedCharacters' : itemType === 'house' ? 'ownedHouses' : 'ownedCars']: newOwned,
        };
      });

      return true;
    } catch (error) {
      console.error('Error purchasing item:', error);
      return false;
    }
  }, [gameState.profile, gameState.houses, gameState.cars, saveProfile]);

  const updatePlayerName = useCallback(async (newName: string) => {
    await saveProfile({ display_name: newName, username: newName });
  }, [saveProfile]);

  const clearOfflineEarnings = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      offlineEarnings: null,
    }));
  }, []);

  const unlockJob = useCallback(async (jobId: string) => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return false;

    const job = gameState.jobs.find(j => j.id === jobId);
    if (!job) return false;

    if (gameState.profile.total_money < job.unlock_requirement_money) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('player_jobs')
        .insert({
          player_id: profileId,
          job_id: jobId,
          is_unlocked: true,
          is_active: false,
          unlocked_at: new Date().toISOString(),
        });

      if (error) throw error;

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error unlocking job:', error);
      return false;
    }
  }, [gameState.profile, gameState.jobs, loadGameData]);

  const selectJob = useCallback(async (jobId: string) => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return false;

    if (gameState.jobChangeLockedUntil && Date.now() < gameState.jobChangeLockedUntil) {
      return false;
    }

    const job = gameState.jobs.find(j => j.id === jobId);
    if (!job) return false;

    const playerJob = gameState.playerJobs.find(pj => pj.job_id === jobId);
    if (!playerJob || !playerJob.is_unlocked) return false;

    try {
      await supabase
        .from('player_jobs')
        .update({ is_active: false })
        .eq('player_id', profileId);

      await supabase
        .from('player_jobs')
        .update({ is_active: true })
        .eq('player_id', profileId)
        .eq('job_id', jobId);

      await saveProfile({
        hourly_income: job.hourly_income,
      });

      const lockUntil = Date.now() + 120000;
      setGameState(prev => ({
        ...prev,
        jobChangeLockedUntil: lockUntil,
      }));

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error selecting job:', error);
      return false;
    }
  }, [gameState.profile, gameState.jobs, gameState.playerJobs, gameState.jobChangeLockedUntil, saveProfile, loadGameData]);

  const resetProgress = useCallback(async () => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId) return;

    try {
      await Promise.all([
        supabase.from('player_purchases').delete().eq('player_id', profileId),
        supabase.from('player_jobs').delete().eq('player_id', profileId),
        supabase.from('game_stats').delete().eq('player_id', profileId),
        supabase.from('player_profiles').delete().eq('id', profileId),
      ]);

      deviceIdentity.reset();
      localStorage.removeItem(GAME_STATE_KEY);

      setGameState({
        profile: null,
        characters: gameState.characters,
        houses: gameState.houses,
        cars: gameState.cars,
        jobs: gameState.jobs,
        playerJobs: [],
        gameStats: null,
        ownedCharacters: [],
        ownedHouses: [],
        ownedCars: [],
        loading: false,
        error: null,
        offlineEarnings: null,
        jobChangeLockedUntil: null,
      });

      window.location.reload();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [gameState.characters, gameState.houses, gameState.cars]);

  useEffect(() => {
    loadGameData(true);
  }, [loadGameData]);

  useEffect(() => {
    if (!gameState.profile || !gameState.profile.hourly_income || gameState.profile.hourly_income <= 0) return;

    const hourlyIncome = gameState.profile.hourly_income;
    const incomePerSecond = hourlyIncome / 3600;
    const updateIntervalMs = incomePerSecond >= 1 ? 1000 : Math.floor(1000 / incomePerSecond);
    const moneyPerUpdate = incomePerSecond >= 1 ? incomePerSecond : 1;

    passiveIncomeInterval.current = setInterval(() => {
      setGameState(prev => {
        if (!prev.profile) return prev;

        const updatedProfile = {
          ...prev.profile,
          total_money: prev.profile.total_money + moneyPerUpdate,
          lifetime_earnings: prev.profile.lifetime_earnings + moneyPerUpdate,
        };

        saveToLocalStorage({ profile: updatedProfile });

        return {
          ...prev,
          profile: updatedProfile,
        };
      });
    }, updateIntervalMs);

    return () => {
      if (passiveIncomeInterval.current) {
        clearInterval(passiveIncomeInterval.current);
      }
    };
  }, [gameState.profile?.hourly_income, saveToLocalStorage]);

  useEffect(() => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return;

    autoSaveInterval.current = setInterval(() => {
      if (gameState.profile) {
        saveProfile({
          total_money: gameState.profile.total_money,
          lifetime_earnings: gameState.profile.lifetime_earnings,
          total_clicks: gameState.profile.total_clicks,
          last_played_at: new Date().toISOString(),
        });
      }
    }, 10000);

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [gameState.profile, saveProfile]);

  useEffect(() => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return;

    const updateLastPlayed = () => {
      if (gameState.profile) {
        saveProfile({
          last_played_at: new Date().toISOString(),
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateLastPlayed();
      }
    };

    const handleBeforeUnload = () => {
      updateLastPlayed();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState.profile, saveProfile]);

  const claimDailyReward = useCallback(async () => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile || !gameState.gameStats) return false;

    try {
      const now = new Date();
      const lastReward = gameState.gameStats.last_daily_reward
        ? new Date(gameState.gameStats.last_daily_reward)
        : null;

      let newStreak = gameState.gameStats.daily_login_streak;

      if (lastReward) {
        const hoursSince = (now.getTime() - lastReward.getTime()) / 1000 / 60 / 60;

        if (hoursSince < 24) {
          return false;
        }

        if (hoursSince > 48) {
          newStreak = 1;
        } else {
          newStreak = newStreak + 1;
        }
      } else {
        newStreak = 1;
      }

      const currentDay = ((newStreak - 1) % 7) + 1;
      const rewards = [
        { day: 1, money: 1000, gems: 0 },
        { day: 2, money: 3000, gems: 0 },
        { day: 3, money: 10000, gems: 0 },
        { day: 4, money: 15000, gems: 5 },
        { day: 5, money: 25000, gems: 0 },
        { day: 6, money: 50000, gems: 0 },
        { day: 7, money: 100000, gems: 0 },
      ];

      const todayReward = rewards[currentDay - 1];

      const newTotalMoney = gameState.profile.total_money + todayReward.money;
      const newLifetimeEarnings = gameState.profile.lifetime_earnings + todayReward.money;
      const newGems = (gameState.profile.gems || 0) + todayReward.gems;

      await supabase
        .from('player_profiles')
        .update({
          total_money: newTotalMoney,
          lifetime_earnings: newLifetimeEarnings,
          gems: newGems,
        })
        .eq('id', profileId);

      await supabase
        .from('game_stats')
        .update({
          daily_login_streak: newStreak,
          last_daily_reward: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('player_id', profileId);

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      return false;
    }
  }, [gameState.profile, gameState.gameStats, loadGameData]);

  const claimAccumulatedMoney = useCallback(async (isTriple: boolean) => {
    const profileId = deviceIdentity.getProfileId();
    if (!profileId || !gameState.profile) return false;

    try {
      // Call the atomic RPC function to claim money with profile_id
      const { data, error } = await supabase
        .rpc('claim_accumulated_money', {
          p_profile_id: profileId,
          is_triple: isTriple
        });

      if (error) {
        console.error('Error claiming accumulated money:', error);
        return false;
      }

      // If no data returned, there was no money to claim
      if (!data || data.length === 0) {
        return false;
      }

      // Update local state immediately with the new values from database
      const updatedProfile = data[0];
      setGameState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          total_money: Number(updatedProfile.total_money),
          lifetime_earnings: Number(updatedProfile.lifetime_earnings),
          last_claim_time: updatedProfile.last_claim_time,
        } : null,
      }));

      // Save to local storage
      if (gameState.profile) {
        saveToLocalStorage({
          profile: {
            ...gameState.profile,
            total_money: Number(updatedProfile.total_money),
            lifetime_earnings: Number(updatedProfile.lifetime_earnings),
            last_claim_time: updatedProfile.last_claim_time,
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error claiming accumulated money:', error);
      return false;
    }
  }, [gameState.profile, saveToLocalStorage]);

  return {
    ...gameState,
    handleClick,
    purchaseItem,
    saveProfile,
    createProfile,
    updatePlayerName,
    resetProgress,
    clearOfflineEarnings,
    unlockJob,
    selectJob,
    claimDailyReward,
    claimAccumulatedMoney,
    reload: () => loadGameData(false),
  };
}

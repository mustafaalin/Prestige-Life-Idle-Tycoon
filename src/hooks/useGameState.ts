import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';
import type { Database, Business, PlayerBusiness, BusinessWithPlayerData } from '../lib/database.types';

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
  businesses: BusinessWithPlayerData[];
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
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
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
    gameStats: null,
    ownedCharacters: [],
    ownedHouses: [],
    ownedCars: [],
    loading: true,
    error: null,
    offlineEarnings: null,
    jobChangeLockedUntil: null,
    claimLockedUntil: null,
    dailyClaimedTotal: 0,
    businessesLoading: true,
    unsavedJobWorkSeconds: 0,
  });

  const passiveIncomeInterval = useRef<NodeJS.Timeout | null>(null);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const playTimeInterval = useRef<NodeJS.Timeout | null>(null);
  const jobWorkTimeInterval = useRef<NodeJS.Timeout | null>(null);
  const jobWorkTimeAutoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const isTabVisible = useRef<boolean>(true);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep ref in sync with state
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

  const loadBusinesses = useCallback(async () => {
    if (!userId) {
      setGameState(prev => ({ ...prev, businessesLoading: false }));
      return;
    }

    try {
      setGameState(prev => ({ ...prev, businessesLoading: true }));

      const { data, error } = await supabase
        .rpc('get_all_businesses', {
          p_player_id: userId
        } as any);

      if (error) throw error;

      const businesses = (data || []) as BusinessWithPlayerData[];

      setGameState(prev => ({
        ...prev,
        businesses,
        businessesLoading: false,
      }));
    } catch (error) {
      console.error('Error loading businesses:', error);
      setGameState(prev => ({
        ...prev,
        businessesLoading: false,
      }));
    }
  }, [userId]);

  const loadGameData = useCallback(async (shouldCalculateOfflineEarnings: boolean = true) => {
    if (!deviceId || !userId) {
      setGameState(prev => ({ ...prev, loading: false }));
      return;
    }

    console.log('[loadGameData] Starting to load game data...', { deviceId, userId });

    try {
      const [profileRes, charactersRes, housesRes, carsRes, purchasesRes, jobsRes, playerJobsRes, gameStatsRes] = await Promise.all([
        supabase.from('player_profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('characters').select('*').order('unlock_order'),
        supabase.from('houses').select('*').order('level'),
        supabase.from('cars').select('*').order('level'),
        supabase.from('player_purchases').select('*').eq('player_id', userId),
        supabase.from('jobs').select('*').order('level'),
        supabase.from('player_jobs').select('*').eq('player_id', userId),
        supabase.from('game_stats').select('*').eq('player_id', userId).maybeSingle(),
      ]);

      if (charactersRes.error) throw charactersRes.error;
      if (housesRes.error) throw housesRes.error;
      if (carsRes.error) throw carsRes.error;
      if (jobsRes.error) throw jobsRes.error;

      console.log('[loadGameData] Data loaded:', {
        characters: charactersRes.data?.length,
        houses: housesRes.data?.length,
        cars: carsRes.data?.length,
        jobs: jobsRes.data?.length,
        profile: profileRes.data ? 'exists' : 'null',
      });

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
            .eq('id', userId);
        }
      }

      const activePlayerJob = (playerJobsRes.data || []).find(pj => pj.is_active);

      // Reset last_work_started_at on page load to current time for active job
      if (activePlayerJob && activePlayerJob.is_active) {
        await supabase
          .from('player_jobs')
          .update({
            last_work_started_at: new Date().toISOString(),
          })
          .eq('player_id', userId)
          .eq('id', activePlayerJob.id);
      }

      console.log('[loadGameData] Setting state with houses:', {
        housesCount: housesRes.data?.length,
        houses: housesRes.data,
        selectedHouseId: profile?.selected_house_id,
      });

      setGameState({
        profile,
        characters: charactersRes.data || [],
        houses: housesRes.data || [],
        cars: carsRes.data || [],
        jobs: jobsRes.data || [],
        playerJobs: playerJobsRes.data || [],
        businesses: [],
        gameStats: gameStatsRes.data || null,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        loading: false,
        error: null,
        offlineEarnings,
        jobChangeLockedUntil: null,
        claimLockedUntil: profile?.claim_locked_until || null,
        dailyClaimedTotal: profile?.daily_claimed_total || 0,
        businessesLoading: true,
        unsavedJobWorkSeconds: 0,
      });

      if (userId) {
        loadBusinesses();
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load game data',
      }));
    }
  }, [deviceId, userId, loadFromLocalStorage, calculateOfflineEarnings, loadBusinesses]);

  const saveProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    if (!userId || !gameState.profile) return;

    try {
      const { error } = await supabase
        .from('player_profiles')
        .update(updates)
        .eq('id', userId);

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
  }, [userId, gameState.profile, saveToLocalStorage]);

  /**
   * GAME INITIALIZATION RULES (OYUN BAŞLANGIÇ KURALLARI)
   *
   * When a player starts the game for the first time:
   *
   * 1. CHARACTER (Karakter):
   *    - Default: "Mike" or first free male character
   *    - Selected automatically (selected_character_id)
   *    - NOT added to player_purchases (it's a free starter item)
   *
   * 2. HOUSE (Ev):
   *    - Default: First house with price = 0 (usually "Street", level 1)
   *    - Selected automatically (selected_house_id)
   *    - NOT added to player_purchases (it's a free starter item)
   *
   * 3. JOB (İş):
   *    - NO DEFAULT JOB - Player must choose their first job manually
   *    - Jobs are unlocked through JobsModal
   *
   * 4. BUSINESS (İşletme):
   *    - NO DEFAULT BUSINESS - Player can buy businesses later
   *    - Businesses are purchased through BusinessModal
   *
   * 5. STARTING VALUES (Başlangıç Değerleri):
   *    - total_money: 100
   *    - hourly_income: 50 (passive income without job)
   *    - money_per_click: 1
   *    - gems: 0
   *
   * 6. PLAYER_PURCHASES TABLE:
   *    - Only stores PURCHASED items (cars, businesses, paid houses, paid characters)
   *    - Free starter items (character-1, house-1) are NOT stored here
   *    - Selected items are tracked through profile fields (selected_character_id, selected_house_id, etc.)
   *    - Owned items are computed in loadGameData by combining purchases + selected items
   */
  const createProfile = useCallback(async () => {
    const playerName = deviceIdentity.getPlayerName();
    if (!userId || !deviceId) return;

    try {
      // Find Mike character or first free male character
      const { data: mikeCharacter } = await supabase
        .from('characters')
        .select('id')
        .eq('name', 'Mike')
        .maybeSingle();

      let characterId = mikeCharacter?.id;

      if (!characterId) {
        const { data: fallbackCharacter } = await supabase
          .from('characters')
          .select('id')
          .eq('gender', 'male')
          .eq('price', 0)
          .order('unlock_order')
          .limit(1)
          .maybeSingle();

        characterId = fallbackCharacter?.id;
      }

      if (!characterId) {
        console.error('No default character found');
        return;
      }

      const firstHouse = gameState.houses.find(h => h.price === 0);

      const newProfile = {
        id: userId,
        device_id: deviceId,
        display_name: playerName,
        username: playerName,
        total_money: 100,
        lifetime_earnings: 0,
        money_per_click: 1,
        money_per_second: 0,
        hourly_income: 50,
        total_clicks: 0,
        prestige_points: 0,
        gems: 0,
        last_claim_time: new Date().toISOString(),
        selected_character_id: characterId,
        selected_house_id: firstHouse?.id || null,
        selected_car_id: null,
        created_at: new Date().toISOString(),
        last_played_at: new Date().toISOString(),
      } as PlayerProfile;

      const { error } = await supabase
        .from('player_profiles')
        .insert(newProfile);

      if (error) throw error;

      await supabase.from('game_stats').insert({
        player_id: userId,
      });

      setGameState(prev => ({
        ...prev,
        profile: newProfile,
        ownedCharacters: [],
        ownedHouses: [],
        ownedCars: [],
      }));

      saveToLocalStorage({ profile: newProfile });

      await loadGameData(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [userId, deviceId, gameState.houses, gameState.jobs, saveToLocalStorage, loadGameData]);

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
    if (!userId || !gameState.profile) return false;

    if (gameState.profile.total_money < price) {
      return false;
    }

    try {
      const { error: purchaseError } = await supabase
        .from('player_purchases')
        .insert({
          player_id: userId,
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
  }, [userId, gameState.profile, gameState.houses, gameState.cars, saveProfile]);

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
    if (!userId || !gameState.profile) return false;

    const job = gameState.jobs.find(j => j.id === jobId);
    if (!job) return false;

    if (gameState.profile.total_money < job.unlock_requirement_money) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('player_jobs')
        .insert({
          player_id: userId,
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
  }, [userId, gameState.profile, gameState.jobs, loadGameData]);

  const selectJob = useCallback(async (jobId: string) => {
    if (!userId || !gameState.profile) return false;

    if (gameState.jobChangeLockedUntil && Date.now() < gameState.jobChangeLockedUntil) {
      return false;
    }

    const job = gameState.jobs.find(j => j.id === jobId);
    if (!job) return false;

    const playerJob = gameState.playerJobs.find(pj => pj.job_id === jobId);
    if (!playerJob || !playerJob.is_unlocked) return false;

    try {
      const currentActiveJob = gameState.playerJobs.find(pj => pj.is_active);

      // Save unsaved delta for current active job before switching
      if (currentActiveJob && gameState.unsavedJobWorkSeconds > 0) {
        const newTotalTime = (currentActiveJob.total_time_worked_seconds || 0) + gameState.unsavedJobWorkSeconds;

        await supabase
          .from('player_jobs')
          .update({
            is_active: false,
            total_time_worked_seconds: newTotalTime,
          })
          .eq('player_id', userId)
          .eq('id', currentActiveJob.id);
      } else if (currentActiveJob) {
        await supabase
          .from('player_jobs')
          .update({ is_active: false })
          .eq('player_id', userId)
          .eq('id', currentActiveJob.id);
      }

      // Activate new job and set last_work_started_at to now
      await supabase
        .from('player_jobs')
        .update({
          is_active: true,
          last_work_started_at: new Date().toISOString(),
        })
        .eq('player_id', userId)
        .eq('job_id', jobId);

      const totalBusinessIncome = gameState.businesses
        .filter(b => b.is_owned)
        .reduce((sum, b) => sum + b.current_hourly_income, 0);

      await saveProfile({
        hourly_income: job.hourly_income + totalBusinessIncome,
      });

      const lockUntil = Date.now() + 120000;
      setGameState(prev => ({
        ...prev,
        jobChangeLockedUntil: lockUntil,
        unsavedJobWorkSeconds: 0, // Reset unsaved for new job
      }));

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error selecting job:', error);
      return false;
    }
  }, [userId, gameState.profile, gameState.jobs, gameState.playerJobs, gameState.businesses, gameState.jobChangeLockedUntil, gameState.unsavedJobWorkSeconds, saveProfile, loadGameData]);

  const resetProgress = useCallback(async () => {
    if (!userId) return;

    try {
      // Call database function to reset progress and save history
      const { error } = await supabase.rpc('reset_player_progress', {
        p_player_id: userId
      });

      if (error) throw error;

      // Clear local cache
      localStorage.removeItem(GAME_STATE_KEY);

      // Reload the page to fetch fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (deviceId && userId) {
      loadGameData(true);
    }
  }, [deviceId, userId]);

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
    if (!userId || !gameState.profile) return;

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
  }, [userId, gameState.profile, saveProfile]);

  useEffect(() => {
    if (!userId || !gameState.profile) return;

    const updateLastPlayed = () => {
      if (gameState.profile) {
        saveProfile({
          last_played_at: new Date().toISOString(),
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabVisible.current = false;
        updateLastPlayed();
      } else {
        isTabVisible.current = true;
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
  }, [userId, gameState.profile, saveProfile]);

  useEffect(() => {
    if (!userId) return;

    const activeJob = gameState.playerJobs.find(pj => pj.is_active);
    if (!activeJob) {
      if (jobWorkTimeInterval.current) {
        clearInterval(jobWorkTimeInterval.current);
        jobWorkTimeInterval.current = null;
      }
      if (jobWorkTimeAutoSaveInterval.current) {
        clearInterval(jobWorkTimeAutoSaveInterval.current);
        jobWorkTimeAutoSaveInterval.current = null;
      }
      return;
    }

    if (jobWorkTimeInterval.current) {
      clearInterval(jobWorkTimeInterval.current);
    }
    if (jobWorkTimeAutoSaveInterval.current) {
      clearInterval(jobWorkTimeAutoSaveInterval.current);
    }

    // Client-side timer: increment unsavedJobWorkSeconds every second when visible
    jobWorkTimeInterval.current = setInterval(() => {
      if (isTabVisible.current && !document.hidden) {
        setGameState(prev => ({
          ...prev,
          unsavedJobWorkSeconds: prev.unsavedJobWorkSeconds + 1,
        }));
      }
    }, 1000);

    // Auto-save delta to DB every 5 seconds
    jobWorkTimeAutoSaveInterval.current = setInterval(async () => {
      if (!isTabVisible.current || document.hidden) return;

      const currentState = gameStateRef.current;
      const currentActiveJob = currentState.playerJobs.find(pj => pj.is_active);
      const unsaved = currentState.unsavedJobWorkSeconds;

      if (!currentActiveJob || unsaved === 0) return;

      try {
        const newTotalTime = (currentActiveJob.total_time_worked_seconds || 0) + unsaved;

        await supabase
          .from('player_jobs')
          .update({
            total_time_worked_seconds: newTotalTime,
          })
          .eq('player_id', userId)
          .eq('id', currentActiveJob.id);

        // Reset unsaved after successful save
        setGameState(prev => ({
          ...prev,
          unsavedJobWorkSeconds: 0,
        }));
      } catch (error) {
        console.error('Error auto-saving job work time:', error);
      }
    }, 5000);

    // Flush unsaved delta to DB on visibility change (tab hidden)
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        isTabVisible.current = false;

        const currentState = gameStateRef.current;
        const currentActiveJob = currentState.playerJobs.find(pj => pj.is_active);
        const unsaved = currentState.unsavedJobWorkSeconds;

        if (currentActiveJob && unsaved > 0) {
          try {
            const newTotalTime = (currentActiveJob.total_time_worked_seconds || 0) + unsaved;

            await supabase
              .from('player_jobs')
              .update({
                total_time_worked_seconds: newTotalTime,
              })
              .eq('player_id', userId)
              .eq('id', currentActiveJob.id);

            setGameState(prev => ({
              ...prev,
              unsavedJobWorkSeconds: 0,
            }));
          } catch (error) {
            console.error('Error saving job work time on visibility change:', error);
          }
        }
      } else {
        isTabVisible.current = true;
      }
    };

    // Flush unsaved delta to DB on page unload
    const handlePageHide = async () => {
      const currentState = gameStateRef.current;
      const currentActiveJob = currentState.playerJobs.find(pj => pj.is_active);
      const unsaved = currentState.unsavedJobWorkSeconds;

      if (currentActiveJob && unsaved > 0) {
        try {
          const newTotalTime = (currentActiveJob.total_time_worked_seconds || 0) + unsaved;

          await supabase
            .from('player_jobs')
            .update({
              total_time_worked_seconds: newTotalTime,
            })
            .eq('player_id', userId)
            .eq('id', currentActiveJob.id);
        } catch (error) {
          console.error('Error saving job work time on page hide:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      if (jobWorkTimeInterval.current) {
        clearInterval(jobWorkTimeInterval.current);
      }
      if (jobWorkTimeAutoSaveInterval.current) {
        clearInterval(jobWorkTimeAutoSaveInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [userId, gameState.playerJobs]);

  const claimDailyReward = useCallback(async () => {
    if (!userId || !gameState.profile || !gameState.gameStats) return false;

    try {
      const { data, error } = await supabase
        .rpc('claim_daily_reward', {
          p_player_id: userId
        } as any);

      if (error) {
        console.error('Error claiming daily reward:', error);
        return false;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return false;
      }

      const result = data[0] as {
        success: boolean;
        message: string;
      };

      if (!result.success) {
        console.log('Cannot claim reward:', result.message);
        return false;
      }

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      return false;
    }
  }, [userId, gameState.profile, gameState.gameStats, loadGameData]);

  const claimAccumulatedMoney = useCallback(async (isTriple: boolean) => {
    if (!userId || !gameState.profile) return false;

    try {
      const { data, error } = await supabase
        .rpc('claim_accumulated_money', {
          p_player_id: userId,
          p_is_triple: isTriple
        } as any);

      if (error) {
        console.error('Error claiming accumulated money:', error);
        return false;
      }

      if (!data) {
        return false;
      }

      const result = data as {
        success: boolean;
        error?: string;
        claimed_amount?: number;
        new_total?: number;
      };

      if (!result.success) {
        console.error('Claim failed:', result.error);
        return false;
      }

      setGameState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          total_money: Number(result.new_total),
          last_claim_time: new Date().toISOString(),
        } : null,
      }));

      if (gameState.profile) {
        saveToLocalStorage({
          profile: {
            ...gameState.profile,
            total_money: Number(result.new_total),
            last_claim_time: new Date().toISOString(),
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error claiming accumulated money:', error);
      return false;
    }
  }, [userId, gameState.profile, saveToLocalStorage]);

  const watchAd = useCallback(async () => {
    if (!userId || !gameState.profile) return { success: false, reward: 0, cooldown: 0 };

    try {
      const { data, error } = await supabase
        .rpc('claim_ad_reward', {
          p_player_id: userId
        } as any);

      if (error) {
        console.error('Error claiming ad reward:', error);
        return { success: false, reward: 0, cooldown: 0 };
      }

      if (!data) {
        return { success: false, reward: 0, cooldown: 0 };
      }

      const result = data as {
        success: boolean;
        error?: string;
        reward?: number;
        new_total?: number;
        cooldown?: number;
      };

      if (!result.success) {
        console.error('Ad reward failed:', result.error);
        return { success: false, reward: 0, cooldown: result.cooldown || 0 };
      }

      setGameState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          total_money: Number(result.new_total),
        } : null,
      }));

      if (gameState.profile) {
        saveToLocalStorage({
          profile: {
            ...gameState.profile,
            total_money: Number(result.new_total),
          }
        });
      }

      return {
        success: true,
        reward: Number(result.reward),
        cooldown: result.cooldown || 0
      };
    } catch (error) {
      console.error('Error watching ad:', error);
      return { success: false, reward: 0, cooldown: 0 };
    }
  }, [userId, gameState.profile, saveToLocalStorage]);

  const purchaseBusiness = useCallback(async (businessId: string) => {
    if (!userId || !gameState.profile) return false;

    const business = gameState.businesses.find(b => b.id === businessId);
    if (!business) return false;

    if (gameState.profile.total_money < business.base_price) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('purchase_business', {
          p_business_id: businessId,
          p_player_id: userId
        } as any);

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number; new_hourly_income?: number };

      if (!result.success) {
        console.error('Purchase failed:', result.error);
        return false;
      }

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error purchasing business:', error);
      return false;
    }
  }, [userId, gameState.profile, gameState.businesses, loadGameData]);

  const upgradeBusiness = useCallback(async (businessId: string, targetLevel: number) => {
    if (!userId || !gameState.profile) return false;

    try {
      const { data, error } = await supabase
        .rpc('upgrade_business', {
          p_business_id: businessId,
          p_player_id: userId
        } as any);

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        new_level?: number;
        new_income?: number;
        upgrade_cost?: number;
        new_balance?: number;
      };

      if (!result.success) {
        console.error('Upgrade failed:', result.error);
        return false;
      }

      await loadGameData(false);
      return true;
    } catch (error) {
      console.error('Error upgrading business:', error);
      return false;
    }
  }, [userId, gameState.profile, loadGameData]);

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
    watchAd,
    loadBusinesses,
    purchaseBusiness,
    upgradeBusiness,
    reload: () => loadGameData(false),
  };
}

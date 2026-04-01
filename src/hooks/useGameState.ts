import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceIdentity } from '../lib/deviceIdentity';
import type { Database } from '../lib/database.types';
import { LOCAL_BUSINESSES } from '../data/local/businesses';
import { LOCAL_INVESTMENTS } from '../data/local/investments';
import {
  getJobUnlockRequirementSeconds,
  LOCAL_JOBS,
} from '../data/local/jobs';
import { LOCAL_HOUSES, LOCAL_STARTER_HOUSE_ID } from '../data/local/houses';
import { LOCAL_CARS } from '../data/local/cars';
import { LOCAL_CHARACTERS, LOCAL_MIKE_CHARACTER_ID } from '../data/local/characters';
import { createStarterPlayerOutfit, LOCAL_OUTFITS, LOCAL_STARTER_OUTFIT_ID } from '../data/local/outfits';
import {
  calculatePrestigeFromQuestProgress,
  createInitialQuestProgress,
  getQuestChapterByIndex,
  getQuestsForChapter,
  isQuestCompleted,
  LOCAL_QUESTS,
  normalizeQuestProgress,
} from '../data/local/quests';
import {
  createBankDeposit,
  getBankDepositMaxAmount,
  getBankDepositPlan,
  isBankDepositReady,
} from '../data/local/bankDeposits';
import { claimCashback as claimCashbackReward } from '../data/local/bankRewards';
import {
  applyPremiumBankCardPurchase,
  hasPremiumBankCard,
  type PremiumPurchaseMethod,
} from '../data/local/bankPremium';
import {
  DEFAULT_HAPPINESS,
  DEFAULT_HEALTH,
  getHealthCooldownRemaining,
  HEALTH_ACTIONS,
  HEALTH_AD_BOOST_PERCENT,
  normalizeProfileWellbeing,
} from '../data/local/healthActions';
import { calculateWellbeingDeltaForSeconds } from '../data/local/wellbeing';
import {
  getHappinessCooldownRemaining,
  HAPPINESS_ACTIONS,
  HAPPINESS_AD_BOOST_PERCENT,
} from '../data/local/happinessActions';
import type {
  BankDeposit,
  BankDepositPlanId,
  BusinessWithPlayerData,
  HappinessActionKey,
  HealthActionKey,
  InvestmentUpgradeKey,
  InvestmentWithPlayerData,
  Job,
  QuestProgress,
} from '../types/game';
import { recalculateLocalEconomy } from '../data/local/economy';
import { getBusinessPrestigeForLevel } from '../data/local/businessPrestigePoints';
import { calculateOfflineEarnings } from '../utils/game/calculations';
import { canAccessCarWithPrestige, canAccessHouseWithPrestige } from '../data/local/prestigeRequirements';
import { usePassiveIncome } from './usePassiveIncome';
import { useAutoSave } from './useAutoSave';
import { useJobTracking } from './useJobTracking';
import * as profileService from '../services/profileService';
import * as itemService from '../services/itemService';
import * as jobService from '../services/jobService';
import * as businessService from '../services/businessService';
import type { BusinessMutationResult } from '../services/businessService';
import * as purchaseService from '../services/purchaseService';
import * as rewardService from '../services/rewardService';
import * as statsService from '../services/statsService';
import * as investmentService from '../services/investmentService';

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'] & {
  bonus_prestige_points?: number;
  cashback_pool?: number;
  cashback_claimed_total?: number;
  premium_bank_card_owned?: boolean;
  premium_bank_card_purchased_at?: string | null;
  premium_bank_card_purchase_source?: 'gems' | 'cash' | null;
  health?: number;
  happiness?: number;
  health_action_cooldowns?: Partial<Record<HealthActionKey, string>>;
  health_ad_cooldown_until?: string | null;
  happiness_action_cooldowns?: Partial<Record<HappinessActionKey, string>>;
  happiness_ad_cooldown_until?: string | null;
};
type Character = Database['public']['Tables']['characters']['Row'];
type House = Database['public']['Tables']['houses']['Row'];
type Car = Database['public']['Tables']['cars']['Row'];
type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];
type GameStats = Database['public']['Tables']['game_stats']['Row'];
type CharacterOutfit = Database['public']['Tables']['character_outfits']['Row'];
type PlayerOutfit = Database['public']['Tables']['player_outfits']['Row'];

interface GameState {
  profile: PlayerProfile | null;
  characters: Character[];
  houses: House[];
  cars: Car[];
  jobs: Job[];
  playerJobs: PlayerJob[];
  businesses: BusinessWithPlayerData[];
  investments: InvestmentWithPlayerData[];
  businessesPrestige: number;
  gameStats: GameStats | null;
  ownedCharacters: string[];
  ownedHouses: string[];
  ownedCars: string[];
  playerOutfits: PlayerOutfit[];
  selectedOutfit: CharacterOutfit | null;
  questProgress: QuestProgress;
  loading: boolean;
  error: string | null;
  offlineEarnings: { amount: number; minutes: number; appliedMinutes: number } | null;
  jobChangeLockedUntil: number | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
  pendingMoneyDelta: number;
  bankDeposits: BankDeposit[];
}

const GAME_STATE_KEY = 'idle_guy_game_state';

function ensurePlayerOutfits(playerId: string, outfits?: PlayerOutfit[]): PlayerOutfit[] {
  if (outfits?.length) {
    const hasStarter = outfits.some((outfit) => outfit.outfit_id === LOCAL_STARTER_OUTFIT_ID && outfit.is_owned);
    return hasStarter ? outfits : [createStarterPlayerOutfit(playerId), ...outfits];
  }

  return [createStarterPlayerOutfit(playerId)];
}

function ensureOwnedSelection(ids: string[] | undefined, selectedId: string | null, fallbackIds: string[] = []): string[] {
  const nextIds = ids?.length ? [...ids] : [...fallbackIds];

  if (selectedId && !nextIds.includes(selectedId)) {
    nextIds.push(selectedId);
  }

  return nextIds;
}

function normalizeGameStats(stats: GameStats | null | undefined, playerId: string): GameStats {
  return stats
    ? {
        ...createLocalGameStats(playerId),
        ...stats,
        player_id: playerId,
      }
    : createLocalGameStats(playerId);
}

function createLocalGameStats(playerId: string): GameStats {
  const now = new Date().toISOString();

  return {
    id: 'local-game-stats',
    player_id: playerId,
    play_time_seconds: 0,
    highest_combo: 0,
    achievements_unlocked: [],
    daily_login_streak: 0,
    last_daily_reward: null,
    created_at: now,
    updated_at: now,
    claimed_reward_days: [],
    last_claim_date: null,
  };
}

function createLocalProfile(userId: string, deviceId: string): PlayerProfile {
  const now = new Date().toISOString();
  const playerName = deviceIdentity.getPlayerName();

  return {
    id: userId,
    username: playerName,
    total_money: 100,
    lifetime_earnings: 0,
    money_per_click: 1,
    total_clicks: 0,
    prestige_points: 0,
    selected_character_id: LOCAL_MIKE_CHARACTER_ID,
    selected_house_id: LOCAL_STARTER_HOUSE_ID,
    selected_car_id: null,
    created_at: now,
    last_played_at: now,
    device_id: deviceId,
    display_name: playerName,
    auth_user_id: userId,
    linked_at: null,
    hourly_income: 0,
    current_job_id: null,
    gems: 0,
    last_claim_time: now,
    last_claim_reset_date: null,
    daily_claimed_total: 0,
    claim_locked_until: null,
    last_ad_watch_time: null,
    times_reset: 0,
    last_reset_at: null,
    job_income: 0,
    business_income: 0,
    investment_income: 0,
    house_rent_expense: 0,
    vehicle_expense: 0,
    other_expenses: 0,
    gross_income: 0,
    total_expenses: 0,
    selected_outfit_id: LOCAL_STARTER_OUTFIT_ID,
    cashback_pool: 0,
    cashback_claimed_total: 0,
    premium_bank_card_owned: false,
    premium_bank_card_purchased_at: null,
    premium_bank_card_purchase_source: null,
    health: DEFAULT_HEALTH,
    happiness: DEFAULT_HAPPINESS,
    health_action_cooldowns: {},
    health_ad_cooldown_until: null,
    happiness_action_cooldowns: {},
    happiness_ad_cooldown_until: null,
  };
}

function getCurrentQuestFromProgress(progress: QuestProgress) {
  const chapterQuests = getQuestsForChapter(progress.unlockedChapterIndex);

  return (
    chapterQuests.find((quest) => progress.claimableQuestIds.includes(quest.id)) ||
    chapterQuests.find((quest) => !progress.completedQuestIds.includes(quest.id)) ||
    null
  );
}

function syncQuestPrestige(profile: PlayerProfile, questProgress: QuestProgress): PlayerProfile {
  const questPrestige = calculatePrestigeFromQuestProgress(questProgress);

  return {
    ...profile,
    bonus_prestige_points: questPrestige,
    prestige_points: questPrestige,
  } as PlayerProfile;
}

function migrateLocalBusinesses(
  storedBusinesses: BusinessWithPlayerData[] | undefined,
  seedBusinesses: BusinessWithPlayerData[]
): BusinessWithPlayerData[] {
  if (!storedBusinesses?.length) return seedBusinesses;

  return seedBusinesses.map((seedBusiness) => {
    const storedBusiness =
      storedBusinesses.find((business) => business.id === seedBusiness.id) ||
      storedBusinesses.find((business) => business.unlock_order === seedBusiness.unlock_order) ||
      storedBusinesses.find((business) => business.name === seedBusiness.name);

    if (!storedBusiness) {
      return seedBusiness;
    }

    const currentLevel = storedBusiness.current_level ?? seedBusiness.current_level ?? 1;
    const resolvedPrestigePoints = getBusinessPrestigeForLevel(seedBusiness.id, currentLevel);

    return {
      ...seedBusiness,
      is_owned: storedBusiness.is_owned ?? seedBusiness.is_owned,
      can_unlock: storedBusiness.can_unlock ?? seedBusiness.can_unlock,
      current_level: currentLevel,
      current_hourly_income: storedBusiness.current_hourly_income ?? seedBusiness.current_hourly_income,
      total_invested: storedBusiness.total_invested ?? seedBusiness.total_invested,
      current_prestige_points: resolvedPrestigePoints,
    };
  });
}

function migrateLocalInvestments(
  storedInvestments: InvestmentWithPlayerData[] | undefined,
  seedInvestments: InvestmentWithPlayerData[]
): InvestmentWithPlayerData[] {
  if (!storedInvestments?.length) return seedInvestments;

  return seedInvestments.map((seedInvestment) => {
    const storedInvestment =
      storedInvestments.find((investment) => investment.id === seedInvestment.id) ||
      storedInvestments.find((investment) => investment.sort_order === seedInvestment.sort_order) ||
      storedInvestments.find((investment) => investment.region === seedInvestment.region);

    if (!storedInvestment) {
      return seedInvestment;
    }

    return {
      ...seedInvestment,
      is_owned: storedInvestment.is_owned ?? seedInvestment.is_owned,
      current_level: storedInvestment.current_level ?? seedInvestment.current_level,
      current_rental_income:
        storedInvestment.current_rental_income ?? seedInvestment.current_rental_income,
      total_invested: storedInvestment.total_invested ?? seedInvestment.total_invested,
      purchased_at: storedInvestment.purchased_at ?? seedInvestment.purchased_at,
      upgrades_applied: storedInvestment.upgrades_applied ?? seedInvestment.upgrades_applied,
    };
  });
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

  const saveToLocalStorage = useCallback((state: Partial<GameState>) => {
    try {
      const existing = localStorage.getItem(GAME_STATE_KEY);
      const current = existing ? JSON.parse(existing) : {};
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ ...current, ...state }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

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

  const loadFromLocalStorage = useCallback((): Partial<GameState> | null => {
    try {
      const stored = localStorage.getItem(GAME_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }, []);

  const bootstrapLocalState = useCallback((reason: 'missing_profile' | 'load_error') => {
    const stored = loadFromLocalStorage();
    const baseProfile = (stored?.profile as PlayerProfile | undefined) || createLocalProfile(userId || deviceId, deviceId);
    const normalizedBaseProfile = {
      ...baseProfile,
      selected_house_id: baseProfile.selected_house_id || LOCAL_STARTER_HOUSE_ID,
    };
    const playerOutfits = ensurePlayerOutfits(
      normalizedBaseProfile.id,
      stored?.playerOutfits as PlayerOutfit[] | undefined
    );
    const selectedOutfit =
      LOCAL_OUTFITS.find((outfit) => outfit.id === (normalizedBaseProfile.selected_outfit_id || LOCAL_STARTER_OUTFIT_ID)) || null;
    const jobs = LOCAL_JOBS;
    const houses = LOCAL_HOUSES;
    const cars = LOCAL_CARS;
    const businesses = migrateLocalBusinesses(
      stored?.businesses as BusinessWithPlayerData[] | undefined,
      LOCAL_BUSINESSES
    );
    const investments = migrateLocalInvestments(
      stored?.investments as InvestmentWithPlayerData[] | undefined,
      LOCAL_INVESTMENTS
    );
    const playerJobs = (stored?.playerJobs as PlayerJob[] | undefined) || [];
    const profile = recalculateLocalEconomy({
      profile: normalizedBaseProfile,
      jobs,
      playerJobs,
      businesses,
      investments,
      selectedOutfit,
    });
    const businessesPrestige = businesses
      .filter((business) => business.is_owned)
      .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0);
    const gameStats = normalizeGameStats(stored?.gameStats as GameStats | undefined, profile.id);
    const questProgress = normalizeQuestProgress(stored?.questProgress as QuestProgress | undefined);
    const bankDeposits = (stored?.bankDeposits as BankDeposit[] | undefined) || [];
    const syncedProfile = syncQuestPrestige(profile, questProgress);
    const ownedCharacters = ensureOwnedSelection(
      stored?.ownedCharacters as string[] | undefined,
      syncedProfile.selected_character_id,
      [LOCAL_MIKE_CHARACTER_ID]
    );
    const ownedHouses = ensureOwnedSelection(
      stored?.ownedHouses as string[] | undefined,
      syncedProfile.selected_house_id
    );
    const ownedCars = ensureOwnedSelection(
      stored?.ownedCars as string[] | undefined,
      syncedProfile.selected_car_id
    );

    saveToLocalStorage({
      profile: syncedProfile,
      characters: LOCAL_CHARACTERS,
      houses,
      cars,
      jobs,
      businesses,
      investments,
      businessesPrestige,
      playerJobs,
      playerOutfits,
      gameStats,
      questProgress,
      ownedCharacters,
      ownedHouses,
      ownedCars,
      selectedOutfit,
      jobChangeLockedUntil:
        typeof stored?.jobChangeLockedUntil === 'number' && stored.jobChangeLockedUntil > Date.now()
          ? stored.jobChangeLockedUntil
          : null,
      bankDeposits,
    });

    setGameState({
      profile: syncedProfile,
      characters: LOCAL_CHARACTERS,
      houses,
      cars,
      jobs,
      playerJobs,
      businesses,
      investments,
      businessesPrestige,
      gameStats,
      ownedCharacters,
      ownedHouses,
      ownedCars,
      playerOutfits,
      selectedOutfit,
      questProgress,
      loading: false,
      error: reason === 'load_error' ? 'Supabase unavailable, local mode active.' : null,
      offlineEarnings: null,
      jobChangeLockedUntil:
        typeof stored?.jobChangeLockedUntil === 'number' && stored.jobChangeLockedUntil > Date.now()
          ? stored.jobChangeLockedUntil
          : null,
      claimLockedUntil: profile.claim_locked_until || null,
      dailyClaimedTotal: profile.daily_claimed_total || 0,
      businessesLoading: false,
      unsavedJobWorkSeconds: 0,
      pendingMoneyDelta: 0,
      bankDeposits,
    });
  }, [deviceId, loadFromLocalStorage, saveToLocalStorage, userId]);

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
      const wellbeingDelta = activeJob
        ? calculateWellbeingDeltaForSeconds(activeJob, secondsToAdd)
        : null;
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
      const resumedAt = new Date().toISOString();
      const updatedProfile = {
        ...currentProfile,
        last_played_at: resumedAt,
      };

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

  const loadBusinesses = useCallback(async (profileId: string) => {
    if (!profileId) return setGameState(prev => ({ ...prev, businessesLoading: false }));
    try {
      setGameState(prev => ({ ...prev, businessesLoading: true }));
      const [result, investmentResult] = await Promise.all([
        businessService.getBusinesses(profileId),
        investmentService.getInvestments(profileId),
      ]);
      setGameState(prev => {
        if (!prev.profile) {
          return {
            ...prev,
            businesses: result.businesses,
            investments: investmentResult.investments,
            businessesPrestige: result.businessesPrestige ?? result.prestigePoints ?? 0,
            businessesLoading: false,
          };
        }

        const recalculatedProfile = recalculateLocalEconomy({
          profile: prev.profile,
          jobs: prev.jobs,
          playerJobs: prev.playerJobs,
          businesses: result.businesses,
          investments: investmentResult.investments,
          selectedOutfit: prev.selectedOutfit,
        });

        saveToLocalStorage({
          profile: recalculatedProfile,
          businesses: result.businesses,
          investments: investmentResult.investments,
          businessesPrestige: result.businessesPrestige ?? result.prestigePoints ?? 0,
        });

        return {
          ...prev,
          profile: recalculatedProfile,
          businesses: result.businesses,
          investments: investmentResult.investments,
          businessesPrestige: result.businessesPrestige ?? result.prestigePoints ?? 0,
          businessesLoading: false,
        };
      });
    } catch (error) {
      setGameState(prev => ({ ...prev, businessesLoading: false }));
    }
  }, []);

  const loadGameData = useCallback(async (shouldCalculateOfflineEarnings: boolean = true) => {
    if (!userId) return setGameState(prev => ({ ...prev, loading: false }));

    try {
      const profile = await profileService.getProfile(userId, deviceId);
      
      if (!profile) {
        bootstrapLocalState('missing_profile');
        return;
      }

      const activeId = profile.id;

      const [charactersRes, housesRes, carsRes, ownedCharacters, ownedHouses, ownedCars, jobsRes, playerJobsRes, gameStatsRes, investmentsRes] = await Promise.all([
        itemService.getCharacters(),
        itemService.getHouses(),
        itemService.getCars(),
        itemService.getOwnedCharacters(activeId),
        itemService.getOwnedHouses(activeId),
        itemService.getOwnedCars(activeId),
        jobService.getJobs(),
        jobService.getPlayerJobs(activeId),
        statsService.getGameStats(activeId),
        investmentService.getInvestments(activeId),
      ]);

      let currentProfile = profile;
      const localData = loadFromLocalStorage();
      if (!currentProfile && localData?.profile) { currentProfile = localData.profile; }
      if (currentProfile) {
        currentProfile = {
          ...currentProfile,
          selected_house_id: currentProfile.selected_house_id || LOCAL_STARTER_HOUSE_ID,
        };
      }

      const playerOutfits = ensurePlayerOutfits(
        activeId,
        (localData?.playerOutfits as PlayerOutfit[] | undefined) || undefined
      );
      let selectedOutfit = null;
      if (currentProfile?.selected_outfit_id) {
        selectedOutfit = await itemService.getSelectedOutfit(currentProfile.id);
      }
      if (!selectedOutfit) {
        selectedOutfit =
          LOCAL_OUTFITS.find((outfit) => outfit.id === (currentProfile?.selected_outfit_id || LOCAL_STARTER_OUTFIT_ID)) || null;
      }

      const normalizedOwnedCharacters = ensureOwnedSelection(
        ownedCharacters,
        currentProfile?.selected_character_id,
        [LOCAL_MIKE_CHARACTER_ID]
      );
      const normalizedOwnedHouses = ensureOwnedSelection(
        ownedHouses,
        currentProfile?.selected_house_id
      );
      const normalizedOwnedCars = ensureOwnedSelection(
        ownedCars,
        currentProfile?.selected_car_id
      );
      const normalizedGameStats = normalizeGameStats(gameStatsRes, activeId);
      const questProgress = normalizeQuestProgress(localData?.questProgress as QuestProgress | undefined);
      const bankDeposits = (localData?.bankDeposits as BankDeposit[] | undefined) || [];
      if (currentProfile) {
        currentProfile = syncQuestPrestige(currentProfile as PlayerProfile, questProgress);
      }

      const currentPending = gameStateRef.current.pendingMoneyDelta;
      let offlineEarnings = null;

      if (currentProfile && shouldCalculateOfflineEarnings) {
        offlineEarnings = calculateOfflineEarnings(currentProfile);

        if (offlineEarnings) {
          currentProfile = {
            ...currentProfile,
            last_played_at: new Date().toISOString(),
          };
          saveToLocalStorage({ profile: currentProfile });
        }
      }

      if (currentProfile) { currentProfile = { ...currentProfile, total_money: currentProfile.total_money + currentPending }; }
      const storedJobCooldown =
        typeof localData?.jobChangeLockedUntil === 'number' && localData.jobChangeLockedUntil > Date.now()
          ? localData.jobChangeLockedUntil
          : null;
      const currentJobCooldown =
        gameStateRef.current.jobChangeLockedUntil && gameStateRef.current.jobChangeLockedUntil > Date.now()
          ? gameStateRef.current.jobChangeLockedUntil
          : storedJobCooldown;

      setGameState({
        profile: currentProfile,
        characters: charactersRes || [],
        houses: housesRes || [],
        cars: carsRes || [],
        jobs: jobsRes || [],
        playerJobs: playerJobsRes || [],
        businesses: [],
        investments: investmentsRes?.investments || [],
        businessesPrestige: 0,
        gameStats: normalizedGameStats,
        ownedCharacters: normalizedOwnedCharacters,
        ownedHouses: normalizedOwnedHouses,
        ownedCars: normalizedOwnedCars,
        playerOutfits,
        selectedOutfit,
        questProgress,
        loading: false,
        error: null,
        offlineEarnings,
        jobChangeLockedUntil: currentJobCooldown,
        claimLockedUntil: currentProfile?.claim_locked_until || null,
        dailyClaimedTotal: currentProfile?.daily_claimed_total || 0,
        businessesLoading: true,
        unsavedJobWorkSeconds: 0,
        pendingMoneyDelta: currentPending,
        bankDeposits,
      });

      saveToLocalStorage({
        profile: currentProfile,
        characters: charactersRes || [],
        houses: housesRes || [],
        cars: carsRes || [],
        jobs: jobsRes || [],
        playerJobs: playerJobsRes || [],
        investments: investmentsRes?.investments || [],
        gameStats: normalizedGameStats,
        ownedCharacters: normalizedOwnedCharacters,
        ownedHouses: normalizedOwnedHouses,
        ownedCars: normalizedOwnedCars,
        playerOutfits,
        selectedOutfit,
        questProgress,
        jobChangeLockedUntil: currentJobCooldown,
        bankDeposits,
      });

      loadBusinesses(activeId);
    } catch (error) {
      console.error('Error loading game data:', error);
      bootstrapLocalState('load_error');
    }
  }, [userId, deviceId, loadFromLocalStorage, loadBusinesses, bootstrapLocalState]);

  useEffect(() => {
    if (questRewardInFlightRef.current) return;
    if (!gameState.profile) return;
    const openChapterQuests = getQuestsForChapter(gameState.questProgress.unlockedChapterIndex);
    if (!openChapterQuests.length) return;

    const snapshot = {
      profile: gameState.profile,
      questProgress: gameState.questProgress,
      gameStats: gameState.gameStats,
      cars: gameState.cars,
      jobs: gameState.jobs,
      playerJobs: gameState.playerJobs,
      unsavedJobWorkSeconds: gameState.unsavedJobWorkSeconds,
      ownedCars: gameState.ownedCars,
      playerOutfits: gameState.playerOutfits,
      businesses: gameState.businesses,
      investments: gameState.investments,
    };

    const newlyCompletedQuestIds = openChapterQuests
      .filter((quest) => {
        const alreadyTracked =
          gameState.questProgress.completedQuestIds.includes(quest.id) ||
          gameState.questProgress.claimableQuestIds.includes(quest.id);

        if (alreadyTracked) return false;
        return isQuestCompleted(quest, snapshot);
      })
      .map((quest) => quest.id);

    const openChapter = getQuestChapterByIndex(gameState.questProgress.unlockedChapterIndex);
    const chapterQuestIds = openChapterQuests.map((quest) => quest.id);
    const completedQuestIds = [
      ...new Set([...gameState.questProgress.completedQuestIds, ...newlyCompletedQuestIds]),
    ];
    const chapterCompleted =
      chapterQuestIds.length > 0 &&
      chapterQuestIds.every((questId) => completedQuestIds.includes(questId));
    const shouldUnlockChapterReward =
      Boolean(openChapter) &&
      chapterCompleted &&
      !gameState.questProgress.claimableChapterRewardId &&
      !gameState.questProgress.claimedChapterRewardIds.includes(openChapter!.id);

    if (!newlyCompletedQuestIds.length && !shouldUnlockChapterReward) return;

    questRewardInFlightRef.current = true;
    setGameState((prev) => {
      const currentChapter = getQuestChapterByIndex(prev.questProgress.unlockedChapterIndex);
      const nextQuestProgress: QuestProgress = {
        ...prev.questProgress,
        completedQuestIds: [
          ...new Set([...prev.questProgress.completedQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableQuestIds: [
          ...new Set([...prev.questProgress.claimableQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableChapterRewardId:
          shouldUnlockChapterReward && currentChapter ? currentChapter.id : prev.questProgress.claimableChapterRewardId,
      };
      const nextProfile = prev.profile ? syncQuestPrestige(prev.profile as PlayerProfile, nextQuestProgress) : prev.profile;

      saveToLocalStorage({
        profile: nextProfile,
        questProgress: nextQuestProgress,
      });

      questRewardInFlightRef.current = false;
      return {
        ...prev,
        profile: nextProfile,
        questProgress: nextQuestProgress,
      };
    });
  }, [
    gameState.profile,
    gameState.gameStats,
    gameState.cars,
    gameState.jobs,
    gameState.playerJobs,
    gameState.ownedCars,
    gameState.unsavedJobWorkSeconds,
    gameState.playerOutfits,
    gameState.businesses,
    gameState.investments,
    gameState.questProgress,
    saveToLocalStorage,
  ]);

  const claimQuestReward = useCallback(async (questId?: string, rewardMultiplier = 1) => {
    const claimableQuestId = questId || gameState.questProgress.claimableQuestIds[0];
    const activeQuest = LOCAL_QUESTS.find((quest) => quest.id === claimableQuestId);

    if (!gameState.profile || !claimableQuestId || !activeQuest) {
      return null;
    }

    const normalizedRewardMultiplier = rewardMultiplier > 1 ? 2 : 1;
    const finalRewardMoney = activeQuest.reward_money * normalizedRewardMultiplier;
    const finalRewardGems =
      activeQuest.reward_gems > 0
        ? activeQuest.reward_gems + (rewardMultiplier > 1 ? 2 : 0)
        : 0;

    const nextQuestProgress: QuestProgress = {
      ...gameState.questProgress,
      completedQuestIds: [
        ...new Set([...gameState.questProgress.completedQuestIds, activeQuest.id]),
      ],
      claimedQuestIds: [...gameState.questProgress.claimedQuestIds, activeQuest.id],
      claimableQuestIds: gameState.questProgress.claimableQuestIds.filter((id) => id !== activeQuest.id),
      totalClaimedMoney: gameState.questProgress.totalClaimedMoney + finalRewardMoney,
      totalClaimedGems: gameState.questProgress.totalClaimedGems + finalRewardGems,
    };
    const nextProfile = syncQuestPrestige({
      ...gameState.profile,
      total_money: Number(gameState.profile.total_money || 0) + finalRewardMoney,
      lifetime_earnings: Number(gameState.profile.lifetime_earnings || 0) + finalRewardMoney,
      gems: Number(gameState.profile.gems || 0) + finalRewardGems,
    } as PlayerProfile, nextQuestProgress);

    setGameState((prev) => ({
      ...prev,
      profile: nextProfile,
      questProgress: nextQuestProgress,
    }));

    saveToLocalStorage({
      profile: nextProfile,
      questProgress: nextQuestProgress,
    });

    return {
      success: true,
      rewardMoney: finalRewardMoney,
      rewardGems: finalRewardGems,
      questId: activeQuest.id,
    };
  }, [gameState.profile, gameState.questProgress, saveToLocalStorage]);

  const claimQuestChapterReward = useCallback(async () => {
    const claimableChapterRewardId = gameState.questProgress.claimableChapterRewardId;
    const chapterIndex = gameState.questProgress.unlockedChapterIndex;
    const chapter = getQuestChapterByIndex(chapterIndex);

    if (!gameState.profile || !claimableChapterRewardId || !chapter || chapter.id !== claimableChapterRewardId) {
      return null;
    }

    const nextQuestProgress: QuestProgress = {
      ...gameState.questProgress,
      unlockedChapterIndex: Math.min(gameState.questProgress.unlockedChapterIndex + 1, 9),
      claimableChapterRewardId: null,
      claimedChapterRewardIds: [...gameState.questProgress.claimedChapterRewardIds, chapter.id],
      totalClaimedMoney: gameState.questProgress.totalClaimedMoney,
      totalClaimedGems: gameState.questProgress.totalClaimedGems,
    };
    const nextProfile = syncQuestPrestige({
      ...gameState.profile,
    } as PlayerProfile, nextQuestProgress);

    setGameState((prev) => ({
      ...prev,
      profile: nextProfile,
      questProgress: nextQuestProgress,
    }));

    saveToLocalStorage({
      profile: nextProfile,
      questProgress: nextQuestProgress,
    });

    return {
      success: true,
      rewardPrestigePoints: chapter.reward_prestige_points,
      chapterId: chapter.id,
    };
  }, [gameState.profile, gameState.questProgress, saveToLocalStorage]);

  // EKSİK OLAN VE OYUNUN AÇILMASINI ENGELLEYEN İLK VERİ YÜKLEYİCİ
  useEffect(() => {
    if (userId) {
      loadGameData(true);
    }
  }, [userId, loadGameData]);

  const saveProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return;
    try {
      await profileService.updateProfile(activeId, updates);
      const updatedProfile = { ...gameState.profile!, ...updates };
      gameStateRef.current = {
        ...gameStateRef.current,
        profile: updatedProfile,
      };
      setGameState(prev => ({ ...prev, profile: updatedProfile }));
      saveToLocalStorage({ profile: updatedProfile });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [gameState.profile, saveToLocalStorage]);

  const applyHealthAction = useCallback(async (actionKey: HealthActionKey) => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const action = HEALTH_ACTIONS.find((entry) => entry.key === actionKey);
    if (!action) {
      return { success: false, appliedAmount: 0 };
    }

    if (getHealthCooldownRemaining(currentProfile, actionKey) > 0) {
      return { success: false, appliedAmount: 0 };
    }

    if (Number(currentProfile.total_money || 0) < action.cost) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHealth = Number(currentProfile.health ?? DEFAULT_HEALTH);
    const nextHealth = Math.min(100, currentHealth + action.healthIncreasePercent);
    const appliedAmount = Math.max(0, nextHealth - currentHealth);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      total_money: Math.max(0, Number(currentProfile.total_money || 0) - action.cost),
      health: nextHealth,
      health_action_cooldowns: {
        ...(currentProfile.health_action_cooldowns || {}),
        [actionKey]: new Date(Date.now() + action.cooldownSeconds * 1000).toISOString(),
      },
    });

    await profileService.updateProfile(activeId, updatedProfile);
    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, saveToLocalStorage]);

  const applyHealthAdBoost = useCallback(async () => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHealth = Number(currentProfile.health ?? DEFAULT_HEALTH);
    const nextHealth = Math.min(100, currentHealth + HEALTH_AD_BOOST_PERCENT);
    const appliedAmount = Math.max(0, nextHealth - currentHealth);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      health: nextHealth,
      health_ad_cooldown_until: null,
    });

    await profileService.updateProfile(activeId, updatedProfile);
    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, saveToLocalStorage]);

  const applyHappinessAction = useCallback(async (actionKey: HappinessActionKey) => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const action = HAPPINESS_ACTIONS.find((entry) => entry.key === actionKey);
    if (!action) {
      return { success: false, appliedAmount: 0 };
    }

    if (getHappinessCooldownRemaining(currentProfile, actionKey) > 0) {
      return { success: false, appliedAmount: 0 };
    }

    if (Number(currentProfile.total_money || 0) < action.cost) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHappiness = Number(currentProfile.happiness ?? DEFAULT_HAPPINESS);
    const nextHappiness = Math.min(100, currentHappiness + action.happinessIncreasePercent);
    const appliedAmount = Math.max(0, nextHappiness - currentHappiness);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      total_money: Math.max(0, Number(currentProfile.total_money || 0) - action.cost),
      happiness: nextHappiness,
      happiness_action_cooldowns: {
        ...(currentProfile.happiness_action_cooldowns || {}),
        [actionKey]: new Date(Date.now() + action.cooldownSeconds * 1000).toISOString(),
      },
    });

    await profileService.updateProfile(activeId, updatedProfile);
    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, saveToLocalStorage]);

  const applyHappinessAdBoost = useCallback(async () => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHappiness = Number(currentProfile.happiness ?? DEFAULT_HAPPINESS);
    const nextHappiness = Math.min(100, currentHappiness + HAPPINESS_AD_BOOST_PERCENT);
    const appliedAmount = Math.max(0, nextHappiness - currentHappiness);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      happiness: nextHappiness,
      happiness_ad_cooldown_until: null,
    });

    await profileService.updateProfile(activeId, updatedProfile);
    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, saveToLocalStorage]);

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

  const purchaseitem = useCallback(async (itemType: 'character' | 'house' | 'car', itemId: string, price: number) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    if (itemType !== 'house' && gameState.profile!.total_money < price) return false;
    if (itemType === 'car') {
      const targetCar = gameState.cars.find((car) => car.id === itemId);
      if (!targetCar || !canAccessCarWithPrestige(targetCar, Number(gameState.profile?.prestige_points || 0))) {
        return false;
      }
    }

    try {
      if (itemType === 'car') {
        moneyMutationInFlightRef.current = true;
        await flushPendingIfNeeded();
        await purchaseService.purchaseCarViaRPC(activeId, itemId, price);
        moneyMutationInFlightRef.current = false;
        await loadGameData(false);
        return true;
      } else {
        await purchaseService.purchaseGeneralItem(activeId, itemType, itemId, price);

        setGameState(prev => {
          const newOwned =
            itemType === 'character'
              ? Array.from(new Set([...prev.ownedCharacters, itemId]))
              : Array.from(new Set([...prev.ownedHouses, itemId]));
          return {
            ...prev,
            [itemType === 'character' ? 'ownedCharacters' : 'ownedHouses']: newOwned,
          };
        });
        await loadGameData(false);
        return true;
      }
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile, gameState.cars, loadGameData, flushPendingIfNeeded]);

  const selectCar = useCallback(async (carId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    if (!gameState.ownedCars.includes(carId)) return false;
    const currentCar = gameState.cars.find((car) => car.id === gameState.profile?.selected_car_id);
    const targetCar = gameState.cars.find((car) => car.id === carId);
    if (!targetCar) return false;
    if (currentCar && targetCar.level < currentCar.level) return false;
    try {
      await itemService.selectCar(activeId, carId);
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [gameState.profile?.id, gameState.profile?.selected_car_id, gameState.ownedCars, gameState.cars, loadGameData]);

  const selectHouse = useCallback(async (houseId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    const targetHouse = gameState.houses.find((house) => house.id === houseId);
    const currentHouse = gameState.houses.find((house) => house.id === gameState.profile?.selected_house_id);
    const isCurrentHouse = gameState.profile?.selected_house_id === houseId;
    if (!targetHouse || (!isCurrentHouse && !canAccessHouseWithPrestige(targetHouse, Number(gameState.profile?.prestige_points || 0)))) {
      return false;
    }
    if (currentHouse && targetHouse.level < currentHouse.level) {
      return false;
    }
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await itemService.selectHouse(activeId, houseId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false; 
    }
  }, [gameState.profile, gameState.houses, loadGameData, flushPendingIfNeeded]);

  const selectCharacter = useCallback(async (characterId: string) => {
    await saveProfile({ selected_character_id: characterId });
  }, [saveProfile]);

  const unlockJob = useCallback(async (jobId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      await jobService.unlockJob(activeId, jobId);
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [gameState.profile?.id, loadGameData]);

  const selectJob = useCallback(async (jobId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    if (gameState.jobChangeLockedUntil && Date.now() < gameState.jobChangeLockedUntil) return false;

    const currentActiveJob = gameState.playerJobs.find(pj => pj.is_active);
    const unsaved = gameState.unsavedJobWorkSeconds;

    try {
      const result = await jobService.selectJob(activeId, jobId, currentActiveJob, unsaved);
      gameStateRef.current = {
        ...gameStateRef.current,
        jobChangeLockedUntil: result.lockedUntil,
        unsavedJobWorkSeconds: 0,
      };
      setGameState(prev => ({ 
        ...prev, 
        jobChangeLockedUntil: result.lockedUntil, 
        unsavedJobWorkSeconds: 0 
      }));
      saveToLocalStorage({ jobChangeLockedUntil: result.lockedUntil });
      await loadGameData(false);
      return true;
    } catch (error) { return false; }
  }, [gameState.profile?.id, gameState.playerJobs, gameState.jobChangeLockedUntil, gameState.unsavedJobWorkSeconds, loadGameData]);

  const skipJobCooldown = useCallback(async () => {
    if (!gameState.profile?.id) return false;

    const activePlayerJob = gameState.playerJobs.find((job) => job.is_active);
    if (!activePlayerJob) return false;

    const activeJob = gameState.jobs.find((job) => job.id === activePlayerJob.job_id);
    if (!activeJob) return false;

    const requiredSeconds = getJobUnlockRequirementSeconds(activeJob);
    const currentWorkedSeconds =
      Number(activePlayerJob.total_time_worked_seconds || 0) + Number(gameState.unsavedJobWorkSeconds || 0);
    const missingSeconds = Math.max(0, requiredSeconds - currentWorkedSeconds);
    const syncTimestamp = new Date().toISOString();
    const nextPlayerJobs = gameState.playerJobs.map((job) =>
      job.id === activePlayerJob.id
        ? {
            ...job,
            total_time_worked_seconds: (job.total_time_worked_seconds || 0) + missingSeconds,
            last_work_started_at: syncTimestamp,
          }
        : job
    );

    gameStateRef.current = {
      ...gameStateRef.current,
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
      unsavedJobWorkSeconds: 0,
    };

    setGameState((prev) => ({
      ...prev,
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
      unsavedJobWorkSeconds: 0,
    }));

    saveToLocalStorage({
      jobChangeLockedUntil: null,
      playerJobs: nextPlayerJobs,
    });

    return true;
  }, [gameState.profile?.id, gameState.playerJobs, gameState.unsavedJobWorkSeconds, saveToLocalStorage]);

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
  }, [saveToLocalStorage]);

  const purchaseBusiness = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.purchaseBusiness(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch (error) {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, flushPendingIfNeeded]);

  const upgradeBusiness = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.upgradeBusiness(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch (error) {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, flushPendingIfNeeded]);

  const upgradeBusinessWithAdDiscount = useCallback(async (businessId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      const result = await businessService.upgradeBusinessWithAdDiscount(activeId, businessId);
      applyBusinessMutation(result);
      return true;
    } catch (error) {
      return false;
    } finally {
      moneyMutationInFlightRef.current = false;
    }
  }, [applyBusinessMutation, gameState.profile?.id, flushPendingIfNeeded]);

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
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile?.id, loadGameData, flushPendingIfNeeded]);

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
    } catch (error) {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile?.id, loadGameData, flushPendingIfNeeded]);

  const claimDailyReward = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      await rewardService.claimDailyReward(activeId);
      await loadGameData();
      return true;
    } catch (error) { return false; }
  }, [gameState.profile?.id, loadGameData]);

  const rescueDailyRewardStreak = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return { success: false, cooldown: 0 };
    try {
      const result = await rewardService.rescueDailyRewardStreak(activeId);
      await loadGameData();
      return result;
    } catch (error) { return { success: false, cooldown: 0 }; }
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
    } catch (error) {
      return { success: false, claimedAmount: 0 };
    }
  }, [gameState.profile?.id, loadGameData, saveToLocalStorage]);

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
      lifetime_earnings:
        Number(currentProfile.lifetime_earnings || 0) + claimedAmount,
      last_played_at: new Date().toISOString(),
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      offlineEarnings: null,
    }));

    saveToLocalStorage({ profile: updatedProfile });
    return true;
  }, [saveToLocalStorage]);

  const dismissOfflineEarnings = useCallback(() => {
    setGameState((prev) => ({ ...prev, offlineEarnings: null }));
  }, []);

  const startBankDeposit = useCallback(async (planId: BankDepositPlanId, amount: number) => {
    const currentProfile = gameState.profile;
    if (!currentProfile) return false;
    const hasActivePlanDeposit = gameStateRef.current.bankDeposits.some(
      (deposit) => deposit.plan_id === planId
    );
    if (hasActivePlanDeposit) return false;

    const principal = Math.floor(amount);
    const maxAmount = getBankDepositMaxAmount(Number(currentProfile.total_money || 0), planId);

    if (principal < 1000 || principal > maxAmount || principal > Number(currentProfile.total_money || 0)) {
      return false;
    }

    const deposit = createBankDeposit({
      planId,
      principal,
      hasPremiumCard: hasPremiumBankCard(currentProfile),
    });
    const updatedProfile = {
      ...currentProfile,
      total_money: Number(currentProfile.total_money || 0) - principal,
    };

    const nextDeposits = [...gameStateRef.current.bankDeposits, deposit];

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    }));

    saveToLocalStorage({
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    });

    return true;
  }, [gameState.profile, saveToLocalStorage]);

  const claimBankDeposit = useCallback(async (depositId: string) => {
    const currentProfile = gameStateRef.current.profile;
    const currentDeposits = gameStateRef.current.bankDeposits;
    if (!currentProfile) return null;

    const deposit = currentDeposits.find((entry) => entry.id === depositId);
    if (!deposit || !isBankDepositReady(deposit)) {
      return null;
    }

    const totalPayout = deposit.principal + deposit.profit;
    const updatedProfile = {
      ...currentProfile,
      total_money: Number(currentProfile.total_money || 0) + totalPayout,
      lifetime_earnings: Number(currentProfile.lifetime_earnings || 0) + deposit.profit,
    };
    const nextDeposits = currentDeposits.filter((entry) => entry.id !== depositId);

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    }));

    saveToLocalStorage({
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    });

    return {
      success: true,
      amount: totalPayout,
      profit: deposit.profit,
      deposit,
      plan: getBankDepositPlan(deposit.plan_id),
    };
  }, [saveToLocalStorage]);

  const claimCashback = useCallback(async () => {
    const currentProfile = gameStateRef.current.profile;
    if (!currentProfile) return null;

    const result = claimCashbackReward(currentProfile);
    if (!result) {
      return null;
    }

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: result.updatedProfile,
    };

    setGameState((prev) => ({
      ...prev,
      profile: result.updatedProfile,
    }));

    saveToLocalStorage({
      profile: result.updatedProfile,
    });

    return {
      success: true,
      amount: result.claimedAmount,
    };
  }, [saveToLocalStorage]);

  const purchasePremiumBankCard = useCallback(async (purchaseMethod: PremiumPurchaseMethod) => {
    const currentProfile = gameStateRef.current.profile;
    if (!currentProfile) return false;
    if (premiumBankCardMutationInFlightRef.current) return false;

    premiumBankCardMutationInFlightRef.current = true;
    try {
      const nextProfileBase = applyPremiumBankCardPurchase(currentProfile, purchaseMethod);
      if (!nextProfileBase) {
        return false;
      }

      const updatedProfile = recalculateLocalEconomy({
        profile: nextProfileBase,
        jobs: gameStateRef.current.jobs,
        playerJobs: gameStateRef.current.playerJobs,
        businesses: gameStateRef.current.businesses,
        investments: gameStateRef.current.investments,
        selectedOutfit: gameStateRef.current.selectedOutfit,
      });

      gameStateRef.current = {
        ...gameStateRef.current,
        profile: updatedProfile,
      };

      setGameState((prev) => ({
        ...prev,
        profile: updatedProfile,
      }));

      saveToLocalStorage({
        profile: updatedProfile,
      });

      return true;
    } finally {
      premiumBankCardMutationInFlightRef.current = false;
    }
  }, [saveToLocalStorage]);

  const watchAd = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return { success: false, reward: 0, cooldown: 0 };
    try {
      const result = await rewardService.watchAd(activeId);
      await loadGameData(false);
      return result;
    } catch (error) { return { success: false, reward: 0, cooldown: 0 }; }
  }, [gameState.profile?.id, loadGameData]);

  const updatePlayerName = useCallback(async (newName: string) => {
    await saveProfile({ display_name: newName, username: newName });
  }, [saveProfile]);

  const resetProgress = useCallback(async () => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    try {
      gameStateRef.current = {
        ...gameStateRef.current,
        pendingMoneyDelta: 0,
        offlineEarnings: null,
        unsavedJobWorkSeconds: 0,
        bankDeposits: [],
      };
      setGameState((prev) => ({
        ...prev,
        pendingMoneyDelta: 0,
        offlineEarnings: null,
        unsavedJobWorkSeconds: 0,
        bankDeposits: [],
      }));
      saveToLocalStorage({ bankDeposits: [] });
      await profileService.resetProgress(activeId);
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

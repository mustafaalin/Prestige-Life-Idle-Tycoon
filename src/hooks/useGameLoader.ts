import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { LOCAL_BUSINESSES } from '../data/local/businesses';
import { LOCAL_INVESTMENTS } from '../data/local/investments';
import { LOCAL_JOBS } from '../data/local/jobs';
import { LOCAL_HOUSES, LOCAL_STARTER_HOUSE_ID } from '../data/local/houses';
import { LOCAL_CARS } from '../data/local/cars';
import { LOCAL_CHARACTERS, LOCAL_MIKE_CHARACTER_ID } from '../data/local/characters';
import { LOCAL_OUTFITS, LOCAL_STARTER_OUTFIT_ID } from '../data/local/outfits';
import { normalizeQuestProgress } from '../data/local/quests';
import { recalculateLocalEconomy } from '../data/local/economy';
import { DEFAULT_HAPPINESS, DEFAULT_HEALTH, normalizeProfileWellbeing } from '../data/local/healthActions';
import { calculateOfflineEarnings, calculateOfflineWellbeingDecay } from '../utils/game/calculations';
import {
  createLocalProfile,
  ensureOwnedSelection,
  ensurePlayerOutfits,
  migrateLocalBusinesses,
  migrateLocalInvestments,
  normalizeGameStats,
  syncQuestPrestige,
} from '../utils/game/gameStateHelpers';
import * as profileService from '../services/profileService';
import * as itemService from '../services/itemService';
import * as jobService from '../services/jobService';
import * as businessService from '../services/businessService';
import * as investmentService from '../services/investmentService';
import * as statsService from '../services/statsService';
import type { BankDeposit, GameState, QuestProgress } from '../types/game';

export const GAME_STATE_KEY = 'idle_guy_game_state';

interface UseGameLoaderParams {
  deviceId: string;
  userId: string | null;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
}

export function useGameLoader({
  deviceId,
  userId,
  setGameState,
  gameStateRef,
}: UseGameLoaderParams) {

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
    } catch {
      return null;
    }
  }, []);

  const bootstrapLocalState = useCallback((reason: 'missing_profile' | 'load_error') => {
    const stored = loadFromLocalStorage();
    const baseProfile = (stored?.profile as GameState['profile']) || createLocalProfile(userId || deviceId, deviceId);
    const normalizedBaseProfile = {
      ...baseProfile!,
      selected_house_id: baseProfile?.selected_house_id || LOCAL_STARTER_HOUSE_ID,
    };
    const playerOutfits = ensurePlayerOutfits(
      normalizedBaseProfile.id,
      stored?.playerOutfits as GameState['playerOutfits'] | undefined
    );
    const selectedOutfit =
      LOCAL_OUTFITS.find(
        (outfit) => outfit.id === (normalizedBaseProfile.selected_outfit_id || LOCAL_STARTER_OUTFIT_ID)
      ) || null;
    const jobs = LOCAL_JOBS;
    const houses = LOCAL_HOUSES;
    const cars = LOCAL_CARS;
    const businesses = migrateLocalBusinesses(
      stored?.businesses as GameState['businesses'] | undefined,
      LOCAL_BUSINESSES
    );
    const investments = migrateLocalInvestments(
      stored?.investments as GameState['investments'] | undefined,
      LOCAL_INVESTMENTS
    );
    const playerJobs = (stored?.playerJobs as GameState['playerJobs'] | undefined) || [];
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
    const gameStats = normalizeGameStats(stored?.gameStats as GameState['gameStats'] | undefined, profile.id);
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
  }, [deviceId, loadFromLocalStorage, saveToLocalStorage, setGameState, userId]);

  const loadBusinesses = useCallback(async (profileId: string) => {
    if (!profileId) {
      setGameState((prev) => ({ ...prev, businessesLoading: false }));
      return;
    }
    try {
      setGameState((prev) => ({ ...prev, businessesLoading: true }));
      const [result, investmentResult] = await Promise.all([
        businessService.getBusinesses(profileId),
        investmentService.getInvestments(profileId),
      ]);
      setGameState((prev) => {
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
    } catch {
      setGameState((prev) => ({ ...prev, businessesLoading: false }));
    }
  }, [saveToLocalStorage, setGameState]);

  const loadGameData = useCallback(async (shouldCalculateOfflineEarnings = true) => {
    if (!userId) {
      setGameState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const profile = await profileService.getProfile(userId, deviceId);

      if (!profile) {
        bootstrapLocalState('missing_profile');
        return;
      }

      const activeId = profile.id;

      const [
        charactersRes,
        housesRes,
        carsRes,
        ownedCharacters,
        ownedHouses,
        ownedCars,
        jobsRes,
        playerJobsRes,
        gameStatsRes,
        investmentsRes,
      ] = await Promise.all([
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
      if (!currentProfile && localData?.profile) {
        currentProfile = localData.profile as typeof profile;
      }
      if (currentProfile) {
        currentProfile = {
          ...currentProfile,
          selected_house_id: currentProfile.selected_house_id || LOCAL_STARTER_HOUSE_ID,
        };
      }

      const playerOutfits = ensurePlayerOutfits(
        activeId,
        (localData?.playerOutfits as GameState['playerOutfits'] | undefined) || undefined
      );
      let selectedOutfit = null;
      if (currentProfile?.selected_outfit_id) {
        selectedOutfit = await itemService.getSelectedOutfit(currentProfile.id);
      }
      if (!selectedOutfit) {
        selectedOutfit =
          LOCAL_OUTFITS.find(
            (outfit) => outfit.id === (currentProfile?.selected_outfit_id || LOCAL_STARTER_OUTFIT_ID)
          ) || null;
      }

      const normalizedOwnedCharacters = ensureOwnedSelection(
        ownedCharacters,
        currentProfile?.selected_character_id,
        [LOCAL_MIKE_CHARACTER_ID]
      );
      const normalizedOwnedHouses = ensureOwnedSelection(ownedHouses, currentProfile?.selected_house_id);
      const normalizedOwnedCars = ensureOwnedSelection(ownedCars, currentProfile?.selected_car_id);
      const normalizedGameStats = normalizeGameStats(gameStatsRes, activeId);
      const questProgress = normalizeQuestProgress(localData?.questProgress as QuestProgress | undefined);
      const bankDeposits = (localData?.bankDeposits as BankDeposit[] | undefined) || [];

      if (currentProfile) {
        currentProfile = syncQuestPrestige(currentProfile, questProgress);
      }

      const currentPending = gameStateRef.current.pendingMoneyDelta;
      let offlineEarnings = null;

      if (currentProfile && shouldCalculateOfflineEarnings) {
        offlineEarnings = calculateOfflineEarnings(currentProfile);

        const activePlayerJob = (playerJobsRes || []).find((pj) => pj.is_active);
        const activeJob = activePlayerJob
          ? (jobsRes || []).find((j) => j.id === activePlayerJob.job_id) ?? null
          : null;
        const selectedCar =
          (carsRes || []).find((c) => c.id === currentProfile!.selected_car_id) ?? null;
        const selectedHouse =
          (housesRes || []).find((h) => h.id === currentProfile!.selected_house_id) ?? null;

        const wellbeingDecay = calculateOfflineWellbeingDecay(
          [activeJob, selectedCar, selectedHouse],
          currentProfile.last_played_at
        );

        if (wellbeingDecay || offlineEarnings) {
          currentProfile = normalizeProfileWellbeing({
            ...currentProfile,
            health: Number(currentProfile.health ?? DEFAULT_HEALTH) + (wellbeingDecay?.health ?? 0),
            happiness:
              Number(currentProfile.happiness ?? DEFAULT_HAPPINESS) + (wellbeingDecay?.happiness ?? 0),
            last_played_at: new Date().toISOString(),
          });
          saveToLocalStorage({ profile: currentProfile });
        }
      }

      if (currentProfile) {
        currentProfile = { ...currentProfile, total_money: currentProfile.total_money + currentPending };
      }

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
  }, [
    userId,
    deviceId,
    loadFromLocalStorage,
    loadBusinesses,
    bootstrapLocalState,
    saveToLocalStorage,
    setGameState,
    gameStateRef,
  ]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    loadGameData,
    bootstrapLocalState,
  };
}

import { deviceIdentity } from '../lib/deviceIdentity';
import type { Database } from '../lib/database.types';
import { getLocalGameStats, getLocalProfile, saveLocalGameState } from '../data/local/storage';
import { LOCAL_CHARACTERS, LOCAL_MIKE_CHARACTER_ID } from '../data/local/characters';
import { LOCAL_STARTER_HOUSE_ID } from '../data/local/houses';
import { LOCAL_CARS } from '../data/local/cars';
import { LOCAL_JOBS } from '../data/local/jobs';
import { LOCAL_BUSINESSES } from '../data/local/businesses';
import { LOCAL_INVESTMENTS } from '../data/local/investments';
import { createStarterPlayerOutfit, LOCAL_OUTFITS, LOCAL_STARTER_OUTFIT_ID } from '../data/local/outfits';
import { createInitialQuestProgress } from '../data/local/quests';
import { clearLocalStorage } from '../utils/game/storage';
import { normalizeAccumulatedClaimProfile } from '../data/local/rewards';
import {
  DEFAULT_HAPPINESS,
  DEFAULT_HEALTH,
  hasWellbeingDefaults,
  normalizeProfileWellbeing,
} from '../data/local/healthActions';
import type { HappinessActionKey, HealthActionKey } from '../types/game';

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

function createInitialGameStats(userId: string, now: string) {
  return {
    id: 'local-game-stats',
    player_id: userId,
    play_time_seconds: 0,
    highest_combo: 0,
    achievements_unlocked: [],
    daily_login_streak: 0,
    last_daily_reward: null,
    created_at: now,
    updated_at: now,
    claimed_reward_days: [],
    last_claim_date: null,
  } as any;
}

function createBaseProfile(params: {
  userId: string;
  deviceId: string;
  now: string;
  playerName: string;
  timesReset: number;
  lastResetAt: string | null;
}): PlayerProfile {
  const { userId, deviceId, now, playerName, timesReset, lastResetAt } = params;

  return {
    id: userId,
    username: playerName,
    total_money: 100,
    lifetime_earnings: 0,
    money_per_click: 1,
    total_clicks: 0,
    prestige_points: 0,
    bonus_prestige_points: 0,
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
    times_reset: timesReset,
    last_reset_at: lastResetAt,
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

export async function getProfile(userId: string, deviceId?: string) {
  void userId;
  void deviceId;
  const storedProfile = getLocalProfile();
  if (!storedProfile) {
    return null;
  }

  const normalizedClaimProfile = normalizeAccumulatedClaimProfile(storedProfile);
  const normalizedProfile = normalizeProfileWellbeing(normalizedClaimProfile.profile);
  if (normalizedClaimProfile.changed || !hasWellbeingDefaults(normalizedClaimProfile.profile)) {
    saveLocalGameState({ profile: normalizedProfile });
  }

  return normalizedProfile;
}

export async function createProfile(userId: string, deviceId: string) {
  const playerName = deviceIdentity.getPlayerName();
  const existingProfile = getLocalProfile();
  if (existingProfile) return existingProfile;

  const now = new Date().toISOString();
  const profile = createBaseProfile({
    userId,
    deviceId,
    now,
    playerName,
    timesReset: 0,
    lastResetAt: null,
  });

  const existingStats = getLocalGameStats();
  saveLocalGameState({
    profile,
    characters: LOCAL_CHARACTERS,
    houses: [],
    cars: LOCAL_CARS,
    jobs: LOCAL_JOBS,
    playerJobs: [],
    businesses: LOCAL_BUSINESSES,
    ownedHouses: [LOCAL_STARTER_HOUSE_ID],
    ownedCars: [],
    ownedCharacters: [LOCAL_MIKE_CHARACTER_ID],
    investments: LOCAL_INVESTMENTS,
    playerOutfits: [createStarterPlayerOutfit(userId)],
    selectedOutfit: LOCAL_OUTFITS.find((outfit) => outfit.id === LOCAL_STARTER_OUTFIT_ID) || null,
    questProgress: createInitialQuestProgress(),
    gameStats: existingStats || createInitialGameStats(userId, now),
  });
  return profile;
}

export async function updateProfile(userId: string, updates: Partial<PlayerProfile>) {
  void userId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const updatedProfile = normalizeProfileWellbeing({ ...profile, ...updates });
  saveLocalGameState({ profile: updatedProfile });
  return updatedProfile;
}

export async function resetProgress(userId: string) {
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const now = new Date().toISOString();
  const playerName = profile.display_name || profile.username || deviceIdentity.getPlayerName();
  const deviceId = profile.device_id || deviceIdentity.getDeviceId() || deviceIdentity.initialize().deviceId;
  const iapGems = Number(profile.iap_gems_total || 0);
  const iapMoney = Number(profile.iap_money_total || 0);
  const freshProfile = {
    ...createBaseProfile({
      userId,
      deviceId,
      now,
      playerName,
      timesReset: Number(profile.times_reset || 0) + 1,
      lastResetAt: now,
    }),
    gems: iapGems,
    total_money: 100 + iapMoney,
    iap_gems_total: iapGems,
    iap_money_total: iapMoney,
  };

  clearLocalStorage();
  saveLocalGameState({
    profile: freshProfile,
    characters: LOCAL_CHARACTERS,
    houses: [],
    cars: LOCAL_CARS,
    jobs: LOCAL_JOBS,
    playerJobs: [],
    businesses: LOCAL_BUSINESSES,
    investments: LOCAL_INVESTMENTS,
    ownedCharacters: [LOCAL_MIKE_CHARACTER_ID],
    ownedHouses: [LOCAL_STARTER_HOUSE_ID],
    ownedCars: [],
    playerOutfits: [createStarterPlayerOutfit(userId)],
    selectedOutfit: LOCAL_OUTFITS.find((outfit) => outfit.id === LOCAL_STARTER_OUTFIT_ID) || null,
    questProgress: createInitialQuestProgress(),
    gameStats: createInitialGameStats(userId, now),
  });
  return true;
}

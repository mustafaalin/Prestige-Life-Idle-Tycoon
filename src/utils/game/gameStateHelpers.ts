import { deviceIdentity } from '../../lib/deviceIdentity';
import type { Database } from '../../lib/database.types';
import { LOCAL_MIKE_CHARACTER_ID } from '../../data/local/characters';
import { LOCAL_STARTER_HOUSE_ID } from '../../data/local/houses';
import { LOCAL_STARTER_OUTFIT_ID, createStarterPlayerOutfit } from '../../data/local/outfits';
import {
  calculatePrestigeFromQuestProgress,
  getQuestsForChapter,
} from '../../data/local/quests';
import { getBusinessPrestigeForLevel } from '../../data/local/businessPrestigePoints';
import { DEFAULT_HAPPINESS, DEFAULT_HEALTH } from '../../data/local/healthActions';
import type {
  BusinessWithPlayerData,
  InvestmentWithPlayerData,
  PlayerProfile,
  QuestProgress,
} from '../../types/game';

type PlayerOutfit = Database['public']['Tables']['player_outfits']['Row'];
type GameStats = Database['public']['Tables']['game_stats']['Row'];

export function ensurePlayerOutfits(playerId: string, outfits?: PlayerOutfit[]): PlayerOutfit[] {
  if (outfits?.length) {
    const hasStarter = outfits.some(
      (outfit) => outfit.outfit_id === LOCAL_STARTER_OUTFIT_ID && outfit.is_owned
    );
    return hasStarter ? outfits : [createStarterPlayerOutfit(playerId), ...outfits];
  }
  return [createStarterPlayerOutfit(playerId)];
}

export function ensureOwnedSelection(
  ids: string[] | undefined,
  selectedId: string | null,
  fallbackIds: string[] = []
): string[] {
  const nextIds = ids?.length ? [...ids] : [...fallbackIds];
  if (selectedId && !nextIds.includes(selectedId)) {
    nextIds.push(selectedId);
  }
  return nextIds;
}

export function createLocalGameStats(playerId: string): GameStats {
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

export function normalizeGameStats(
  stats: GameStats | null | undefined,
  playerId: string
): GameStats {
  return stats
    ? { ...createLocalGameStats(playerId), ...stats, player_id: playerId }
    : createLocalGameStats(playerId);
}

export function createLocalProfile(userId: string, deviceId: string): PlayerProfile {
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

export function getCurrentQuestFromProgress(progress: QuestProgress) {
  const chapterQuests = getQuestsForChapter(progress.unlockedChapterIndex);
  return (
    chapterQuests.find((quest) => progress.claimableQuestIds.includes(quest.id)) ||
    chapterQuests.find((quest) => !progress.completedQuestIds.includes(quest.id)) ||
    null
  );
}

export function syncQuestPrestige(
  profile: PlayerProfile,
  questProgress: QuestProgress
): PlayerProfile {
  const questPrestige = calculatePrestigeFromQuestProgress(questProgress);
  const resetBonus = Number((profile as PlayerProfile & { reset_prestige_bonus?: number }).reset_prestige_bonus || 0);
  const totalPrestige = questPrestige + resetBonus;
  return {
    ...profile,
    bonus_prestige_points: totalPrestige,
    prestige_points: totalPrestige,
  } as PlayerProfile;
}

export function migrateLocalBusinesses(
  storedBusinesses: BusinessWithPlayerData[] | undefined,
  seedBusinesses: BusinessWithPlayerData[]
): BusinessWithPlayerData[] {
  if (!storedBusinesses?.length) return seedBusinesses;

  return seedBusinesses.map((seedBusiness) => {
    const storedBusiness =
      storedBusinesses.find((b) => b.id === seedBusiness.id) ||
      storedBusinesses.find((b) => b.unlock_order === seedBusiness.unlock_order) ||
      storedBusinesses.find((b) => b.name === seedBusiness.name);

    if (!storedBusiness) return seedBusiness;

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

export function migrateLocalInvestments(
  storedInvestments: InvestmentWithPlayerData[] | undefined,
  seedInvestments: InvestmentWithPlayerData[]
): InvestmentWithPlayerData[] {
  if (!storedInvestments?.length) return seedInvestments;

  return seedInvestments.map((seedInvestment) => {
    const storedInvestment =
      storedInvestments.find((i) => i.id === seedInvestment.id) ||
      storedInvestments.find((i) => i.sort_order === seedInvestment.sort_order) ||
      storedInvestments.find((i) => i.region === seedInvestment.region);

    if (!storedInvestment) return seedInvestment;

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


import type { Database } from '../lib/database.types';

export type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'] & {
  bonus_prestige_points?: number;
  cashback_pool?: number;
  cashback_claimed_total?: number;
  premium_bank_card_owned?: boolean;
  premium_bank_card_purchased_at?: string | null;
  premium_bank_card_purchase_source?: 'gems' | 'cash' | null;
};
export type Character = Database['public']['Tables']['characters']['Row'];
export type House = Database['public']['Tables']['houses']['Row'];
export type Car = Database['public']['Tables']['cars']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];
export type GameStats = Database['public']['Tables']['game_stats']['Row'];
export type CharacterOutfit = Database['public']['Tables']['character_outfits']['Row'];
export type PlayerOutfit = Database['public']['Tables']['player_outfits']['Row'];
export type InvestmentUpgradeKey =
  | 'paint'
  | 'appliances'
  | 'furniture'
  | 'internet'
  | 'parking';
export type BankDepositPlanId = 'quick' | 'growth' | 'premium_ad';

export type QuestTargetScreen = 'shop' | 'job' | 'business' | 'investments' | 'stuff';

export type QuestCondition =
  | { type: 'start_job' }
  | { type: 'daily_reward_claimed' }
  | { type: 'job_time_seconds'; jobLevel: number; seconds: number }
  | { type: 'active_job_level'; level: number }
  | { type: 'owned_car_count'; count: number }
  | { type: 'owned_car_level_at_least'; level: number }
  | { type: 'selected_house_level'; level: number }
  | { type: 'owned_outfit_count'; count: number }
  | { type: 'prestige_at_least'; amount: number }
  | { type: 'owned_business_count'; count: number }
  | { type: 'business_level_at_least'; level: number }
  | { type: 'business_level_at_least_count'; level: number; count: number }
  | { type: 'business_total_upgrade_count'; count: number }
  | { type: 'accumulated_money_claimed_once' }
  | { type: 'accumulated_money_claim_count'; count: number }
  | { type: 'claimed_quest_count'; count: number }
  | { type: 'daily_streak_at_least'; count: number }
  | { type: 'owned_investment_count'; count: number }
  | { type: 'investment_level_at_least'; level: number }
  | { type: 'investment_level_at_least_count'; level: number; count: number }
  | { type: 'investment_total_upgrade_count'; count: number }
  | { type: 'full_upgraded_property_count'; count: number }
  | { type: 'investment_income_at_least'; amount: number };

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  reward_money: number;
  reward_gems: number;
  target_screen: QuestTargetScreen;
  condition: QuestCondition;
}

export interface QuestChapterDefinition {
  id: string;
  title: string;
  reward_prestige_points: number;
}

export interface QuestProgress {
  unlockedChapterIndex: number;
  completedQuestIds: string[];
  claimedQuestIds: string[];
  claimableQuestIds: string[];
  claimableChapterRewardId: string | null;
  claimedChapterRewardIds: string[];
  totalClaimedMoney: number;
  totalClaimedGems: number;
  accumulatedMoneyClaimCount: number;
}

export interface OfflineEarnings {
  amount: number;
  minutes: number;
  appliedMinutes: number;
}

export interface BankDeposit {
  id: string;
  plan_id: BankDepositPlanId;
  principal: number;
  profit: number;
  started_at: string;
  matures_at: string;
  ad_required: boolean;
  ad_completed: boolean;
}

export interface GameState {
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
  offlineEarnings: OfflineEarnings | null;
  jobChangeLockedUntil: number | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
  pendingMoneyDelta: number;
  bankDeposits: BankDeposit[];
}

export interface BusinessWithPlayerData {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  base_hourly_income: number;
  unlock_order: number;
  icon_name: string;
  icon_url?: string;
  prestige_points: number;
  is_owned?: boolean;
  can_unlock?: boolean;
  current_level?: number;
  current_hourly_income?: number;
  total_invested?: number;
  current_prestige_points?: number;
}

export interface InvestmentWithPlayerData {
  id: string;
  name: string;
  region: string;
  description: string;
  category: 'real-estate';
  price: number;
  base_rental_income: number;
  image_url?: string | null;
  sort_order: number;
  is_owned?: boolean;
  current_level?: number;
  current_rental_income?: number;
  total_invested?: number;
  purchased_at?: string | null;
  upgrades_applied?: InvestmentUpgradeKey[];
}

export interface PurchaseResult {
  success: boolean;
  message?: string;
  new_balance?: number;
}

export interface ClaimResult {
  success: boolean;
  error?: string;
  claimed_amount?: number;
  new_total?: number;
}

export interface AdRewardResult {
  success: boolean;
  reward: number;
  cooldown: number;
}

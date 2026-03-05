import type { Database } from '../lib/database.types';

export type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];
export type Character = Database['public']['Tables']['characters']['Row'];
export type House = Database['public']['Tables']['houses']['Row'];
export type Car = Database['public']['Tables']['cars']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];
export type GameStats = Database['public']['Tables']['game_stats']['Row'];
export type CharacterOutfit = Database['public']['Tables']['character_outfits']['Row'];

export interface OfflineEarnings {
  amount: number;
  minutes: number;
}

export interface GameState {
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
  offlineEarnings: OfflineEarnings | null;
  jobChangeLockedUntil: number | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  businessesLoading: boolean;
  unsavedJobWorkSeconds: number;
  pendingMoneyDelta: number;
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
  current_level?: number;
  current_hourly_income?: number;
  total_invested?: number;
  current_prestige_points?: number;
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

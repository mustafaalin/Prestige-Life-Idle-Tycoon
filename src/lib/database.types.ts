export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          name: string
          gender: 'male' | 'female'
          description: string
          image_url: string
          price: number
          unlock_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          gender: 'male' | 'female'
          description: string
          image_url: string
          price?: number
          unlock_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          gender?: 'male' | 'female'
          description?: string
          image_url?: string
          price?: number
          unlock_order?: number
          created_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          price: number
          passive_income_bonus: number
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          price?: number
          passive_income_bonus?: number
          level?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          price?: number
          passive_income_bonus?: number
          level?: number
          created_at?: string
        }
      }
      cars: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          price: number
          prestige_points: number
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          price?: number
          prestige_points?: number
          level?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          price?: number
          prestige_points?: number
          level?: number
          created_at?: string
        }
      }
      player_profiles: {
        Row: {
          id: string
          device_id: string | null
          auth_user_id: string | null
          username: string
          display_name: string | null
          total_money: number
          lifetime_earnings: number
          money_per_click: number
          money_per_second: number
          hourly_income: number
          total_clicks: number
          prestige_points: number
          selected_character_id: string | null
          selected_house_id: string | null
          selected_car_id: string | null
          gems: number
          last_claim_time: string | null
          last_claim_reset_date: string | null
          daily_claimed_total: number
          claim_locked_until: string | null
          linked_at: string | null
          times_reset: number
          last_reset_at: string | null
          created_at: string
          last_played_at: string
        }
        Insert: {
          id: string
          device_id?: string | null
          auth_user_id?: string | null
          username?: string
          display_name?: string | null
          total_money?: number
          lifetime_earnings?: number
          money_per_click?: number
          money_per_second?: number
          hourly_income?: number
          total_clicks?: number
          prestige_points?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          gems?: number
          last_claim_time?: string | null
          last_claim_reset_date?: string | null
          daily_claimed_total?: number
          claim_locked_until?: string | null
          linked_at?: string | null
          times_reset?: number
          last_reset_at?: string | null
          created_at?: string
          last_played_at?: string
        }
        Update: {
          id?: string
          device_id?: string | null
          auth_user_id?: string | null
          username?: string
          display_name?: string | null
          total_money?: number
          lifetime_earnings?: number
          money_per_click?: number
          money_per_second?: number
          hourly_income?: number
          total_clicks?: number
          prestige_points?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          gems?: number
          last_claim_time?: string | null
          last_claim_reset_date?: string | null
          daily_claimed_total?: number
          claim_locked_until?: string | null
          linked_at?: string | null
          times_reset?: number
          last_reset_at?: string | null
          created_at?: string
          last_played_at?: string
        }
      }
      player_reset_history: {
        Row: {
          id: string
          player_id: string
          reset_at: string
          money_at_reset: number
          gems_at_reset: number
          hourly_income_at_reset: number
          lifetime_earnings_at_reset: number
          total_clicks_at_reset: number
          prestige_points_at_reset: number
          selected_character_id: string | null
          selected_house_id: string | null
          selected_car_id: string | null
          current_job_id: string | null
          owned_characters: Json
          owned_houses: Json
          owned_cars: Json
          player_jobs: Json
          player_businesses: Json
        }
        Insert: {
          id?: string
          player_id: string
          reset_at?: string
          money_at_reset?: number
          gems_at_reset?: number
          hourly_income_at_reset?: number
          lifetime_earnings_at_reset?: number
          total_clicks_at_reset?: number
          prestige_points_at_reset?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          current_job_id?: string | null
          owned_characters?: Json
          owned_houses?: Json
          owned_cars?: Json
          player_jobs?: Json
          player_businesses?: Json
        }
        Update: {
          id?: string
          player_id?: string
          reset_at?: string
          money_at_reset?: number
          gems_at_reset?: number
          hourly_income_at_reset?: number
          lifetime_earnings_at_reset?: number
          total_clicks_at_reset?: number
          prestige_points_at_reset?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          current_job_id?: string | null
          owned_characters?: Json
          owned_houses?: Json
          owned_cars?: Json
          player_jobs?: Json
          player_businesses?: Json
        }
      }
      player_purchases: {
        Row: {
          id: string
          player_id: string
          item_type: 'character' | 'house' | 'car'
          item_id: string
          purchase_price: number
          purchased_at: string
        }
        Insert: {
          id?: string
          player_id: string
          item_type: 'character' | 'house' | 'car'
          item_id: string
          purchase_price: number
          purchased_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          item_type?: 'character' | 'house' | 'car'
          item_id?: string
          purchase_price?: number
          purchased_at?: string
        }
      }
      game_stats: {
        Row: {
          id: string
          player_id: string
          play_time_seconds: number
          highest_combo: number
          achievements_unlocked: Json
          daily_login_streak: number
          last_daily_reward: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          play_time_seconds?: number
          highest_combo?: number
          achievements_unlocked?: Json
          daily_login_streak?: number
          last_daily_reward?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          play_time_seconds?: number
          highest_combo?: number
          achievements_unlocked?: Json
          daily_login_streak?: number
          last_daily_reward?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          name: string
          description: string
          hourly_income: number
          unlock_requirement_money: number
          level: number
          is_default_unlocked: boolean
          icon_name: string
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          hourly_income?: number
          unlock_requirement_money?: number
          level?: number
          is_default_unlocked?: boolean
          icon_name?: string
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          hourly_income?: number
          unlock_requirement_money?: number
          level?: number
          is_default_unlocked?: boolean
          icon_name?: string
          icon_url?: string | null
          created_at?: string
        }
      }
      player_jobs: {
        Row: {
          id: string
          player_id: string
          job_id: string
          is_unlocked: boolean
          is_active: boolean
          times_worked: number
          total_earned: number
          unlocked_at: string | null
          created_at: string
          total_time_worked_seconds: number
          last_work_started_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          job_id: string
          is_unlocked?: boolean
          is_active?: boolean
          times_worked?: number
          total_earned?: number
          unlocked_at?: string | null
          created_at?: string
          total_time_worked_seconds?: number
          last_work_started_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          job_id?: string
          is_unlocked?: boolean
          is_active?: boolean
          times_worked?: number
          total_earned?: number
          unlocked_at?: string | null
          created_at?: string
          total_time_worked_seconds?: number
          last_work_started_at?: string | null
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          description: string
          category: 'small' | 'large'
          base_price: number
          base_hourly_income: number
          unlock_order: number
          icon_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'small' | 'large'
          base_price: number
          base_hourly_income: number
          unlock_order: number
          icon_name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'small' | 'large'
          base_price?: number
          base_hourly_income?: number
          unlock_order?: number
          icon_name?: string
          created_at?: string
        }
      }
      player_businesses: {
        Row: {
          id: string
          player_id: string
          business_id: string
          is_unlocked: boolean
          current_level: number
          current_hourly_income: number
          total_invested: number
          purchased_at: string | null
          last_upgrade_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          business_id: string
          is_unlocked?: boolean
          current_level?: number
          current_hourly_income: number
          total_invested: number
          purchased_at?: string | null
          last_upgrade_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          business_id?: string
          is_unlocked?: boolean
          current_level?: number
          current_hourly_income?: number
          total_invested?: number
          purchased_at?: string | null
          last_upgrade_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Business = Database['public']['Tables']['businesses']['Row']
export type PlayerBusiness = Database['public']['Tables']['player_businesses']['Row']

export interface BusinessWithPlayerData extends Business {
  is_owned: boolean
  can_unlock: boolean
  current_level: number
  current_hourly_income: number
  total_invested: number
}

export interface UpgradeInfo {
  level: number
  cost: number
  newIncome: number
}

export const UPGRADE_MULTIPLIERS = [30, 60, 120, 180, 240]
export const INCOME_INCREASE_MULTIPLIER = 1.25

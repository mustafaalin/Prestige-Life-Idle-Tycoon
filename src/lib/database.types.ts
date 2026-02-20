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
      businesses: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          base_price: number
          base_hourly_income: number
          unlock_order: number
          icon_name: string
          created_at: string | null
          icon_url: string | null
          prestige_points: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          base_price: number
          base_hourly_income: number
          unlock_order: number
          icon_name: string
          created_at?: string | null
          icon_url?: string | null
          prestige_points?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          base_price?: number
          base_hourly_income?: number
          unlock_order?: number
          icon_name?: string
          created_at?: string | null
          icon_url?: string | null
          prestige_points?: number
        }
      }
      business_prestige_points: {
        Row: {
          business_id: string
          base_points: number
          level1_points: number
          level2_points: number
          level3_points: number
          level4_points: number
          level5_points: number
          level6_points: number
          updated_at: string
        }
        Insert: {
          business_id: string
          base_points?: number
          level1_points?: number
          level2_points?: number
          level3_points?: number
          level4_points?: number
          level5_points?: number
          level6_points?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          base_points?: number
          level1_points?: number
          level2_points?: number
          level3_points?: number
          level4_points?: number
          level5_points?: number
          level6_points?: number
          updated_at?: string
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
          created_at: string | null
          hourly_maintenance_cost: number | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          price?: number
          prestige_points?: number
          level?: number
          created_at?: string | null
          hourly_maintenance_cost?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          price?: number
          prestige_points?: number
          level?: number
          created_at?: string | null
          hourly_maintenance_cost?: number | null
        }
      }
      characters: {
        Row: {
          id: string
          name: string
          gender: string
          description: string
          image_url: string
          price: number
          unlock_order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          gender: string
          description: string
          image_url: string
          price?: number
          unlock_order?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          gender?: string
          description?: string
          image_url?: string
          price?: number
          unlock_order?: number
          created_at?: string | null
        }
      }
      character_outfits: {
        Row: {
          id: string
          character_id: string | null
          code: string
          name: string
          description: string | null
          image_url: string
          price: number
          prestige_points: number
          unlock_order: number
          unlock_type: string
          unlock_value: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          character_id?: string | null
          code: string
          name: string
          description?: string | null
          image_url: string
          price?: number
          prestige_points?: number
          unlock_order?: number
          unlock_type?: string
          unlock_value?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string | null
          code?: string
          name?: string
          description?: string | null
          image_url?: string
          price?: number
          prestige_points?: number
          unlock_order?: number
          unlock_type?: string
          unlock_value?: number
          is_active?: boolean
          created_at?: string
        }
      }
      game_stats: {
        Row: {
          id: string
          player_id: string
          play_time_seconds: number
          highest_combo: number
          achievements_unlocked: Json | null
          daily_login_streak: number
          last_daily_reward: string | null
          created_at: string | null
          updated_at: string | null
          claimed_reward_days: Json | null
          last_claim_date: string | null
        }
        Insert: {
          id?: string
          player_id: string
          play_time_seconds?: number
          highest_combo?: number
          achievements_unlocked?: Json | null
          daily_login_streak?: number
          last_daily_reward?: string | null
          created_at?: string | null
          updated_at?: string | null
          claimed_reward_days?: Json | null
          last_claim_date?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          play_time_seconds?: number
          highest_combo?: number
          achievements_unlocked?: Json | null
          daily_login_streak?: number
          last_daily_reward?: string | null
          created_at?: string | null
          updated_at?: string | null
          claimed_reward_days?: Json | null
          last_claim_date?: string | null
        }
      }
      houses: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          level: number
          created_at: string | null
          hourly_rent_cost: number | null
          prestige_points: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          level?: number
          created_at?: string | null
          hourly_rent_cost?: number | null
          prestige_points?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          level?: number
          created_at?: string | null
          hourly_rent_cost?: number | null
          prestige_points?: number
        }
      }
      investment_properties: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          base_price: number
          base_rental_income: number
          unlock_order: number
          icon_name: string
          image_url: string | null
          created_at: string | null
          prestige_points: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          base_price: number
          base_rental_income: number
          unlock_order: number
          icon_name?: string
          image_url?: string | null
          created_at?: string | null
          prestige_points?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          base_price?: number
          base_rental_income?: number
          unlock_order?: number
          icon_name?: string
          image_url?: string | null
          created_at?: string | null
          prestige_points?: number
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
          created_at: string | null
          icon_url: string | null
          prestige_points: number
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
          created_at?: string | null
          icon_url?: string | null
          prestige_points?: number
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
          created_at?: string | null
          icon_url?: string | null
          prestige_points?: number
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
        }
      }
      player_investments: {
        Row: {
          id: string
          player_id: string
          investment_id: string
          is_unlocked: boolean | null
          current_level: number | null
          current_rental_income: number | null
          total_invested: number | null
          purchased_at: string | null
          last_upgrade_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          investment_id: string
          is_unlocked?: boolean | null
          current_level?: number | null
          current_rental_income?: number | null
          total_invested?: number | null
          purchased_at?: string | null
          last_upgrade_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          investment_id?: string
          is_unlocked?: boolean | null
          current_level?: number | null
          current_rental_income?: number | null
          total_invested?: number | null
          purchased_at?: string | null
          last_upgrade_at?: string | null
        }
      }
      player_jobs: {
        Row: {
          id: string
          player_id: string
          job_id: string
          is_unlocked: boolean
          is_active: boolean
          is_completed: boolean
          times_worked: number
          total_earned: number
          unlocked_at: string | null
          created_at: string | null
          total_time_worked_seconds: number
          last_work_started_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          job_id: string
          is_unlocked?: boolean
          is_active?: boolean
          is_completed?: boolean
          times_worked?: number
          total_earned?: number
          unlocked_at?: string | null
          created_at?: string | null
          total_time_worked_seconds?: number
          last_work_started_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          job_id?: string
          is_unlocked?: boolean
          is_active?: boolean
          is_completed?: boolean
          times_worked?: number
          total_earned?: number
          unlocked_at?: string | null
          created_at?: string | null
          total_time_worked_seconds?: number
          last_work_started_at?: string | null
        }
      }
      player_outfits: {
        Row: {
          player_id: string
          outfit_id: string
          is_unlocked: boolean
          unlocked_at: string | null
          is_owned: boolean
          purchased_at: string | null
          created_at: string
        }
        Insert: {
          player_id: string
          outfit_id: string
          is_unlocked?: boolean
          unlocked_at?: string | null
          is_owned?: boolean
          purchased_at?: string | null
          created_at?: string
        }
        Update: {
          player_id?: string
          outfit_id?: string
          is_unlocked?: boolean
          unlocked_at?: string | null
          is_owned?: boolean
          purchased_at?: string | null
          created_at?: string
        }
      }
      player_profiles: {
        Row: {
          id: string
          username: string
          total_money: number
          lifetime_earnings: number
          money_per_click: number
          total_clicks: number
          prestige_points: number
          selected_character_id: string | null
          selected_house_id: string | null
          selected_car_id: string | null
          selected_outfit_id: string | null
          created_at: string | null
          last_played_at: string | null
          device_id: string | null
          display_name: string
          auth_user_id: string | null
          linked_at: string | null
          hourly_income: number
          current_job_id: string | null
          gems: number
          last_claim_time: string | null
          last_claim_reset_date: string | null
          daily_claimed_total: number | null
          claim_locked_until: string | null
          last_ad_watch_time: string | null
          times_reset: number | null
          last_reset_at: string | null
          job_income: number | null
          business_income: number | null
          investment_income: number | null
          house_rent_expense: number | null
          vehicle_expense: number | null
          other_expenses: number | null
          gross_income: number | null
          total_expenses: number | null
        }
        Insert: {
          id: string
          username?: string
          total_money?: number
          lifetime_earnings?: number
          money_per_click?: number
          total_clicks?: number
          prestige_points?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          selected_outfit_id?: string | null
          created_at?: string | null
          last_played_at?: string | null
          device_id?: string | null
          display_name?: string
          auth_user_id?: string | null
          linked_at?: string | null
          hourly_income?: number
          current_job_id?: string | null
          gems?: number
          last_claim_time?: string | null
          last_claim_reset_date?: string | null
          daily_claimed_total?: number | null
          claim_locked_until?: string | null
          last_ad_watch_time?: string | null
          times_reset?: number | null
          last_reset_at?: string | null
          job_income?: number | null
          business_income?: number | null
          investment_income?: number | null
          house_rent_expense?: number | null
          vehicle_expense?: number | null
          other_expenses?: number | null
          gross_income?: number | null
          total_expenses?: number | null
        }
        Update: {
          id?: string
          username?: string
          total_money?: number
          lifetime_earnings?: number
          money_per_click?: number
          total_clicks?: number
          prestige_points?: number
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          selected_outfit_id?: string | null
          created_at?: string | null
          last_played_at?: string | null
          device_id?: string | null
          display_name?: string
          auth_user_id?: string | null
          linked_at?: string | null
          hourly_income?: number
          current_job_id?: string | null
          gems?: number
          last_claim_time?: string | null
          last_claim_reset_date?: string | null
          daily_claimed_total?: number | null
          claim_locked_until?: string | null
          last_ad_watch_time?: string | null
          times_reset?: number | null
          last_reset_at?: string | null
          job_income?: number | null
          business_income?: number | null
          investment_income?: number | null
          house_rent_expense?: number | null
          vehicle_expense?: number | null
          other_expenses?: number | null
          gross_income?: number | null
          total_expenses?: number | null
        }
      }
      player_purchases: {
        Row: {
          id: string
          player_id: string
          item_type: string
          item_id: string
          purchase_price: number
          purchased_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          item_type: string
          item_id: string
          purchase_price: number
          purchased_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          item_type?: string
          item_id?: string
          purchase_price?: number
          purchased_at?: string | null
        }
      }
      player_reset_history: {
        Row: {
          id: string
          player_id: string
          reset_at: string
          money_at_reset: number | null
          gems_at_reset: number | null
          hourly_income_at_reset: number | null
          lifetime_earnings_at_reset: number | null
          total_clicks_at_reset: number | null
          prestige_points_at_reset: number | null
          selected_character_id: string | null
          selected_house_id: string | null
          selected_car_id: string | null
          current_job_id: string | null
          owned_characters: Json | null
          owned_houses: Json | null
          owned_cars: Json | null
          player_jobs: Json | null
          player_businesses: Json | null
        }
        Insert: {
          id?: string
          player_id: string
          reset_at?: string
          money_at_reset?: number | null
          gems_at_reset?: number | null
          hourly_income_at_reset?: number | null
          lifetime_earnings_at_reset?: number | null
          total_clicks_at_reset?: number | null
          prestige_points_at_reset?: number | null
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          current_job_id?: string | null
          owned_characters?: Json | null
          owned_houses?: Json | null
          owned_cars?: Json | null
          player_jobs?: Json | null
          player_businesses?: Json | null
        }
        Update: {
          id?: string
          player_id?: string
          reset_at?: string
          money_at_reset?: number | null
          gems_at_reset?: number | null
          hourly_income_at_reset?: number | null
          lifetime_earnings_at_reset?: number | null
          total_clicks_at_reset?: number | null
          prestige_points_at_reset?: number | null
          selected_character_id?: string | null
          selected_house_id?: string | null
          selected_car_id?: string | null
          current_job_id?: string | null
          owned_characters?: Json | null
          owned_houses?: Json | null
          owned_cars?: Json | null
          player_jobs?: Json | null
          player_businesses?: Json | null
        }
      }
      player_transactions: {
        Row: {
          id: string
          player_id: string
          package_id: string
          transaction_status: string
          payment_provider: string | null
          provider_transaction_id: string | null
          amount_paid: number | null
          currency: string | null
          items_received: Json | null
          error_message: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          package_id: string
          transaction_status?: string
          payment_provider?: string | null
          provider_transaction_id?: string | null
          amount_paid?: number | null
          currency?: string | null
          items_received?: Json | null
          error_message?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          package_id?: string
          transaction_status?: string
          payment_provider?: string | null
          provider_transaction_id?: string | null
          amount_paid?: number | null
          currency?: string | null
          items_received?: Json | null
          error_message?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
      }
      purchase_packages: {
        Row: {
          id: string
          package_type: string
          base_amount: number
          amount_multiplier: number | null
          gem_amount: number | null
          price_usd: number
          display_order: number
          is_popular: boolean | null
          is_best_value: boolean | null
          platform_product_id: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          package_type: string
          base_amount?: number
          amount_multiplier?: number | null
          gem_amount?: number | null
          price_usd: number
          display_order?: number
          is_popular?: boolean | null
          is_best_value?: boolean | null
          platform_product_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          package_type?: string
          base_amount?: number
          amount_multiplier?: number | null
          gem_amount?: number | null
          price_usd?: number
          display_order?: number
          is_popular?: boolean | null
          is_best_value?: boolean | null
          platform_product_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Business = Database['public']['Tables']['businesses']['Row']
export type PlayerBusiness = Database['public']['Tables']['player_businesses']['Row']

export interface BusinessWithPlayerData extends Business {
  player_level: number | null
  player_income: number | null
  player_invested: number | null
  is_owned: boolean
  next_level_cost: number | null
  next_level_income: number | null
}

export const UPGRADE_MULTIPLIERS = [20, 40, 80, 160, 320]

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
          linked_at: string | null
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
          linked_at?: string | null
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
          linked_at?: string | null
          created_at?: string
          last_played_at?: string
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
    }
  }
}

import { supabase } from '../lib/supabase';
import type { AdRewardResult } from '../types/game';

export async function claimDailyReward(
  playerId: string
): Promise<{ success: boolean; reward?: number; error?: string }> {
  const { data, error } = await supabase.rpc('claim_daily_reward', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error claiming daily reward:', error);
    return { success: false, error: error.message };
  }

  if (!data?.success) {
    return { success: false, error: data?.message };
  }

  return { success: true, reward: data.reward };
}

export async function watchAd(playerId: string): Promise<AdRewardResult> {
  const { data, error } = await supabase.rpc('watch_ad', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error watching ad:', error);
    return { success: false, reward: 0, cooldown: 0 };
  }

  return {
    success: data?.success || false,
    reward: data?.reward || 0,
    cooldown: data?.cooldown || 0,
  };
}

export async function canClaimDailyReward(playerId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_claim_daily_reward', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error checking daily reward eligibility:', error);
    return false;
  }

  return data || false;
}

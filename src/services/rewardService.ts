import { supabase } from '../lib/supabase';
import type { AdRewardResult } from '../types/game';

export async function getClaimStatus(
  playerId: string
): Promise<{ claimLockedUntil: string | null; dailyClaimedTotal: number }> {
  const { data } = await supabase
    .from('player_profiles')
    .select('claim_locked_until, daily_claimed_total')
    .eq('id', playerId)
    .maybeSingle();

  return {
    claimLockedUntil: data?.claim_locked_until || null,
    dailyClaimedTotal: data?.daily_claimed_total || 0,
  };
}

export async function claimDailyReward(
  playerId: string
): Promise<{ claimLockedUntil: string | null; dailyClaimedTotal: number }> {
  const { data, error } = await supabase.rpc('claim_daily_reward', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error claiming daily reward:', error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Failed to claim daily reward');
  }

  return getClaimStatus(playerId);
}

export async function claimAccumulatedMoney(
  playerId: string
): Promise<{ claimLockedUntil: string | null; dailyClaimedTotal: number }> {
  const { error } = await supabase.rpc('claim_accumulated_money', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error claiming accumulated money:', error);
    throw error;
  }

  return getClaimStatus(playerId);
}

export async function watchAd(
  playerId: string
): Promise<{ claimLockedUntil: string | null; dailyClaimedTotal: number }> {
  const { error } = await supabase.rpc('claim_ad_reward', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error watching ad:', error);
    throw error;
  }

  return getClaimStatus(playerId);
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

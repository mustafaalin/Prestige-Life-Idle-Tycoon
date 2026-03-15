import { supabase } from '../lib/supabase';

export async function getClaimStatus(playerId: string) {
  // HATA DÜZELTİLDİ: get_claim_status -> get_daily_reward_status
  const { data, error } = await supabase.rpc('get_daily_reward_status', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error fetching claim status:', error);
    return { claimLockedUntil: null, dailyClaimedTotal: 0 };
  }

  return {
    claimLockedUntil: data?.claim_locked_until || null,
    dailyClaimedTotal: data?.daily_claimed_total || 0,
  };
}

export async function claimDailyReward(playerId: string) {
  const { data, error } = await supabase.rpc('claim_daily_reward', {
    p_player_id: playerId,
  });

  if (error) throw error;
  
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to claim daily reward');
  }
  
  return {
    claimLockedUntil: data?.claim_locked_until || null,
    dailyClaimedTotal: data?.daily_claimed_total || 0,
  };
}

export async function claimAccumulatedMoney(playerId: string) {
  const { data, error } = await supabase.rpc('claim_accumulated_money', {
    p_player_id: playerId,
  });

  if (error) throw error;
  
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to claim money');
  }

  return {
    claimLockedUntil: data?.claim_locked_until || null,
    dailyClaimedTotal: data?.daily_claimed_total || 0,
  };
}

export async function watchAd(playerId: string) {
  // HATA DÜZELTİLDİ: watch_ad -> claim_ad_reward
  const { data, error } = await supabase.rpc('claim_ad_reward', {
    p_player_id: playerId,
  });

  if (error) throw error;
  
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to watch ad');
  }

  return {
    claimLockedUntil: data?.claim_locked_until || null,
    dailyClaimedTotal: data?.daily_claimed_total || 0,
  };
}

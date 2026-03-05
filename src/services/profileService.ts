import { supabase } from '../lib/supabase';
import type { PlayerProfile } from '../types/game';

export async function getProfile(playerId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('id', playerId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }

  return data;
}

export async function createProfile(playerId: string, deviceId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from('player_profiles')
    .insert({
      id: playerId,
      device_id: deviceId,
      username: `player_${deviceId.slice(0, 8)}`,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(
  playerId: string,
  updates: Partial<PlayerProfile>
): Promise<void> {
  const { error } = await supabase
    .from('player_profiles')
    .update(updates)
    .eq('id', playerId);

  if (error) {
    console.error('Error updating player profile:', error);
    throw error;
  }
}

export async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
  return getProfile(playerId);
}

export async function updatePlayerProfile(
  playerId: string,
  updates: Partial<PlayerProfile>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('player_profiles')
    .update(updates)
    .eq('id', playerId);

  if (error) {
    console.error('Error updating player profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateLastPlayedAt(playerId: string): Promise<void> {
  await supabase
    .from('player_profiles')
    .update({ last_played_at: new Date().toISOString() })
    .eq('id', playerId);
}

export async function claimAccumulatedMoney(
  playerId: string
): Promise<{ success: boolean; claimed_amount?: number; new_total?: number; error?: string }> {
  const { data, error } = await supabase.rpc('claim_accumulated_money', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error claiming accumulated money:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    claimed_amount: data?.claimed_amount,
    new_total: data?.new_total,
  };
}

export async function resetProgress(playerId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_player_progress', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error resetting player progress:', error);
    throw error;
  }
}

export async function resetPlayerProgress(
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('reset_player_progress', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error resetting player progress:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

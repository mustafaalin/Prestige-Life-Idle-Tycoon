import { supabase } from '../lib/supabase';
import type { GameStats } from '../types/game';

export async function fetchGameStats(playerId: string): Promise<GameStats | null> {
  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('player_id', playerId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching game stats:', error);
    return null;
  }

  return data;
}

export async function updateGameStats(
  playerId: string,
  updates: Partial<GameStats>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('game_stats')
    .update(updates)
    .eq('player_id', playerId);

  if (error) {
    console.error('Error updating game stats:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function calculatePlayerIncome(
  playerId: string
): Promise<{ hourly_income: number; hourly_expenses: number }> {
  const { data, error } = await supabase.rpc('calculate_player_income', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error calculating player income:', error);
    return { hourly_income: 0, hourly_expenses: 0 };
  }

  return {
    hourly_income: data?.hourly_income || 0,
    hourly_expenses: data?.hourly_expenses || 0,
  };
}

export async function calculatePrestigeTotal(playerId: string): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_prestige_total', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error calculating prestige total:', error);
    return 0;
  }

  return data || 0;
}

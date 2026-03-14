import { supabase } from '../lib/supabase';
import type { BusinessWithPlayerData } from '../types/game';

export async function getBusinesses(
  playerId: string
): Promise<{ businesses: BusinessWithPlayerData[]; prestigePoints: number }> {
  const [businesses, prestigePoints] = await Promise.all([
    fetchAllBusinesses(playerId),
    calculateBusinessPrestigePoints(playerId),
  ]);

  return { businesses, prestigePoints };
}

export async function fetchAllBusinesses(
  playerId: string
): Promise<BusinessWithPlayerData[]> {
  const { data, error } = await supabase.rpc('get_all_businesses', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return (data || []) as BusinessWithPlayerData[];
}

export async function calculateBusinessPrestigePoints(
  playerId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_player_prestige', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error calculating business prestige:', error);
    return 0;
  }

  return data || 0;
}

export async function purchaseBusiness(
  playerId: string,
  businessId: string
): Promise<void> {
  const { data, error } = await supabase.rpc('purchase_business', {
    p_player_id: playerId,
    p_business_id: businessId,
  });

  if (error) {
    console.error('Error purchasing business:', error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Purchase failed');
  }

  try {
    await supabase.rpc('calculate_player_income', { p_player_id: playerId });
    await supabase.rpc('calculate_player_prestige', { p_player_id: playerId });
  } catch (rpcError) {
    console.error('Error calculating income/prestige:', rpcError);
  }
}

export async function upgradeBusiness(
  playerId: string,
  businessId: string
): Promise<void> {
  const { data, error } = await supabase.rpc('upgrade_business', {
    p_player_id: playerId,
    p_business_id: businessId,
  });

  if (error) {
    console.error('Error upgrading business:', error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Upgrade failed');
  }

  try {
    await supabase.rpc('calculate_player_income', { p_player_id: playerId });
    await supabase.rpc('calculate_player_prestige', { p_player_id: playerId });
  } catch (rpcError) {
    console.error('Error calculating income/prestige:', rpcError);
  }
}

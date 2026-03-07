import { supabase } from '../lib/supabase';
import type { PurchaseResult } from '../types/game';

export async function purchaseItem(
  playerId: string,
  itemId: string,
  itemType: 'car' | 'house' | 'character',
  price: number
): Promise<PurchaseResult> {
  const { data, error } = await supabase.rpc('purchaseitem', {
    p_player_id: playerId,
    p_item_id: itemId,
    p_item_type: itemType,
    p_price: price,
  });

  if (error) {
    console.error('Error purchasing item:', error);
    return { success: false, message: error.message };
  }

  if (!data?.success) {
    return { success: false, message: data?.message || 'Purchase failed' };
  }

  return {
    success: true,
    new_balance: data.new_balance,
    message: data.message,
  };
}

export async function recordPurchase(
  playerId: string,
  itemType: string,
  itemId: string,
  purchasePrice: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('player_purchases').insert({
    player_id: playerId,
    item_type: itemType,
    item_id: itemId,
    purchase_price: purchasePrice,
  });

  if (error) {
    console.error('Error recording purchase:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchPlayerPurchases(playerId: string) {
  const { data, error } = await supabase
    .from('player_purchases')
    .select('item_type, item_id')
    .eq('player_id', playerId);

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return data || [];
}

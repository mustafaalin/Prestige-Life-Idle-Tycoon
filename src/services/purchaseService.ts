import { supabase } from '../lib/supabase';

// Arabalar için orijinal RPC çağrısı
export async function purchaseCarViaRPC(playerId: string, carId: string, price: number) {
  const { data, error } = await supabase.rpc('purchaseitem', {
    p_player_id: playerId,
    p_item_id: carId,
    p_item_type: 'car'
  } as any);

  if (error) throw error;
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Purchase failed: Invalid response from database');
  }

  const result = data[0] as { success: boolean; message: string; new_balance: number };
  if (!result.success) throw new Error(result.message);

  await supabase.from('player_purchases').insert({
    player_id: playerId,
    item_type: 'car',
    item_id: carId,
    purchase_price: price,
  });

  return result;
}

// Karakter ve evler için orijinal Client-Side kayıt
export async function purchaseGeneralItem(
  playerId: string, 
  itemType: 'character' | 'house', 
  itemId: string, 
  price: number
) {
  const { error } = await supabase.from('player_purchases').insert({
    player_id: playerId,
    item_type: itemType,
    item_id: itemId,
    purchase_price: price,
  });

  if (error) throw error;
  return true;
}
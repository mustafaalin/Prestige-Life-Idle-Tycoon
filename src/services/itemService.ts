import { supabase } from '../lib/supabase';

export async function getCharacters() {
  const { data, error } = await supabase.from('characters').select('*').order('price');
  if (error) throw error;
  return data || [];
}

export async function getHouses() {
  const { data, error } = await supabase.from('houses').select('*').order('price');
  if (error) throw error;
  return data || [];
}

export async function getCars() {
  const { data, error } = await supabase.from('cars').select('*').order('price');
  if (error) throw error;
  return data || [];
}

export async function getOwnedCharacters(playerId: string) {
  const { data, error } = await supabase.from('player_purchases')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('item_type', 'character');
  if (error) throw error;
  return data?.map(d => d.item_id) || [];
}

export async function getOwnedHouses(playerId: string) {
  const { data, error } = await supabase.from('player_purchases')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('item_type', 'house');
  if (error) throw error;
  return data?.map(d => d.item_id) || [];
}

export async function getOwnedCars(playerId: string) {
  const { data, error } = await supabase.from('player_purchases')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('item_type', 'car');
  if (error) throw error;
  return data?.map(d => d.item_id) || [];
}

export async function getSelectedOutfit(playerId: string) {
  const { data, error } = await supabase.from('player_profiles')
    .select('selected_outfit_id')
    .eq('id', playerId)
    .single();
  if (error) return null;
  
  if (!data?.selected_outfit_id) return null;

  const { data: outfit } = await supabase.from('character_outfits')
    .select('*')
    .eq('id', data.selected_outfit_id)
    .single();
    
  return outfit || null;
}

// -------------------------------------------------------------
// DÜZELTİLEN KISIM: Supabase'deki doğru RPC isimleri ve argümanları eklendi
// -------------------------------------------------------------

export async function selectCharacter(playerId: string, characterId: string) {
  const { data, error } = await supabase.rpc('select_character', {
    p_player_id: playerId,
    p_character_id: characterId,
  });
  if (error) {
    console.error('Error selecting character:', error);
    throw error;
  }
  return data;
}

export async function selectHouse(playerId: string, houseId: string) {
  const { data, error } = await supabase.rpc('select_house', {
    p_player_id: playerId,
    p_house_id: houseId,
  });
  if (error) {
    console.error('Error selecting house:', error);
    throw error;
  }
  return data;
}

export async function selectCar(playerId: string, carId: string) {
  const { data, error } = await supabase.rpc('select_car', {
    p_player_id: playerId,
    p_car_id: carId,
  });
  if (error) {
    console.error('Error selecting car:', error);
    throw error;
  }
  return data;
}
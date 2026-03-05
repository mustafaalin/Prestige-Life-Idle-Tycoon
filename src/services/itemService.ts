import { supabase } from '../lib/supabase';
import type { Character, House, Car, CharacterOutfit } from '../types/game';

export async function fetchAllCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching characters:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllHouses(): Promise<House[]> {
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching houses:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching cars:', error);
    return [];
  }

  return data || [];
}

export async function selectCar(
  playerId: string,
  carId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('player_profiles')
    .update({ selected_car_id: carId })
    .eq('id', playerId);

  if (error) {
    console.error('Error selecting car:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchCharacterOutfits(): Promise<CharacterOutfit[]> {
  const { data, error } = await supabase
    .from('character_outfits')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching character outfits:', error);
    return [];
  }

  return data || [];
}

export async function fetchPlayerOutfit(playerId: string): Promise<CharacterOutfit | null> {
  const { data: profileData } = await supabase
    .from('player_profiles')
    .select('selected_outfit_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!profileData?.selected_outfit_id) {
    return null;
  }

  const { data: outfitData, error } = await supabase
    .from('character_outfits')
    .select('*')
    .eq('id', profileData.selected_outfit_id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching player outfit:', error);
    return null;
  }

  return outfitData;
}

export async function purchaseOutfit(
  playerId: string,
  outfitId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('player_outfits').insert({
    player_id: playerId,
    outfit_id: outfitId,
  });

  if (error) {
    console.error('Error purchasing outfit:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function selectOutfit(
  playerId: string,
  outfitId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('player_profiles')
    .update({ selected_outfit_id: outfitId })
    .eq('id', playerId);

  if (error) {
    console.error('Error selecting outfit:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

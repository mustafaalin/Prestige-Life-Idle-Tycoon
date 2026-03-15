import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';
import type { Database } from '../lib/database.types';

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];

export async function getProfile(userId: string, deviceId?: string) {
  let { data, error } = await supabase.from('player_profiles').select('*').eq('id', userId).maybeSingle();
  if (!data && deviceId) {
    const { data: deviceData } = await supabase.from('player_profiles').select('*').eq('device_id', deviceId).maybeSingle();
    if (deviceData) data = deviceData;
  }
  return data;
}

export async function createProfile(userId: string, deviceId: string) {
  const playerName = deviceIdentity.getPlayerName();
  
  try {
    const existingProfile = await getProfile(userId, deviceId);
    if (existingProfile) return existingProfile;

    const { data: mikeCharacter } = await supabase.from('characters').select('id').eq('name', 'Mike').maybeSingle();
    let characterId = mikeCharacter?.id;

    if (!characterId) {
      const { data: fallbackCharacter } = await supabase.from('characters')
        .select('id').eq('gender', 'male').eq('price', 0).order('unlock_order').limit(1).maybeSingle();
      characterId = fallbackCharacter?.id;
    }

    if (!characterId) return null;

    // DÜZELTME: Evlerde 'price' olmadığı için 'hourly_rent_cost' olarak değiştirildi
    const { data: defaultHouse } = await supabase.from('houses')
      .select('id').eq('hourly_rent_cost', 0).order('level').limit(1).maybeSingle();

    const { data: defaultOutfit } = await supabase.from('character_outfits')
      .select('id').eq('unlock_order', 1).eq('is_active', true).maybeSingle();

    const newProfile = {
      id: userId,
      device_id: deviceId,
      auth_user_id: userId,
      display_name: playerName,
      username: playerName,
      total_money: 100,
      lifetime_earnings: 0,
      money_per_click: 1,
      money_per_second: 0,
      hourly_income: 50,
      total_clicks: 0,
      prestige_points: 0,
      gems: 0,
      last_claim_time: new Date().toISOString(),
      selected_character_id: characterId,
      selected_house_id: defaultHouse?.id || null,
      selected_car_id: null,
      selected_outfit_id: defaultOutfit?.id || null,
      created_at: new Date().toISOString(),
      last_played_at: new Date().toISOString(),
    };

    const { data: insertedProfile, error } = await supabase.from('player_profiles').insert(newProfile).select().single();

    if (error) {
      if (error.code === '23505') return await getProfile(userId, deviceId);
      throw error;
    }

    await supabase.from('game_stats').insert({ player_id: insertedProfile.id });

    if (defaultOutfit?.id) {
      await supabase.from('player_outfits').insert({
        player_id: insertedProfile.id,
        outfit_id: defaultOutfit.id,
        is_owned: true,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      });
    }

    return insertedProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<PlayerProfile>) {
  const { data, error } = await supabase.from('player_profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function resetProgress(userId: string) {
  const { error } = await supabase.rpc('reset_player_progress', { p_player_id: userId });
  if (error) throw error;
  return true;
}

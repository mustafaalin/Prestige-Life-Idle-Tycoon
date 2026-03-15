import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];

export async function getProfile(userId: string, deviceId?: string) {
  // 1. Önce ID ile ara
  let { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  // 2. Bulunamazsa ve deviceId varsa cihaz kimliğiyle ara (Eski hesaplar için)
  if (!data && deviceId) {
    const { data: deviceData } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (deviceData) {
      data = deviceData;
    }
  }

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }

  return data;
}

export async function createProfile(userId: string, deviceId: string) {
  try {
    // KORUMA: Çift kayıt (Duplicate) hatasını engellemek için profil gerçekten var mı diye tekrar kontrol et
    const existingProfile = await getProfile(userId, deviceId);
    
    if (existingProfile) {
      console.log('Profile already exists, skipping insert to prevent duplicate key error.');
      return existingProfile;
    }

    const { data, error } = await supabase
      .from('player_profiles')
      .insert({
        id: userId,
        device_id: deviceId
      })
      .select()
      .single();

    if (error) {
      // Eğer insert yine de duplicate key (23505) hatası fırlatırsa, yakala ve mevcut profili döndür
      if (error.code === '23505') {
         console.log('Duplicate key caught during profile creation. Fetching existing profile.');
         return await getProfile(userId, deviceId);
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<PlayerProfile>) {
  const { data, error } = await supabase
    .from('player_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

export async function resetProgress(userId: string) {
  const { error } = await supabase.rpc('reset_player_progress', {
    p_player_id: userId
  });
  
  if (error) {
    console.error('Error resetting progress:', error);
    throw error;
  }
  return true;
}

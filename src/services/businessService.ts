import { supabase } from '../lib/supabase';

// İşletmeleri ve prestij puanını getirir
export async function getBusinesses(playerId: string) {
  const { data, error } = await supabase.rpc('get_all_businesses', {
    p_player_id: playerId,
  });

  if (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }

  // Veritabanı fonksiyonunun döndürdüğü yapıya göre (businesses ve prestige_points) eşleme
  return {
    businesses: data?.businesses || [],
    prestigePoints: data?.prestige_points || 0
  };
}

// İşletme satın alır
export async function purchaseBusiness(playerId: string, businessId: string) {
  const { data, error } = await supabase.rpc('purchase_business', {
    p_player_id: playerId,
    p_business_id: businessId,
  });

  if (error) {
    console.error('Error purchasing business:', error);
    throw error;
  }

  // Veritabanından gelen data.success yapısına göre hata fırlat veya başarılı dön
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to purchase business');
  }

  return data;
}

// İşletmeyi yükseltir
export async function upgradeBusiness(playerId: string, businessId: string) {
  const { data, error } = await supabase.rpc('upgrade_business', {
    p_player_id: playerId,
    p_business_id: businessId,
  });

  if (error) {
    console.error('Error upgrading business:', error);
    throw error;
  }

  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to upgrade business');
  }

  return data;
}
import { supabase } from '../lib/supabase';

// Tüm mevcut işleri getir
export async function getJobs() {
  const { data, error } = await supabase.from('jobs').select('*').order('level');
  if (error) throw error;
  return data || [];
}

// Oyuncunun iş durumu (çalıştığı süreler vb.)
export async function getPlayerJobs(playerId: string) {
  const { data, error } = await supabase.from('player_jobs').select('*').eq('player_id', playerId);
  if (error) throw error;
  return data || [];
}

// İş kilidini aç
export async function unlockJob(playerId: string, jobId: string, unlockCost: number) {
  const { data, error } = await supabase.rpc('unlock_job', {
    p_player_id: playerId,
    p_job_id: jobId,
    p_unlock_cost: unlockCost,
  });

  if (error) {
    console.error('Error unlocking job:', error);
    throw error;
  }

  // Dönen yapıya göre başarı kontrolü
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to unlock job');
  }

  return data;
}

// İşe gir / iş seç
export async function selectJob(playerId: string, jobId: string) {
  const { data, error } = await supabase.rpc('select_job', {
    p_player_id: playerId,
    p_job_id: jobId,
  });

  if (error) {
    console.error('Error selecting job:', error);
    throw error;
  }

  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new Error(data.message || 'Failed to select job');
  }

  return data;
}

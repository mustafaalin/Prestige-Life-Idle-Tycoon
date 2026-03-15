import { supabase } from '../lib/supabase';
import type { PlayerJob } from '../types/game';

export async function getJobs() {
  const { data, error } = await supabase.from('jobs').select('*').order('level');
  if (error) throw error;
  return data || [];
}

export async function getPlayerJobs(playerId: string) {
  const { data, error } = await supabase.from('player_jobs').select('*').eq('player_id', playerId);
  if (error) throw error;
  return data || [];
}

export async function unlockJob(playerId: string, jobId: string) {
  const { error } = await supabase.from('player_jobs').insert({
    player_id: playerId,
    job_id: jobId,
    is_unlocked: true,
    is_active: false,
    is_completed: false,
    total_time_worked_seconds: 0,
    unlocked_at: new Date().toISOString(),
  });

  if (error) throw error;
  return true;
}

export async function selectJob(playerId: string, jobId: string, currentActiveJob?: PlayerJob, unsavedSeconds: number = 0) {
  // Eski işi pasif ve "Completed" yap. (Artık geri dönülemez)
  if (currentActiveJob && unsavedSeconds > 0) {
    const newTotalTime = (currentActiveJob.total_time_worked_seconds || 0) + unsavedSeconds;
    await supabase.from('player_jobs').update({
      is_active: false,
      is_completed: true,
      total_time_worked_seconds: newTotalTime,
    }).eq('player_id', playerId).eq('id', currentActiveJob.id);
  } else if (currentActiveJob) {
    await supabase.from('player_jobs').update({ is_active: false, is_completed: true })
      .eq('player_id', playerId).eq('id', currentActiveJob.id);
  }

  // Yeni seçilen iş daha önce kaydedilmiş mi kontrol et
  const { data: existingJob } = await supabase.from('player_jobs')
    .select('id').eq('player_id', playerId).eq('job_id', jobId).maybeSingle();

  if (existingJob) {
    // Sadece aktif et
    await supabase.from('player_jobs').update({
      is_active: true,
      last_work_started_at: new Date().toISOString(),
    }).eq('id', existingJob.id);
  } else {
    // Level 1 gibi doğrudan kilidi açık varsayılan ve ilk kez seçilen bir işse, veritabanına ekle ve aktif et
    await supabase.from('player_jobs').insert({
      player_id: playerId,
      job_id: jobId,
      is_unlocked: true,
      is_active: true,
      is_completed: false,
      total_time_worked_seconds: 0,
      unlocked_at: new Date().toISOString(),
      last_work_started_at: new Date().toISOString(),
    });
  }

  // Gelir ve prestiji tetikle (Olası Supabase Timeout'una karşı try-catch eklendi)
  try {
    await Promise.all([
      supabase.rpc('calculate_player_income', { p_player_id: playerId } as any),
      supabase.rpc('calculate_player_prestige', { p_player_id: playerId } as any)
    ]);
  } catch (error) {
    console.warn('Warning: Could not recalculate income/prestige automatically. It will be recalculated on next load.', error);
  }
  
  // Bolt'un istediği objeli return yapısına geçildi
  return { success: true, lockedUntil: Date.now() + 120000 };
}

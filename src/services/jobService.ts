import { supabase } from '../lib/supabase';
import type { Job, PlayerJob } from '../types/game';

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

export async function getPlayerJobs(playerId: string): Promise<PlayerJob[]> {
  const { data, error } = await supabase
    .from('player_jobs')
    .select('*')
    .eq('player_id', playerId);

  if (error) {
    console.error('Error fetching player jobs:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllJobs(): Promise<Job[]> {
  return getJobs();
}

export async function fetchPlayerJobs(playerId: string): Promise<PlayerJob[]> {
  return getPlayerJobs(playerId);
}

export async function unlockJob(
  playerId: string,
  jobId: string,
  unlockCost: number
): Promise<void> {
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('total_money')
    .eq('id', playerId)
    .single();

  if (!profile || profile.total_money < unlockCost) {
    throw new Error('Not enough money');
  }

  await supabase
    .from('player_profiles')
    .update({ total_money: profile.total_money - unlockCost })
    .eq('id', playerId);

  const { error } = await supabase.from('player_jobs').insert({
    player_id: playerId,
    job_id: jobId,
    is_unlocked: true,
    is_active: false,
    unlocked_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error unlocking job:', error);
    throw error;
  }
}

export async function selectJob(
  playerId: string,
  jobId: string
): Promise<{ lockedUntil: number }> {
  await supabase
    .from('player_jobs')
    .update({ is_active: false })
    .eq('player_id', playerId);

  const { error } = await supabase
    .from('player_jobs')
    .update({
      is_active: true,
      last_work_started_at: new Date().toISOString(),
      total_time_worked_seconds: 0,
    })
    .eq('player_id', playerId)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error selecting job:', error);
    throw error;
  }

  const lockedUntil = Date.now() + 30 * 60 * 1000;
  return { lockedUntil };
}

export async function setActiveJob(
  playerId: string,
  jobId: string,
  currentActiveJobId?: string
): Promise<{ success: boolean; error?: string }> {
  if (currentActiveJobId) {
    await supabase
      .from('player_jobs')
      .update({
        is_active: false,
        is_completed: false,
        total_time_worked_seconds: 0,
      })
      .eq('player_id', playerId)
      .eq('job_id', currentActiveJobId);
  }

  await supabase
    .from('player_jobs')
    .update({ is_active: false })
    .eq('player_id', playerId)
    .neq('job_id', jobId);

  const { error } = await supabase
    .from('player_jobs')
    .update({
      is_active: true,
      last_work_started_at: new Date().toISOString(),
    })
    .eq('player_id', playerId)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error setting active job:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateJobWorkTime(
  playerId: string,
  jobId: string,
  totalSeconds: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('player_jobs')
    .update({ total_time_worked_seconds: totalSeconds })
    .eq('player_id', playerId)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error updating job work time:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function completeJob(
  playerId: string,
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('player_jobs')
    .update({
      is_active: false,
      is_completed: true,
    })
    .eq('player_id', playerId)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error completing job:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

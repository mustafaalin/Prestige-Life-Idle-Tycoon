import { supabase } from '../lib/supabase';
import type { Job, PlayerJob } from '../types/game';

export async function fetchAllJobs(): Promise<Job[]> {
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

export async function fetchPlayerJobs(playerId: string): Promise<PlayerJob[]> {
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

export async function unlockJob(
  playerId: string,
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('player_jobs').insert({
    player_id: playerId,
    job_id: jobId,
    is_unlocked: true,
    is_active: false,
    unlocked_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error unlocking job:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
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

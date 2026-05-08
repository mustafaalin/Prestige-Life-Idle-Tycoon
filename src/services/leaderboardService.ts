import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  prestigePoints: number;
  lifetimeEarnings: number;
  isCurrentPlayer: boolean;
}

export interface LeaderboardResult {
  top100: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
}

const SCORE_TYPE = 'prestige_points';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function upsertLeaderboardScore(params: {
  authUserId: string;
  displayName: string;
  prestigePoints: number;
  lifetimeEarnings: number;
}): Promise<void> {
  const { authUserId, displayName, prestigePoints, lifetimeEarnings } = params;
  await db.from('leaderboard_scores').upsert(
    {
      auth_user_id: authUserId,
      display_name: displayName,
      score_type: SCORE_TYPE,
      score_value: prestigePoints,
      extra_data: { lifetime_earnings: lifetimeEarnings },
    },
    { onConflict: 'auth_user_id,score_type' }
  );
}

export async function fetchLeaderboard(authUserId: string): Promise<LeaderboardResult> {
  const { data: rows, error } = await db
    .from('leaderboard_scores')
    .select('auth_user_id, display_name, score_value, extra_data')
    .eq('score_type', SCORE_TYPE)
    .order('score_value', { ascending: false })
    .limit(100);

  if (error || !rows) return { top100: [], myEntry: null };

  const sorted = [...rows].sort((a: any, b: any) => {
    if (b.score_value !== a.score_value) return b.score_value - a.score_value;
    return (
      Number(b.extra_data?.lifetime_earnings || 0) -
      Number(a.extra_data?.lifetime_earnings || 0)
    );
  });

  const top100: LeaderboardEntry[] = sorted.map((row: any, index: number) => ({
    rank: index + 1,
    displayName: row.display_name || 'Player',
    prestigePoints: Number(row.score_value || 0),
    lifetimeEarnings: Number(row.extra_data?.lifetime_earnings || 0),
    isCurrentPlayer: row.auth_user_id === authUserId,
  }));

  const inTop100 = top100.some((e) => e.isCurrentPlayer);
  if (inTop100) return { top100, myEntry: null };

  // Player is outside top 100: fetch their rank separately
  const { data: myRow } = await db
    .from('leaderboard_scores')
    .select('display_name, score_value, extra_data')
    .eq('score_type', SCORE_TYPE)
    .eq('auth_user_id', authUserId)
    .single();

  if (!myRow) return { top100, myEntry: null };

  const { count } = await db
    .from('leaderboard_scores')
    .select('*', { count: 'exact', head: true })
    .eq('score_type', SCORE_TYPE)
    .gt('score_value', myRow.score_value);

  const myEntry: LeaderboardEntry = {
    rank: (count || 0) + 1,
    displayName: myRow.display_name || 'Player',
    prestigePoints: Number(myRow.score_value || 0),
    lifetimeEarnings: Number(myRow.extra_data?.lifetime_earnings || 0),
    isCurrentPlayer: true,
  };

  return { top100, myEntry };
}

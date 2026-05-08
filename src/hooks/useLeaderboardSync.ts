import { useEffect, useRef } from 'react';
import { upsertLeaderboardScore } from '../services/leaderboardService';
import { getCachedAuthUserId } from '../lib/auth';
import type { PlayerProfile } from '../types/game';

const SYNC_INTERVAL_MS = 3 * 60 * 1000;

interface UseLeaderboardSyncOptions {
  profile: PlayerProfile | null;
}

export function useLeaderboardSync({ profile }: UseLeaderboardSyncOptions) {
  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const sync = () => {
      const p = profileRef.current;
      const authUserId = getCachedAuthUserId();
      // authUserId null ise Supabase anonymous session henüz tamamlanmamış;
      // bir sonraki interval'de tekrar denenecek
      if (!p || !authUserId) return;

      upsertLeaderboardScore({
        authUserId,
        displayName: p.display_name || p.username || 'Player',
        prestigePoints: Number(p.prestige_points || 0),
        lifetimeEarnings: Number(p.lifetime_earnings || 0),
      }).catch(() => {});
    };

    sync();
    const interval = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  // profile'ın varlığı bağlantıyı kurar; prestige değişince interval yeniden kurulmaz,
  // ref sayesinde her sync son değeri okur.
  }, [profile?.id]);
}

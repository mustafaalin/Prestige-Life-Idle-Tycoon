import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardResult } from '../services/leaderboardService';
import { getCachedAuthUserId } from '../lib/auth';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import { formatMoneyFull } from '../utils/money';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-400 text-amber-900',
  2: 'bg-slate-300 text-slate-700',
  3: 'bg-orange-400 text-orange-900',
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank] ?? 'bg-white/15 text-white';
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${style}`}>
      {rank <= 3 ? <Trophy className="h-3.5 w-3.5" /> : rank}
    </div>
  );
}

function EntryRow({ entry, dimmed = false }: { entry: LeaderboardEntry; dimmed?: boolean }) {
  const bg = entry.isCurrentPlayer
    ? 'bg-cyan-500/20 border border-cyan-400/40'
    : dimmed
    ? 'opacity-50'
    : '';

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${bg}`}>
      <RankBadge rank={entry.rank} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] font-black ${entry.isCurrentPlayer ? 'text-cyan-100' : 'text-white'}`}>
          {entry.displayName}
          {entry.isCurrentPlayer && (
            <span className="ml-1.5 text-[10px] font-semibold text-cyan-300">(You)</span>
          )}
        </p>
        <p className="text-[10px] text-white/50">
          {formatMoneyFull(entry.lifetimeEarnings)} earned
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-3.5 w-3.5" />
        <span className="text-[13px] font-black text-amber-300">{entry.prestigePoints}</span>
      </div>
    </div>
  );
}

function useRelativeTime(fetchedAt: Date | null): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!fetchedAt) return;

    const update = () => {
      const seconds = Math.floor((Date.now() - fetchedAt.getTime()) / 1000);
      if (seconds < 10) setLabel('Updated just now');
      else if (seconds < 60) setLabel(`Updated ${seconds}s ago`);
      else setLabel(`Updated ${Math.floor(seconds / 60)}m ago`);
    };

    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  return label;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [result, setResult] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const freshnessLabel = useRelativeTime(fetchedAt);

  useEffect(() => {
    if (!isOpen) return;
    const authUserId = getCachedAuthUserId();
    if (!authUserId) return;

    setLoading(true);
    fetchLeaderboard(authUserId)
      .then((data) => { setResult(data); setFetchedAt(new Date()); })
      .catch(() => setResult({ top100: [], myEntry: null }))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 z-[80] flex flex-col bg-slate-700" style={{ top: '88px', bottom: 0 }}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-black text-white">Global Leaderboard</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 transition-all active:scale-90"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold text-white/60">Ranked by Prestige · Top 100</span>
        </div>
        {freshnessLabel && (
          <span className="text-[10px] font-semibold text-white/35">{freshnessLabel}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : result && result.top100.length > 0 ? (
          <div className="space-y-1.5">
            {result.top100.map((entry) => (
              <EntryRow key={entry.rank} entry={entry} />
            ))}

            {result.myEntry && (
              <>
                <div className="my-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-[10px] font-bold text-white/40">YOUR RANK</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
                <EntryRow entry={result.myEntry} />
              </>
            )}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <Trophy className="h-10 w-10 text-white/20" />
            <p className="text-sm font-semibold text-white/40">
              No scores yet. Keep playing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

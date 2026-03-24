import { Clock3, MoonStar, Play, TrendingUp } from 'lucide-react';
import { formatMoneyFull } from '../utils/money';

interface OfflineEarningsModalProps {
  isOpen: boolean;
  onClaim: () => void;
  onClaimDouble: () => void;
  earnedAmount: number;
  offlineMinutes: number;
  appliedMinutes: number;
  isClaiming?: boolean;
  isWatchingAd?: boolean;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${Math.floor(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export default function OfflineEarningsModal({
  isOpen,
  onClaim,
  onClaimDouble,
  earnedAmount,
  offlineMinutes,
  appliedMinutes,
  isClaiming = false,
  isWatchingAd = false,
}: OfflineEarningsModalProps) {
  if (!isOpen) return null;

  const wasCapped = offlineMinutes > appliedMinutes;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[340px] overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 px-5 pb-5 pt-6 text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/18 shadow-[0_12px_36px_rgba(255,255,255,0.18)]">
            <MoonStar className="h-8 w-8" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              Welcome Back
            </p>
            <h2 className="mt-2 text-xl font-black leading-tight">You earned while away</h2>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 text-center">
            <div className="text-3xl font-black text-emerald-600">
              {formatMoneyFull(earnedAmount)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.16em]">Away Time</span>
              </div>
              <div className="mt-2 text-base font-black text-slate-900">
                {formatDuration(offlineMinutes)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.16em]">Paid Time</span>
              </div>
              <div className="mt-2 text-base font-black text-slate-900">
                {formatDuration(appliedMinutes)}
              </div>
            </div>
          </div>

          {wasCapped && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] font-bold text-amber-700">
              Your offline payout was capped at 12 hours.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClaim}
              disabled={isClaiming || isWatchingAd}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isClaiming ? 'Collecting...' : 'Collect'}
            </button>

            <button
              onClick={onClaimDouble}
              disabled={isClaiming || isWatchingAd}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1.5">
                <Play className="h-4 w-4 fill-current" />
                {isWatchingAd ? 'Watching...' : 'Boost'}
              </span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Ad Boost
            </div>
            <div className="mt-2 text-sm font-black text-cyan-700">
              {formatMoneyFull(earnedAmount * 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[32px] border border-sky-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 px-6 pb-7 pt-8 text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/18 shadow-[0_18px_50px_rgba(255,255,255,0.2)]">
            <MoonStar className="h-10 w-10" />
          </div>
          <div className="mt-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              Welcome Back
            </p>
            <h2 className="mt-2 text-3xl font-black">You earned while away</h2>
            <p className="mt-2 text-sm font-semibold text-white/85">
              Offline income pays at 20% efficiency for up to 12 hours.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-5">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">Offline Earnings</span>
            </div>
            <div className="mt-3 text-4xl font-black text-emerald-600">
              {formatMoneyFull(earnedAmount)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.16em]">Away Time</span>
              </div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {formatDuration(offlineMinutes)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.16em]">Paid Time</span>
              </div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {formatDuration(appliedMinutes)}
              </div>
            </div>
          </div>

          {wasCapped && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
              Your offline payout was capped at 12 hours.
            </div>
          )}

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                  Ad Boost
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  Watch an ad to collect <span className="text-cyan-700">{formatMoneyFull(earnedAmount * 2)}</span>
                </p>
              </div>
              <button
                onClick={onClaimDouble}
                disabled={isClaiming || isWatchingAd}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <Play className="h-4 w-4 fill-white" />
                {isWatchingAd ? 'Watching...' : 'Watch x2'}
              </button>
            </div>
          </div>

          <button
            onClick={onClaim}
            disabled={isClaiming || isWatchingAd}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-4 text-base font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isClaiming ? 'Collecting...' : 'Collect Earnings'}
          </button>
        </div>
      </div>
    </div>
  );
}

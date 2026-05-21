import { Clock3, MoonStar, TrendingUp } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
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
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-200 px-4 py-3 text-slate-600 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isClaiming ? (
                <span className="text-sm font-black">Collecting...</span>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <img src={LOCAL_ICON_ASSETS.moneyPack0} alt="" className="h-5 w-5 object-contain opacity-70" />
                    <span className="text-sm font-black">{formatMoneyFull(earnedAmount)}</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-60">Collect</span>
                </>
              )}
            </button>

            <div className="relative">
              {!isWatchingAd && !isClaiming && (
                <img
                  src={LOCAL_ICON_ASSETS.ads}
                  alt="Ad"
                  className="absolute -top-3.5 right-3 h-7 w-7 object-contain drop-shadow-sm z-10"
                />
              )}
              <button
                onClick={onClaimDouble}
                disabled={isClaiming || isWatchingAd}
                className={`w-full flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-white transition-all active:scale-[0.98] disabled:opacity-60 ${
                  isWatchingAd
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                {isWatchingAd ? (
                  <span className="text-sm font-black">...</span>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <img src={LOCAL_ICON_ASSETS.moneyPack1} alt="" className="h-5 w-5 object-contain" />
                      <span className="text-sm font-black">{formatMoneyFull(earnedAmount * 2)}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-80">Boost x2</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

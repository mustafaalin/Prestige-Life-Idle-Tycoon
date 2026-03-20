import { useEffect, useMemo, useState } from 'react';
import { Play, ShieldAlert, X } from 'lucide-react';
import type { RewardedAdRequest } from '../services/adService';

interface TestRewardedAdModalProps {
  request: RewardedAdRequest | null;
  providerName?: 'mock' | 'capacitor-admob';
  onRewarded: () => void;
  onDismiss: () => void;
}

export function TestRewardedAdModal({
  request,
  providerName = 'mock',
  onRewarded,
  onDismiss,
}: TestRewardedAdModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!request) {
      setSecondsRemaining(0);
      return;
    }

    setSecondsRemaining(request.minWatchSeconds);

    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [request]);

  const canComplete = useMemo(() => secondsRemaining <= 0, [secondsRemaining]);

  if (!request) return null;

  const progressPercent = ((request.minWatchSeconds - secondsRemaining) / request.minWatchSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-violet-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)]">
        <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 px-6 pb-7 pt-8 text-white">
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 transition-colors hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/15 shadow-[0_18px_50px_rgba(255,255,255,0.2)]">
            <Play className="h-10 w-10 fill-white" />
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              Test Rewarded Ad
            </p>
            <h2 className="mt-2 text-2xl font-black">{request.title}</h2>
            <p className="mt-2 text-sm font-semibold text-white/85">
              {request.description}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-5">
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-violet-700">
              <span>Playback</span>
              <span>{canComplete ? 'Ready' : `${secondsRemaining}s`}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-violet-200 bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(progressPercent, 100))}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {providerName === 'mock'
                  ? 'This is a development test ad. In production, this modal will be replaced by a native rewarded ad SDK.'
                  : 'A native provider is selected, but rewarded ads are not wired yet. This fallback keeps reward flows testable.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition-all active:scale-[0.98]"
            >
              Close
            </button>
            <button
              onClick={onRewarded}
              disabled={!canComplete}
              className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {canComplete ? request.ctaLabel : `Watch ${secondsRemaining}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

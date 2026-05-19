import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { BoostStatus } from '../hooks/useBoosts';

interface BoostAdButtonProps {
  boost: BoostStatus;
  onWatch: () => void;
  disabled?: boolean;
  loading?: boolean;
  gems?: number;
  gemCost?: number;
  onGem?: () => void;
}

export function BoostAdButton({
  boost,
  onWatch,
  disabled = false,
  loading = false,
  gems,
  gemCost,
  onGem,
}: BoostAdButtonProps) {
  if (boost.active) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">⚡ 2× Active</span>
        <div className="flex items-center gap-1.5 rounded-xl bg-amber-400 border border-amber-500 px-3 py-1.5">
          <span className="text-[12px] font-black text-amber-900">⏱</span>
          <span className="text-[12px] font-black text-amber-900">{boost.remainingLabel}</span>
        </div>
      </div>
    );
  }

  const canAffordGem = onGem && gemCost !== undefined && gems !== undefined && gems >= gemCost;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">⚡ 2× Boost · 1hr</span>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onWatch}
          disabled={disabled || loading}
          className="flex items-center gap-1.5 bg-orange-500 px-3 py-2 text-[11px] font-black text-white transition-all active:scale-95 disabled:opacity-50 hover:bg-orange-600"
        >
          <img src={LOCAL_ICON_ASSETS.ads} alt="Ad" className="h-4 w-4 object-contain" />
          <span>{loading ? '...' : 'Watch Ad'}</span>
        </button>
        {onGem && gemCost !== undefined && (
          <>
            <div className="w-px bg-slate-200" />
            <button
              onClick={onGem}
              disabled={!canAffordGem}
              className="flex items-center gap-1.5 bg-violet-600 px-3 py-2 text-[11px] font-black text-white transition-all active:scale-95 disabled:opacity-40 hover:bg-violet-700"
            >
              <img src={LOCAL_ICON_ASSETS.gem} alt="gem" className="h-3.5 w-3.5 object-contain" />
              <span>{gemCost}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

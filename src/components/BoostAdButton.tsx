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
      <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 px-3 py-1.5">
        <span className="text-[11px] font-black text-amber-300">⚡ 2×</span>
        <span className="text-[11px] font-semibold text-amber-200/80">{boost.remainingLabel}</span>
      </div>
    );
  }

  const canAffordGem = onGem && gemCost !== undefined && gems !== undefined && gems >= gemCost;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">⚡ 2× · 1hr</span>
      <div className="flex overflow-hidden rounded-xl border border-amber-400/40">
        <button
          onClick={onWatch}
          disabled={disabled || loading}
          className="flex items-center gap-1 bg-amber-500/20 px-3 py-1.5 text-[11px] font-black text-amber-200 transition-all active:scale-95 disabled:opacity-40 hover:bg-amber-500/30"
        >
          <img src={LOCAL_ICON_ASSETS.ads} alt="Ad" className="h-4 w-4 object-contain" />
          <span>{loading ? '...' : 'Free'}</span>
        </button>
        {onGem && gemCost !== undefined && (
          <>
            <div className="w-px bg-amber-400/30" />
            <button
              onClick={onGem}
              disabled={!canAffordGem}
              className="flex items-center gap-1 bg-violet-500/20 px-3 py-1.5 text-[11px] font-black text-violet-300 transition-all active:scale-95 disabled:opacity-40 hover:bg-violet-500/30"
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

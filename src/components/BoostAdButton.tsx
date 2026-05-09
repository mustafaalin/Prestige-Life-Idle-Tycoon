import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { BoostStatus } from '../hooks/useBoosts';

interface BoostAdButtonProps {
  boost: BoostStatus;
  onWatch: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function BoostAdButton({ boost, onWatch, disabled = false, loading = false }: BoostAdButtonProps) {
  if (boost.active) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 px-3 py-1.5">
        <span className="text-[11px] font-black text-amber-300">⚡ 2×</span>
        <span className="text-[11px] font-semibold text-amber-200/80">{boost.remainingLabel}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={LOCAL_ICON_ASSETS.ads}
        alt="Ad"
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-7 w-7 object-contain drop-shadow-sm z-10"
      />
      <button
        onClick={onWatch}
        disabled={disabled || loading}
        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-black text-white transition-all active:scale-95 disabled:opacity-50 mt-1"
      >
        {loading ? '...' : '2× 1 Saat'}
      </button>
    </div>
  );
}

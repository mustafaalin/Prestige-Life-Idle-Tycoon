import { X, ShoppingBag, TrendingUp } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import { formatMoneyFull } from '../utils/money';

export type FundsCurrency = 'cash' | 'gems';

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToShop: () => void;
  currency: FundsCurrency;
  required: number;
  available: number;
  itemName?: string;
}

export function InsufficientFundsModal({
  isOpen,
  onClose,
  onGoToShop,
  currency,
  required,
  available,
  itemName,
}: InsufficientFundsModalProps) {
  if (!isOpen) return null;

  const isGems = currency === 'gems';
  const shortage = required - available;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-6 pointer-events-auto">
      <div className="w-full max-w-[320px] overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.30)]">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-5 pb-5 pt-6 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 transition-colors hover:bg-white/25 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/18 shadow-[0_10px_30px_rgba(255,255,255,0.18)]">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              Not Enough {isGems ? 'Gems' : 'Cash'}
            </p>
            <h2 className="mt-1.5 text-xl font-black leading-tight">
              {itemName ? `Can't buy ${itemName}` : "You can't afford this"}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 px-4 pb-4 pt-4">

          {/* Shortage info */}
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                  You Need
                </p>
                <p className="mt-1 text-2xl font-black text-slate-800">
                  {isGems ? `${shortage} gems` : formatMoneyFull(shortage)}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {isGems
                    ? `You have ${available} gems`
                    : `You have ${formatMoneyFull(available)}`}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                {isGems
                  ? <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-7 w-7 object-contain" />
                  : <TrendingUp className="h-6 w-6 text-amber-600" />
                }
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-black text-slate-700 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => { onClose(); onGoToShop(); }}
              className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_4px_16px_rgba(251,146,60,0.4)] transition-all active:scale-[0.98]"
            >
              Go to Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

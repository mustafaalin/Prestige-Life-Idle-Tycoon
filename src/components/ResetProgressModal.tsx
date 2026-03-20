import { AlertTriangle, RotateCcw, Sparkles, X } from 'lucide-react';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isResetting?: boolean;
}

export function ResetProgressModal({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}: ResetProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="relative bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 px-6 pb-7 pt-8 text-white">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="absolute right-4 top-4 rounded-full bg-white/12 p-2 transition-colors hover:bg-white/20 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/18 shadow-[0_18px_50px_rgba(255,255,255,0.2)]">
            <RotateCcw className="h-10 w-10" />
          </div>
          <div className="mt-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              Fresh Start
            </p>
            <h2 className="mt-2 text-3xl font-black">Reset Your Progress?</h2>
            <p className="mt-2 text-sm font-semibold text-white/85">
              Your save will go back to a brand new run.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-5">
          <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">This Will Reset</span>
            </div>
            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
              <p>Money, gems, lifetime earnings, clicks, jobs, businesses, properties, outfits and quests.</p>
              <p>You will restart with the level 1 outfit, level 1 house and no vehicle.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Starter balance after reset: $100</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isResetting}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-sm font-black text-slate-700 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isResetting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-4 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isResetting ? 'Resetting...' : 'Reset Everything'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

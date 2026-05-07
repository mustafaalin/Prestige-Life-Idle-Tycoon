import { AlertTriangle, RotateCcw, Sparkles, X } from 'lucide-react';
import { calculateResetPrestigeBonus } from '../services/profileService';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isResetting?: boolean;
  currentGems?: number;
  iapGems?: number;
  iapMoney?: number;
  claimedQuestCount?: number;
  currentBonusPrestige?: number;
}

export function ResetProgressModal({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
  currentGems = 0,
  iapGems = 0,
  iapMoney = 0,
  claimedQuestCount = 0,
  currentBonusPrestige = 0,
}: ResetProgressModalProps) {
  const bonusEarned = calculateResetPrestigeBonus(claimedQuestCount);
  const totalBonusAfter = currentBonusPrestige + bonusEarned;
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

        <div className="space-y-3 px-5 pb-5 pt-5">
          <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">This Will Reset</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-600">
              Money, jobs, businesses, investments, houses, vehicles, outfits and quest progress.
            </div>
          </div>

          <div className={`rounded-3xl border p-4 ${bonusEarned > 0 ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'}`}>
            <div className={`flex items-center gap-2 ${bonusEarned > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">Prestige Bonus</span>
            </div>
            {bonusEarned > 0 ? (
              <>
                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">+{bonusEarned} Permanent Prestige</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {currentBonusPrestige > 0
                        ? `${currentBonusPrestige} → ${totalBonusAfter} total bonus`
                        : `Total after reset: ${totalBonusAfter}`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <span className="text-lg font-black text-white">+{bonusEarned}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-amber-700/80">
                  Earned from {claimedQuestCount} completed quests. Stacks with future resets.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Complete at least 5 quests to earn prestige bonus on reset.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">This Will Be Kept</span>
            </div>
            <div className="mt-2 space-y-1.5 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Purchased gems</span>
                <span className="font-black text-violet-600">{iapGems} gems</span>
              </div>
              {iapMoney > 0 && (
                <div className="flex items-center justify-between">
                  <span>Purchased money</span>
                  <span className="font-black text-emerald-600">${iapMoney.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Starter balance</span>
                <span className="font-black text-emerald-600">$100</span>
              </div>
              {currentGems - iapGems > 0 && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Earned gems (reset)</span>
                  <span className="font-black">-{currentGems - iapGems} gems</span>
                </div>
              )}
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

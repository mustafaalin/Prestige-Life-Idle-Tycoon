import { Play, X } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { QuestDefinition } from '../types/game';
import { formatMoneyFull } from '../utils/money';

interface QuestRewardClaimModalProps {
  isOpen: boolean;
  quest: QuestDefinition | null;
  onClose: () => void;
  onClaim: () => Promise<void>;
  onClaimDouble: () => Promise<void>;
  isBusy?: boolean;
  isWatchingAd?: boolean;
}

export function QuestRewardClaimModal({
  isOpen,
  quest,
  onClose,
  onClaim,
  onClaimDouble,
  isBusy = false,
  isWatchingAd = false,
}: QuestRewardClaimModalProps) {
  if (!isOpen || !quest) return null;

  const rewardMoney = Number(quest.reward_money || 0);
  const rewardGems = Number(quest.reward_gems || 0);
  const hasMoneyReward = rewardMoney > 0;
  const hasGemReward = rewardGems > 0;
  const doubledMoney = rewardMoney * 2;
  const boostedGems = rewardGems + 2;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[340px] overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-5 pb-5 pt-6 text-white">
          <button
            onClick={onClose}
            disabled={isBusy || isWatchingAd}
            className="absolute right-4 top-4 rounded-full bg-white/12 p-2 transition-colors hover:bg-white/20 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/18 shadow-[0_12px_36px_rgba(255,255,255,0.18)]">
            <img
              src={hasMoneyReward ? LOCAL_ICON_ASSETS.money : LOCAL_ICON_ASSETS.gem}
              alt="Quest reward"
              className="h-8 w-8"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
              Quest Reward
            </p>
            <h2 className="mt-2 text-xl font-black leading-tight">{quest.title}</h2>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 text-center">
            <div className="flex items-center justify-center gap-3">
              {hasMoneyReward && (
                <div className="text-3xl font-black text-emerald-600">{formatMoneyFull(rewardMoney)}</div>
              )}
              {hasGemReward && (
                <div className="inline-flex items-center gap-2 text-2xl font-black text-cyan-700">
                  <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-6 w-6" />
                  {rewardGems}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClaim}
              disabled={isBusy || isWatchingAd}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isBusy ? 'Claiming...' : 'Claim'}
            </button>

            <button
              onClick={onClaimDouble}
              disabled={isBusy || isWatchingAd}
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
            <div className="mt-2 text-sm font-black text-slate-800">
              {hasMoneyReward && <span>{formatMoneyFull(doubledMoney)}</span>}
              {hasMoneyReward && hasGemReward && <span> + </span>}
              {hasGemReward && (
                <span className="inline-flex items-center gap-1">
                  <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-4 w-4" />
                  {boostedGems}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

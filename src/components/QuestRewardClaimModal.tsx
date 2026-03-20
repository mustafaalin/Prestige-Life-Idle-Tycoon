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
  const doubledGems = rewardGems * 2;
  const rewardMode = hasMoneyReward && hasGemReward ? 'mixed' : hasMoneyReward ? 'money' : 'gems';
  const rewardLabel =
    rewardMode === 'money'
      ? 'Cash Reward'
      : rewardMode === 'gems'
        ? 'Gem Reward'
        : 'Bonus Reward';
  const helperCopy =
    rewardMode === 'money'
      ? 'Choose how you want to collect this cash reward.'
      : rewardMode === 'gems'
        ? 'Choose how you want to collect these gems.'
        : 'Choose how you want to collect this bonus reward.';
  const adCopy =
    rewardMode === 'money'
      ? 'Watch an ad to double your cash payout'
      : rewardMode === 'gems'
        ? 'Watch an ad to double your gem reward'
        : 'Watch an ad to double both rewards';

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-6 pb-7 pt-8 text-white">
          <button
            onClick={onClose}
            disabled={isBusy || isWatchingAd}
            className="absolute right-4 top-4 rounded-full bg-white/12 p-2 transition-colors hover:bg-white/20 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/18 shadow-[0_18px_50px_rgba(255,255,255,0.2)]">
            <img
              src={hasMoneyReward ? LOCAL_ICON_ASSETS.money : LOCAL_ICON_ASSETS.gem}
              alt="Quest reward"
              className="h-10 w-10"
            />
          </div>
          <div className="mt-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
              {rewardLabel}
            </p>
            <h2 className="mt-2 text-2xl font-black">{quest.title}</h2>
            <p className="mt-2 text-sm font-semibold text-white/85">
              {helperCopy}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-5">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 text-center">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Base Reward</div>
            <div className="mt-3 flex items-center justify-center gap-3">
              {hasMoneyReward && (
                <div className="text-4xl font-black text-emerald-600">{formatMoneyFull(rewardMoney)}</div>
              )}
              {hasGemReward && (
                <div className="inline-flex items-center gap-2 text-3xl font-black text-cyan-700">
                  <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-7 w-7" />
                  {rewardGems}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                  Ad Boost
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {adCopy}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  Watch an ad to collect{' '}
                  {hasMoneyReward && (
                    <span className="text-cyan-700">{formatMoneyFull(doubledMoney)}</span>
                  )}
                  {hasMoneyReward && hasGemReward && <span className="text-cyan-700"> + </span>}
                  {hasGemReward && (
                    <span className="inline-flex items-center gap-1 text-cyan-700">
                      <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-4 w-4" />
                      {doubledGems}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClaimDouble}
                disabled={isBusy || isWatchingAd}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <Play className="h-4 w-4 fill-white" />
                {isWatchingAd ? 'Watching...' : 'Watch x2'}
              </button>
            </div>
          </div>

          <button
            onClick={onClaim}
            disabled={isBusy || isWatchingAd}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-4 text-base font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isBusy ? 'Claiming...' : 'Claim Reward'}
          </button>
        </div>
      </div>
    </div>
  );
}

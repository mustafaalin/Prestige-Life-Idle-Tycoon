import { ArrowRight, CheckCircle2, Sparkles, Wallet } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { QuestDefinition } from '../types/game';

interface QuestBarProps {
  quest: QuestDefinition | null;
  isClaimable: boolean;
  isBusy?: boolean;
  onPress: () => void;
}

export function QuestBar({ quest, isClaimable, isBusy = false, onPress }: QuestBarProps) {
  if (!quest) return null;

  const hasMoneyReward = Number(quest.reward_money || 0) > 0;

  return (
    <div className="fixed bottom-[84px] left-1/2 z-40 mb-1.5 flex w-[88vw] max-w-[468px] -translate-x-1/2 items-stretch gap-2">
      <button
        onClick={onPress}
        disabled={isBusy}
        className={
          'group relative w-full overflow-hidden rounded-[20px] px-3.5 py-2.5 text-left shadow-xl backdrop-blur-md transition-all disabled:opacity-90 disabled:cursor-default ' +
          (isClaimable
            ? 'border border-emerald-300/70 bg-[linear-gradient(135deg,rgba(6,95,70,0.94),rgba(16,185,129,0.92))] hover:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.65)] animate-[questBarClaimablePulse_1.8s_ease-in-out_infinite]'
            : 'border border-slate-200/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(30,41,59,0.78))] hover:scale-[1.01]')
        }
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            isClaimable
              ? 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]'
              : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]'
          }`}
        />

        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${
                isClaimable
                  ? 'bg-white/14 text-emerald-50'
                  : 'bg-white/8 text-slate-200'
              }`}
            >
              {isClaimable ? <CheckCircle2 className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {isClaimable ? 'Complete' : 'Quest'}
            </div>

            <h3 className="mt-1.5 line-clamp-2 pr-1 text-[14px] font-black leading-[1.1] text-white">
              {quest.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-black shadow-sm ${
                isClaimable
                  ? hasMoneyReward
                    ? 'bg-white text-emerald-700'
                    : 'bg-white text-cyan-700'
                  : hasMoneyReward
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-cyan-50 text-cyan-700'
              }`}
            >
              {hasMoneyReward ? (
                <>
                  <Wallet className="h-3.5 w-3.5" />
                  ${quest.reward_money.toLocaleString()}
                </>
              ) : (
                <>
                  <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3.5 w-3.5" />
                  {quest.reward_gems}
                </>
              )}
            </div>

            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                isClaimable
                  ? 'border-white/20 bg-white/14 text-white'
                  : 'border-white/10 bg-white/8 text-white'
              }`}
            >
              <ArrowRight className="h-4 w-4 shrink-0" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

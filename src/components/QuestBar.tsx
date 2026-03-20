import { ArrowRight, Wallet } from 'lucide-react';
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

  return (
    <div className="fixed bottom-[88px] left-1/2 z-40 mb-2 flex w-[75vw] max-w-[420px] -translate-x-1/2 items-stretch gap-2">
      <button
        onClick={onPress}
        disabled={isBusy}
        className={
          'w-full rounded-xl px-3 py-2 text-left shadow-xl backdrop-blur-sm transition-all disabled:opacity-90 disabled:cursor-default ' +
          (isClaimable
            ? 'border border-emerald-300/50 bg-emerald-600/88 animate-bounce hover:scale-[1.02]'
            : 'border border-amber-300/45 bg-slate-950/62 animate-pulse hover:scale-[1.01]')
        }
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${isClaimable ? 'text-emerald-100' : 'text-amber-300'}`}>
              {isClaimable ? 'Quest Complete' : 'Current Quest'}
            </p>
            <h3 className="line-clamp-2 text-[13px] font-black leading-tight text-white sm:line-clamp-1 sm:text-sm">
              {quest.title}
            </h3>
          </div>
          {quest.reward_money > 0 ? (
            <div className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black ${isClaimable ? 'bg-white text-emerald-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Wallet className="h-3.5 w-3.5" />
              ${quest.reward_money.toLocaleString()}
            </div>
          ) : (
            <div className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black ${isClaimable ? 'bg-white text-cyan-700' : 'bg-cyan-50 text-cyan-700'}`}>
              <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3.5 w-3.5" />
              {quest.reward_gems}
            </div>
          )}
          <div className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black ${isClaimable ? 'bg-white/15 text-white' : 'bg-white/8 text-amber-200'}`}>
            {isBusy ? 'Claiming...' : isClaimable ? 'Claim Reward' : 'Go'}
            <ArrowRight className={`h-4 w-4 shrink-0 ${isClaimable ? 'text-white' : 'text-amber-300'}`} />
          </div>
        </div>
      </button>
    </div>
  );
}

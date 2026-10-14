import { Play } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useT } from '../../i18n/useT';
import { showRewardedAd, type AdPlacement } from '../../runtime/ads';
import { canHelp, helpMissing } from '../../runtime/adRewards';
import { track } from '../../runtime/analytics';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { burstCoins } from '../home/coins';
import { GameButton } from '../kit';

// "Watch an ad" offers (docs/monetization-v2.md §4). The button always says what the ad gives, the
// reward comes only after an ad watched to the end, and when no ad can be shown it says so.

interface AdButtonProps {
  placement: AdPlacement;
  /** What the ad gives, e.g. "+$4.2K". */
  children: ReactNode;
  /** The ad was watched to the end; `from` is the button's place on screen (where coins start). */
  onReward: (from: { x: number; y: number }) => void;
  className?: string;
}

export function AdButton({ placement, children, onReward, className = '' }: AdButtonProps) {
  const { t } = useT();
  const ref = useRef<HTMLButtonElement>(null);
  const alive = useRef(true);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => track('ad_offer', { placement }), [placement]);

  const watch = async () => {
    if (busy) return;
    playSfx('click');
    setBusy(true);
    setUnavailable(false);
    // Read before the ad covers the screen; the card may be gone when it closes.
    const rect = ref.current?.getBoundingClientRect();
    const from = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
    const outcome = await showRewardedAd(placement);
    if (outcome === 'rewarded') onReward(from);
    if (!alive.current) return;
    setBusy(false);
    setUnavailable(outcome === 'unavailable');
  };

  return (
    <div className={className}>
      <GameButton
        ref={ref}
        tone="ad"
        onClick={watch}
        disabled={busy}
        className="w-full min-h-11 py-2 px-3 flex items-center justify-center gap-1.5"
      >
        <Play className="shrink-0 w-4 h-4 fill-white" />
        <span className="v2-display text-[14px] leading-tight v2-shadow">{children}</span>
      </GameButton>
      {unavailable && (
        <p className="mt-1 text-[11px] font-bold text-slate-500 text-center">{t('ads.unavailable')}</p>
      )}
    </div>
  );
}

/**
 * "A little help" under a buy button: shown only while what is missing for `cost` is no more than 10%
 * of it and 5 minutes of income, so it is the last step toward a purchase and never a money tap.
 */
export function HelpAd({ cost, className = '' }: { cost: number; className?: string }) {
  const { state } = useGameV2();
  if (!canHelp(state, Date.now(), cost)) return null;
  return <HelpOffer cost={cost} className={className} />;
}

/**
 * The offer keeps the amount it first showed: income would otherwise tick it down every second. It
 * only goes up, when a purchase elsewhere makes the gap bigger, so it always covers what is missing.
 */
function HelpOffer({ cost, className }: { cost: number; className: string }) {
  const { game, actions } = useGameV2();
  const { t, money } = useT();
  const missing = helpMissing(game, cost);
  const [amount, setAmount] = useState(missing);
  if (missing > amount) setAmount(missing);
  return (
    <AdButton
      placement="dream_help"
      className={className}
      onReward={(from) => {
        if (actions.ads.help(cost, amount) <= 0) return;
        playSfx('coin');
        haptic('medium');
        burstCoins({ ...from, count: 10 });
      }}
    >
      {t('ads.help', { amount: money(amount) })}
    </AdButton>
  );
}

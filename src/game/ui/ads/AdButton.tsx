import { Gift } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useT } from '../../i18n/useT';
import { showRewardedAd, type AdPlacement } from '../../runtime/ads';
import { canHelp, helpMissing } from '../../runtime/adRewards';
import { track } from '../../runtime/analytics';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { payout } from '../home/coins';
import { ICONS } from '../icons';
import { GameButton } from '../kit';
import { useAdFree, useAdText } from './useAdText';

// "Watch an ad" offers (docs/monetization-v2.md §4). The button always says what the ad gives, the
// reward comes only after an ad watched to the end, and when no ad can be shown it says so. It must
// read as an ad at a glance (user 2026-10-16): the rewarded-video ticket sticks out of its left edge
// and a light sweeps across it now and then.

interface AdButtonProps {
  placement: AdPlacement;
  /** What the ad gives, e.g. "+$4.2K". */
  children: ReactNode;
  /** The ad was watched to the end; `from` is the button's place on screen (where coins start). */
  onReward: (from: { x: number; y: number }) => void;
  className?: string;
  /** A small button for tight rows (goals, the scene). */
  small?: boolean;
}

export function AdButton({ placement, children, onReward, className = '', small = false }: AdButtonProps) {
  const { t } = useT();
  // The Comfort Pack: the reward comes at once, no ad (runtime/purchases.ts).
  const free = useAdFree();
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
    if (free) {
      track('ad_watch', { placement, outcome: 'ad_free' });
      onReward(from);
      if (alive.current) setBusy(false);
      return;
    }
    const outcome = await showRewardedAd(placement);
    if (outcome === 'rewarded') onReward(from);
    if (!alive.current) return;
    setBusy(false);
    setUnavailable(outcome === 'unavailable');
  };

  return (
    <div className={className}>
      <div className="relative">
        <GameButton
          ref={ref}
          tone="ad"
          onClick={watch}
          disabled={busy}
          className={`relative overflow-hidden w-full flex items-center justify-center gap-1.5 ${
            small ? 'min-h-8 py-1' : 'min-h-11 py-2'
          } ${free ? 'px-3' : `${small ? 'pl-8 pr-2.5' : 'pl-12 pr-3'} v2-ad-shine`}`}
        >
          {free && <Gift className="shrink-0 w-4 h-4" />}
          <span className={`v2-display ${small ? 'text-[12px]' : 'text-[14px]'} leading-tight v2-shadow`}>{children}</span>
        </GameButton>
        {!free && (
          <img
            src={ICONS.adReward}
            alt=""
            draggable={false}
            className={`v2-ad-ticket pointer-events-none absolute -left-2 top-1/2 ${small ? 'w-8 h-8' : 'w-12 h-12'} object-contain drop-shadow-md ${busy ? 'opacity-50' : ''}`}
          />
        )}
      </div>
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
  const { money } = useT();
  const adText = useAdText();
  const missing = helpMissing(game, cost);
  const [amount, setAmount] = useState(missing);
  if (missing > amount) setAmount(missing);
  return (
    <AdButton
      placement="dream_help"
      className={className}
      onReward={() => {
        const paid = actions.ads.help(cost, amount);
        if (paid <= 0) return;
        playSfx('reward');
        haptic('medium');
        payout({ amount: paid, label: `+${money(paid)}`, count: 10 });
      }}
    >
      {adText('ads.help', { amount: money(amount) })}
    </AdButton>
  );
}

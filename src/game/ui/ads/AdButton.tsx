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
import { useAdChipText, useAdFree } from './useAdText';

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
  /** A chip that sits beside others inside a card (AdStrip), instead of a full-width bar. */
  chip?: boolean;
}

export function AdButton({ placement, children, onReward, className = '', small = false, chip = false }: AdButtonProps) {
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

  if (chip) {
    return (
      <div className={`flex flex-col items-end ${className}`}>
        <button
          ref={ref}
          type="button"
          onClick={watch}
          disabled={busy}
          className={`relative overflow-hidden inline-flex items-center gap-1.5 min-h-9 max-w-full rounded-full border-2 border-white/80 bg-gradient-to-b from-orange-400 to-orange-600 v2-glossy shadow-[0_3px_8px_rgba(234,88,12,0.35)] pl-1 pr-3 py-0.5 text-left transition-all active:scale-95 disabled:opacity-60 ${
            free ? '' : 'v2-ad-shine'
          }`}
        >
          <span className="shrink-0 w-7 h-7 rounded-full bg-white/95 shadow-inner flex items-center justify-center">
            <img src={free ? ICONS.adFree : ICONS.adReward} alt="" draggable={false} className="w-6 h-6 object-contain" />
          </span>
          <span className="v2-display text-[12px] leading-tight text-white v2-shadow">{children}</span>
        </button>
        {unavailable && <p className="mt-0.5 text-[10px] font-bold text-slate-500">{t('ads.unavailable')}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        {/* With the Comfort Pack the button turns green and wears the pack's crossed-out play button. */}
        <GameButton
          ref={ref}
          tone={free ? 'buy' : 'ad'}
          onClick={watch}
          disabled={busy}
          className={`relative overflow-hidden w-full flex items-center justify-center gap-1.5 v2-ad-shine ${
            small ? 'min-h-8 py-1 pl-8 pr-2.5' : 'min-h-11 py-2 pl-12 pr-3'
          } ${free ? '!border-amber-300' : ''}`}
        >
          <span className={`v2-display ${small ? 'text-[12px]' : 'text-[14px]'} leading-tight v2-shadow`}>{children}</span>
        </GameButton>
        <img
          src={free ? ICONS.adFree : ICONS.adReward}
          alt=""
          draggable={false}
          className={`v2-ad-ticket pointer-events-none absolute -left-2 top-1/2 ${small ? 'w-8 h-8' : 'w-12 h-12'} object-contain drop-shadow-md ${busy ? 'opacity-50' : ''}`}
        />
      </div>
      {unavailable && (
        <p className="mt-1 text-[11px] font-bold text-slate-500 text-center">{t('ads.unavailable')}</p>
      )}
    </div>
  );
}

interface AdCollectProps {
  placement: AdPlacement;
  /** The ad button's text ("Watch an ad: +$16K (×2)"). */
  adLabel: ReactNode;
  onReward: (from: { x: number; y: number }) => void;
  /** The plain button ("Collect") and what it does. */
  collectLabel: ReactNode;
  /** The pack's one button, when it should not read as the plain one ("Second chance" after a loss). */
  packLabel?: ReactNode;
  onCollect: () => void;
  /** The plain button's look; a loss's "Oh well" is soft. */
  collectTone?: 'buy' | 'soft';
  /** With the Comfort Pack the one button says what it gives ("+$16K"), the plain amount struck out
      beside it ("+$8K") and the badge what the pack added ("×2"). */
  packAmount: string;
  plainAmount?: string;
  packBadge?: string;
  /** The ad can be watched now (its daily limit); otherwise only the plain button. */
  available?: boolean;
  className?: string;
}

/**
 * A reward card's two ways out: the ad that pays more, and the plain collect. With the Comfort Pack
 * the ad's reward comes at once, so a second button would only pay less (2026-10-22, user): one button
 * pays the bigger reward and shows the pack did it, its badge and the plain amount struck out.
 */
export function AdCollect({
  placement,
  adLabel,
  onReward,
  collectLabel,
  packLabel,
  onCollect,
  collectTone = 'buy',
  packAmount,
  plainAmount,
  packBadge,
  available = true,
  className = '',
}: AdCollectProps) {
  const { t } = useT();
  const free = useAdFree();
  const ref = useRef<HTMLButtonElement>(null);

  if (free && available) {
    const take = () => {
      track('ad_watch', { placement, outcome: 'ad_free' });
      const rect = ref.current?.getBoundingClientRect();
      onReward(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 });
    };
    return (
      <div className={`relative pt-3.5 ${className}`}>
        <GameButton
          ref={ref}
          tone="buy"
          onClick={take}
          className="relative overflow-hidden w-full !border-amber-300 v2-ad-shine py-2.5 px-3 flex items-center justify-center gap-2"
        >
          <span className="v2-display text-lg v2-shadow">{packLabel ?? collectLabel}</span>
          <span className="v2-display text-lg v2-shadow tabular-nums">{packAmount}</span>
          {plainAmount && <span className="text-[12px] font-black text-white/70 line-through tabular-nums">{plainAmount}</span>}
        </GameButton>
        {/* The pack's ribbon: what it added, so the player feels the purchase at work. */}
        <span className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <span className="v2-pop-in flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 v2-glossy pl-0.5 pr-2.5 py-px shadow-md">
            <img src={ICONS.adFree} alt="" draggable={false} className="w-6 h-6 object-contain" />
            <span className="v2-display text-[12px] text-white v2-shadow">
              {t('iap.comfort.name')}
              {packBadge ? ` ${packBadge}` : ''}
            </span>
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      {available && (
        <AdButton placement={placement} onReward={onReward} className="mb-2">
          {adLabel}
        </AdButton>
      )}
      <GameButton tone={collectTone} onClick={onCollect} className="w-full py-3 v2-display text-lg v2-shadow">
        {collectLabel}
      </GameButton>
    </div>
  );
}

/** Ad chips inside a card, side by side at its right edge; empty when none is offered. */
export function AdStrip({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`flex flex-wrap justify-end gap-2 empty:hidden ${className}`}>{children}</div>;
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
  const adText = useAdChipText();
  const missing = helpMissing(game, cost);
  const [amount, setAmount] = useState(missing);
  if (missing > amount) setAmount(missing);
  return (
    <AdButton
      chip
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

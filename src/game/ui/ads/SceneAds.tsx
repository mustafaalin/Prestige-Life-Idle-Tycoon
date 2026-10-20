import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  COIN_RAIN_SECONDS,
  OPPORTUNITY_MAX_GAP_SECONDS,
  OPPORTUNITY_MIN_GAP_SECONDS,
  OPPORTUNITY_WINDOW_SECONDS,
} from '../../core/config/ads';
import { canCollect } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { adCooldownLeft, canWatch, opportunityReward } from '../../runtime/adRewards';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { payout } from '../home/coins';
import { ICONS } from '../icons';
import { GameButton } from '../kit';
import { requestFind } from '../scene/sceneEvents';
import { portalRoot } from '../stage';
import { AdButton } from './AdButton';
import { useAdText } from './useAdText';

// Ads on the home scene (docs/monetization-v2.md §4): round buttons under the income boost (send Şans
// to look, a coin shower while there is something on the ground) and an opportunity balloon that floats
// by now and then. Every one opens a small card that says what the ad gives; nothing plays by itself.

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** A small card: picture, title, what the ad gives, the ad button and "Close". */
function AdCard({ image, title, body, children, onClose }: { image: string; title: string; body: string; children: ReactNode; onClose: () => void }) {
  const { t } = useT();
  useBackButton(true, 70, onClose);
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6" onClick={onClose}>
      <div
        className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-28 bg-gradient-to-b from-amber-300 to-orange-500 overflow-hidden flex items-center justify-center">
          <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />
          <img src={image} alt="" draggable={false} className="relative h-24 w-24 object-contain drop-shadow-lg" />
        </div>
        <div className="px-5 pt-3 pb-5 flex flex-col gap-2">
          <h2 className="v2-display text-xl text-slate-900">{title}</h2>
          <p className="text-sm font-bold text-slate-600">{body}</p>
          {children}
          <GameButton tone="soft" onClick={onClose} className="w-full py-2.5 v2-display text-[15px]">
            {t('common.close')}
          </GameButton>
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}

function RoundAdButton({ image, label, onClick, disabled }: { image: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        playSfx('click');
        haptic('light');
        onClick();
      }}
      className="relative w-12 h-12 rounded-full border-2 border-white shadow-xl v2-glossy bg-gradient-to-b from-orange-300 to-orange-500 flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
    >
      <img src={image} alt="" draggable={false} className="w-9 h-9 object-contain" />
      <img src={ICONS.adReward} alt="" draggable={false} className="absolute -right-1.5 -bottom-1.5 w-6 h-6 object-contain drop-shadow" />
    </button>
  );
}

/** Under the income boost on the scene's right. */
export function SceneAdButtons() {
  const { game, state, actions } = useGameV2();
  const { t, duration } = useT();
  const adText = useAdText();
  const [open, setOpen] = useState<'sans' | 'rain' | null>(null);
  const now = Date.now();
  const sansWait = adCooldownLeft(state.ads, 'call_sans', now);
  const raining = state.ads.coinRainUntil > now;

  return (
    <>
      {canWatch(state.ads, 'call_sans', now) || sansWait > 0 ? (
        <RoundAdButton
          image="/assets/scene/sans-wallet.webp"
          label={sansWait > 0 ? t('ads.callSansWait', { duration: duration(Math.ceil(sansWait)) }) : t('ads.callSans')}
          disabled={sansWait > 0}
          onClick={() => setOpen('sans')}
        />
      ) : null}
      {canCollect(game) && !raining && canWatch(state.ads, 'coin_rain', now) && (
        <RoundAdButton image="/assets/scene/coin-pile.webp" label={t('ads.coinRain')} onClick={() => setOpen('rain')} />
      )}
      {open === 'sans' && (
        <AdCard image="/assets/scene/sans-wallet.webp" title={t('ads.callSans')} body={t('scene.findBody')} onClose={() => setOpen(null)}>
          <AdButton
            placement="call_sans"
            onReward={() => {
              setOpen(null);
              if (actions.ads.callSans()) requestFind();
            }}
          >
            {adText('ads.help', { amount: t('ads.callSans') })}
          </AdButton>
        </AdCard>
      )}
      {open === 'rain' && (
        <AdCard
          image="/assets/scene/coin-pile.webp"
          title={t('ads.coinRain')}
          body={t('ads.coinRainBody', { duration: duration(COIN_RAIN_SECONDS) })}
          onClose={() => setOpen(null)}
        >
          <AdButton
            placement="coin_rain"
            onReward={() => {
              setOpen(null);
              if (actions.ads.coinRain()) playSfx('reward');
            }}
          >
            {adText('ads.help', { amount: t('ads.coinRain') })}
          </AdButton>
        </AdCard>
      )}
    </>
  );
}

/** Now and then a balloon floats across the scene; tapping it opens its offer. */
export function OpportunityBalloon({ hidden }: { hidden: boolean }) {
  const { game, state, actions } = useGameV2();
  const { t, money } = useT();
  const adText = useAdText();
  const [flying, setFlying] = useState(false);
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (flying) {
      const timer = window.setTimeout(() => setFlying(false), OPPORTUNITY_WINDOW_SECONDS * 1000);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setFlying(true), random(OPPORTUNITY_MIN_GAP_SECONDS, OPPORTUNITY_MAX_GAP_SECONDS) * 1000);
    return () => window.clearTimeout(timer);
  }, [flying, round]);

  const available = canWatch(state.ads, 'opportunity', Date.now());
  return (
    <>
      {flying && !hidden && available && (
        <button
          type="button"
          aria-label={t('ads.opportunityTitle')}
          onClick={() => {
            playSfx('click');
            haptic('light');
            setFlying(false);
            setOpen(true);
          }}
          className="v2-drift pointer-events-auto absolute top-[22%] w-16 h-16 rounded-full border-2 border-white bg-gradient-to-b from-sky-300 to-indigo-500 v2-glossy shadow-xl flex items-center justify-center"
          style={{ animationDuration: `${OPPORTUNITY_WINDOW_SECONDS}s` }}
        >
          <img src={ICONS.adReward} alt="" draggable={false} className="w-11 h-11 object-contain" />
        </button>
      )}
      {open && (
        <AdCard
          image={ICONS.adReward}
          title={t('ads.opportunityTitle')}
          body={t('ads.opportunityBody')}
          onClose={() => {
            setOpen(false);
            setRound((value) => value + 1);
          }}
        >
          <AdButton
            placement="opportunity"
            onReward={() => {
              setOpen(false);
              setRound((value) => value + 1);
              const amount = actions.ads.opportunity();
              if (amount <= 0) return;
              playSfx('reward');
              haptic('medium');
              payout({ amount, label: `+${money(amount)}`, count: 12 });
            }}
          >
            {adText('ads.opportunity', { amount: money(opportunityReward(game)) })}
          </AdButton>
        </AdCard>
      )}
    </>
  );
}

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BOOST_FACTOR, BOOST_MAX_SECONDS, BOOST_SECONDS } from '../../core/config/ads';
import { useT } from '../../i18n/useT';
import { adsUnlocked, boostHasRoom, boostSecondsLeft, boostsLeft, canBoost } from '../../runtime/adRewards';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { GameButton } from '../kit';
import { AdButton } from './AdButton';

// The income boost (monetization-v2 §4 #3): a button on the home scene opens a small card; one ad
// doubles all earnings for an hour of real time. While it runs, the button shows the time left.

export function BoostButton() {
  const { state } = useGameV2();
  const { t, duration } = useT();
  const [open, setOpen] = useState(false);
  if (!adsUnlocked(state)) return null;

  const left = boostSecondsLeft(state.ads, Date.now());
  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSfx('click');
          haptic('light');
          setOpen(true);
        }}
        aria-label={t('ads.boostTitle', { factor: BOOST_FACTOR })}
        className={`min-w-14 h-14 px-2 rounded-full border-2 border-white shadow-xl v2-glossy bg-gradient-to-b from-orange-400 to-orange-600 flex flex-col items-center justify-center leading-none transition-all active:scale-90 ${left > 0 ? '' : 'v2-bob'}`}
      >
        <span className="v2-display text-[20px] text-white v2-shadow">×{BOOST_FACTOR}</span>
        {left > 0 && (
          <span className="v2-display text-[11px] text-amber-100 v2-shadow tabular-nums whitespace-nowrap">
            {duration(Math.ceil(left / 60) * 60)}
          </span>
        )}
      </button>
      {open && <BoostCard onClose={() => setOpen(false)} />}
    </>
  );
}

function BoostCard({ onClose }: { onClose: () => void }) {
  const { state, actions } = useGameV2();
  const { t, duration } = useT();
  useBackButton(true, 70, onClose);

  const now = Date.now();
  const left = boostSecondsLeft(state.ads, now);
  const adsLeft = boostsLeft(state.ads, now);

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6" onClick={onClose}>
      <div
        className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-28 bg-gradient-to-b from-amber-300 to-orange-500 overflow-hidden flex items-center justify-center">
          <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />
          <p className="relative v2-display v2-outline text-[64px] leading-none text-white">×{BOOST_FACTOR}</p>
        </div>
        <div className="px-5 pt-3 pb-5">
          <h2 className="v2-display text-xl text-slate-900">{t('ads.boostTitle', { factor: BOOST_FACTOR })}</h2>
          <p className="text-sm font-bold text-slate-600 mt-1">
            {t('ads.boostBody', { factor: BOOST_FACTOR, duration: duration(BOOST_SECONDS) })}
          </p>
          {left > 0 && (
            <p className="v2-display text-[20px] text-orange-500 tabular-nums mt-2">
              {t('ads.boostActive', { duration: duration(Math.ceil(left / 60) * 60) })}
            </p>
          )}
          <p className="text-[11px] font-semibold text-slate-500 mt-2 mb-3">
            {adsLeft <= 0
              ? t('ads.boostNone')
              : !boostHasRoom(state.ads, now)
                ? t('ads.boostFull', { duration: duration(BOOST_MAX_SECONDS) })
                : t('ads.boostLeft', { count: adsLeft })}
          </p>
          {canBoost(state, now) && (
            <AdButton
              placement="income_boost"
              className="mb-2"
              onReward={() => {
                if (!actions.ads.boost()) return;
                playSfx('levelUp');
                haptic('medium');
              }}
            >
              {t('ads.boostWatch', { factor: BOOST_FACTOR, duration: duration(BOOST_SECONDS) })}
            </AdButton>
          )}
          <GameButton tone="soft" onClick={onClose} className="w-full py-2.5 v2-display text-[15px]">
            {t('common.close')}
          </GameButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

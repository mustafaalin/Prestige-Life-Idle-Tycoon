import { useEffect, useRef, useState } from 'react';
import { COIN_RAIN_SECONDS } from '../../core/config/ads';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { useRainLook } from './rainLook';

// The coin shower's countdown (2026-10-21, user: the player should feel the hurry): big seconds in a
// ring that drains, red and blinking in the last 10 seconds with "Hurry!", a tick and a buzz each of
// the last 5. Under it, what to tap (\"Tap the bottles!\"), so nobody looks for coins among bottles.

/** From here on the timer turns red and blinks. */
const HURRY_SECONDS = 10;
/** From here on each second ticks. */
const TICK_SECONDS = 5;

export function RainTimer() {
  const { state } = useGameV2();
  const { t } = useT();
  const rain = useRainLook();
  const until = state.ads.coinRainUntil;
  const [now, setNow] = useState(() => Date.now());
  const lastTick = useRef<number | null>(null);

  useEffect(() => {
    if (until <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [until]);

  const left = Math.max(0, (until - now) / 1000);
  const seconds = Math.ceil(left);

  useEffect(() => {
    if (seconds <= 0 || seconds > TICK_SECONDS || lastTick.current === seconds) return;
    lastTick.current = seconds;
    playSfx('click');
    haptic('light');
  }, [seconds]);

  if (left <= 0) return null;

  const hurry = seconds <= HURRY_SECONDS;
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const share = Math.min(1, left / COIN_RAIN_SECONDS);

  return (
    <div className={`flex flex-col items-center gap-1 ${hurry ? 'v2-rain-hurry' : 'v2-rain-in'}`} role="timer" aria-live="off">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className={`absolute inset-[6px] rounded-full border-2 border-white shadow-lg bg-gradient-to-b ${
            hurry ? 'from-rose-400 to-rose-600' : 'from-amber-300 to-orange-500'
          }`}
        />
        <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-black/25" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - share)}
            className={hurry ? 'stroke-rose-200' : 'stroke-white'}
          />
        </svg>
        <span
          key={hurry ? seconds : 'calm'}
          className={`absolute inset-0 flex items-center justify-center v2-display v2-outline-thin text-[34px] text-white tabular-nums ${
            hurry ? 'v2-rain-beat' : ''
          }`}
        >
          {seconds}
        </span>
      </div>
      <span
        className={`rounded-full border-2 border-white px-3 py-0.5 v2-display text-[13px] text-white v2-shadow shadow-md bg-gradient-to-b ${
          hurry ? 'from-rose-400 to-rose-600' : 'from-amber-300 to-orange-500'
        }`}
      >
        {hurry ? t('ads.coinRainHurry') : rain.tap}
      </span>
    </div>
  );
}

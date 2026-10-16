import { ChevronRight, Settings } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { autoIncomePerSecond, classProgress, heroAge } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { boostFactor } from '../../runtime/adRewards';
import { useGameV2 } from '../../runtime/useGameV2';
import { ICONS } from '../icons';
import { heldBalance, onCoinSpill, onHeldBalance, onWalletHit } from './coins';

// Top bar over the scene: money (the target collected bottles fly to), auto income, wealth class,
// age and progress to the next class. A tap on the money opens the income breakdown (IncomeSheet).

export function TopBar({ onOpenSettings, onOpenIncome }: { onOpenSettings: () => void; onOpenIncome: () => void }) {
  const { game, state } = useGameV2();
  const { t, name, money, perMonth } = useT();
  // A watched ad's income boost shows in the income line.
  const boost = boostFactor(state.ads, Date.now());
  // Each arriving coin bumps the wallet (the key restarts the animation).
  const [bump, setBump] = useState(0);
  useEffect(() => onWalletHit(() => setBump((count) => count + 1)), []);
  // Money leaving the wallet: the balance flashes red and shakes (the key restarts it).
  const [hurt, setHurt] = useState(0);
  useEffect(() => onCoinSpill(() => setHurt((count) => count + 1)), []);
  useEffect(() => {
    if (!hurt) return;
    const timer = window.setTimeout(() => setHurt(0), 700);
    return () => window.clearTimeout(timer);
  }, [hurt]);
  // A payout joins the balance as its coins land (an answered event card's reward once collected).
  const held = useSyncExternalStore(onHeldBalance, heldBalance);
  const balance = useRollingBalance(Math.max(0, game.cash - held), held);

  const current = WEALTH_CLASSES[game.classIndex];
  const next = WEALTH_CLASSES[game.classIndex + 1];
  const progress = classProgress(game);

  return (
    <header className="px-3 pt-[calc(var(--safe-top)+8px)]">
      <div className="rounded-[22px] bg-gradient-to-b from-[#2b3f87]/95 to-[#1b2758]/95 border-2 border-white/20 shadow-xl px-2.5 pt-2 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenIncome}
            aria-label={t('income.open')}
            className="flex-1 min-w-0 flex items-center gap-2 max-[380px]:gap-1 rounded-2xl bg-black/25 pl-1.5 pr-2 max-[380px]:pl-1 max-[380px]:pr-1.5 py-1 text-left transition-all active:scale-[0.98]"
          >
            <img
              key={bump}
              data-wallet-icon
              src={ICONS.money}
              alt=""
              draggable={false}
              className={`shrink-0 w-11 max-[380px]:w-8 drop-shadow-md ${bump ? 'v2-bump' : ''}`}
            />
            <div className="min-w-0">
              <p
                key={hurt}
                className={`v2-display v2-outline text-[26px] max-[380px]:text-[21px] leading-none tabular-nums truncate transition-colors duration-500 ${
                  hurt ? 'v2-hurt text-rose-400' : 'text-white'
                }`}
              >
                {money(balance)}
              </p>
              <p
                className={`v2-display text-[12px] leading-tight v2-shadow tabular-nums truncate ${boost > 1 ? 'text-amber-300' : 'text-emerald-300'}`}
              >
                +{perMonth(autoIncomePerSecond(game) * boost)}
                {boost > 1 && ` ×${boost}`}
              </p>
            </div>
            {/* Narrow phones (320 px) need the room for the money. */}
            <ChevronRight className="ml-auto shrink-0 w-4 h-4 text-white/50 max-[380px]:hidden" />
          </button>
          <div className="shrink-0 flex flex-col items-end gap-1">
            {/* On narrow phones a long class name takes two lines, without its icon. */}
            <span className="flex items-center gap-1 rounded-full max-[380px]:rounded-[12px] bg-gradient-to-b from-amber-300 to-orange-500 border border-white/60 v2-glossy pl-1 pr-2.5 max-[380px]:px-2 py-0.5">
              <img
                src={ICONS.status}
                alt=""
                draggable={false}
                className="w-5 h-5 object-contain max-[380px]:hidden"
              />
              <span className="v2-display text-[12px] text-white v2-shadow max-[380px]:max-w-[88px] max-[380px]:text-center max-[380px]:leading-[1.1]">
                {name('wealthClass', current)}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 v2-display text-[12px] text-sky-100 tabular-nums">
                {t('hud.ageShort', { age: heroAge(game).years })}
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label={t('settings.open')}
                className="relative v2-hit w-7 h-7 rounded-full bg-black/25 flex items-center justify-center transition-all active:scale-90"
              >
                <Settings className="w-4 h-4 text-sky-100" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-2 h-[18px] rounded-full bg-black/35 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
          <div className="absolute inset-x-1 top-0.5 h-1.5 rounded-full bg-white/25" />
          <p className="absolute inset-0 flex items-center justify-center v2-display text-[11px] text-white v2-shadow">
            {next
              ? t('hud.toNextClass', { percent: Math.floor(progress * 100), name: name('wealthClass', next) })
              : t('hud.topClass')}
          </p>
        </div>
      </div>
    </header>
  );
}

/** How long the balance takes to count up to a landed payment. */
const ROLL_MS = 450;

/**
 * The balance shown: it counts up when held money is released (a payout's coins landing) and keeps
 * rolling to the latest value while it does; otherwise (income ticks, spending) it is the value itself.
 */
function useRollingBalance(target: number, held: number) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const heldRef = useRef(held);
  const rolling = useRef(false);

  useEffect(() => {
    const released = held < heldRef.current;
    heldRef.current = held;
    if (target <= shownRef.current || (!released && !rolling.current)) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    rolling.current = true;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / ROLL_MS);
      shownRef.current = from + (target - from) * (1 - (1 - progress) ** 3);
      setShown(shownRef.current);
      if (progress < 1) frame = requestAnimationFrame(step);
      else rolling.current = false;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, held]);

  return shown;
}

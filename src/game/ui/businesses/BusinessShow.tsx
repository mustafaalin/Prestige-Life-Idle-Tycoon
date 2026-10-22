import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n/useT';
import type { AdPlacement } from '../../runtime/ads';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { AdCollect } from '../ads/AdButton';
import { Confetti } from '../Confetti';
import { portalRoot } from '../stage';
import { reducedMotion, useCountUp, useShowStep, type Timeline } from './showTiming';

// The two big moments of a business line, played as a short show (2026-10-21): every business has
// three looks of its own and its own manager, so the moment the look changes and the moment a manager
// joins are staged instead of announced. A tap during the show jumps to its end; Android back does the
// same, then closes. With reduced motion the show starts at its end.

/** The old look charges up, a flash, the new look grows in with its name, then the run counts up. */
const GROW_STEPS: Timeline = [0, 700, 1350, 1900];
const GROW_FLASH = 2;
/** The spotlight, the manager steps in, the name plate, then the line is typed and the stamp lands. */
const HIRE_STEPS: Timeline = [0, 250, 800, 1100];
const TYPE_MS_PER_CHAR = 24;

/** `text` typed out letter by letter once `active`; whole when `instant`. */
function useTyped(text: string, active: boolean, instant: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (instant) {
      setCount(text.length);
      return;
    }
    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current + 1 >= text.length) window.clearInterval(timer);
        return Math.min(text.length, current + 1);
      });
    }, TYPE_MS_PER_CHAR);
    return () => window.clearInterval(timer);
  }, [text, active, instant]);
  return { shown: text.slice(0, count), typed: count >= text.length };
}

interface ShowFrameProps {
  /** The top of the card: the stage the show plays on. */
  stage: ReactNode;
  stageClass: string;
  done: boolean;
  skip: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function ShowFrame({ stage, stageClass, done, skip, onClose, children }: ShowFrameProps) {
  useBackButton(true, 70, done ? onClose : skip);

  // Portaled to <body>: a sheet's slide-in animation would otherwise trap the fixed overlay inside it.
  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6"
      onClick={done ? undefined : skip}
    >
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
        <div className={`relative h-56 overflow-hidden ${stageClass}`}>{stage}</div>
        <div className="px-5 pt-3 pb-5 min-h-[150px] flex flex-col">{children}</div>
      </div>
    </div>,
    portalRoot(),
  );
}

export function OkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-show-ribbon w-full rounded-2xl py-3 v2-display text-lg text-white v2-shadow bg-gradient-to-b from-emerald-400 to-green-600 border-2 border-white/70 v2-glossy transition-all active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

interface GrowShowProps {
  /** The picture before and after. */
  fromImage: string;
  toImage: string;
  /** The new level's name ("Small shop"); the line's sentence while it charges ("Flower Stand is
      growing…") and once grown ("Flower Stand grew!"). */
  levelName: string;
  growing: string;
  title: string;
  /** What the line earns per second before and after; shown as a month (2026-10-22, user). */
  fromRate: number;
  toRate: number;
  actionLabel: string;
  onClose: () => void;
  /** An ad's gift beside "Great!"; `amount` for the Comfort Pack's one button. */
  ad?: { placement: AdPlacement; label: string; amount: number; onReward: () => void };
}

/** A business takes on a new look (stand → shop → store). */
export function GrowShow({
  fromImage,
  toImage,
  levelName,
  growing,
  title,
  fromRate,
  toRate,
  actionLabel,
  onClose,
  ad,
}: GrowShowProps) {
  const { t, money, perMonth } = useT();
  const { step, done, skip } = useShowStep(GROW_STEPS);
  const revealed = step >= GROW_FLASH;
  const [skipped, setSkipped] = useState(false);
  const rate = useCountUp(fromRate, toRate, done, skipped || reducedMotion());

  // The flash is the moment: the sound and a firm buzz land with it (at once with reduced motion).
  useEffect(() => {
    if (step !== GROW_FLASH && !(step === GROW_STEPS.length - 1 && reducedMotion())) return;
    playSfx('grow');
    haptic('medium');
  }, [step]);

  const skipShow = () => {
    if (!revealed) playSfx('grow');
    setSkipped(true);
    skip();
  };

  return (
    <ShowFrame
      stageClass="bg-gradient-to-b from-amber-300 to-orange-500"
      done={done}
      skip={skipShow}
      onClose={onClose}
      stage={
        <>
          {revealed && <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />}
          {revealed && <Confetti count={28} />}
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            {revealed ? (
              <img
                key="to"
                src={toImage}
                alt=""
                draggable={false}
                className="v2-show-reveal h-44 max-w-[86%] object-contain drop-shadow-xl"
              />
            ) : (
              <img
                key="from"
                src={fromImage}
                alt=""
                draggable={false}
                className={`h-36 max-w-[76%] object-contain drop-shadow-xl ${step >= 1 ? 'v2-show-charge' : ''}`}
              />
            )}
          </div>
          {step === GROW_FLASH && !skipped && <div className="v2-show-flash absolute inset-0 bg-white" />}
          {revealed && (
            <span className="v2-show-ribbon absolute left-1/2 -translate-x-1/2 bottom-3 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-violet-500 to-indigo-600 v2-glossy px-4 py-1 v2-display text-[15px] text-white v2-shadow">
              {levelName}
            </span>
          )}
        </>
      }
    >
      {revealed ? (
        <h2 className="v2-show-ribbon v2-display text-xl text-slate-900">{title}</h2>
      ) : (
        <p className="v2-display text-xl text-slate-400 animate-pulse">{growing}</p>
      )}
      {done && (
        <>
          <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('business.showMonth')}</p>
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 mb-3 tabular-nums">
            <span className="text-sm font-bold text-slate-400 line-through">{perMonth(fromRate)}</span>
            <span className="v2-display v2-outline text-[30px] leading-tight text-emerald-400">{perMonth(rate)}</span>
          </p>
          {ad ? (
            <AdCollect
              placement={ad.placement}
              className="v2-show-ribbon"
              adLabel={ad.label}
              onReward={ad.onReward}
              collectLabel={actionLabel}
              onCollect={onClose}
              packAmount={`+${money(ad.amount)}`}
            />
          ) : (
            <OkButton label={actionLabel} onClick={onClose} />
          )}
        </>
      )}
    </ShowFrame>
  );
}

interface HireShowProps {
  portrait: string;
  name: string;
  /** What they say on their first day. */
  line: string;
  /** What changes: "{name} now runs {business} for you." */
  note: string;
  stamp: string;
  actionLabel: string;
  onClose: () => void;
}

/** A manager joins a business: steps into a spotlight, says hello, the "on duty" stamp lands. */
export function HireShow({ portrait, name, line, note, stamp, actionLabel, onClose }: HireShowProps) {
  const { step, done, skip } = useShowStep(HIRE_STEPS);
  const [skipped, setSkipped] = useState(false);
  const instant = skipped || reducedMotion();
  const { shown, typed } = useTyped(`“${line}”`, done, instant);
  const finished = done && typed;

  useEffect(() => {
    if (step !== 1 && !(step === HIRE_STEPS.length - 1 && reducedMotion())) return;
    playSfx('hire');
    haptic('light');
  }, [step]);

  // The stamp lands with a firm buzz once the line is said.
  useEffect(() => {
    if (finished && !instant) haptic('medium');
  }, [finished, instant]);

  const skipShow = () => {
    if (step < 1) playSfx('hire');
    setSkipped(true);
    skip();
  };

  return (
    <ShowFrame
      stageClass="bg-gradient-to-b from-indigo-900 to-violet-700"
      done={finished}
      skip={skipShow}
      onClose={onClose}
      stage={
        <>
          <div
            className="v2-show-spot absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 75% at 50% 45%, rgba(253, 230, 138, 0.75), rgba(253, 230, 138, 0.15) 60%, transparent 75%)' }}
          />
          <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-40 h-6 rounded-[50%] bg-black/25 blur-[2px]" />
          {step >= 1 && (
            <img
              src={portrait}
              alt=""
              draggable={false}
              className="v2-show-step-in absolute left-1/2 top-5 -ml-[72px] w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl"
            />
          )}
          {step >= 2 && (
            <span className="v2-show-ribbon absolute left-1/2 -translate-x-1/2 bottom-3 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 v2-glossy px-4 py-1 v2-display text-[16px] text-white v2-shadow">
              {name}
            </span>
          )}
          {finished && (
            <span className="v2-show-stamp absolute right-4 top-5 rounded-lg border-[3px] border-emerald-400 bg-white/90 px-2 py-0.5 v2-display text-[13px] text-emerald-500 shadow-lg">
              {stamp}
            </span>
          )}
        </>
      }
    >
      <p className="text-sm font-bold text-slate-600 min-h-[40px]">{shown}</p>
      {finished && (
        <>
          <p className="v2-show-ribbon text-[11px] font-semibold text-slate-500 mt-2 mb-3">{note}</p>
          <OkButton label={actionLabel} onClick={onClose} />
        </>
      )}
    </ShowFrame>
  );
}

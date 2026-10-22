import { useEffect, useRef, useState } from 'react';
import { careersAfter } from '../../core/formulas';
import type { CareerDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { OkButton, ShowFrame } from '../businesses/BusinessShow';
import { reducedMotion, useCountUp, useShowStep } from '../businesses/showTiming';
import { Confetti } from '../Confetti';
import { JobIcon } from './JobIcon';
import { Cash } from '../CashAmount';

// A new job, played as a short show (docs/career-redesign.md §4): the old job sits in the middle and
// slides out to the left, the new one comes in from the right with rays and confetti, the salary
// counts up from the old pay to the new with "+$X/mo", and the jobs it opens are listed. A tap jumps
// to the end; with reduced motion the show starts there.

/** The old job, it slides out, the new one slides in, then the pay counts up. */
const STEPS = [0, 650, 1100, 1700] as const;
const REVEAL = 2;
/** The finished card closes by itself after this long, if the player has not closed it (user 2026-10-21). */
const AUTO_CLOSE_MS = 3500;

export function JobShow({
  from,
  to,
  fromPay,
  toPay,
  onClose,
}: {
  from: CareerDef | undefined;
  to: CareerDef;
  /** Salary per second before and after (with the income multiplier). */
  fromPay: number;
  toPay: number;
  onClose: () => void;
}) {
  const { t, name, perMonth } = useT();
  const { step, done, skip } = useShowStep(STEPS);
  const [skipped, setSkipped] = useState(false);
  const revealed = step >= REVEAL || from === undefined;
  const pay = useCountUp(fromPay, toPay, done, skipped || reducedMotion());
  const opens = careersAfter(to.id);

  // The new job's arrival is the moment: the fanfare and a firm buzz land with it.
  useEffect(() => {
    if (step !== REVEAL && !(step === STEPS.length - 1 && reducedMotion())) return;
    playSfx('fanfare');
    haptic('medium');
  }, [step]);

  // The latest onClose, so the timer does not restart when the screen re-renders on a tick.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => close.current(), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [done]);

  const skipShow = () => {
    if (!revealed) playSfx('fanfare');
    setSkipped(true);
    skip();
  };

  return (
    <ShowFrame
      stageClass="bg-gradient-to-b from-violet-400 to-indigo-600"
      done={done}
      skip={skipShow}
      onClose={onClose}
      stage={
        <>
          {revealed && <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />}
          {revealed && <Confetti count={28} />}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {revealed ? (
              <div key="to" className="v2-job-in flex flex-col items-center gap-2">
                <JobIcon career={to} size={170} />
                <span className="rounded-full bg-white/95 px-3 py-0.5 v2-display text-[15px] text-indigo-950 shadow">{name('career', to)}</span>
              </div>
            ) : (
              from && (
                <div key="from" className={`flex flex-col items-center gap-2 ${step >= 1 ? 'v2-job-out' : ''}`}>
                  <JobIcon career={from} size={150} />
                  <span className="rounded-full bg-white/80 px-3 py-0.5 v2-display text-[13px] text-indigo-900/70">{name('career', from)}</span>
                </div>
              )
            )}
          </div>
        </>
      }
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{t('career.showTitle')}</p>
      <p className="mt-1 v2-display text-[26px] leading-tight text-emerald-600 tabular-nums"><Cash size={30}>{perMonth(revealed ? pay : fromPay)}</Cash></p>
      {done && toPay > fromPay && (
        <span className="v2-show-ribbon mx-auto mt-1 rounded-full bg-emerald-50 px-3 py-0.5 text-[12px] font-black text-emerald-600">
          <Cash size={16}>+{perMonth(toPay - fromPay)}</Cash>
        </span>
      )}
      {done && opens.length > 0 && (
        <p className="v2-show-ribbon mt-2 text-[12px] font-bold text-violet-600">
          {t('career.leadsToLabel')} {opens.map((next) => name('career', next)).join(', ')}
        </p>
      )}
      <div className="mt-auto pt-3">{done && <OkButton label={t('career.showOk')} onClick={onClose} />}</div>
    </ShowFrame>
  );
}

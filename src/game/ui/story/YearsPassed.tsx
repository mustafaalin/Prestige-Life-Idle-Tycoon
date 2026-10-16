import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx, useMusic } from '../../runtime/feedback';

// "Hand over now" (story-v2.md §6): the skipped years pass on a dark screen while the age counts up
// to the end of life; then the last life moments play one after another (StoryDirector).

const COUNT_MS = 2200;
/** It moves on by itself a little after the count ends; a tap moves on sooner. */
const HOLD_MS = 1600;

export function YearsPassed({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
  const { t } = useT();
  const [age, setAge] = useState(from);
  const done = useRef(false);
  useMusic('story');
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDoneRef.current();
  };

  useEffect(() => {
    playSfx('levelUp');
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      // Fast through the middle years, slowing into the last ones.
      setAge(Math.round(from + (to - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
      else haptic('medium');
    };
    frame = requestAnimationFrame(step);
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onDoneRef.current();
    }, COUNT_MS + HOLD_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [from, to]);

  useBackButton(true, 200, finish);

  return createPortal(
    <div className="fixed inset-0 z-[200] select-none bg-[#140d2b] flex flex-col items-center justify-center px-8" onClick={finish}>
      <p className="v2-line-in text-2xl font-black italic text-white/90 text-center">{t('moments.yearsPassed')}</p>
      <p className="v2-pop-in v2-display v2-outline text-[64px] leading-none text-amber-300 tabular-nums mt-4" style={{ animationDelay: '300ms' }}>
        {t('hud.ageShort', { age })}
      </p>
    </div>,
    document.body,
  );
}

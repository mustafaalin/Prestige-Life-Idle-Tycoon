import { useEffect, useRef, type ReactNode } from 'react';
import { useGuideTarget } from '../guide/guideSteps';
import { ICONS } from '../icons';
import { clearFocus, useFocus } from './focus';

/**
 * Wraps a button a goal ("Go") or Old Ray's guide can point at. Tapping inside it ends a goal's hint.
 * Several keys: the button is the way to more than one goal (e.g. upgrading on the way to a branch).
 */
export function Focusable({
  focusKey,
  className = '',
  children,
}: {
  focusKey: string | readonly string[];
  className?: string;
  children: ReactNode;
}) {
  const focus = useFocus();
  const guide = useGuideTarget();
  const keys: readonly string[] = typeof focusKey === 'string' ? [focusKey] : focusKey;
  const fromGoal = focus !== null && focus !== undefined && keys.includes(focus.target.key);
  const fromGuide = guide !== null && guide !== undefined && keys.includes(guide.key);
  const active = fromGoal || fromGuide;
  const ref = useRef<HTMLDivElement>(null);
  const focusId = fromGoal ? focus.id : fromGuide ? 'guide' : null;

  useEffect(() => {
    if (focusId === null) return;
    // Wait for the sheet to open before scrolling.
    const scroll = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => window.clearTimeout(scroll);
  }, [focusId]);

  return (
    <div ref={ref} onClickCapture={fromGoal ? clearFocus : undefined} className={`relative ${className}`}>
      {children}
      {active && (
        <>
          <span className="v2-focus-ring pointer-events-none absolute -inset-1 rounded-[20px] border-4 border-amber-300" />
          <PointingHand className="-bottom-5 -right-2" />
        </>
      )}
    </div>
  );
}

/** The bobbing hand that shows what to tap; `className` places it (absolute). */
export function PointingHand({ className }: { className: string }) {
  return (
    <span className={`v2-focus-hand pointer-events-none absolute z-10 ${className}`}>
      {/* A dark outline-like shadow keeps the white glove readable on the light sheets. */}
      <img
        src={ICONS.hand}
        alt=""
        draggable={false}
        className="w-9 h-9 object-contain [filter:drop-shadow(0_0_1px_rgba(30,27,75,0.9))_drop-shadow(0_2px_2px_rgba(30,27,75,0.45))]"
      />
    </span>
  );
}

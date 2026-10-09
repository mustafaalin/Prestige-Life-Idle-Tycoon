import { Pointer } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useGuideTarget } from '../guide/guideSteps';
import { clearFocus, useFocus } from './focus';

/** Wraps a button a goal ("Go") or Old Ray's guide can point at. Tapping inside it ends a goal's hint. */
export function Focusable({
  focusKey,
  className = '',
  children,
}: {
  focusKey: string;
  className?: string;
  children: ReactNode;
}) {
  const focus = useFocus();
  const guide = useGuideTarget();
  const fromGoal = focus?.target.key === focusKey;
  const fromGuide = guide?.key === focusKey;
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
      <Pointer className="w-8 h-8 fill-white text-indigo-900 drop-shadow" />
    </span>
  );
}

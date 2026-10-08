import { Pointer } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { clearFocus, useFocus } from './focus';

/** Wraps a button a goal can point at. Tapping inside it ends the hint. */
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
  const active = focus?.target.key === focusKey;
  const ref = useRef<HTMLDivElement>(null);
  const focusId = active ? focus.id : null;

  useEffect(() => {
    if (focusId === null) return;
    // Wait for the sheet to open before scrolling.
    const scroll = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => window.clearTimeout(scroll);
  }, [focusId]);

  return (
    <div ref={ref} onClickCapture={active ? clearFocus : undefined} className={`relative ${className}`}>
      {children}
      {active && (
        <>
          <span className="v2-focus-ring pointer-events-none absolute -inset-1 rounded-[20px] border-4 border-amber-300" />
          <span className="v2-focus-hand pointer-events-none absolute -bottom-5 -right-2 z-10">
            <Pointer className="w-8 h-8 fill-white text-indigo-900 drop-shadow" />
          </span>
        </>
      )}
    </div>
  );
}

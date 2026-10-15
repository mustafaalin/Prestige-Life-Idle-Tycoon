import { Lock } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGuideTarget } from '../guide/guideSteps';
import { AlertBadge } from '../kit';
import { PointingHand } from './Focusable';
import { TABS, type TabId } from './tabs';

// Bottom menu over the scene: glossy buttons that open the tab sheets. Tapping the open one closes it.
// The scene owns the middle and top of the screen, so new screens get a button here (a second row if
// it fills up). A screen that is not open yet shows its button from the start, grey with a lock;
// tapping it says when it opens.

interface BottomNavProps {
  open: TabId | null;
  onSelect: (tab: TabId | null) => void;
  /** Tabs with something the player can do right now get a "!" badge. */
  attention: Partial<Record<TabId, boolean>>;
  /** Tabs not open yet, with when they open ("Opens at Middle Class"). */
  locked?: Partial<Record<TabId, string>>;
  /** A row over the buttons, inside the menu (the dreams board). */
  top?: ReactNode;
}

/** How long the "opens at…" bubble stays over a locked button. */
const LOCKED_HINT_MS = 2500;

export function BottomNav({ open, onSelect, attention, locked = {}, top }: BottomNavProps) {
  const { t } = useT();
  // Old Ray's guide points at the tab its next step is in.
  const guideTab = useGuideTarget()?.tab;
  const [hint, setHint] = useState<TabId | null>(null);

  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(null), LOCKED_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [hint]);

  return (
    <nav className="px-3 pt-1 pb-[calc(var(--safe-bottom)+8px)]">
      <div
        className={`rounded-[24px] bg-gradient-to-b from-[#2b3f87]/95 to-[#1b2758]/95 border-2 border-white/20 shadow-xl px-2.5 pb-2 ${top ? 'pt-4' : 'pt-6'}`}
      >
        {top}
        <div className="flex gap-2.5">
          {TABS.map(({ id, label, icon }) => {
            const selected = id === open;
            const lockedHint = locked[id];
            return (
              <button
                key={id}
                type="button"
                aria-disabled={lockedHint !== undefined}
                onClick={() => {
                  if (lockedHint !== undefined) {
                    haptic('light');
                    setHint(id);
                    return;
                  }
                  playSfx('click');
                  onSelect(selected ? null : id);
                }}
                className={`relative flex-1 min-w-0 h-[56px] rounded-[18px] border-2 border-white/70 v2-glossy bg-gradient-to-b transition-all active:scale-95 ${
                  lockedHint !== undefined
                    ? 'from-slate-400 to-slate-600'
                    : selected
                      ? 'from-amber-300 to-orange-500'
                      : 'from-sky-400 to-blue-600'
                }`}
              >
                <img
                  src={icon}
                  alt=""
                  draggable={false}
                  className={`absolute left-1/2 -translate-x-1/2 -top-6 h-12 w-auto drop-shadow-lg pointer-events-none ${
                    lockedHint !== undefined ? 'grayscale opacity-70' : ''
                  }`}
                />
                {lockedHint !== undefined && (
                  <span className="absolute -top-2 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-b from-slate-500 to-slate-700 border-2 border-white flex items-center justify-center shadow">
                    <Lock className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                )}
                {hint === id && lockedHint !== undefined && (
                  <span className="v2-pop-in absolute bottom-full right-0 mb-8 w-max max-w-[60vw] rounded-xl bg-white px-2.5 py-1.5 shadow-xl v2-display text-[12px] text-indigo-950 pointer-events-none">
                    {lockedHint}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-1 truncate px-0.5 v2-display text-[13px] text-white v2-outline-thin">
                  {t(label)}
                </span>
                {attention[id] && !selected && lockedHint === undefined && (
                  <AlertBadge className="-top-2.5 -right-1.5" />
                )}
                {guideTab === id && !selected && (
                  <>
                    <span className="v2-focus-ring pointer-events-none absolute -inset-1 rounded-[22px] border-4 border-amber-300" />
                    <PointingHand className="-bottom-3 right-0" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

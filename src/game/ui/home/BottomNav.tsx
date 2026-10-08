import { useT } from '../../i18n/useT';
import { playSfx } from '../../runtime/feedback';
import { TABS, type TabId } from './tabs';

// Bottom menu over the scene: glossy buttons that open the tab sheets. Tapping the open one closes it.

interface BottomNavProps {
  open: TabId | null;
  onSelect: (tab: TabId | null) => void;
  /** Tabs with something the player can do right now get a "!" badge. */
  attention: Partial<Record<TabId, boolean>>;
}

export function BottomNav({ open, onSelect, attention }: BottomNavProps) {
  const { t } = useT();

  return (
    <nav className="px-3 pt-1 pb-[calc(var(--safe-bottom)+8px)]">
      <div className="flex gap-2.5 rounded-[24px] bg-gradient-to-b from-[#2b3f87]/95 to-[#1b2758]/95 border-2 border-white/20 shadow-xl px-2.5 pt-6 pb-2">
        {TABS.map(({ id, label, icon }) => {
          const selected = id === open;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                playSfx('click');
                onSelect(selected ? null : id);
              }}
              className={`relative flex-1 h-[56px] rounded-[18px] border-2 border-white/70 v2-glossy bg-gradient-to-b transition-all active:scale-95 ${
                selected ? 'from-amber-300 to-orange-500' : 'from-sky-400 to-blue-600'
              }`}
            >
              <img
                src={icon}
                alt=""
                draggable={false}
                className="absolute left-1/2 -translate-x-1/2 -top-6 h-12 w-auto drop-shadow-lg pointer-events-none"
              />
              <span className="absolute inset-x-0 bottom-1 v2-display text-[13px] text-white v2-outline-thin">
                {t(label)}
              </span>
              {attention[id] && !selected && (
                <span className="absolute -top-2.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-b from-rose-400 to-rose-600 border-2 border-white flex items-center justify-center v2-display text-[13px] text-white shadow">
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

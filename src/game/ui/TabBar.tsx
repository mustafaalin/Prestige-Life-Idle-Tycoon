import { Briefcase, ShoppingBag, Store } from 'lucide-react';
import type { ComponentType } from 'react';
import type { MessageKey } from '../i18n/translate';
import { useT } from '../i18n/useT';

export type TabId = 'businesses' | 'career' | 'shop';

interface TabDef {
  id: TabId;
  label: MessageKey;
  icon: ComponentType<{ className?: string }>;
  /** Not built yet: shown with a "soon" badge and not selectable. */
  soon?: boolean;
}

const TABS: TabDef[] = [
  { id: 'businesses', label: 'tabs.businesses', icon: Store },
  { id: 'career', label: 'tabs.career', icon: Briefcase },
  { id: 'shop', label: 'tabs.shop', icon: ShoppingBag },
];

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  /** Tabs with something the player can do right now get a dot. */
  attention: Partial<Record<TabId, boolean>>;
}

export function TabBar({ active, onChange, attention }: TabBarProps) {
  const { t } = useT();

  return (
    <nav className="shrink-0 bg-white border-t border-slate-100 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] flex gap-2">
      {TABS.map(({ id, label, icon: Icon, soon }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            disabled={soon}
            className={`relative flex-1 rounded-2xl py-2 flex flex-col items-center gap-0.5 transition-all active:scale-95 disabled:opacity-50 ${
              selected ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-black">{t(label)}</span>
            {soon && (
              <span className="absolute -top-1 right-2 rounded-full bg-slate-200 text-slate-500 px-1.5 text-[9px] font-black">
                {t('tabs.soon')}
              </span>
            )}
            {attention[id] && !selected && (
              <span className="absolute top-1 right-[calc(50%-18px)] w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

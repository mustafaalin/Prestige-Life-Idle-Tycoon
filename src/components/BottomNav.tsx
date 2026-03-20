import { ListTodo } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';

interface BottomNavProps {
  activeTab: 'shop' | 'job' | 'business' | 'investments' | 'stuff';
  onTabChange: (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => void;
  attentionTabs?: Partial<Record<'shop' | 'job' | 'business' | 'investments' | 'stuff', boolean>>;
  onOpenQuestList: () => void;
  hasQuestAttention?: boolean;
}

export function BottomNav({
  activeTab,
  onTabChange,
  attentionTabs = {},
  onOpenQuestList,
  hasQuestAttention = false,
}: BottomNavProps) {
  const navItems = [
    { id: 'shop' as const, iconUrl: LOCAL_ICON_ASSETS.shop, label: 'Shop' },
    { id: 'job' as const, iconUrl: LOCAL_ICON_ASSETS.job, label: 'Job' },
    { id: 'business' as const, iconUrl: LOCAL_ICON_ASSETS.business, label: 'Business' },
    { id: 'investments' as const, iconUrl: LOCAL_ICON_ASSETS.investments, label: 'Investments' },
    { id: 'stuff' as const, iconUrl: LOCAL_ICON_ASSETS.stuff, label: 'Stuff' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-transparent border-t border-white/25 h-[88px] pb-[env(safe-area-inset-bottom)]">
      <div className="h-full flex items-center justify-between px-2 py-2 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const hasAttention = attentionTabs[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={
                'relative flex-1 aspect-square rounded-xl transition-all duration-200 border ' +
                (isActive
                  ? 'bg-white/22 border-white/40 shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/20 hover:bg-white/16 hover:border-white/30 hover:shadow-md active:scale-95')
              }
              aria-label={item.label}
            >
              {hasAttention && (
                <div className="absolute -right-1.5 -top-1.5 z-20 flex h-8 w-8 animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 text-base font-black leading-none text-white shadow-[0_0_18px_rgba(239,68,68,0.75)]">
                  !
                </div>
              )}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  className={
                    'w-[70%] h-[70%] object-contain transition-all duration-200 ' +
                    (item.id === 'stuff' ? 'scale-110' : '') + // 👈 sadece Stuff büyür
                    (isActive ? ' scale-125' : '')
                  }
                />
              </div>
            </button>
          );
        })}

        <button
          onClick={onOpenQuestList}
          className="relative flex-1 aspect-square rounded-xl border bg-white/10 border-white/20 transition-all duration-200 hover:bg-white/16 hover:border-white/30 hover:shadow-md active:scale-95"
          aria-label="Quest"
        >
          {hasQuestAttention && (
            <div className="absolute -right-1.5 -top-1.5 z-20 flex h-8 w-8 animate-pulse items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-base font-black leading-none text-white shadow-[0_0_18px_rgba(16,185,129,0.75)]">
              !
            </div>
          )}
          <div className="flex h-full w-full items-center justify-center">
            <ListTodo className="h-8 w-8 text-white" />
          </div>
        </button>
      </div>
    </nav>
  );
}

import { ListTodo } from 'lucide-react';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';

interface BottomNavProps {
  activeTab: 'shop' | 'job' | 'business' | 'investments' | 'stuff';
  onTabChange: (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => void;
  attentionTabs?: Partial<Record<'shop' | 'job' | 'business' | 'investments' | 'stuff', boolean>>;
  onOpenQuestList: () => void;
  hasQuestAttention?: boolean;
  jobProgress?: number;
}

export function BottomNav({
  activeTab,
  onTabChange,
  attentionTabs = {},
  onOpenQuestList,
  hasQuestAttention = false,
  jobProgress = 0,
}: BottomNavProps) {
  const navItems = [
    { id: 'shop' as const, iconUrl: LOCAL_ICON_ASSETS.shop, label: 'Shop' },
    { id: 'job' as const, iconUrl: LOCAL_ICON_ASSETS.job, label: 'Job' },
    { id: 'business' as const, iconUrl: LOCAL_ICON_ASSETS.business, label: 'Business' },
    { id: 'investments' as const, iconUrl: LOCAL_ICON_ASSETS.investments, label: 'Investments' },
    { id: 'stuff' as const, iconUrl: LOCAL_ICON_ASSETS.stuff, label: 'Stuff' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] px-3 py-3">
      <div className="flex items-center gap-2 bg-black/30 border border-white/20 rounded-2xl px-2 py-2 w-full max-w-[500px]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const hasAttention = attentionTabs[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={
                'relative flex-1 h-14 rounded-xl transition-all duration-200 border ' +
                (isActive
                  ? 'bg-white/22 border-white/40 shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/20 active:scale-95')
              }
              aria-label={item.label}
            >
              {item.id === 'job' && jobProgress > 0 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background: `conic-gradient(from -90deg, rgba(52,211,153,0.98) 0deg, rgba(45,212,191,0.98) ${Math.max(0, Math.min(1, jobProgress)) * 360}deg, rgba(255,255,255,0.14) ${Math.max(0, Math.min(1, jobProgress)) * 360}deg, rgba(255,255,255,0.14) 360deg)`,
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />
              )}
              {hasAttention && (
                <div className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-black leading-none text-white shadow-[0_0_14px_rgba(239,68,68,0.75)]">
                  !
                </div>
              )}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  className={
                    'w-7 h-7 object-contain transition-all duration-200 ' +
                    (item.id === 'stuff' ? 'scale-110 ' : '') +
                    (isActive ? 'scale-125' : '')
                  }
                />
              </div>
            </button>
          );
        })}

        <button
          onClick={onOpenQuestList}
          className="relative flex-1 h-14 rounded-xl border bg-white/10 border-white/20 transition-all duration-200 active:scale-95"
          aria-label="Quest"
        >
          {hasQuestAttention && (
            <div className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs font-black leading-none text-white shadow-[0_0_14px_rgba(16,185,129,0.75)]">
              !
            </div>
          )}
          <div className="flex h-full w-full items-center justify-center">
            <ListTodo className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>
    </nav>
  );
}

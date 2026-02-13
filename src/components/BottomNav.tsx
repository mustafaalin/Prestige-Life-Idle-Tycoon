import { ShoppingBag, Briefcase, Building2, TrendingUp, Package } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'shop' | 'job' | 'business' | 'investments' | 'stuff';
  onTabChange: (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: 'shop' as const, icon: ShoppingBag, label: 'Shop' },
    { id: 'job' as const, icon: Briefcase, label: 'Job' },
    { id: 'business' as const, icon: Building2, label: 'Business' },
    { id: 'investments' as const, icon: TrendingUp, label: 'Investments' },
    { id: 'stuff' as const, icon: Package, label: 'Stuff' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/25 backdrop-blur-xl border-t-2 border-white/40 shadow-2xl">
      <div className="flex items-center justify-around py-2 px-2 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg transition-all duration-200
                flex-1 border-2
                ${isActive
                  ? 'bg-gradient-to-br from-cyan-400/60 to-teal-500/60 border-cyan-300 scale-105 shadow-xl'
                  : 'bg-white/20 border-white/40 hover:bg-cyan-300/40 hover:border-cyan-200 hover:scale-105 hover:shadow-lg active:scale-95'
                }
              `}
            >
              <Icon
                className={`
                  w-6 h-6 transition-all duration-200
                  ${isActive ? 'text-white stroke-[2.5]' : 'text-teal-800 stroke-[2]'}
                `}
              />
              <span
                className={`
                  text-[10px] font-black transition-all duration-200 uppercase tracking-tight
                  ${isActive ? 'text-white' : 'text-teal-900'}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

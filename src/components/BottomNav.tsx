const ICON_BASE_URL = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons';

interface BottomNavProps {
  activeTab: 'shop' | 'job' | 'business' | 'investments' | 'stuff';
  onTabChange: (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: 'shop' as const, iconUrl: `${ICON_BASE_URL}/shop.png`, label: 'Shop' },
    { id: 'job' as const, iconUrl: `${ICON_BASE_URL}/job.png`, label: 'Job' },
    { id: 'business' as const, iconUrl: `${ICON_BASE_URL}/business.png`, label: 'Business' },
    { id: 'investments' as const, iconUrl: `${ICON_BASE_URL}/investments.png`, label: 'Investments' },
    { id: 'stuff' as const, iconUrl: `${ICON_BASE_URL}/stuff.png`, label: 'Stuff' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/25 backdrop-blur-xl border-t-2 border-white/40 shadow-2xl">
      <div className="flex items-center justify-around py-2 px-2 gap-2">
        {navItems.map((item) => {
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
              <img
                src={item.iconUrl}
                alt={item.label}
                className="w-8 h-8 transition-all duration-200"
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

const ICON_BASE_URL =
  'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons';

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
    { id: 'stuff' as const, iconUrl: `${ICON_BASE_URL}/stuff.png`, label: 'Stuff' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-transparent border-t border-white/25 h-[88px] pb-[env(safe-area-inset-bottom)]">
      <div className="h-full flex items-center justify-between px-2 py-2 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={
                'flex-1 aspect-square rounded-xl transition-all duration-200 border ' +
                (isActive
                  ? 'bg-white/22 border-white/40 shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/20 hover:bg-white/16 hover:border-white/30 hover:shadow-md active:scale-95')
              }
              aria-label={item.label}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  className={
                    'w-[70%] h-[70%] object-contain transition-all duration-200 ' +
                    (item.id === 'stuff' ? 'scale-110' : '') + // 👈 sadece Stuff büyür
                    (isActive ? ' scale-145' : '')
                  }
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
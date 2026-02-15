import React, { useState, useEffect, useRef } from 'react';

const ICON_BASE_URL =
  'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons';
const DEFAULT_PROFILE_PIC =
  'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/profile-pictures/male/pp-1.png';

interface HeaderProps {
  totalMoney: number;
  hourlyIncome: number;
  username: string;
  characterImage?: string;
  health: number;
  happiness: number;
  gems: number;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function Header({
  totalMoney,
  hourlyIncome,
  username,
  characterImage,
  health,
  happiness,
  gems,
  onOpenProfile,
  onOpenSettings
}: HeaderProps) {
  const [isMoneyAnimating, setIsMoneyAnimating] = useState(false);
  const prevMoneyRef = useRef(totalMoney);

  useEffect(() => {
    if (totalMoney > prevMoneyRef.current) {
      setIsMoneyAnimating(true);
      const timer = setTimeout(() => setIsMoneyAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevMoneyRef.current = totalMoney;
  }, [totalMoney]);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000000) return '$' + (amount / 1000000000).toFixed(2) + 'B';
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(2) + 'K';
    return '$' + amount.toFixed(0);
  };

  const formatHourly = (amount: number) => {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(2) + 'M/h';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(2) + 'K/h';
    return '$' + amount.toFixed(2) + '/h';
  };

  return (
    <header className="bg-gradient-to-br from-sky-500/80 via-cyan-600/80 to-blue-700/80 backdrop-blur-xl text-white shadow-2xl relative overflow-hidden w-full border-b border-white/30 z-20">
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

      <div className="px-3 py-2.5 relative z-10 w-full">
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={onOpenProfile}
              className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 shadow-xl transition-transform active:scale-90"
            >
              <img
                src={characterImage || DEFAULT_PROFILE_PIC}
                alt={username}
                className="w-full h-full object-cover"
              />
            </button>

            <div className="flex flex-col gap-1 min-w-0">
              <div
                className={
                  'flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 border border-white/10 w-fit transition-all duration-300 ' +
                  (isMoneyAnimating
                    ? 'scale-[1.06] shadow-[0_0_16px_rgba(250,204,21,0.55)] border-yellow-400/40'
                    : 'scale-100')
                }
              >
                <img src={ICON_BASE_URL + '/money.png'} alt="Money" className="w-5 h-5" />
                <span className="text-base font-black leading-none truncate max-w-[140px] sm:max-w-[180px]">
                  {formatMoney(totalMoney)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1 border border-white/5 w-fit">
                <img src={ICON_BASE_URL + '/wallet.png'} alt="Wallet" className="w-4 h-4" />
                <span className="text-[11px] font-bold opacity-90 leading-none">
                  {formatHourly(hourlyIncome)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1 border-r border-white/15 pr-2">
              <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-md border border-red-400/30 w-[88px] justify-center">
                <img src={ICON_BASE_URL + '/healthy.png'} alt="Health" className="w-4 h-4" />
                <span className="text-xs font-black">{health}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/20 px-2 py-1 rounded-md border border-amber-400/30 w-[88px] justify-center">
                <img src={ICON_BASE_URL + '/happiness.png'} alt="Happiness" className="w-4 h-4" />
                <span className="text-xs font-black">{happiness}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/12 px-2 py-1 rounded-lg border border-white/20 min-w-[76px] justify-center">
  <img src={ICON_BASE_URL + '/gem.png'} alt="Gems" className="w-4 h-4" />
  <span className="text-sm font-black leading-none">{gems}</span>
</div>

              <button
                onClick={onOpenSettings}
                className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition-all border border-white/20 shadow-lg"
              >
                <img src={ICON_BASE_URL + '/settings.png'} alt="Settings" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
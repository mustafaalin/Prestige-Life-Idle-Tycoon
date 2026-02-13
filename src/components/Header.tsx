import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

const ICON_BASE_URL = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons';
const DEFAULT_PROFILE_PIC = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/profile-pictures/male/pp-1.png';

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
  onOpenSettings,
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

  // Para formatlama fonksiyonları
  const formatMoney = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatHourly = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M/h`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K/h`;
    return `$${amount.toFixed(1)}/h`;
  };

  return (
    <header className="bg-gradient-to-br from-cyan-400/80 via-teal-500/80 to-emerald-600/80 backdrop-blur-xl text-white shadow-2xl relative overflow-hidden w-full border-b border-white/30 z-20">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      
      <div className="px-4 py-3 relative z-10 w-full">
        <div className="flex w-full items-center">
          
          {/* SOL ANA BÖLÜM (%50) - Profil ve Para */}
          <div className="w-1/2 flex items-center gap-3">
            {/* Profil Fotoğrafı */}
            <button
              onClick={onOpenProfile}
              className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 shadow-xl transition-transform active:scale-90"
            >
              <img
                src={characterImage || DEFAULT_PROFILE_PIC}
                alt={username}
                className="w-full h-full object-cover"
              />
            </button>

            {/* Para Bilgileri - Üst Üste */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className={`flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1 border border-white/10 w-fit transition-all duration-300 ${
                isMoneyAnimating
                  ? 'scale-110 shadow-[0_0_20px_rgba(250,204,21,0.6)] border-yellow-400/50'
                  : 'scale-100'
              }`}>
                <img src={`${ICON_BASE_URL}/money.png`} alt="Money" className="w-4 h-4" />
                <span className="text-xl font-black leading-none">{formatMoney(totalMoney)}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1 border border-white/5 w-fit">
                <img src={`${ICON_BASE_URL}/wallet.png`} alt="Wallet" className="w-3.5 h-3.5" />
                <span className="text-xs font-bold opacity-90 leading-none">{formatHourly(hourlyIncome)}</span>
              </div>
            </div>
          </div>

          {/* SAĞ ANA BÖLÜM (%50) */}
          <div className="w-1/2 flex items-center h-full">
            
            {/* Can ve Sağlık (Sağ tarafın ilk %25'lik dilimi) */}
            <div className="w-1/2 flex flex-col items-center gap-1.5 border-r border-white/10">
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-md border border-red-400/30 w-24 justify-center">
                <img src={`${ICON_BASE_URL}/healthy.png`} alt="Health" className="w-4 h-4" />
                <span className="text-sm font-black">{health}%</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-md border border-amber-400/30 w-24 justify-center">
                <img src={`${ICON_BASE_URL}/happiness.png`} alt="Happiness" className="w-4 h-4" />
                <span className="text-sm font-black">{happiness}%</span>
              </div>
            </div>

            {/* Gem ve Ayarlar (En sağdaki %25'lik dilim) */}
            <div className="w-1/2 flex flex-col items-end gap-1.5">
              {/* Gem Bilgisi */}
              <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 min-w-[80px] justify-center">
                <img src={`${ICON_BASE_URL}/money.png`} alt="Gems" className="w-4 h-4" />
                <span className="text-base font-black leading-none">{gems}</span>
              </div>

              {/* Ayarlar Butonu */}
              <button
                onClick={onOpenSettings}
                className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition-all border border-white/20 shadow-lg"
              >
                <img src={`${ICON_BASE_URL}/settings.png`} alt="Settings" className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
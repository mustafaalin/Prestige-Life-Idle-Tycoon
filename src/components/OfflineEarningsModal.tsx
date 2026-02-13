import { Coins, Clock, TrendingUp } from 'lucide-react';

interface OfflineEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedAmount: number;
  offlineMinutes: number;
}

export default function OfflineEarningsModal({
  isOpen,
  onClose,
  earnedAmount,
  offlineMinutes,
}: OfflineEarningsModalProps) {
  if (!isOpen) return null;

  function formatNumber(num: number): string {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(0)}`;
  }

  function formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.floor(minutes)} dakika`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    if (remainingMinutes === 0) {
      return `${hours} saat`;
    }
    return `${hours} saat ${remainingMinutes} dakika`;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 p-1 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-3xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border-2 border-yellow-500/50">
                <Coins className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Hoş Geldin!
              </h2>
              <p className="text-gray-300 text-sm">
                Sen yokken işlerin yolunda gitti
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <p className="text-gray-300 text-sm">Çevrimdışı Süre</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatTime(offlineMinutes)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border-2 border-green-500/50 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <p className="text-gray-200 text-sm font-medium">Kazandığın Para</p>
              </div>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-400 animate-pulse">
                {formatNumber(earnedAmount)}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              Çevrimdışı kazanç, normal kazancının %20'si kadardır
            </p>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Harika! Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

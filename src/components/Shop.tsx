import { X, ShoppingBag } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Character = Database['public']['Tables']['characters']['Row'];
type House = Database['public']['Tables']['houses']['Row'];
type Car = Database['public']['Tables']['cars']['Row'];

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  houses: House[];
  cars: Car[];
  ownedCharacters: string[];
  ownedHouses: string[];
  ownedCars: string[];
  totalMoney: number;
  onPurchase: (itemType: 'character' | 'house' | 'car', itemId: string, price: number) => Promise<boolean>;
}

export function Shop({
  isOpen,
  onClose,
}: ShopProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-white/40">
        <div className="flex items-center justify-between p-6 border-b border-teal-200/50">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Shop
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-teal-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-teal-700" />
          </button>
        </div>

        <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
            <ShoppingBag className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>

          <h3 className="text-3xl font-black text-teal-800">Coming Soon</h3>

          <p className="text-center text-teal-600 text-lg max-w-md leading-relaxed">
            The shop is being prepared with amazing items for you. Stay tuned for exciting updates!
          </p>

          <div className="flex gap-2 mt-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

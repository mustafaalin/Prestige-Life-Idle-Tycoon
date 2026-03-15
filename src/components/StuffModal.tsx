import { useState } from 'react';
import { X, Car as CarIcon, Home, Check } from 'lucide-react';
import type { Car, House } from '../types/game';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

interface StuffModalProps {
  cars: Car[];
  houses: House[];
  totalMoney: number;
  selectedCarId: string | null;
  selectedHouseId: string | null;
  ownedCars: string[];
  onPurchaseCar: (carId: string, price: number) => Promise<void>;
  onSelectCar: (carId: string) => Promise<void>;
  onSelectHouse: (houseId: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function StuffModal({
  cars,
  houses,
  totalMoney,
  selectedCarId,
  selectedHouseId,
  ownedCars,
  onPurchaseCar,
  onSelectCar,
  onSelectHouse,
  onClose,
  loading
}: StuffModalProps) {
  const [activeTab, setActiveTab] = useState<'cars' | 'houses'>('cars');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePurchase = async () => {
    if (!selectedCar || totalMoney < selectedCar.price) return;

    setIsPurchasing(true);
    try {
      await onPurchaseCar(selectedCar.id, selectedCar.price);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error purchasing car:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderCars = () => (
    <div className="grid grid-cols-2 gap-4">
      {cars.map((car: any) => {
        const isOwned = ownedCars.includes(car.id);
        const isSelected = selectedCarId === car.id;
        const canAfford = totalMoney >= car.price;

        return (
          <div
            key={car.id}
            className={`relative rounded-2xl overflow-hidden border-2 ${
              isSelected ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
              isOwned ? 'border-emerald-500/50' : 'border-slate-700'
            } bg-slate-800 flex flex-col transition-all`}
          >
            <div className="aspect-[4/3] relative bg-slate-900 group">
              {car.image_url ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CarIcon className="w-12 h-12 text-slate-700" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{car.name}</h3>
                {!isOwned && (
                  <p className={`font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatMoney(car.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-800">
              {isOwned ? (
                <button
                  onClick={() => onSelectCar(car.id)}
                  disabled={isSelected || loading}
                  className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5" />
                      Equipped
                    </>
                  ) : (
                    'Equip Car'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCar(car);
                    setShowConfirm(true);
                  }}
                  disabled={!canAfford || loading}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                    canAfford
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Buy Car
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[85vh]">
        <div className="p-6 bg-slate-800 border-b border-white/5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-black text-white mb-6">Inventory</h2>

          <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl">
            <button
              onClick={() => setActiveTab('cars')}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'cars'
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CarIcon className="w-5 h-5" />
              Cars
            </button>
            <button
              onClick={() => setActiveTab('houses')}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'houses'
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-5 h-5" />
              Houses
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50">
          {activeTab === 'cars' ? renderCars() : (
            <div className="text-center text-slate-400 mt-10">
              <p>House viewing coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {showConfirm && selectedCar && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2">Confirm Purchase</h3>
            <p className="text-slate-300 mb-6">
              Do you want to buy <span className="text-white font-bold">{selectedCar.name}</span> for{' '}
              <span className="text-emerald-400 font-bold">{formatMoney(selectedCar.price)}</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPurchasing}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center justify-center"
              >
                {isPurchasing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

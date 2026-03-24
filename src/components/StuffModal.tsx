import { useEffect, useState } from 'react';
import { X, Car as CarIcon, Home, Lock, Wallet } from 'lucide-react';
import type { Car, House } from '../types/game';
import { getHouseIconAsset, LOCAL_ICON_ASSETS, resolveLocalAsset } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour } from '../utils/money';
import {
  canAccessCarWithPrestige,
  canAccessHouseWithPrestige,
  getRequiredPrestigeForCar,
  getRequiredPrestigeForHouse,
} from '../data/local/prestigeRequirements';

const formatMoney = formatMoneyFull;

interface StuffModalProps {
  cars: Car[];
  houses: House[];
  totalMoney: number;
  prestigePoints: number;
  initialTab?: 'cars' | 'houses';
  selectedCarId: string | null;
  selectedHouseId: string | null;
  ownedCars: string[];
  onPurchaseCar: (carId: string, price: number) => Promise<boolean>;
  onSelectCar: (carId: string) => Promise<boolean>;
  onSelectHouse: (houseId: string) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

export function StuffModal({
  cars,
  houses,
  totalMoney,
  prestigePoints,
  initialTab = 'cars',
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
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useState;
  useState;

  useState;

  useState;

  useState;

  useState;

  useState;

  useState;

  const currentSelectedCar = cars.find((car) => car.id === selectedCarId) || null;
  const currentSelectedHouse = houses.find((house) => house.id === selectedHouseId) || null;

  const handlePurchase = async () => {
    if (!selectedCar || totalMoney < selectedCar.price || !canAccessCarWithPrestige(selectedCar, prestigePoints)) return;

    setIsPurchasing(true);
    try {
      const success = await onPurchaseCar(selectedCar.id, selectedCar.price);
      if (success) {
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Error purchasing car:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderCars = () => (
    <div className="grid grid-cols-1 gap-3">
      {cars.map((car) => {
        const isOwned = ownedCars.includes(car.id);
        const isSelected = selectedCarId === car.id;
        const canAfford = totalMoney >= car.price;
        const requiredPrestige = getRequiredPrestigeForCar(car);
        const isPrestigeLocked = !isOwned && !canAccessCarWithPrestige(car, prestigePoints);
        const isDowngradeLocked = Boolean(currentSelectedCar && isOwned && car.level < currentSelectedCar.level);

        return (
          <div
            key={car.id}
            className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
              isSelected
                ? 'border-2 border-blue-500'
                : isOwned
                  ? 'border-2 border-emerald-300'
                  : 'border-2 border-slate-200'
            }`}
          >
            <div className={`p-3 flex gap-3 ${
              isSelected
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50'
                : isOwned
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50'
                  : isPrestigeLocked
                    ? 'bg-gradient-to-br from-slate-100 to-slate-200'
                    : 'bg-gradient-to-br from-slate-50 to-blue-50'
            }`}>
              {isPrestigeLocked ? (
                <div className="flex min-h-[176px] w-full flex-col items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 px-5 py-6 text-center shadow-inner">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-5 w-5" />
                    <span className="text-lg font-black">{requiredPrestige}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    Required {requiredPrestige} Prestige Points
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Complete more quests to unlock this vehicle tier.
                  </p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 w-[104px] flex items-center justify-center">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-200'
                        : isOwned
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-200'
                          : 'bg-gradient-to-br from-slate-500 to-slate-700 border-slate-200'
                    }`}>
                      <img
                        src={resolveLocalAsset(car.image_url, 'car')}
                        alt={car.name}
                        className="w-[90%] h-[90%] object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Level {car.level}
                      </p>
                      <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{car.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{car.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/80 rounded-lg px-2 py-1 border border-white/70">
                        <div className="text-[11px] font-black text-blue-700 truncate">
                          {formatMoneyFull(car.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">Price</div>
                      </div>
                      <div className="bg-white/80 rounded-lg px-2 py-1 border border-white/70">
                        <div className="text-[11px] font-black text-rose-700 truncate">
                          {formatMoneyPerHour(Number(car.hourly_maintenance_cost || 0))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">Maintenance</div>
                      </div>
                    </div>

                    {isOwned ? (
                      <button
                        onClick={() => onSelectCar(car.id)}
                        disabled={isSelected || isDowngradeLocked || loading}
                        className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300'
                            : isDowngradeLocked
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95'
                        }`}
                      >
                        {isSelected ? 'Selected' : isDowngradeLocked ? 'Lower Tier Locked' : 'Use Car'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          setShowConfirm(true);
                        }}
                        disabled={!canAfford || loading}
                        className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:scale-95'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy Car' : 'Need More Money'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHouses = () => (
    <div className="grid grid-cols-1 gap-3">
      {houses.map((house) => {
        const isSelected = selectedHouseId === house.id;
        const requiredPrestige = getRequiredPrestigeForHouse(house);
        const isPrestigeLocked = !isSelected && !canAccessHouseWithPrestige(house, prestigePoints);
        const isDowngradeLocked = Boolean(currentSelectedHouse && !isSelected && house.level < currentSelectedHouse.level);
        return (
          <div
            key={house.id}
            className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
              isSelected ? 'border-2 border-blue-500' : 'border-2 border-slate-200'
            }`}
          >
            <div className={`p-3 flex gap-3 ${
              isSelected
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50'
                : isPrestigeLocked
                  ? 'bg-gradient-to-br from-slate-100 to-slate-200'
                  : 'bg-gradient-to-br from-slate-50 to-blue-50'
            }`}>
              {isPrestigeLocked ? (
                <div className="flex min-h-[176px] w-full flex-col items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 px-5 py-6 text-center shadow-inner">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-5 w-5" />
                    <span className="text-lg font-black">{requiredPrestige}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    Required {requiredPrestige} Prestige Points
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Finish more quests to move into this home tier.
                  </p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 w-[104px] flex items-center justify-center">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-200'
                        : 'bg-gradient-to-br from-violet-500 to-indigo-500 border-violet-200'
                    }`}>
                      <img
                        src={getHouseIconAsset(house.level)}
                        alt={house.name}
                        className="w-[90%] h-[90%] object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Level {house.level}
                      </p>
                      <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{house.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{house.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-white/80 rounded-lg px-2 py-1 border border-white/70">
                        <div className="text-[11px] font-black text-rose-700 truncate">
                          {formatMoneyPerHour(Number(house.hourly_rent_cost || 0))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">Rent</div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectHouse(house.id)}
                      disabled={isSelected || isDowngradeLocked || loading}
                      className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300'
                          : isDowngradeLocked
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 active:scale-95'
                      }`}
                    >
                      {isSelected ? 'Current Home' : isDowngradeLocked ? 'Lower Tier Locked' : 'Move Here'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)',
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-violet-100">
        <div className="flex items-center justify-between p-4 border-b border-violet-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Stuff
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-violet-600 font-bold flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                {formatMoneyFull(totalMoney)} available
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {ownedCars.length}/{cars.length} cars owned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-violet-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-violet-700" />
          </button>
        </div>

        <div className="flex gap-2 p-3 bg-white border-b border-violet-100">
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'cars'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            <CarIcon className="w-4 h-4 inline mr-1.5" />
            Cars ({ownedCars.length}/{cars.length})
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'houses'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            <Home className="w-4 h-4 inline mr-1.5" />
            Houses ({houses.length})
          </button>
        </div>

        <div className="px-4 py-3 border-b border-violet-100 bg-white">
          <p className="text-xs text-slate-500">
            Cars cost money and add maintenance. Higher tiers stay hidden behind prestige requirements until you unlock them.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-white">
          {activeTab === 'cars' ? (
            cars.length > 0 ? renderCars() : (
              <div className="h-40 flex items-center justify-center text-slate-400 font-semibold">
                No cars available yet.
              </div>
            )
          ) : houses.length > 0 ? renderHouses() : (
            <div className="h-40 flex items-center justify-center text-slate-400 font-semibold">
              No houses available yet.
            </div>
          )}
        </div>
      </div>

      {showConfirm && selectedCar && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 pointer-events-auto">
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

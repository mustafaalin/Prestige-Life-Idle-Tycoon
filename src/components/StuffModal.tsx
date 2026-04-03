import { useEffect, useState } from 'react';
import { X, Car as CarIcon, Home, Lock, Wallet } from 'lucide-react';
import type { Car, House } from '../types/game';
import { getHouseIconAsset, LOCAL_ICON_ASSETS, resolveLocalAsset } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour } from '../utils/money';
import { getCarProgressionLevel, getMaxJobLevelCoveredByCar } from '../data/local/cars';
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
  totalGems: number;
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
  totalGems,
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
  const sortedCars = [...cars].sort(
    (a, b) => Number(a.display_order || a.level) - Number(b.display_order || b.level)
  );

  const handlePurchase = async () => {
    if (!selectedCar || !canAccessCarWithPrestige(selectedCar, prestigePoints)) return;

    const canAffordSelection =
      selectedCar.purchase_currency === 'gems'
        ? totalGems >= Number(selectedCar.gem_price || 0)
        : totalMoney >= Number(selectedCar.price || 0);

    if (!canAffordSelection) return;

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
      {sortedCars.map((car) => {
        const isOwned = ownedCars.includes(car.id);
        const isSelected = selectedCarId === car.id;
        const isPremium = Boolean(car.is_premium);
        const purchaseCurrency = car.purchase_currency || 'cash';
        const cashPrice = Number(car.price || 0);
        const gemPrice = Number(car.gem_price || 0);
        const canAfford = purchaseCurrency === 'gems' ? totalGems >= gemPrice : totalMoney >= cashPrice;
        const requiredPrestige = getRequiredPrestigeForCar(car);
        const isPrestigeLocked = !isOwned && !canAccessCarWithPrestige(car, prestigePoints);
        const isDowngradeLocked = Boolean(
          currentSelectedCar && isOwned && getCarProgressionLevel(car) < getCarProgressionLevel(currentSelectedCar)
        );
        const healthEffect = Number(car.health_effect_per_hour || 0);
        const happinessEffect = Number(car.happiness_effect_per_hour || 0);
        const formatWellbeingRate = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}/h`;
        const premiumMaxJobLevel = isPremium ? getMaxJobLevelCoveredByCar(car) : null;

        return (
          <div
            key={car.id}
            className={`relative overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl ${
              isSelected
                ? isPremium
                  ? 'border-2 border-amber-400 bg-white shadow-[0_18px_40px_-24px_rgba(245,158,11,0.45)] ring-1 ring-cyan-200/70'
                  : 'border-2 border-blue-500'
                : isOwned
                  ? isPremium
                    ? 'border-2 border-amber-300 bg-white shadow-[0_16px_36px_-24px_rgba(245,158,11,0.35)] ring-1 ring-amber-100'
                    : 'border-2 border-emerald-300'
                  : isPremium
                    ? 'border-2 border-amber-300 bg-white shadow-[0_12px_28px_-24px_rgba(245,158,11,0.28)] ring-1 ring-cyan-100/80'
                    : 'border-2 border-slate-200'
            }`}
          >
            {isPremium && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%),linear-gradient(135deg,rgba(255,251,235,0.97),rgba(248,250,252,0.96))]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />
              </>
            )}
            <div className={`relative z-10 p-3 flex gap-3 ${
              isSelected
                ? isPremium
                  ? 'bg-transparent'
                  : 'bg-gradient-to-br from-blue-50 to-cyan-50'
                : isOwned
                  ? isPremium
                    ? 'bg-transparent'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50'
                  : isPrestigeLocked
                    ? 'bg-gradient-to-br from-slate-100 to-slate-200'
                    : isPremium
                      ? 'bg-transparent'
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
                        ? isPremium
                          ? 'bg-gradient-to-br from-amber-300 via-yellow-300 to-cyan-300 border-amber-200 ring-2 ring-white/70 shadow-[0_10px_24px_rgba(251,191,36,0.28)]'
                          : 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-200'
                        : isOwned
                          ? isPremium
                            ? 'bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 border-amber-200 ring-2 ring-white/60 shadow-[0_10px_24px_rgba(251,191,36,0.22)]'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-200'
                          : isPremium
                            ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-amber-200 ring-2 ring-amber-100/70'
                            : 'bg-gradient-to-br from-slate-500 to-slate-700 border-slate-200'
                    }`}>
                      {car.image_url ? (
                        <img
                          src={resolveLocalAsset(car.image_url, 'car')}
                          alt={car.name}
                          className="w-[90%] h-[90%] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/90">
                          Premium
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-[11px] font-bold uppercase tracking-wide ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isPremium ? `Premium ${car.premium_rank || car.level}` : `Level ${car.level}`}
                        </p>
                        {isPremium && (
                          <span className="rounded-full border border-amber-200 bg-gradient-to-r from-amber-100 to-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                            Premium
                          </span>
                        )}
                      </div>
                      <h3 className={`font-extrabold text-sm leading-tight ${isPremium ? 'text-slate-950' : 'text-gray-900'}`}>{car.name}</h3>
                      <p className={`mt-1 line-clamp-2 text-[11px] ${isPremium ? 'text-slate-700' : 'text-slate-500'}`}>{car.description}</p>
                      {isPremium && premiumMaxJobLevel !== null && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">
                          Covers jobs up to Lv {premiumMaxJobLevel}
                        </p>
                      )}
                    </div>

                    <div className={`grid gap-2 ${isPremium ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {isPremium ? (
                        <div className="col-span-2 rounded-xl border-2 border-amber-200 bg-white/92 px-3 py-2 text-center shadow-[0_6px_16px_rgba(15,23,42,0.06)] backdrop-blur-[2px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-4 w-4" />
                            <div className="text-[13px] font-black text-cyan-800">{gemPrice} Gems</div>
                          </div>
                          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Price</div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/70 bg-white/80 px-2 py-1">
                          <div className="text-[11px] font-black truncate text-blue-700">
                            {formatMoneyFull(cashPrice)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">Price</div>
                        </div>
                      )}
                      {!isPremium && (
                        <div className="bg-white/80 rounded-lg px-2 py-1 border border-white/70">
                          <div className="text-[11px] font-black text-rose-700 truncate">
                            {formatMoneyPerHour(Number(car.hourly_maintenance_cost || 0))}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">Maintenance</div>
                        </div>
                      )}
                      <div className={`rounded-lg px-2 py-1 ${isPremium ? 'border-2 border-emerald-200 bg-emerald-50/92 shadow-[0_4px_12px_rgba(16,185,129,0.08)] backdrop-blur-[2px]' : 'border border-white/70 bg-white/80'}`}>
                        <div className={`text-[11px] font-black truncate ${healthEffect >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                          {formatWellbeingRate(healthEffect)}
                        </div>
                        <div className={`text-[10px] font-semibold ${isPremium ? 'text-slate-600' : 'text-slate-400'}`}>Health</div>
                      </div>
                      <div className={`rounded-lg px-2 py-1 ${isPremium ? 'border-2 border-cyan-200 bg-cyan-50/92 shadow-[0_4px_12px_rgba(34,211,238,0.08)] backdrop-blur-[2px]' : 'border border-white/70 bg-white/80'}`}>
                        <div className={`text-[11px] font-black truncate ${happinessEffect >= 0 ? 'text-cyan-800' : 'text-rose-700'}`}>
                          {formatWellbeingRate(happinessEffect)}
                        </div>
                        <div className={`text-[10px] font-semibold ${isPremium ? 'text-slate-600' : 'text-slate-400'}`}>Happiness</div>
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
                            ? isPremium
                              ? 'bg-gradient-to-r from-amber-400 to-cyan-500 text-white hover:from-amber-500 hover:to-cyan-600 active:scale-95'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:scale-95'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (isPremium ? 'Buy with Gems' : 'Buy Car') : purchaseCurrency === 'gems' ? 'Need More Gems' : 'Need More Money'}
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
              <p className="text-[10px] text-cyan-600 font-bold flex items-center gap-1">
                <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3 w-3" />
                {totalGems} gems
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {ownedCars.length}/{sortedCars.length} cars owned
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
            Cars ({ownedCars.length}/{sortedCars.length})
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
            Standard cars use cash and upkeep. Premium cars use gems and add pure wellbeing bonuses with no maintenance.
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
              <span className={`font-bold ${(selectedCar.purchase_currency || 'cash') === 'gems' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {(selectedCar.purchase_currency || 'cash') === 'gems'
                  ? `${Number(selectedCar.gem_price || 0)} gems`
                  : formatMoney(selectedCar.price)}
              </span>?
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

import { useEffect, useRef, useState } from 'react';
import { Heart, Home, Lock, Smile, Wrench, X, Car as CarIcon, Wallet } from 'lucide-react';
import type { Car, House, Job } from '../types/game';
import { getHouseIconAsset, LOCAL_ICON_ASSETS, resolveLocalAsset } from '../lib/localAssets';
import { Gem } from 'lucide-react';
import { formatMoneyFull, formatMoneyPerHour } from '../utils/money';
import { getCarProgressionLevel, getMaxJobLevelCoveredByCar } from '../data/local/cars';
import {
  canAccessCarWithPrestige,
  canAccessHouseWithPrestige,
  getRequiredPrestigeForCar,
  getRequiredPrestigeForHouse,
} from '../data/local/prestigeRequirements';
import { getJobRequirementMinimum } from '../data/local/jobRequirements';

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
  ownedHouses: string[];
  activeJob: Job | null;
  onPurchaseCar: (carId: string, price: number) => Promise<boolean>;
  onSellCar: (carId: string) => Promise<boolean>;
  onOpenShopForCurrency: (currency: 'cash' | 'gems') => void;
  onSelectCar: (carId: string) => Promise<boolean>;
  onSelectHouse: (houseId: string) => Promise<boolean>;
  onPurchasePremiumHouse: (houseId: string) => Promise<boolean>;
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
  ownedHouses,
  activeJob,
  onPurchaseCar,
  onSellCar,
  onOpenShopForCurrency,
  onSelectCar,
  onSelectHouse,
  onPurchasePremiumHouse,
  onClose,
  loading
}: StuffModalProps) {
  const [activeTab, setActiveTab] = useState<'cars' | 'houses'>('cars');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedCarRef = useRef<HTMLDivElement>(null);
  const selectedHouseRef = useRef<HTMLDivElement>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'buy' | 'sell'>('buy');
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const selectedRef = activeTab === 'cars' ? selectedCarRef : selectedHouseRef;
    const container = scrollContainerRef.current;
    const card = selectedRef.current;
    if (!container || !card) return;

    const timer = setTimeout(() => {
      const cardTop = card.offsetTop;
      const cardCenter = cardTop - container.clientHeight / 2 + card.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, cardCenter), behavior: 'smooth' });
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab]);

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
  const minimumSupportedHouseLevel = getJobRequirementMinimum(activeJob, 'house_level');
  const minimumSupportedCarLevel = getJobRequirementMinimum(activeJob, 'car_level');
  const sortedCars = [...cars].sort(
    (a, b) => Number(a.display_order || a.level) - Number(b.display_order || b.level)
  );
  const formatWellbeingRate = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}/h`;

  const handleConfirmAction = async () => {
    if (!selectedCar) return;
    setIsPurchasing(true);
    try {
      const success =
        confirmMode === 'sell'
          ? await onSellCar(selectedCar.id)
          : await onPurchaseCar(selectedCar.id, selectedCar.price);
      if (success) {
        setShowConfirm(false);
        setSelectedCar(null);
      }
    } catch (error) {
      console.error(`Error ${confirmMode === 'sell' ? 'selling' : 'purchasing'} car:`, error);
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
        const isBelowActiveJobCarRequirement =
          minimumSupportedCarLevel > 0 && getCarProgressionLevel(car) < minimumSupportedCarLevel;
        const violatesActiveJobCarRequirement = Boolean(
          isOwned && !isSelected && isBelowActiveJobCarRequirement
        );
        const blocksPurchaseForActiveJob = !isOwned && isBelowActiveJobCarRequirement;
        const healthEffect = Number(car.health_effect_per_hour || 0);
        const happinessEffect = Number(car.happiness_effect_per_hour || 0);
        const premiumMaxJobLevel = isPremium ? getMaxJobLevelCoveredByCar(car) : null;

        return (
          <div
            key={car.id}
            ref={isSelected ? selectedCarRef : undefined}
            className={`relative overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl ${
              isSelected
                ? isPremium
                  ? 'border-[2.5px] border-amber-400 bg-white shadow-[0_22px_48px_-26px_rgba(245,158,11,0.52)] ring-2 ring-amber-200/80'
                  : 'border-2 border-blue-500'
                : isOwned
                  ? isPremium
                    ? 'border-[2.5px] border-amber-300 bg-white shadow-[0_18px_42px_-26px_rgba(245,158,11,0.4)] ring-2 ring-amber-100/90'
                    : 'border-2 border-emerald-300'
                  : isPremium
                    ? 'border-[2.5px] border-amber-300 bg-white shadow-[0_16px_34px_-24px_rgba(245,158,11,0.32)] ring-2 ring-amber-100/80'
                    : 'border-2 border-slate-200'
            }`}
          >
            {isPremium && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%),linear-gradient(135deg,rgba(255,251,235,0.97),rgba(248,250,252,0.96))]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />
                <div className="pointer-events-none absolute left-[-34px] top-[14px] z-20 rotate-[-34deg] rounded-md border border-amber-300/80 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 px-10 py-1 shadow-[0_8px_18px_rgba(245,158,11,0.28)]">
                  <span className="text-[11px] font-black uppercase tracking-[0.26em] text-white">
                    Premium
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/70" />
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
                  <div className={`${isPremium ? 'shrink-0 w-[48%] max-w-[210px] flex items-center justify-center' : 'shrink-0 w-[42%] max-w-[172px] flex items-center justify-center'}`}>
                    <div className={`aspect-square w-full ${isPremium ? 'max-w-[188px]' : 'max-w-[152px]'} rounded-[24px] shadow-md border flex items-center justify-center ${
                      isSelected
                        ? isPremium
                          ? 'bg-gradient-to-br from-white via-amber-50 to-cyan-50 border-amber-200 ring-2 ring-white/70 shadow-[0_10px_24px_rgba(251,191,36,0.20)]'
                          : 'bg-gradient-to-br from-white via-sky-50 to-cyan-50 border-blue-200 shadow-[0_10px_24px_rgba(59,130,246,0.14)]'
                        : isOwned
                          ? isPremium
                            ? 'bg-gradient-to-br from-white via-amber-50 to-orange-50 border-amber-200 ring-2 ring-white/60 shadow-[0_10px_24px_rgba(251,191,36,0.16)]'
                            : 'bg-gradient-to-br from-white via-emerald-50 to-teal-50 border-emerald-200 shadow-[0_10px_24px_rgba(16,185,129,0.14)]'
                          : isPremium
                            ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50 border-amber-200 ring-2 ring-amber-100/70'
                            : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                    }`}>
                      {car.image_url ? (
                        <img
                          src={resolveLocalAsset(car.image_url, 'car')}
                          alt={car.name}
                          className="h-[86%] w-[86%] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/90">
                          Premium
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2.5 min-w-0">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isPremium ? `Premium ${car.premium_rank || car.level}` : `Level ${car.level}`}
                        </p>
                      </div>
                      <h3 className={`font-extrabold text-sm leading-tight ${isPremium ? 'text-slate-950' : 'text-gray-900'}`}>{car.name}</h3>
                      {isPremium && premiumMaxJobLevel !== null && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">
                          Covers jobs up to Lv {premiumMaxJobLevel}
                        </p>
                      )}
                      {blocksPurchaseForActiveJob && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600">
                          Current job requires vehicle Lv {minimumSupportedCarLevel}+
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {isPremium ? (
                        <div className="col-span-2 rounded-xl border-2 border-amber-200 bg-white/92 px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.06)] backdrop-blur-[2px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-4 w-4" />
                            <div className="text-[13px] font-black text-cyan-800">{gemPrice} Gems</div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/70 bg-white/80 px-2.5 py-2">
                          <div className="flex items-center gap-1.5 text-blue-700">
                            <img src={LOCAL_ICON_ASSETS.money} alt="Price" className="h-3.5 w-3.5 object-contain" />
                            <div className="truncate text-[11px] font-black">{formatMoneyFull(cashPrice)}</div>
                          </div>
                        </div>
                      )}
                      {!isPremium && (
                        <div className="bg-white/80 rounded-lg px-2.5 py-2 border border-white/70">
                          <div className="flex items-center gap-1.5 text-rose-700">
                            <Wrench className="h-3.5 w-3.5" />
                            <div className="truncate text-[11px] font-black">
                              {formatMoneyPerHour(Number(car.hourly_maintenance_cost || 0))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={`rounded-lg px-2.5 py-2 ${isPremium ? 'border-2 border-emerald-200 bg-emerald-50/92 shadow-[0_4px_12px_rgba(16,185,129,0.08)] backdrop-blur-[2px]' : 'border border-white/70 bg-white/80'}`}>
                        <div className={`flex items-center gap-1.5 ${healthEffect >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                          <Heart className="h-3.5 w-3.5" />
                          <div className="truncate text-[11px] font-black">{formatWellbeingRate(healthEffect)}</div>
                        </div>
                      </div>
                      <div className={`rounded-lg px-2.5 py-2 ${isPremium ? 'border-2 border-cyan-200 bg-cyan-50/92 shadow-[0_4px_12px_rgba(34,211,238,0.08)] backdrop-blur-[2px]' : 'border border-white/70 bg-white/80'}`}>
                        <div className={`flex items-center gap-1.5 ${happinessEffect >= 0 ? 'text-cyan-800' : 'text-rose-700'}`}>
                          <Smile className="h-3.5 w-3.5" />
                          <div className="truncate text-[11px] font-black">{formatWellbeingRate(happinessEffect)}</div>
                        </div>
                      </div>
                    </div>

                    {isOwned ? (
                      isSelected ? (
                        <button
                          disabled
                          className={`${isPremium ? 'mt-0.5' : ''} w-full rounded-lg py-1.5 px-3 text-[11px] font-bold transition-all bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300`}
                        >
                          Selected
                        </button>
                      ) : (
                        <div className={`${isPremium ? 'mt-0.5' : ''} grid grid-cols-2 gap-2`}>
                          <button
                            onClick={async () => {
                              if (violatesActiveJobCarRequirement) {
                                setSelectionWarning('Your current job does not support using this vehicle.');
                                return;
                              }

                              await onSelectCar(car.id);
                            }}
                            disabled={loading}
                            className="rounded-lg py-1.5 px-3 text-[11px] font-bold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCar(car);
                              setConfirmMode('sell');
                              setShowConfirm(true);
                            }}
                            disabled={loading}
                            className="rounded-lg py-1.5 px-3 text-[11px] font-bold transition-all bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 active:scale-95"
                          >
                            Sell
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        disabled={loading || blocksPurchaseForActiveJob}
                        className={`${isPremium ? 'mt-0.5' : ''} w-full rounded-lg py-1.5 px-3 text-[11px] font-bold transition-all ${
                          isPremium
                            ? 'bg-gradient-to-r from-amber-400 to-cyan-500 text-white hover:from-amber-500 hover:to-cyan-600 active:scale-95'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:scale-95'
                        } ${loading || blocksPurchaseForActiveJob ? 'opacity-60' : ''}`}
                        onClick={() => {
                          if (blocksPurchaseForActiveJob) {
                            setSelectionWarning(`Your current job requires a vehicle level of ${minimumSupportedCarLevel} or higher.`);
                            return;
                          }

                          if (canAfford) {
                            setSelectedCar(car);
                            setConfirmMode('buy');
                            setShowConfirm(true);
                            return;
                          }

                          onOpenShopForCurrency(purchaseCurrency);
                        }}
                      >
                        Buy
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
        const isPremium = Boolean(house.is_premium);
        const isOwned = isPremium && ownedHouses.includes(house.id);
        const requiredPrestige = getRequiredPrestigeForHouse(house);
        const isPrestigeLocked = !isSelected && !canAccessHouseWithPrestige(house, prestigePoints);
        const violatesActiveJobHouseRequirement = Boolean(
          !isSelected && !isPremium && minimumSupportedHouseLevel > 0 && house.level < minimumSupportedHouseLevel
        );
        const healthEffect = Number(house.health_effect_per_hour || 0);
        const happinessEffect = Number(house.happiness_effect_per_hour || 0);

        // Premium ev kartı
        if (isPremium) {
          const gemPrice = Number(house.gem_price || 0);
          const canAffordGems = totalGems >= gemPrice;
          return (
            <div
              key={house.id}
              ref={isSelected ? selectedHouseRef : undefined}
              className={`relative overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl ${
                isSelected
                  ? 'border-2 border-amber-400 shadow-[0_4px_20px_rgba(251,191,36,0.3)]'
                  : isOwned
                    ? 'border-2 border-amber-300'
                    : isPrestigeLocked
                      ? 'border-2 border-slate-200'
                      : 'border-2 border-amber-200'
              }`}
            >
              {/* Premium gradient arka plan */}
              <div className={`p-3 flex gap-3 ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
                  : isPrestigeLocked
                    ? 'bg-gradient-to-br from-slate-100 to-slate-200'
                    : 'bg-gradient-to-br from-amber-50 via-white to-yellow-50'
              }`}>
                {/* PREMIUM etiketi */}
                {!isPrestigeLocked && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 shadow-sm">
                    <Gem className="h-2.5 w-2.5 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">Premium</span>
                  </div>
                )}

                {isPrestigeLocked ? (
                  <div className="flex min-h-[176px] w-full flex-col items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 px-5 py-6 text-center shadow-inner">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
                      <Lock className="h-7 w-7" />
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-4 w-4" />
                      <span className="text-base font-black">{requiredPrestige}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-black text-slate-900">Requires {requiredPrestige} Prestige</p>
                    <div className="mt-1.5 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1">
                      <Gem className="h-3 w-3 text-amber-600" />
                      <span className="text-[10px] font-black text-amber-700">{gemPrice} gems to unlock</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="shrink-0 w-[42%] max-w-[172px] flex items-center justify-center">
                      <div className={`aspect-square w-full max-w-[152px] rounded-[24px] shadow-md border flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 shadow-[0_10px_24px_rgba(251,191,36,0.25)]'
                          : 'bg-gradient-to-br from-white via-amber-50 to-yellow-50 border-amber-200 shadow-[0_10px_24px_rgba(251,191,36,0.15)]'
                      }`}>
                        <img
                          src={house.icon_url || getHouseIconAsset(house.level)}
                          alt={house.name}
                          className="w-[86%] h-[86%] object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-2 min-w-0 pt-4">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{house.name}</h3>
                        <p className="text-[10px] text-slate-500 leading-snug">{house.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5">
                          <div className="flex items-center gap-1 text-emerald-700">
                            <Home className="h-3 w-3" />
                            <span className="text-[10px] font-black">No Rent</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/70 bg-white/80 px-2 py-1.5">
                          <div className="flex items-center gap-1 text-emerald-700">
                            <Heart className="h-3 w-3" />
                            <span className="text-[10px] font-black">{formatWellbeingRate(healthEffect)}</span>
                          </div>
                        </div>
                        <div className="col-span-2 rounded-lg border border-white/70 bg-white/80 px-2 py-1.5">
                          <div className="flex items-center gap-1 text-cyan-700">
                            <Smile className="h-3 w-3" />
                            <span className="text-[10px] font-black">{formatWellbeingRate(happinessEffect)}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <button disabled className="w-full rounded-lg py-2 px-3 text-xs font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-300">
                          Current Home
                        </button>
                      ) : isOwned ? (
                        <button
                          onClick={async () => { await onSelectHouse(house.id); }}
                          disabled={loading}
                          className="w-full rounded-lg py-2 px-3 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white active:scale-95 transition-all"
                        >
                          Move Here
                        </button>
                      ) : (
                        <button
                          onClick={async () => { await onPurchasePremiumHouse(house.id); }}
                          disabled={loading || !canAffordGems}
                          className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            canAffordGems
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Gem className="h-3.5 w-3.5" />
                          {canAffordGems ? `Buy — ${gemPrice} Gems` : `Need ${gemPrice - totalGems} more gems`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={house.id}
            ref={isSelected ? selectedHouseRef : undefined}
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
                  <div className="shrink-0 w-[42%] max-w-[172px] flex items-center justify-center">
                    <div className={`aspect-square w-full max-w-[152px] rounded-[24px] shadow-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-white via-sky-50 to-cyan-50 border-blue-200 shadow-[0_10px_24px_rgba(59,130,246,0.14)]'
                        : 'bg-gradient-to-br from-white via-violet-50 to-indigo-50 border-violet-200 shadow-[0_10px_24px_rgba(99,102,241,0.14)]'
                    }`}>
                      <img
                        src={getHouseIconAsset(house.level)}
                        alt={house.name}
                        className="w-[86%] h-[86%] object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2.5 min-w-0">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Level {house.level}
                      </p>
                      <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{house.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-white/70 bg-white/80 px-2.5 py-2">
                        <div className="flex items-center gap-1.5 text-rose-700">
                          <Home className="h-3.5 w-3.5" />
                          <div className="truncate text-[11px] font-black">
                            {formatMoneyPerHour(Number(house.hourly_rent_cost || 0))}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/70 bg-white/80 px-2.5 py-2">
                        <div className={`flex items-center gap-1.5 ${healthEffect >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                          <Heart className="h-3.5 w-3.5" />
                          <div className="truncate text-[11px] font-black">{formatWellbeingRate(healthEffect)}</div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/70 bg-white/80 px-2.5 py-2">
                        <div className={`flex items-center gap-1.5 ${happinessEffect >= 0 ? 'text-cyan-800' : 'text-rose-700'}`}>
                          <Smile className="h-3.5 w-3.5" />
                          <div className="truncate text-[11px] font-black">{formatWellbeingRate(happinessEffect)}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => { await onSelectHouse(house.id); }}
                      disabled={isSelected || loading || violatesActiveJobHouseRequirement}
                      className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300'
                          : violatesActiveJobHouseRequirement
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 active:scale-95'
                      }`}
                    >
                      {isSelected
                        ? 'Current Home'
                        : violatesActiveJobHouseRequirement
                          ? `Job needs Lv ${minimumSupportedHouseLevel}+`
                          : 'Move Here'}
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

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 bg-white">
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

      {selectionWarning && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/25 px-5 pointer-events-auto">
          <div className="w-full max-w-[320px] rounded-2xl border border-violet-100 bg-white p-4 shadow-2xl">
            <p className="text-sm font-semibold leading-5 text-slate-700">
              {selectionWarning}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectionWarning(null)}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white transition-all hover:from-violet-600 hover:to-indigo-600 active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && selectedCar && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2">
              {confirmMode === 'sell' ? 'Confirm Sale' : 'Confirm Purchase'}
            </h3>
            <p className="text-slate-300 mb-6">
              {confirmMode === 'sell' ? (
                <>
                  Do you want to sell <span className="text-white font-bold">{selectedCar.name}</span> for{' '}
                  <span className={`font-bold ${(selectedCar.purchase_currency || 'cash') === 'gems' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {(selectedCar.purchase_currency || 'cash') === 'gems'
                      ? `${Math.floor(Number(selectedCar.gem_price || 0) / 2)} gems`
                      : formatMoney(Math.floor(Number(selectedCar.price || 0) / 2))}
                  </span>?
                </>
              ) : (
                <>
                  Do you want to buy <span className="text-white font-bold">{selectedCar.name}</span> for{' '}
                  <span className={`font-bold ${(selectedCar.purchase_currency || 'cash') === 'gems' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {(selectedCar.purchase_currency || 'cash') === 'gems'
                      ? `${Number(selectedCar.gem_price || 0)} gems`
                      : formatMoney(selectedCar.price)}
                  </span>?
                </>
              )}
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
                onClick={handleConfirmAction}
                disabled={isPurchasing}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center ${
                  confirmMode === 'sell'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
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

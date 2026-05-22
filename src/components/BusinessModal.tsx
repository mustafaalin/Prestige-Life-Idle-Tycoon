import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { X, Lock, TrendingUp, CheckCircle2, Building2, Store } from 'lucide-react';
import type { BusinessWithPlayerData } from '../types/game';
import { resolveLocalAsset, LOCAL_ICON_ASSETS } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour } from '../utils/money';
import {
  BUSINESS_MAX_LEVEL,
  getBusinessUpgradeCost,
  getDiscountedBusinessUpgradeCost,
  getNextBusinessIncome,
} from '../utils/businessUpgrade';
import { BoostAdButton } from './BoostAdButton';
import type { BoostStatus } from '../hooks/useBoosts';
import { InsufficientFundsModal } from './InsufficientFundsModal';
import { useInsufficientFunds } from '../hooks/useInsufficientFunds';

type ProcessingAction = 'purchase' | 'upgrade' | 'discount';

interface BusinessModalProps {
  businesses: BusinessWithPlayerData[];
  totalMoney: number;
  onPurchase: (businessId: string) => Promise<boolean>;
  onUpgrade: (businessId: string) => Promise<boolean>;
  onUpgradeWithAdDiscount: (businessId: string) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
  boost: BoostStatus;
  onBoostWatch: () => void;
  onBoostGem: () => void;
  gems: number;
  onGoToShop: () => void;
}

export function BusinessModal({
  businesses,
  totalMoney,
  onPurchase,
  onUpgrade,
  onUpgradeWithAdDiscount,
  onClose,
  loading = false,
  boost,
  onBoostWatch,
  onBoostGem,
  gems,
  onGoToShop,
}: BusinessModalProps) {
  const [activeTab, setActiveTab] = useState<'small' | 'large'>('small');
  const { insufficientFundsState, showInsufficientFunds, hideInsufficientFunds } = useInsufficientFunds();

  const [processingState, setProcessingState] = useState<{
    businessId: string;
    action: ProcessingAction;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoreRef = useRef<number | null>(null);

  const filteredBusinesses = useMemo(
    () => businesses.filter(b => b.category === activeTab),
    [businesses, activeTab]
  );
  const smallBusinesses = useMemo(
    () => businesses.filter((business) => business.category === 'small'),
    [businesses]
  );
  const largeBusinesses = useMemo(
    () => businesses.filter((business) => business.category === 'large'),
    [businesses]
  );
  const ownedSmallCount = useMemo(
    () => smallBusinesses.filter((business) => business.is_owned).length,
    [smallBusinesses]
  );
  const ownedLargeCount = useMemo(
    () => largeBusinesses.filter((business) => business.is_owned).length,
    [largeBusinesses]
  );
  const isLargeTabLocked = smallBusinesses.length > 0 && ownedSmallCount < smallBusinesses.length;

  const ownedCount = businesses.filter(b => b.is_owned).length;
  const totalBusinessIncome = businesses
    .filter(b => b.is_owned)
    .reduce((sum, b) => sum + Number(b.current_hourly_income || 0), 0);

  useEffect(() => {
    if (activeTab === 'large' && isLargeTabLocked) {
      setActiveTab('small');
    }
  }, [activeTab, isLargeTabLocked]);

  useLayoutEffect(() => {
    if (loading || scrollRestoreRef.current === null || !scrollContainerRef.current) return;

    scrollContainerRef.current.scrollTop = scrollRestoreRef.current;
    scrollRestoreRef.current = null;
  }, [loading, businesses, activeTab]);

  const prepareProcessing = (businessId: string, action: ProcessingAction) => {
    scrollRestoreRef.current = scrollContainerRef.current?.scrollTop ?? null;
    setProcessingState({ businessId, action });
  };

  const finishProcessing = () => {
    setProcessingState(null);
  };

  const handlePurchase = async (businessId: string) => {
    prepareProcessing(businessId, 'purchase');
    try {
      const success = await onPurchase(businessId);
      if (!success) {
        scrollRestoreRef.current = null;
      }
    } finally {
      finishProcessing();
    }
  };

  const handleUpgrade = async (businessId: string) => {
    prepareProcessing(businessId, 'upgrade');
    try {
      const success = await onUpgrade(businessId);
      if (!success) {
        scrollRestoreRef.current = null;
      }
    } finally {
      finishProcessing();
    }
  };

  const handleDiscountedUpgrade = async (businessId: string) => {
    prepareProcessing(businessId, 'discount');
    try {
      const success = await onUpgradeWithAdDiscount(businessId);
      if (!success) {
        scrollRestoreRef.current = null;
      }
    } finally {
      finishProcessing();
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
        style={{
          top: '88px',
          bottom: '0',
          height: 'calc(100dvh - 88px)'
        }}
      >
        <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-orange-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)'
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-orange-100">
        <div className="flex items-center justify-between p-4 border-b border-orange-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Business
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                <Store className="w-3 h-3" />
                {ownedCount}/40 owned •{' '}
                {boost.active
                  ? formatMoneyPerHour(totalBusinessIncome * 2)
                  : formatMoneyPerHour(totalBusinessIncome)}
              </p>
              {boost.active && (
                <span className="text-[9px] font-black text-amber-500 bg-amber-50 rounded px-1">⚡2×</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BoostAdButton boost={boost} onWatch={onBoostWatch} onGem={onBoostGem} gems={gems} gemCost={3} />
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-orange-100/50 rounded-full transition-all active:scale-90"
            >
              <X className="w-5 h-5 text-orange-700" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 p-3 bg-white border-b border-orange-100">
          <button
            onClick={() => setActiveTab('small')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'small'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Store className="w-4 h-4 inline mr-1.5" />
            Small ({businesses.filter(b => b.category === 'small').filter(b => b.is_owned).length}/20)
          </button>
          <button
            onClick={() => {
              if (!isLargeTabLocked) {
                setActiveTab('large');
              }
            }}
            disabled={isLargeTabLocked}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'large'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : isLargeTabLocked
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1.5" />
            Large ({ownedLargeCount}/{largeBusinesses.length || 20})
            {isLargeTabLocked && <Lock className="w-4 h-4 inline ml-1.5" />}
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-3 bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBusinesses.map((business) => {
              const isLocked = !business.is_owned && !business.can_unlock;
              const processingAction =
                processingState?.businessId === business.id ? processingState.action : null;
              const isProcessing = processingAction !== null;
              const canAffordPurchase = totalMoney >= business.base_price;
              const currentLevel = Number(business.current_level || 1);
              const currentIncome = Number(
                business.current_hourly_income || business.base_hourly_income || 0
              );
              const upgradeCost = getBusinessUpgradeCost(currentIncome, currentLevel);
              const discountedUpgradeCost = getDiscountedBusinessUpgradeCost(currentIncome, currentLevel);
              const upgradeSavings = Math.max(0, upgradeCost - discountedUpgradeCost);
              const canAffordStandardUpgrade = totalMoney >= upgradeCost;
              const canAffordDiscountedUpgrade = totalMoney >= discountedUpgradeCost;
              const isMaxLevel = currentLevel >= BUSINESS_MAX_LEVEL;

              const nextIncome = getNextBusinessIncome(currentIncome);

              return (
                <div
                  key={business.id}
                  className={`relative rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                    isLocked ? 'opacity-60' : ''
                  } ${
                    isMaxLevel
                      ? 'border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : business.category === 'small'
                        ? 'border-2 border-orange-300'
                        : 'border-2 border-orange-600'
                  }`}
                >
                  {/* MAX shimmer */}
                  {isMaxLevel && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                      <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>
                  )}

                  <div
                    className={`p-3 flex gap-3 ${
                      isMaxLevel
                        ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50'
                        : business.is_owned
                          ? business.category === 'small'
                            ? 'bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50'
                            : 'bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100'
                          : business.category === 'small'
                            ? 'bg-gradient-to-br from-orange-50 to-amber-50'
                            : 'bg-gradient-to-br from-orange-100 to-amber-100'
                    }`}
                  >
                    {isLocked ? (
                      <div className="flex min-h-[128px] w-full items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
                            <Lock className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="shrink-0 flex items-center justify-center">
                          <div
                            className={`w-20 h-20 rounded-2xl shadow-md border flex items-center justify-center overflow-hidden ${
                              isMaxLevel
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300'
                                : business.is_owned
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200'
                                  : 'bg-gradient-to-br from-orange-400 to-amber-500 border-orange-200'
                            }`}
                          >
                            <img
                              src={resolveLocalAsset(business.icon_url || undefined, 'business')}
                              alt={business.name}
                              className="w-[90%] h-[90%] object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-extrabold text-sm text-gray-900 leading-tight line-clamp-2 flex-1">
                              {business.name}
                            </h3>
                            {isMaxLevel ? (
                              <div className="shrink-0 flex flex-col items-end gap-0.5">
                                <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 shadow-sm">
                                  <span className="text-[9px] font-black text-amber-900 leading-none">✦ MAX</span>
                                </div>
                                <div className="flex items-center gap-1 rounded-xl bg-amber-400/20 border border-amber-400/40 px-2 py-1">
                                  <TrendingUp className="w-3 h-3 shrink-0 text-amber-600" />
                                  <span className="text-[13px] font-black leading-none text-amber-700">
                                    {formatMoneyPerHour(Number(business.current_hourly_income || business.base_hourly_income || 0))}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="shrink-0 flex items-center gap-1 rounded-xl px-2 py-1 bg-emerald-500/15 border border-emerald-400/30">
                                <TrendingUp className="w-3 h-3 shrink-0 text-emerald-600" />
                                <span className="text-[13px] font-black leading-none text-emerald-700">
                                  {formatMoneyPerHour(
                                    business.is_owned
                                      ? Number(business.current_hourly_income || business.base_hourly_income || 0)
                                      : business.base_hourly_income
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {!business.is_owned ? (
                            <>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex-1 bg-white/70 rounded-lg px-2 py-1 min-w-[120px]">
                                  <div className="text-[11px] font-bold text-orange-700 truncate">
                                    {formatMoneyFull(business.base_price)}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (!canAffordPurchase) {
                                    showInsufficientFunds({ currency: 'cash', required: business.base_price, available: totalMoney, itemName: business.name });
                                    return;
                                  }
                                  handlePurchase(business.id);
                                }}
                                disabled={isProcessing}
                                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                                  canAffordPurchase && !isProcessing
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                                }`}
                              >
                                {processingAction === 'purchase' ? 'Buying...' : canAffordPurchase ? 'Buy' : '$ Get Cash'}
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="rounded-lg border border-amber-200 bg-white/80 px-2 py-2.5">
                                <div className="flex items-center justify-center gap-2">
                                  {Array.from({ length: 5 }).map((_, index) => {
                                    const isFilled = index < Math.max(0, Number(business.current_level || 1) - 1);
                                    return (
                                      <div
                                        key={index}
                                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                          isFilled
                                            ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_7px_rgba(251,191,36,0.75)]'
                                            : 'bg-slate-200'
                                        }`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {!isMaxLevel ? (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-500">
                                      Upgrade
                                    </p>
                                    <span className="text-[10px] font-black text-slate-400">→</span>
                                    <span className="text-[11px] font-black text-emerald-600">
                                      {formatMoneyPerHour(nextIncome)}
                                    </span>
                                  </div>

                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => {
                                        if (!canAffordStandardUpgrade) {
                                          showInsufficientFunds({ currency: 'cash', required: upgradeCost, available: totalMoney, itemName: `${business.name} upgrade` });
                                          return;
                                        }
                                        handleUpgrade(business.id);
                                      }}
                                      disabled={isProcessing}
                                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-all active:scale-[0.98] ${
                                        canAffordStandardUpgrade && !isProcessing
                                          ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm'
                                          : 'bg-gradient-to-r from-amber-300 to-orange-300 text-white'
                                      }`}
                                    >
                                      {processingAction === 'upgrade' ? (
                                        <span className="text-[11px] font-black">...</span>
                                      ) : (
                                        <>
                                          <span className="text-[11px] font-black leading-none">
                                            {canAffordStandardUpgrade ? 'Upgrade' : '$ Cash'}
                                          </span>
                                          <span className="text-[10px] font-bold opacity-90 leading-none">
                                            {formatMoneyFull(upgradeCost)}
                                          </span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleDiscountedUpgrade(business.id)}
                                      disabled={!canAffordDiscountedUpgrade || isProcessing}
                                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-all ${
                                        canAffordDiscountedUpgrade && !isProcessing
                                          ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white shadow-sm active:scale-[0.98]'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {processingAction === 'discount' ? (
                                        <span className="text-[11px] font-black">...</span>
                                      ) : (
                                        <>
                                          <span className="inline-flex items-center gap-1 text-[11px] font-black leading-none">
                                            <img src={LOCAL_ICON_ASSETS.ads} alt="Ad" className="h-3 w-3 object-contain" />
                                            Ad
                                            <span className={`text-[8px] font-black px-1 py-0.5 rounded-full leading-none ${canAffordDiscountedUpgrade ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'}`}>-50%</span>
                                          </span>
                                          <span className="text-[10px] font-bold opacity-90 leading-none">
                                            {formatMoneyFull(discountedUpgradeCost)}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {!canAffordStandardUpgrade && canAffordDiscountedUpgrade && (
                                    <div className="mt-1 text-center text-[9px] font-black text-fuchsia-700">
                                      Save {formatMoneyFull(upgradeSavings)}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-[12px] font-black text-amber-800 bg-gradient-to-r from-amber-300 to-yellow-300 py-2 px-4 rounded-xl border border-amber-400 text-center shadow-sm">
                                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                                  MASTERED
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    <InsufficientFundsModal
      {...insufficientFundsState}
      onClose={hideInsufficientFunds}
      onGoToShop={onGoToShop}
    />
    </>
  );
}

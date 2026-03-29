import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { X, Lock, TrendingUp, CheckCircle2, Building2, Store, Star, Play } from 'lucide-react';
import type { BusinessWithPlayerData } from '../types/game';
import { resolveLocalAsset } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour } from '../utils/money';
import {
  BUSINESS_MAX_LEVEL,
  getBusinessUpgradeCost,
  getDiscountedBusinessUpgradeCost,
} from '../utils/businessUpgrade';

type ProcessingAction = 'purchase' | 'upgrade' | 'discount';

interface BusinessModalProps {
  businesses: BusinessWithPlayerData[];
  totalMoney: number;
  onPurchase: (businessId: string) => Promise<boolean>;
  onUpgrade: (businessId: string) => Promise<boolean>;
  onUpgradeWithAdDiscount: (businessId: string) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

export function BusinessModal({
  businesses,
  totalMoney,
  onPurchase,
  onUpgrade,
  onUpgradeWithAdDiscount,
  onClose,
  loading = false
}: BusinessModalProps) {
  const [activeTab, setActiveTab] = useState<'small' | 'large'>('small');
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

  const ownedCount = businesses.filter(b => b.is_owned).length;
  const totalBusinessIncome = businesses
    .filter(b => b.is_owned)
    .reduce((sum, b) => sum + Number(b.current_hourly_income || 0), 0);

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
                {ownedCount}/40 owned • {formatMoneyPerHour(totalBusinessIncome)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-orange-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-orange-700" />
          </button>
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
            onClick={() => setActiveTab('large')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'large'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1.5" />
            Large ({businesses.filter(b => b.category === 'large').filter(b => b.is_owned).length}/20)
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

              return (
                <div
                  key={business.id}
                  className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                    isLocked ? 'opacity-60' : ''
                  } ${
                    business.category === 'small'
                      ? 'border-2 border-orange-300'
                      : 'border-2 border-orange-600'
                  }`}
                >
                  <div
                    className={`p-3 flex gap-3 ${
                      business.category === 'small'
                        ? 'bg-gradient-to-br from-orange-50 to-amber-50'
                        : 'bg-gradient-to-br from-orange-100 to-amber-100'
                    }`}
                  >
                    <div className="shrink-0 w-[104px] flex items-center justify-center">
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border flex items-center justify-center overflow-hidden ${
                          business.is_owned
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200'
                            : isLocked
                            ? 'bg-gray-100 border-gray-200'
                            : 'bg-gradient-to-br from-orange-400 to-amber-500 border-orange-200'
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-8 h-8 text-gray-400" />
                        ) : business.icon_url ? (
                          <img
                            src={resolveLocalAsset(business.icon_url, 'business')}
                            alt={business.name}
                            className="w-[90%] h-[90%] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={resolveLocalAsset(undefined, 'business')}
                            alt={business.name}
                            className="w-[90%] h-[90%] object-contain"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                      <h3 className="font-extrabold text-sm text-gray-900 leading-tight line-clamp-2">
                        {business.name}
                      </h3>

                      {!business.is_owned ? (
                        <>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex-1 bg-white/70 rounded-lg px-2 py-1 min-w-[120px]">
                              <div className="text-[11px] font-bold text-orange-700 truncate">
                                {formatMoneyFull(business.base_price)}
                              </div>
                            </div>

                            <div className="flex-1 bg-white/70 rounded-lg px-2 py-1 min-w-[120px] flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-600 shrink-0" />
                              <div className="text-[11px] font-bold text-green-700 truncate">
                                {formatMoneyPerHour(business.base_hourly_income)}
                              </div>
                            </div>
                          </div>

                          {isLocked ? (
                            <div className="bg-gray-100 rounded-lg px-2 py-1.5 text-center border border-dashed border-gray-300">
                              <p className="text-[11px] font-semibold text-gray-600">Locked</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePurchase(business.id)}
                              disabled={!canAffordPurchase || isProcessing}
                              className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                                canAffordPurchase && !isProcessing
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 active:scale-95'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {processingAction === 'purchase' ? 'Buying...' : canAffordPurchase ? 'Buy' : 'Need $'}
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1.5">
                            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-500 text-center">
                              Hourly Income
                            </div>
                            <div className="mt-1 text-[12px] font-black text-green-700 flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {formatMoneyPerHour(business.current_hourly_income)}
                            </div>
                          </div>

                          <div className="rounded-lg border border-amber-200 bg-white/80 px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const isFilled = index < Math.max(0, Number(business.current_level || 1) - 1);

                                return (
                                  <Star
                                    key={index}
                                    className={`h-4 w-4 ${
                                      isFilled
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-transparent text-slate-300'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {!isMaxLevel ? (
                            <div className="rounded-xl border border-orange-200 bg-white/85 p-2 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-500">
                                  Upgrade
                                </p>
                                <div className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[9px] font-black text-fuchsia-700">
                                  -50% ad
                                </div>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleUpgrade(business.id)}
                                  disabled={!canAffordStandardUpgrade || isProcessing}
                                  className={`rounded-lg px-2.5 py-2 transition-all ${
                                    canAffordStandardUpgrade && !isProcessing
                                      ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm hover:from-orange-500 hover:to-amber-600 active:scale-[0.99]'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="text-[10px] font-black uppercase tracking-[0.08em]">
                                    {processingAction === 'upgrade' ? '...' : 'Up'}
                                  </div>
                                  <div className="mt-0.5 text-[11px] font-black">
                                    {formatMoneyFull(upgradeCost)}
                                  </div>
                                </button>

                                <button
                                  onClick={() => handleDiscountedUpgrade(business.id)}
                                  disabled={!canAffordDiscountedUpgrade || isProcessing}
                                  className={`rounded-lg border px-2.5 py-2 transition-all ${
                                    canAffordDiscountedUpgrade && !isProcessing
                                      ? 'border-fuchsia-300 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white shadow-sm hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600 active:scale-[0.99]'
                                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.08em]">
                                    <Play className="h-3 w-3" />
                                    {processingAction === 'discount' ? '...' : 'Ad'}
                                  </div>
                                  <div className="mt-0.5 text-[11px] font-black">
                                    {formatMoneyFull(discountedUpgradeCost)}
                                  </div>
                                  <div className="text-[9px] font-bold line-through opacity-70">
                                    {formatMoneyFull(upgradeCost)}
                                  </div>
                                </button>
                              </div>

                              {!canAffordStandardUpgrade && canAffordDiscountedUpgrade && (
                                <div className="mt-1 text-center text-[9px] font-black text-fuchsia-700">
                                  Save {formatMoneyFull(upgradeSavings)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] font-bold text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 py-1.5 px-3 rounded-full border border-green-300 text-center mx-auto w-auto min-w-[96px]">
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              MAX
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

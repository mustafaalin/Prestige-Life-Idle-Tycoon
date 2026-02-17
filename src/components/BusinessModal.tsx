import React, { useState, useMemo } from 'react';
import { X, Lock, TrendingUp, CheckCircle2, Building2, Store } from 'lucide-react';
import * as Icons from 'lucide-react';
import { BusinessWithPlayerData, UPGRADE_MULTIPLIERS } from '../lib/database.types';

interface BusinessModalProps {
  businesses: BusinessWithPlayerData[];
  totalMoney: number;
  onPurchase: (businessId: string) => Promise<boolean>;
  onUpgrade: (businessId: string, level: number) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

export function BusinessModal({
  businesses,
  totalMoney,
  onPurchase,
  onUpgrade,
  onClose,
  loading = false
}: BusinessModalProps) {
  const [activeTab, setActiveTab] = useState<'small' | 'large'>('small');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredBusinesses = useMemo(
    () => businesses.filter(b => b.category === activeTab),
    [businesses, activeTab]
  );

  const ownedCount = businesses.filter(b => b.is_owned).length;
  const totalBusinessIncome = businesses
    .filter(b => b.is_owned)
    .reduce((sum, b) => sum + b.current_hourly_income, 0);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const calculateUpgradeCost = (currentIncome: number, currentLevel: number) => {
    if (currentLevel >= 6) return 0;
    return currentIncome * UPGRADE_MULTIPLIERS[currentLevel - 1];
  };

  const calculateNewIncome = (currentIncome: number) => {
    return Math.floor(currentIncome * 1.25);
  };

  const handlePurchase = async (businessId: string) => {
    setProcessingId(businessId);
    try {
      await onPurchase(businessId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpgrade = async (businessId: string, level: number) => {
    setProcessingId(businessId);
    try {
      await onUpgrade(businessId, level);
    } finally {
      setProcessingId(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Store;
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
            <p className="text-[10px] text-orange-600 font-bold mt-0.5 flex items-center gap-1">
              <Store className="w-3 h-3" />
              {ownedCount}/40 owned • {formatMoney(totalBusinessIncome)}/hr
            </p>
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

        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBusinesses.map((business) => {
              const Icon = getIconComponent(business.icon_name);
              const isLocked = !business.is_owned && !business.can_unlock;
              const isProcessing = processingId === business.id;
              const canAffordPurchase = totalMoney >= business.base_price;

              return (
                <div
                  key={business.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
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
                            src={business.icon_url}
                            alt={business.name}
                            className="w-[90%] h-[90%] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Icon className="w-8 h-8 text-white" />
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
                                {formatMoney(business.base_price)}
                              </div>
                            </div>

                            <div className="flex-1 bg-white/70 rounded-lg px-2 py-1 min-w-[120px] flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-600 shrink-0" />
                              <div className="text-[11px] font-bold text-green-700 truncate">
                                {formatMoney(business.base_hourly_income)}/h
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
                              {isProcessing ? 'Wait...' : canAffordPurchase ? 'Buy' : 'Need $'}
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2 py-1 border border-blue-200">
                            <div className="text-[11px] font-black text-green-700 flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {formatMoney(business.current_hourly_income)}/h
                            </div>
                          </div>

                          {business.current_level < 6 ? (
                            <button
                              onClick={() => handleUpgrade(business.id, business.current_level + 1)}
                              disabled={
                                totalMoney < calculateUpgradeCost(business.current_hourly_income, business.current_level) ||
                                isProcessing
                              }
                              className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                                totalMoney >= calculateUpgradeCost(business.current_hourly_income, business.current_level) && !isProcessing
                                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white hover:from-orange-500 hover:to-amber-600 active:scale-95'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {isProcessing
                                ? 'Wait...'
                                : `↑ L${business.current_level + 1} • ${formatMoney(
                                    calculateUpgradeCost(business.current_hourly_income, business.current_level)
                                  )}`}
                            </button>
                          ) : (
                            <div className="text-[11px] font-bold text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 py-2 px-2 rounded-lg border border-green-300 text-center">
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
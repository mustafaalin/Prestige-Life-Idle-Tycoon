import React, { useState, useMemo } from 'react';
import { X, Lock, TrendingUp, CheckCircle2, Building2, Store, Zap } from 'lucide-react';
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

  const filteredBusinesses = useMemo(() =>
    businesses.filter(b => b.category === activeTab),
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

        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className={`p-4 ${
                    business.category === 'small'
                      ? 'bg-gradient-to-br from-orange-100 to-amber-100'
                      : 'bg-gradient-to-br from-orange-200 to-amber-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          business.is_owned
                            ? 'bg-blue-500 text-white'
                            : isLocked
                            ? 'bg-gray-400 text-white'
                            : 'bg-orange-500 text-white'
                        } shadow-lg flex items-center justify-center`}>
                          {isLocked ? (
                            <Lock className="w-6 h-6" />
                          ) : business.icon_url ? (
                            <img
                              src={business.icon_url}
                              alt={business.name}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{business.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            business.category === 'small'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-orange-300 text-orange-900'
                          }`}>
                            {business.category === 'small' ? 'Small' : 'Large'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{business.description}</p>

                    {!business.is_owned ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Purchase Price:</span>
                          <span className="text-lg font-bold text-orange-600">{formatMoney(business.base_price)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Income:</span>
                          <span className="text-md font-semibold text-green-600">{formatMoney(business.base_hourly_income)}/hr</span>
                        </div>
                        {isLocked ? (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg text-center">
                            <Lock className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                            <p className="text-xs text-gray-600">Purchase previous business first</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchase(business.id)}
                            disabled={!canAffordPurchase || isProcessing}
                            className={`w-full mt-3 py-3 px-4 rounded-lg font-bold transition-all ${
                              canAffordPurchase && !isProcessing
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isProcessing ? 'Processing...' : canAffordPurchase ? 'Purchase' : 'Insufficient Funds'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg">
                          <span className="text-sm font-medium text-blue-700">Level {business.current_level}/6</span>
                          <span className="text-md font-bold text-green-600">{formatMoney(business.current_hourly_income)}/hr</span>
                        </div>

                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const targetLevel = level + 1;
                            const isCompleted = business.current_level >= targetLevel;
                            const isCurrent = business.current_level === level;
                            const upgradeCost = calculateUpgradeCost(business.current_hourly_income, level);
                            const newIncome = calculateNewIncome(business.current_hourly_income);
                            const canAfford = totalMoney >= upgradeCost;

                            return (
                              <div key={level} className="flex-1">
                                {isCompleted ? (
                                  <div className="bg-green-500 text-white rounded-lg p-2 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                ) : isCurrent ? (
                                  <button
                                    onClick={() => handleUpgrade(business.id, targetLevel)}
                                    disabled={!canAfford || isProcessing}
                                    className={`w-full rounded-lg p-2 text-xs font-semibold transition-all ${
                                      canAfford && !isProcessing
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={`Upgrade to Level ${targetLevel}: ${formatMoney(upgradeCost)} → ${formatMoney(newIncome)}/hr`}
                                  >
                                    {isProcessing ? '...' : `L${targetLevel}`}
                                    <div className="text-[10px] mt-0.5">{formatMoney(upgradeCost)}</div>
                                  </button>
                                ) : (
                                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 text-center">
                                    <span className="text-xs text-gray-400 font-medium">L{targetLevel}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {business.current_level < 6 && (
                          <div className="text-xs text-gray-600 bg-amber-50 p-2 rounded text-center">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Next: {formatMoney(calculateNewIncome(business.current_hourly_income))}/hr (+25%)
                          </div>
                        )}

                        {business.current_level === 6 && (
                          <div className="text-xs font-semibold text-green-700 bg-green-100 p-2 rounded text-center">
                            Maximum Level Reached!
                          </div>
                        )}

                        <div className="text-xs text-gray-500 text-center">
                          Total Invested: {formatMoney(business.total_invested)}
                        </div>
                      </div>
                    )}
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
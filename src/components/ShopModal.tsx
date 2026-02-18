import { useState, useEffect } from 'react';
import { X, Gift, DollarSign, Gem, Play, Lock, Monitor, ShoppingBag, Sparkles, Shirt } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hourlyIncome: number;
  lastClaimTime: string | null;
  gems: number;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  onClaimDaily: () => Promise<boolean>;
  onClaimMoney: (isTriple: boolean) => Promise<boolean>;
  onWatchAd: () => Promise<{ success: boolean; reward: number; cooldown: number }>;
  onPurchaseComplete: (moneyAdded: number, gemsAdded: number) => void;
  totalMoney: number;
  selectedOutfitId: string | null;
  onOutfitChange: () => void;
}

interface MoneyPackage {
  id: string;
  amount_multiplier: number;
  calculated_amount: number;
  price_usd: number;
  display_order: number;
  is_popular: boolean;
  is_best_value: boolean;
}

interface GemPackage {
  id: string;
  gem_amount: number;
  price_usd: number;
  display_order: number;
  is_popular: boolean;
  is_best_value: boolean;
}

interface CharacterOutfit {
  id: string;
  character_id: string | null;
  code: string;
  name: string;
  description: string | null;
  image_url: string;
  price: number;
  prestige_points: number;
  unlock_order: number;
  is_owned: boolean;
  is_unlocked: boolean;
}

const DAILY_REWARDS = [
  { day: 1, money: 1000, gems: 0 },
  { day: 2, money: 3000, gems: 0 },
  { day: 3, money: 10000, gems: 0 },
  { day: 4, money: 15000, gems: 5 },
  { day: 5, money: 25000, gems: 0 },
  { day: 6, money: 50000, gems: 0 },
  { day: 7, money: 100000, gems: 0 },
];

export function ShopModal({
  isOpen,
  onClose,
  userId,
  hourlyIncome,
  lastClaimTime,
  gems,
  claimLockedUntil,
  dailyClaimedTotal,
  onClaimDaily,
  onClaimMoney,
  onWatchAd,
  onPurchaseComplete,
  totalMoney,
  selectedOutfitId,
  onOutfitChange,
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'outfits'>('shop');
  const [accumulatedMoney, setAccumulatedMoney] = useState(0);
  const [timeUntilFull, setTimeUntilFull] = useState(0);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);
  const [dailyRewardStatus, setDailyRewardStatus] = useState<{
    canClaim: boolean;
    currentStreak: number;
    nextRewardDay: number;
    hoursUntilReset: number;
  } | null>(null);
  const [moneyPackages, setMoneyPackages] = useState<MoneyPackage[]>([]);
  const [gemPackages, setGemPackages] = useState<GemPackage[]>([]);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    type: 'money' | 'gem';
    amount: number;
    price: number;
    packageId: string;
  } | null>(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [outfits, setOutfits] = useState<CharacterOutfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDailyRewardStatus = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .rpc('get_daily_reward_status', {
            p_player_id: userId
          } as any);

        if (error) {
          console.error('Error fetching daily reward status:', error);
          return;
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const status = data[0] as {
            can_claim: boolean;
            current_streak: number;
            next_reward_day: number;
            hours_until_reset: number;
          };
          setDailyRewardStatus({
            canClaim: status.can_claim,
            currentStreak: status.current_streak,
            nextRewardDay: status.next_reward_day,
            hoursUntilReset: status.hours_until_reset,
          });
        }
      } catch (error) {
        console.error('Error fetching daily reward status:', error);
      }
    };

    fetchDailyRewardStatus();
    const interval = setInterval(fetchDailyRewardStatus, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPackages = async () => {
      if (!userId) return;

      try {
        const [moneyResult, gemResult] = await Promise.all([
          supabase.rpc('get_money_packages', { p_player_id: userId } as any),
          supabase.rpc('get_gem_packages'),
        ]);

        if (!moneyResult.error && moneyResult.data) {
          setMoneyPackages(moneyResult.data);
        }

        if (!gemResult.error && gemResult.data) {
          setGemPackages(gemResult.data);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'outfits') return;

    const fetchOutfits = async () => {
      if (!userId) return;

      try {
        setOutfitsLoading(true);

        const { data: outfitsData, error: outfitsError } = await supabase
          .from('character_outfits')
          .select('*')
          .eq('is_active', true)
          .order('unlock_order');

        if (outfitsError) throw outfitsError;

        const { data: playerOutfitsData, error: playerOutfitsError } = await supabase
          .from('player_outfits')
          .select('*')
          .eq('player_id', userId);

        if (playerOutfitsError) throw playerOutfitsError;

        const outfitsWithOwnership = (outfitsData || []).map(outfit => {
          const playerOutfit = (playerOutfitsData || []).find(po => po.outfit_id === outfit.id);
          return {
            ...outfit,
            is_owned: playerOutfit?.is_owned || false,
            is_unlocked: playerOutfit?.is_unlocked || false,
          };
        });

        setOutfits(outfitsWithOwnership);
      } catch (error) {
        console.error('Error fetching outfits:', error);
      } finally {
        setOutfitsLoading(false);
      }
    };

    fetchOutfits();
  }, [isOpen, activeTab, userId]);

  useEffect(() => {
    if (!isOpen || !lastClaimTime || !hourlyIncome) {
      setAccumulatedMoney(0);
      setTimeUntilFull(0);
      return;
    }

    const calculateAccumulated = () => {
      const now = Date.now();
      const lastClaim = new Date(lastClaimTime).getTime();
      const elapsedMs = now - lastClaim;
      const elapsedMinutes = elapsedMs / 1000 / 60;

      const maxMinutes = 60;
      const clampedMinutes = Math.min(elapsedMinutes, maxMinutes);

      const incomeRate = hourlyIncome / 2;
      const accumulated = (incomeRate / 60) * clampedMinutes;

      setAccumulatedMoney(Math.floor(accumulated));

      if (elapsedMinutes < maxMinutes) {
        const remainingMs = (maxMinutes - elapsedMinutes) * 60 * 1000;
        setTimeUntilFull(Math.ceil(remainingMs / 1000));
      } else {
        setTimeUntilFull(0);
      }
    };

    calculateAccumulated();
    const interval = setInterval(calculateAccumulated, 1000);

    return () => clearInterval(interval);
  }, [isOpen, lastClaimTime, hourlyIncome]);

  useEffect(() => {
    if (!isOpen || !claimLockedUntil) {
      setTimeUntilUnlock(0);
      return;
    }

    const calculateTimeUntilUnlock = () => {
      const now = Date.now();
      const lockEnd = new Date(claimLockedUntil).getTime();
      const remainingMs = lockEnd - now;

      if (remainingMs <= 0) {
        setTimeUntilUnlock(0);
      } else {
        setTimeUntilUnlock(Math.ceil(remainingMs / 1000));
      }
    };

    calculateTimeUntilUnlock();
    const interval = setInterval(calculateTimeUntilUnlock, 1000);

    return () => clearInterval(interval);
  }, [isOpen, claimLockedUntil]);

  useEffect(() => {
    if (!isOpen || adCooldown <= 0) return;

    const interval = setInterval(() => {
      setAdCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, adCooldown]);

  if (!isOpen) return null;

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLockTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };


  const handleClaimDaily = async () => {
    const success = await onClaimDaily();
    if (success && dailyRewardStatus) {
      const reward = DAILY_REWARDS[dailyRewardStatus.nextRewardDay - 1];
      let message = `Claimed ${formatMoney(reward.money)}!`;
      if (reward.gems > 0) {
        message += ` +${reward.gems} gems!`;
      }
      showNotification(message);
    }
  };

  const handleClaimMoney = async (isTriple: boolean) => {
    const success = await onClaimMoney(isTriple);
    if (success) {
      const amount = isTriple ? accumulatedMoney * 3 : accumulatedMoney;
      showNotification(`Claimed ${formatMoney(amount)}!`);
    }
  };

  const handleWatchAd = async () => {
    setIsWatchingAd(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = await onWatchAd();
    setIsWatchingAd(false);

    if (result.success) {
      showNotification(`Ad reward: ${formatMoney(result.reward)}!`);
      setAdCooldown(result.cooldown);
    } else if (result.cooldown > 0) {
      setAdCooldown(result.cooldown);
      showNotification('Please wait before watching another ad');
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectMoneyPackage = (pkg: MoneyPackage) => {
    setSelectedPackage({
      type: 'money',
      amount: pkg.calculated_amount,
      price: Number(pkg.price_usd),
      packageId: pkg.id,
    });
    setShowPurchaseConfirm(true);
  };

  const handleSelectGemPackage = (pkg: GemPackage) => {
    setSelectedPackage({
      type: 'gem',
      amount: pkg.gem_amount,
      price: Number(pkg.price_usd),
      packageId: pkg.id,
    });
    setShowPurchaseConfirm(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;

    if (!userId) {
      showNotification('Error: Profile not found');
      return;
    }

    setIsProcessingPurchase(true);

    try {
      const { data: txData, error: txError } = await supabase.rpc('create_purchase_transaction', {
        p_player_id: userId,
        p_package_id: selectedPackage.packageId,
        p_amount_usd: selectedPackage.price,
      } as any);

      if (txError) {
        throw new Error(txError.message);
      }

      const txResult = txData as { success: boolean; transaction_id: string };
      if (!txResult.success || !txResult.transaction_id) {
        throw new Error('Failed to create transaction');
      }

      const { data: result, error: completeError } = await supabase.rpc('complete_demo_purchase', {
        p_transaction_id: txResult.transaction_id,
        p_player_id: userId,
      } as any);

      if (completeError) {
        throw new Error(completeError.message);
      }

      const purchaseResult = Array.isArray(result) ? result[0] : result;

      if (purchaseResult?.success) {
        const message = selectedPackage.type === 'money'
          ? `Purchased ${formatMoney(selectedPackage.amount)}!`
          : `Purchased ${selectedPackage.amount} Gems!`;
        showNotification(message);
        setShowPurchaseConfirm(false);
        setSelectedPackage(null);

        // Update state with new values
        const moneyAdded = purchaseResult.money_added || 0;
        const gemsAdded = purchaseResult.gems_added || 0;
        onPurchaseComplete(moneyAdded, gemsAdded);
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      showNotification(`Error: ${error.message || 'Purchase failed'}`);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handlePurchaseOutfit = async (outfitId: string, price: number, prestigePoints: number) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('purchase_outfit', {
        p_player_id: userId,
        p_outfit_id: outfitId,
        p_set_as_selected: true
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; prestige_earned?: number; money_spent?: number };

      if (!result.success) {
        showNotification(result.message);
        return;
      }

      showNotification(`Outfit purchased! +${result.prestige_earned} prestige points`);
      onPurchaseComplete(-(result.money_spent || price), 0);

      setOutfits(prev => prev.map(o =>
        o.id === outfitId ? { ...o, is_owned: true, is_unlocked: true } : o
      ));
    } catch (error: any) {
      console.error('Error purchasing outfit:', error);
      showNotification(`Failed to purchase outfit: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSelectOutfit = async (outfitId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('player_profiles')
        .update({ selected_outfit_id: outfitId })
        .eq('id', userId);

      if (error) throw error;

      showNotification('Outfit selected!');
      onOutfitChange();
    } catch (error) {
      console.error('Error selecting outfit:', error);
      showNotification('Failed to select outfit');
    }
  };

  const maxAccumulated = (hourlyIncome / 2);
  const progressPercent = maxAccumulated > 0 ? Math.min((accumulatedMoney / maxAccumulated) * 100, 100) : 0;
  const isLocked = timeUntilUnlock > 0;
  const canClaim = accumulatedMoney > 0 && !isLocked;
  const isDailyAvailable = dailyRewardStatus?.canClaim ?? false;
  const currentDay = dailyRewardStatus?.nextRewardDay ?? 1;
  const todayReward = DAILY_REWARDS[currentDay - 1] || DAILY_REWARDS[0];
  const dailyLimit = hourlyIncome;
  const dailyLimitPercent = dailyLimit > 0 ? Math.min((dailyClaimedTotal / dailyLimit) * 100, 100) : 0;

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)'
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-purple-100">

        <div className="flex items-center justify-between p-4 border-b border-purple-50 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shop
            </h2>
            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
              <Gem className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-bold text-purple-700">{gems}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-purple-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-purple-700" />
          </button>
        </div>

        {notification && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-10 animate-bounce">
            {notification}
          </div>
        )}

        <div className="flex border-b border-purple-100 bg-white">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${
              activeTab === 'shop'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50/30'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Purchases</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('outfits')}
            className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${
              activeTab === 'outfits'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50/30'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shirt className="w-4 h-4" />
              <span>Outfits</span>
            </div>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
          {activeTab === 'shop' && (
            <>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-black text-orange-700">Daily Reward</h3>
            </div>

            <div className="bg-white rounded-xl p-4 mb-3 border-2 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Day {currentDay}</span>
                {isDailyAvailable ? (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    AVAILABLE
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    CLAIMED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-green-600">
                    {formatMoney(todayReward.money)}
                  </p>
                  {todayReward.gems > 0 && (
                    <p className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-1">
                      <Gem className="w-3 h-3" />
                      +{todayReward.gems} gems
                    </p>
                  )}
                </div>

                <button
                  onClick={handleClaimDaily}
                  disabled={!isDailyAvailable}
                  className={`
                    px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md
                    ${isDailyAvailable
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isDailyAvailable ? 'Claim' : 'Claimed'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {DAILY_REWARDS.map((reward, index) => {
                const dayNum = index + 1;
                const isPast = dayNum < currentDay;
                const isCurrent = dayNum === currentDay;

                return (
                  <div
                    key={reward.day}
                    className={`
                      w-11 h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border-2 transition-all
                      ${isPast ? 'bg-gray-100 border-gray-200 text-gray-400' : ''}
                      ${isCurrent ? 'bg-yellow-100 border-yellow-400 text-yellow-700 ring-2 ring-yellow-300' : ''}
                      ${!isPast && !isCurrent ? 'bg-white border-gray-200 text-gray-400' : ''}
                    `}
                  >
                    <span className="text-[8px]">{dayNum}</span>
                    <span className="text-[9px] font-black">
                      {reward.money >= 1000 ? `${reward.money / 1000}k` : reward.money}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-blue-700">Collect Earnings</h3>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-100">
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Daily Limit</span>
                  <span className="text-xs font-bold text-slate-400">
                    {formatMoney(dailyClaimedTotal)} / {formatMoney(dailyLimit)}
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${dailyLimitPercent}%` }}
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Accumulated</span>
                  <span className="text-xs font-bold text-slate-400">
                    {formatMoney(accumulatedMoney)} / {formatMoney(maxAccumulated)}
                  </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {timeUntilFull > 0 && !isLocked && (
                  <p className="text-[10px] text-slate-400 font-bold mt-1 text-center">
                    Full in: {formatTime(timeUntilFull)}
                  </p>
                )}
              </div>

              {isLocked && (
                <div className="mb-3 bg-orange-50 border-2 border-orange-200 rounded-lg p-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-orange-700">Daily limit reached</p>
                    <p className="text-[10px] text-orange-600">Available in {formatLockTime(timeUntilUnlock)}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleClaimMoney(false)}
                  disabled={!canClaim}
                  className={`
                    flex-1 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md
                    ${canClaim
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isLocked ? <Lock className="w-4 h-4 mx-auto" /> : 'Claim'}
                </button>

                <button
                  onClick={() => handleClaimMoney(true)}
                  disabled={!canClaim}
                  className={`
                    flex-1 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1
                    ${canClaim
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Claim x3
                    </>
                  )}
                </button>
              </div>

              {!canClaim && !isLocked && (
                <p className="text-[10px] text-center text-slate-400 font-bold mt-2">
                  Keep playing to accumulate earnings
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black text-purple-700">Watch Ad</h3>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-purple-100">
              <div className="text-center mb-3">
                <p className="text-xs font-bold text-slate-500 mb-1">Earn money by watching ads</p>
                <p className="text-2xl font-black text-purple-600">
                  {formatMoney(hourlyIncome / 2)}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">per ad</p>
              </div>

              {isWatchingAd && (
                <div className="mb-3 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="text-xs font-bold text-purple-700">Watching ad...</p>
                  </div>
                </div>
              )}

              {adCooldown > 0 && !isWatchingAd && (
                <div className="mb-3 bg-orange-50 border-2 border-orange-200 rounded-lg p-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-orange-700">Ad cooldown</p>
                    <p className="text-[10px] text-orange-600">Available in {formatTime(adCooldown)}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleWatchAd}
                disabled={isWatchingAd || adCooldown > 0}
                className={`
                  w-full py-3 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2
                  ${isWatchingAd || adCooldown > 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white active:scale-95'
                  }
                `}
              >
                {isWatchingAd ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Watching...
                  </>
                ) : adCooldown > 0 ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Locked
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4" />
                    Watch Ad
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-black text-green-700">Money Packages</h3>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mb-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-yellow-800 leading-relaxed">
                DEMO MODE - No real payment will be charged
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moneyPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl p-3 border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all relative"
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                      POPULAR
                    </div>
                  )}
                  {pkg.is_best_value && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  <img
                    src="https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons/buy-more-money.png"
                    alt="Money"
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="text-lg font-black text-green-600 mb-2">
                    {formatMoney(pkg.calculated_amount)}
                  </p>
                  <div className="bg-green-50 text-green-700 rounded-lg py-1 px-2 text-xs font-bold mb-2">
                    ${Number(pkg.price_usd).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleSelectMoneyPackage(pkg)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg py-2 text-sm font-bold hover:from-green-600 hover:to-emerald-600 transition-all active:scale-95"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Gem className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black text-purple-700">Gem Packages</h3>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mb-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-yellow-800 leading-relaxed">
                DEMO MODE - No real payment will be charged
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {gemPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl p-3 border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all relative"
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                      POPULAR
                    </div>
                  )}
                  {pkg.is_best_value && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  <img
                    src="https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/icons/gem-box.png"
                    alt="Gems"
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="text-lg font-black text-purple-600 mb-2">
                    {pkg.gem_amount} Gems
                  </p>
                  <div className="bg-purple-50 text-purple-700 rounded-lg py-1 px-2 text-xs font-bold mb-2">
                    ${Number(pkg.price_usd).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleSelectGemPackage(pkg)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all active:scale-95"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

          {activeTab === 'outfits' && (
            <div className="space-y-3">
              {outfitsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : outfits.length === 0 ? (
                <div className="text-center py-12">
                  <Shirt className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-bold">No outfits available</p>
                </div>
              ) : (
                outfits.map((outfit) => {
                  const isSelected = selectedOutfitId === outfit.id;
                  const canAfford = totalMoney >= outfit.price;

                  return (
                    <div
                      key={outfit.id}
                      className={`relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-green-400 shadow-lg shadow-green-200/50'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                      }`}
                    >
                      {outfit.prestige_points > 0 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                          <Sparkles className="w-3 h-3" />
                          {outfit.prestige_points}
                        </div>
                      )}

                      <div className="flex">
                        <div className="w-1/3 bg-gradient-to-br from-blue-100 to-purple-100 p-4 flex items-center justify-center">
                          <img
                            src={outfit.image_url}
                            alt={outfit.name}
                            className="w-full h-auto object-contain"
                            style={{ minHeight: '280px', maxHeight: '320px' }}
                          />
                        </div>

                        <div className="w-2/3 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-black text-slate-800">{outfit.name}</h3>
                              {isSelected && (
                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                                  SELECTED
                                </span>
                              )}
                            </div>

                            {outfit.description && (
                              <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                {outfit.description}
                              </p>
                            )}

                            <div className="space-y-2 mb-3">
                              {outfit.prestige_points > 0 && (
                                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                                  <Sparkles className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-700">
                                    {outfit.prestige_points} Prestige Points
                                  </span>
                                </div>
                              )}

                              {!outfit.is_owned && (
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-bold text-green-700">
                                    {formatMoney(outfit.price)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            {outfit.is_owned ? (
                              isSelected ? (
                                <div className="w-full bg-green-500 text-white rounded-lg py-2.5 text-sm font-bold text-center flex items-center justify-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  Currently Equipped
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSelectOutfit(outfit.id)}
                                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg py-2.5 text-sm font-bold hover:from-blue-600 hover:to-cyan-600 transition-all active:scale-95"
                                >
                                  Select
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => handlePurchaseOutfit(outfit.id, outfit.price, outfit.prestige_points)}
                                disabled={!canAfford}
                                className={`w-full rounded-lg py-2.5 text-sm font-bold transition-all ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'Purchase' : 'Not Enough Money'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>

      <PurchaseConfirmModal
        isOpen={showPurchaseConfirm}
        onClose={() => {
          setShowPurchaseConfirm(false);
          setSelectedPackage(null);
        }}
        onConfirm={handleConfirmPurchase}
        packageInfo={selectedPackage}
        isProcessing={isProcessingPurchase}
      />
    </div>
  );
}

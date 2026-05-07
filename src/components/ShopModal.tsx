import { useState, useEffect, useRef } from 'react';
import { X, Gift, Lock, ShoppingBag, Sparkles, Shirt, Check, Flame } from 'lucide-react';
import * as rewardService from '../services/rewardService';
import * as itemService from '../services/itemService';
import { purchasePackage } from '../services/iapService';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { LOCAL_ICON_ASSETS, resolveLocalAsset } from '../lib/localAssets';
import { DAILY_REWARDS } from '../data/local/rewards';
import { getScaledMoneyPackageAmount, getScaledShopRewards } from '../data/local/rewardScaling';
import { formatMoneyFull } from '../utils/money';

const AD_COOLDOWN_SECONDS = 30;

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'shop' | 'outfits';
  initialShopSection?: 'money' | 'gems' | null;
  userId: string;
  prestigePoints: number;
  ownedInvestmentCount: number;
  lastClaimTime: string | null;
  lastAdWatchTime: string | null;
  gems: number;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  onClaimDaily: (reward: { money: number; gems: number }) => Promise<boolean>;
  onRescueDailyStreak: () => Promise<{ success: boolean; cooldown: number }>;
  onClaimMoney: (params: { isTriple: boolean }) => Promise<{ success: boolean; claimedAmount: number }>;
  onWatchAd: (reward: number) => Promise<{ success: boolean; reward: number; cooldown: number }>;
  onPurchaseComplete: (moneyAdded: number, gemsAdded: number) => Promise<void>;
  totalMoney: number;
  selectedOutfitId: string | null;
  onOutfitChange: () => void;
  initialNotification?: string | null;
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

const LOCAL_MONEY_PACKAGES: MoneyPackage[] = [
  { id: 'money-pack-1', amount_multiplier: 1, calculated_amount: 8000, price_usd: 0.99, display_order: 1, is_popular: false, is_best_value: false },
  { id: 'money-pack-2', amount_multiplier: 1, calculated_amount: 25000, price_usd: 1.99, display_order: 2, is_popular: true, is_best_value: false },
  { id: 'money-pack-3', amount_multiplier: 1, calculated_amount: 75000, price_usd: 4.49, display_order: 3, is_popular: false, is_best_value: false },
  { id: 'money-pack-4', amount_multiplier: 1, calculated_amount: 250000, price_usd: 9.99, display_order: 4, is_popular: false, is_best_value: true },
];

const LOCAL_GEM_PACKAGES: GemPackage[] = [
  { id: 'gem-pack-1', gem_amount: 30, price_usd: 0.99, display_order: 1, is_popular: false, is_best_value: false },
  { id: 'gem-pack-2', gem_amount: 75, price_usd: 1.99, display_order: 2, is_popular: true, is_best_value: false },
  { id: 'gem-pack-3', gem_amount: 300, price_usd: 4.99, display_order: 3, is_popular: false, is_best_value: false },
  { id: 'gem-pack-4', gem_amount: 750, price_usd: 9.99, display_order: 4, is_popular: false, is_best_value: true },
];

type DailyRewardActionState = 'claimable' | 'claimed' | 'next' | 'loading';

function getDailyRewardActionClasses(state: DailyRewardActionState) {
  if (state === 'claimable' || state === 'loading') {
    return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_10px_22px_rgba(249,115,22,0.22)]';
  }

  if (state === 'claimed') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  }

  return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
}

function DailyRewardActionButton(props: {
  state: DailyRewardActionState;
  label: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
}) {
  const { state, label, onClick, size = 'md' } = props;
  const isInteractive = state === 'claimable';
  const sizeClasses =
    size === 'sm'
      ? 'min-w-[78px] rounded-xl px-3 py-2 text-[10px]'
      : 'min-w-[96px] rounded-[16px] px-4 py-2.5 text-[11px]';

  return (
    <button
      type="button"
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      className={`${sizeClasses} font-black transition-all ${getDailyRewardActionClasses(state)} ${
        isInteractive ? 'active:scale-95' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  );
}

export function ShopModal({
  isOpen,
  onClose,
  initialTab = 'shop',
  initialShopSection = null,
  userId,
  prestigePoints,
  ownedInvestmentCount,
  lastClaimTime,
  lastAdWatchTime,
  gems,
  claimLockedUntil,
  dailyClaimedTotal,
  onClaimDaily,
  onRescueDailyStreak,
  onClaimMoney,
  onWatchAd,
  onPurchaseComplete,
  totalMoney,
  selectedOutfitId,
  onOutfitChange,
  initialNotification = null,
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'outfits'>('shop');
  const moneySectionRef = useRef<HTMLDivElement | null>(null);
  const gemSectionRef = useRef<HTMLDivElement | null>(null);
  const [accumulatedMoney, setAccumulatedMoney] = useState(0);
  const [timeUntilFull, setTimeUntilFull] = useState(0);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [isClaimingEarnings, setIsClaimingEarnings] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);
  const [dailyRewardStatus, setDailyRewardStatus] = useState<{
    canClaim: boolean;
    currentStreak: number;
    nextRewardDay: number;
    displayRewardDay: number;
    hasClaimedToday: boolean;
    rescueAvailable: boolean;
    streakBroken: boolean;
    hoursUntilReset: number;
    cycleLength: number;
    claimLockedUntil: string | null;
    dailyClaimedTotal: number;
  } | null>(null);
  const [moneyPackages, setMoneyPackages] = useState<MoneyPackage[]>([]);
  const [gemPackages, setGemPackages] = useState<GemPackage[]>([]);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showDailyRewardsModal, setShowDailyRewardsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    type: 'money' | 'gem';
    amount: number;
    price: number;
    packageId: string;
  } | null>(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [outfits, setOutfits] = useState<CharacterOutfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);

  const getRemainingAdCooldown = (watchTime: string | null) => {
    if (!watchTime) return 0;

    const elapsedSeconds = (Date.now() - new Date(watchTime).getTime()) / 1000;
    if (elapsedSeconds >= AD_COOLDOWN_SECONDS) {
      return 0;
    }

    return Math.ceil(AD_COOLDOWN_SECONDS - elapsedSeconds);
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    if (initialNotification) {
      setNotification(initialNotification);
      const t = window.setTimeout(() => setNotification(null), 3000);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, initialTab, initialNotification]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'shop' || !initialShopSection) return;

    const targetRef = initialShopSection === 'gems' ? gemSectionRef : moneySectionRef;
    const timeout = window.setTimeout(() => {
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);

    return () => window.clearTimeout(timeout);
  }, [isOpen, activeTab, initialShopSection]);

  const refreshDailyRewardStatus = async () => {
    if (!userId) return;

    try {
      const status = await rewardService.getClaimStatus(userId);
      setDailyRewardStatus({
        canClaim: status.canClaim ?? true,
        currentStreak: status.currentStreak ?? 0,
        nextRewardDay: status.nextRewardDay ?? 1,
        displayRewardDay: status.displayRewardDay ?? status.nextRewardDay ?? 1,
        hasClaimedToday: status.hasClaimedToday ?? false,
        rescueAvailable: status.rescueAvailable ?? false,
        streakBroken: status.streakBroken ?? false,
        hoursUntilReset: status.hoursUntilReset ?? 24,
        cycleLength: status.cycleLength ?? DAILY_REWARDS.length,
        claimLockedUntil: status.claimLockedUntil ?? null,
        dailyClaimedTotal: status.dailyClaimedTotal ?? 0,
      });
    } catch (error) {
      console.error('Error fetching daily reward status:', error);
      setDailyRewardStatus({
        canClaim: true,
        currentStreak: 0,
        nextRewardDay: 1,
        displayRewardDay: 1,
        hasClaimedToday: false,
        rescueAvailable: false,
        streakBroken: false,
        hoursUntilReset: 24,
        cycleLength: DAILY_REWARDS.length,
        claimLockedUntil: claimLockedUntil || null,
        dailyClaimedTotal,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    refreshDailyRewardStatus();
    const interval = setInterval(refreshDailyRewardStatus, 5000);

    return () => clearInterval(interval);
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;
    setMoneyPackages(
      LOCAL_MONEY_PACKAGES.map((pkg) => ({
        ...pkg,
        calculated_amount: getScaledMoneyPackageAmount(pkg.id, prestigePoints, ownedInvestmentCount),
      }))
    );
    setGemPackages(LOCAL_GEM_PACKAGES);
  }, [isOpen, prestigePoints, ownedInvestmentCount]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'outfits') return;

    const fetchOutfits = async () => {
      if (!userId) return;

      try {
        setOutfitsLoading(true);
        const outfitsData = await itemService.getCharacterOutfits(userId);
        setOutfits(outfitsData);
      } catch (error) {
        console.error('Error fetching outfits:', error);
      } finally {
        setOutfitsLoading(false);
      }
    };

    fetchOutfits();
  }, [isOpen, activeTab, userId]);

  useEffect(() => {
    const scaledRewards = getScaledShopRewards(prestigePoints, ownedInvestmentCount);

    if (!isOpen || !lastClaimTime || !scaledRewards.claimPool) {
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

      const accumulated = (scaledRewards.claimPool / 60) * clampedMinutes;

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
  }, [isOpen, lastClaimTime, prestigePoints, ownedInvestmentCount]);

  const resolvedClaimLockedUntil = dailyRewardStatus?.claimLockedUntil ?? claimLockedUntil;
  const resolvedDailyClaimedTotal = dailyRewardStatus?.dailyClaimedTotal ?? dailyClaimedTotal;

  useEffect(() => {
    if (!isOpen || !resolvedClaimLockedUntil) {
      setTimeUntilUnlock(0);
      return;
    }

    const calculateTimeUntilUnlock = () => {
      const now = Date.now();
      const lockEnd = new Date(resolvedClaimLockedUntil).getTime();
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
  }, [isOpen, resolvedClaimLockedUntil]);

  useEffect(() => {
    if (!isOpen) return;

    const syncAdCooldown = () => {
      setAdCooldown(getRemainingAdCooldown(lastAdWatchTime));
    };

    syncAdCooldown();
    const interval = setInterval(syncAdCooldown, 1000);

    return () => clearInterval(interval);
  }, [isOpen, lastAdWatchTime]);

  if (!isOpen) return null;

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
    if (!dailyRewardStatus) return;

    const rewardDay = dailyRewardStatus.rescueAvailable ? 1 : dailyRewardStatus.nextRewardDay;
    const reward = DAILY_REWARDS[rewardDay - 1];

    setIsClaimingDaily(true);
    const success = await onClaimDaily({ money: reward.money, gems: reward.gems });
    setIsClaimingDaily(false);

    if (success && dailyRewardStatus) {
      refreshDailyRewardStatus();
    }

    return success;
  };

  const handleRescueDailyStreak = async () => {
    setIsWatchingAd(true);
    const result = await onRescueDailyStreak();
    setIsWatchingAd(false);

    if (result.success) {
      showNotification('Streak saved! You can now claim today\'s reward.');
      setAdCooldown(result.cooldown);
      refreshDailyRewardStatus();
      return;
    }

    if (result.cooldown > 0) {
      setAdCooldown(result.cooldown);
      showNotification(`Ad cooldown active: ${formatTime(result.cooldown)}`);
      return;
    }

    showNotification('Streak rescue is not available');
  };

  const handleClaimMoney = async (isTriple: boolean) => {
    setIsClaimingEarnings(true);
    const result = await onClaimMoney({ isTriple });
    setIsClaimingEarnings(false);
    if (result.success) {
      refreshDailyRewardStatus();
    }
  };

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    const adRewardAmount = getScaledShopRewards(prestigePoints, ownedInvestmentCount).adReward;
    const result = await onWatchAd(adRewardAmount);
    setIsWatchingAd(false);

    if (result.success) {
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
      const result = await purchasePackage(
        selectedPackage.packageId,
        selectedPackage.type === 'gem' ? 'gems' : 'money',
        selectedPackage.amount,
        selectedPackage.price,
      );

      if (!result.success) {
        if (result.error !== 'cancelled') {
          showNotification(result.error || 'Purchase failed');
        }
        return;
      }

      await onPurchaseComplete(result.moneyAdded, result.gemsAdded);
      setShowPurchaseConfirm(false);
      setSelectedPackage(null);
    } catch (error: any) {
      console.error('Purchase error:', error);
      showNotification(`Error: ${error.message || 'Purchase failed'}`);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handlePurchaseOutfit = async (outfitId: string, _price: number) => {
    if (!userId) return;

    try {
      const result = await itemService.purchaseOutfit(userId, outfitId, true) as {
        success: boolean;
        message: string;
        prestige_earned?: number;
        money_spent?: number;
      };

      if (!result.success) {
        showNotification(result.message);
        return;
      }

      setOutfits((prev) =>
        prev.map((outfit) =>
          outfit.id === outfitId ? { ...outfit, is_owned: true, is_unlocked: true } : outfit
        )
      );
      onOutfitChange();
    } catch (error: any) {
      console.error('Error purchasing outfit:', error);
      showNotification(`Failed to purchase outfit: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSelectOutfit = async (outfitId: string) => {
    if (!userId) return;

    try {
      await itemService.selectOutfit(userId, outfitId);
      onOutfitChange();
    } catch (error) {
      console.error('Error selecting outfit:', error);
      showNotification('Failed to select outfit');
    }
  };

  const scaledRewards = getScaledShopRewards(prestigePoints, ownedInvestmentCount);
  const maxAccumulated = scaledRewards.claimPool;
  const isLocked = timeUntilUnlock > 0;
  const isDailyAvailable = dailyRewardStatus?.canClaim ?? true;
  const rescueAvailable = dailyRewardStatus?.rescueAvailable ?? false;
  const hasClaimedToday = dailyRewardStatus?.hasClaimedToday ?? false;
  const streakBroken = dailyRewardStatus?.streakBroken ?? false;
  const cycleLength = dailyRewardStatus?.cycleLength ?? DAILY_REWARDS.length;
  const featuredDay = hasClaimedToday
    ? dailyRewardStatus?.displayRewardDay ?? 1
    : rescueAvailable
      ? dailyRewardStatus?.nextRewardDay ?? 1
      : dailyRewardStatus?.nextRewardDay ?? 1;
  const spotlightDay = hasClaimedToday
    ? dailyRewardStatus?.nextRewardDay ?? featuredDay
    : featuredDay;
  const spotlightReward = DAILY_REWARDS[spotlightDay - 1] || DAILY_REWARDS[0];
  const completedRewardDay = hasClaimedToday
    ? dailyRewardStatus?.displayRewardDay ?? 0
    : streakBroken
      ? 0
      : Math.max(0, featuredDay - 1);
  const dailyLimit = scaledRewards.dailyClaimLimit;
  const remainingDailyCapacity = Math.max(0, dailyLimit - resolvedDailyClaimedTotal);
  const claimableAccumulated = Math.min(accumulatedMoney, remainingDailyCapacity);
  void timeUntilFull;
  void maxAccumulated;
  const canClaim = claimableAccumulated > 0 && !isLocked;
  const dailyActionState: DailyRewardActionState =
    isClaimingDaily
      ? 'loading'
      : hasClaimedToday
        ? 'claimed'
        : isDailyAvailable
          ? 'claimable'
          : 'next';
  const dailyActionLabel =
    isClaimingDaily
      ? 'Claiming...'
      : hasClaimedToday
        ? 'Claimed'
        : isDailyAvailable
          ? 'Claim'
          : 'Next';

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
              <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3.5 w-3.5 object-contain" />
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

          <div
            className="relative cursor-pointer overflow-hidden rounded-[24px] border-2 border-yellow-200 bg-[linear-gradient(160deg,#fff7df_0%,#ffe9a8_45%,#fffaf2_100%)] p-4 shadow-[0_14px_30px_rgba(251,191,36,0.18)]"
            onClick={() => setShowDailyRewardsModal(true)}
          >
            <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-yellow-300/35 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-orange-300/25 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-orange-500 to-yellow-400 shadow-[0_10px_22px_rgba(249,115,22,0.3)]">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-orange-900">Daily Reward</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-orange-700 ring-1 ring-orange-200">
                      Day {spotlightDay}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-orange-700 ring-1 ring-orange-200">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      {dailyRewardStatus?.currentStreak ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4 rounded-[18px] border border-white/70 bg-white/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                    {hasClaimedToday ? 'Next Reward' : 'Daily Reward'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-[30px] font-black leading-none text-emerald-600">
                      {formatMoneyFull(spotlightReward.money)}
                    </p>

                    {spotlightReward.gems > 0 && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-black text-cyan-700 ring-1 ring-cyan-200">
                        <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3.5 w-3.5 object-contain" />
                        +{spotlightReward.gems}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="shrink-0"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <DailyRewardActionButton
                    state={dailyActionState}
                    label={dailyActionLabel}
                    onClick={handleClaimDaily}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Collect Earnings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-col items-center text-center gap-2">
              <img src={LOCAL_ICON_ASSETS.money} alt="Money" className="h-16 w-16 object-contain mt-1" />

              <div className="w-full">
                <p className={`text-sm font-black leading-tight ${canClaim ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {formatMoneyFull(claimableAccumulated)}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {formatMoneyFull(resolvedDailyClaimedTotal)} / {formatMoneyFull(dailyLimit)}
                </p>
                {isLocked && (
                  <p className="text-[9px] font-bold text-orange-500 mt-0.5">{formatLockTime(timeUntilUnlock)}</p>
                )}
              </div>

              <div className="flex gap-1.5 w-full mt-auto">
                <button
                  onClick={() => handleClaimMoney(false)}
                  disabled={!canClaim || isClaimingEarnings}
                  className={`flex-1 rounded-xl py-2 text-[11px] font-black transition-all active:scale-95 ${
                    canClaim && !isClaimingEarnings
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isClaimingEarnings ? '...' : 'Claim'}
                </button>
                <div className="relative flex-1">
                  <img
                    src={LOCAL_ICON_ASSETS.ads}
                    alt="Ad"
                    className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 object-contain drop-shadow-sm z-10"
                  />
                  <button
                    onClick={() => handleClaimMoney(true)}
                    disabled={!canClaim || isClaimingEarnings}
                    className={`w-full rounded-xl py-2 text-[11px] font-black transition-all active:scale-95 ${
                      canClaim && !isClaimingEarnings
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    x3
                  </button>
                </div>
              </div>
            </div>

            {/* Watch Ad */}
            <button
              onClick={handleWatchAd}
              disabled={isWatchingAd || adCooldown > 0}
              className={`rounded-2xl border p-3 flex flex-col items-center text-center transition-all active:scale-[0.97] ${
                isWatchingAd || adCooldown > 0
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-center my-1">
                {isWatchingAd ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-400" />
                ) : (
                  <img src={LOCAL_ICON_ASSETS.ads} alt="Ad" className="h-16 w-16 object-contain" />
                )}
              </div>

              <p className={`text-sm font-black leading-tight mt-1 ${isWatchingAd || adCooldown > 0 ? 'text-slate-400' : 'text-purple-700'}`}>
                {isWatchingAd ? '...' : formatMoneyFull(scaledRewards.adReward)}
              </p>
              {adCooldown > 0 && !isWatchingAd && (
                <p className="text-[9px] font-bold text-orange-500 mt-0.5">{formatTime(adCooldown)}</p>
              )}

              <div className={`w-full rounded-xl py-2 mt-2 text-[11px] font-black transition-all ${
                isWatchingAd || adCooldown > 0
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}>
                {isWatchingAd ? 'Watching...' : adCooldown > 0 ? 'Wait' : 'Free'}
              </div>
            </button>
          </div>

          <div
            ref={moneySectionRef}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg"
          >
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
                    src={LOCAL_ICON_ASSETS.buyMoreMoney}
                    alt="Money"
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="text-lg font-black text-green-600 mb-2">
                    {formatMoneyFull(pkg.calculated_amount)}
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

          <div
            ref={gemSectionRef}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-5 w-5 object-contain" />
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
                    src={LOCAL_ICON_ASSETS.gemBox}
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
            <div>
              {outfitsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                </div>
              ) : outfits.length === 0 ? (
                <div className="text-center py-12">
                  <Shirt className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-bold">No outfits available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {outfits.map((outfit) => {
                    const isSelected = selectedOutfitId === outfit.id;
                    const canAfford = totalMoney >= outfit.price;

                    return (
                      <div
                        key={outfit.id}
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col ${
                          isSelected
                            ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.3)]'
                            : outfit.is_owned
                              ? 'border-slate-200'
                              : 'border-slate-200'
                        }`}
                      >
                        {/* Görsel */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 flex items-end justify-center pt-3 px-2" style={{ minHeight: '160px' }}>
                          <img
                            src={resolveLocalAsset(outfit.image_url, 'outfit')}
                            alt={outfit.name}
                            className="w-full object-contain"
                            style={{ maxHeight: '180px' }}
                          />
                        </div>

                        {/* Rozet */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            ON
                          </div>
                        )}
                        {!outfit.is_owned && !canAfford && (
                          <div className="absolute top-2 right-2 bg-slate-700/70 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}

                        {/* Alt bilgi */}
                        <div className="p-2.5 flex flex-col gap-2 bg-white flex-1">
                          <p className="text-[12px] font-black text-slate-800 leading-tight truncate">{outfit.name}</p>

                          {outfit.is_owned ? (
                            isSelected ? (
                              <div className="w-full rounded-xl py-2 text-[11px] font-black text-center bg-emerald-500 text-white">
                                Equipped
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSelectOutfit(outfit.id)}
                                className="w-full rounded-xl py-2 text-[11px] font-black bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-all active:scale-95"
                              >
                                Select
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => handlePurchaseOutfit(outfit.id, outfit.price)}
                              disabled={!canAfford}
                              className={`w-full rounded-xl py-2 text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1 ${
                                canAfford
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              <img src={LOCAL_ICON_ASSETS.money} alt="" className="h-3.5 w-3.5 object-contain" />
                              {formatMoneyFull(outfit.price)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showDailyRewardsModal && (
        <div
          className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/50 pointer-events-auto"
          onClick={() => setShowDailyRewardsModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.25)] flex flex-col"
            style={{ maxHeight: 'calc(100dvh - 80px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[linear-gradient(160deg,#fff7df_0%,#ffe9a8_50%,#fffaf2_100%)] px-4 pt-5 pb-4 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black text-orange-700 ring-1 ring-orange-200">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    {dailyRewardStatus?.currentStreak ?? 0} day streak
                  </div>
                  <span className="text-[10px] font-black text-orange-400">
                    Day {spotlightDay} / {cycleLength}
                  </span>
                </div>
                <button
                  onClick={() => setShowDailyRewardsModal(false)}
                  className="rounded-full bg-white/85 p-2 text-orange-700 ring-1 ring-orange-200 transition-all active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-3 text-xl font-black text-orange-900">Daily Rewards</h3>
              <p className="mt-0.5 text-[11px] text-orange-600/70">Login every day to earn bigger rewards</p>
            </div>

            {/* Cards */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2.5">
              {/* Row 1: Days 1–3 (3 columns, small) */}
              <div className="grid grid-cols-3 gap-2">
                {DAILY_REWARDS.slice(0, 3).map((reward) => {
                  const isCompleted = reward.day <= completedRewardDay;
                  const isToday = reward.day === spotlightDay;
                  const isClaimable = isToday && isDailyAvailable && !hasClaimedToday;

                  return (
                    <div
                      key={reward.day}
                      className={`rounded-2xl border px-2 py-3 text-center transition-all ${
                        isClaimable
                          ? 'border-orange-300 bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 shadow-[0_8px_20px_rgba(249,115,22,0.25)]'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50'
                            : isToday
                              ? 'border-orange-200 bg-orange-50'
                              : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className={`text-[9px] font-black uppercase tracking-wide mb-2 ${
                        isClaimable ? 'text-white/80' : isToday ? 'text-orange-500' : 'text-slate-400'
                      }`}>
                        Day {reward.day}
                      </p>
                      {isCompleted ? (
                        <Check className="h-4 w-4 mx-auto text-emerald-500" />
                      ) : (
                        <p className={`text-[11px] font-black leading-tight ${
                          isClaimable ? 'text-white' : 'text-slate-800'
                        }`}>
                          {formatMoneyFull(reward.money)}
                        </p>
                      )}
                      {!isCompleted && reward.gems > 0 && (
                        <div className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                          isClaimable ? 'bg-white/25 text-white' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                        }`}>
                          <img src={LOCAL_ICON_ASSETS.gem} alt="" className="h-2.5 w-2.5 object-contain" />
                          +{reward.gems}
                        </div>
                      )}
                      {isToday && !isCompleted && (
                        <div className={`mt-1.5 text-[8px] font-black rounded-full px-2 py-0.5 ${
                          isClaimable ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {isClaimable ? 'TODAY' : hasClaimedToday ? 'DONE' : 'NEXT'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Days 4–5 (2 columns, medium) */}
              <div className="grid grid-cols-2 gap-2">
                {DAILY_REWARDS.slice(3, 5).map((reward) => {
                  const isCompleted = reward.day <= completedRewardDay;
                  const isToday = reward.day === spotlightDay;
                  const isClaimable = isToday && isDailyAvailable && !hasClaimedToday;

                  return (
                    <div
                      key={reward.day}
                      className={`rounded-2xl border px-3 py-3.5 transition-all ${
                        isClaimable
                          ? 'border-orange-300 bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 shadow-[0_8px_20px_rgba(249,115,22,0.25)]'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50'
                            : isToday
                              ? 'border-orange-200 bg-orange-50'
                              : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-[10px] font-black uppercase tracking-wide ${
                          isClaimable ? 'text-white/80' : isToday ? 'text-orange-500' : 'text-slate-400'
                        }`}>
                          Day {reward.day}
                        </p>
                        {isCompleted
                          ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                          : isToday
                            ? <div className={`text-[8px] font-black rounded-full px-2 py-0.5 ${
                                isClaimable ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {isClaimable ? 'TODAY' : hasClaimedToday ? 'DONE' : 'NEXT'}
                              </div>
                            : null
                        }
                      </div>
                      {isCompleted ? (
                        <p className="text-sm font-black text-emerald-700 line-through opacity-50">
                          {formatMoneyFull(reward.money)}
                        </p>
                      ) : (
                        <p className={`text-base font-black leading-tight ${
                          isClaimable ? 'text-white' : 'text-slate-900'
                        }`}>
                          {formatMoneyFull(reward.money)}
                        </p>
                      )}
                      {!isCompleted && reward.gems > 0 && (
                        <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                          isClaimable ? 'bg-white/25 text-white' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                        }`}>
                          <img src={LOCAL_ICON_ASSETS.gem} alt="" className="h-3 w-3 object-contain" />
                          +{reward.gems}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day 6: Full width */}
              {(() => {
                const reward = DAILY_REWARDS[5];
                const isCompleted = reward.day <= completedRewardDay;
                const isToday = reward.day === spotlightDay;
                const isClaimable = isToday && isDailyAvailable && !hasClaimedToday;

                return (
                  <div className={`rounded-2xl border px-4 py-4 flex items-center justify-between gap-3 transition-all ${
                    isClaimable
                      ? 'border-orange-300 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 shadow-[0_10px_24px_rgba(249,115,22,0.28)]'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50'
                        : isToday
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-wide mb-1 ${
                        isClaimable ? 'text-white/80' : isToday ? 'text-orange-500' : 'text-slate-400'
                      }`}>
                        Day {reward.day}
                      </p>
                      {isCompleted ? (
                        <p className="text-lg font-black text-emerald-700 line-through opacity-50">
                          {formatMoneyFull(reward.money)}
                        </p>
                      ) : (
                        <p className={`text-xl font-black ${isClaimable ? 'text-white' : 'text-slate-900'}`}>
                          {formatMoneyFull(reward.money)}
                        </p>
                      )}
                      {!isCompleted && reward.gems > 0 && (
                        <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${
                          isClaimable ? 'bg-white/25 text-white' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                        }`}>
                          <img src={LOCAL_ICON_ASSETS.gem} alt="" className="h-3.5 w-3.5 object-contain" />
                          +{reward.gems} gems
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isCompleted
                        ? <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-5 w-5 text-emerald-500" />
                          </div>
                        : isToday
                          ? <div className={`text-[9px] font-black rounded-full px-3 py-1.5 ${
                              isClaimable ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {isClaimable ? 'TODAY' : hasClaimedToday ? 'DONE' : 'NEXT'}
                            </div>
                          : null
                      }
                    </div>
                  </div>
                );
              })()}

              {/* Day 7: JACKPOT — special card */}
              {(() => {
                const reward = DAILY_REWARDS[6];
                const isCompleted = reward.day <= completedRewardDay;
                const isToday = reward.day === spotlightDay;
                const isClaimable = isToday && isDailyAvailable && !hasClaimedToday;

                return (
                  <div className={`rounded-2xl border-2 px-4 py-4 transition-all ${
                    isClaimable
                      ? 'border-amber-400 bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-400 shadow-[0_12px_30px_rgba(251,191,36,0.4)]'
                      : isCompleted
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-amber-200 bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_100%)]'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className={`h-4 w-4 shrink-0 ${isClaimable ? 'text-white' : 'text-amber-500'}`} />
                          <span className={`text-[11px] font-black uppercase tracking-wider ${
                            isClaimable ? 'text-white' : 'text-amber-700'
                          }`}>
                            Jackpot — Day 7
                          </span>
                        </div>
                        {isCompleted ? (
                          <p className="text-2xl font-black text-emerald-700 line-through opacity-50">
                            {formatMoneyFull(reward.money)}
                          </p>
                        ) : (
                          <p className={`text-2xl font-black leading-tight ${
                            isClaimable ? 'text-white' : 'text-slate-900'
                          }`}>
                            {formatMoneyFull(reward.money)}
                          </p>
                        )}
                        {!isCompleted && (
                          <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black ${
                            isClaimable ? 'bg-white/30 text-white' : 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300'
                          }`}>
                            <img src={LOCAL_ICON_ASSETS.gem} alt="" className="h-3.5 w-3.5 object-contain" />
                            +{reward.gems} gems bonus!
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-6 w-6 text-emerald-500" />
                          </div>
                        ) : isToday ? (
                          <div className={`text-[9px] font-black rounded-full px-3 py-1.5 ${
                            isClaimable ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-800'
                          }`}>
                            {isClaimable ? 'TODAY' : hasClaimedToday ? 'DONE' : 'NEXT'}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom action */}
            <div className="px-4 pb-6 pt-3 shrink-0 border-t border-slate-100 bg-white">
              {rescueAvailable && !hasClaimedToday ? (
                <button
                  onClick={handleRescueDailyStreak}
                  disabled={adCooldown > 0 || isWatchingAd}
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm font-black transition-all ${
                    adCooldown > 0 || isWatchingAd
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_10px_24px_rgba(244,63,94,0.22)] active:scale-[0.98]'
                  }`}
                >
                  {isWatchingAd ? 'Watching...' : adCooldown > 0 ? `Rescue Streak (${formatTime(adCooldown)})` : 'Watch Ad — Rescue Streak'}
                </button>
              ) : (
                <button
                  onClick={isDailyAvailable && !hasClaimedToday ? handleClaimDaily : undefined}
                  disabled={!isDailyAvailable || hasClaimedToday || isClaimingDaily}
                  className={`w-full rounded-2xl px-4 py-3.5 text-base font-black transition-all ${
                    hasClaimedToday
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                      : isDailyAvailable
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_12px_28px_rgba(249,115,22,0.28)] active:scale-[0.98]'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isClaimingDaily
                    ? 'Claiming...'
                    : hasClaimedToday
                      ? `Come back in ${Math.ceil(dailyRewardStatus?.hoursUntilReset ?? 0)}h`
                      : 'Claim Daily Reward'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

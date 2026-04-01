import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import ProfileModal from './components/ProfileModal';
import OfflineEarningsModal from './components/OfflineEarningsModal';
import { Header } from './components/Header';
import { CharacterDisplay } from './components/CharacterDisplay';
import { Shop } from './components/Shop';
import { ShopModal } from './components/ShopModal';
import { JobsModal } from './components/JobsModal';
import { BusinessModal } from './components/BusinessModal';
import { InvestmentsModal } from './components/InvestmentsModal';
import { StuffModal } from './components/StuffModal';
import { BottomNav } from './components/BottomNav';
import { IncomeBreakdownModal } from './components/IncomeBreakdownModal';
import { QuestBar } from './components/QuestBar';
import { QuestListModal } from './components/QuestListModal';
import { QuestRewardClaimModal } from './components/QuestRewardClaimModal';
import { TestRewardedAdModal } from './components/TestRewardedAdModal';
import { MoneyRewardAnimation } from './components/MoneyRewardAnimation';
import { GemRewardAnimation } from './components/GemRewardAnimation';
import { StatRewardAnimation } from './components/StatRewardAnimation';
import { JobTransitionAnimation } from './components/JobTransitionAnimation';
import { HealthModal } from './components/HealthModal';
import { HappinessModal } from './components/HappinessModal';
import { getDailyRewardStatus } from './data/local/rewards';
import { getScaledShopRewards } from './data/local/rewardScaling';
import { sumWellbeingEffectsPerHour } from './data/local/wellbeing';
import { LOCAL_QUESTS } from './data/local/quests';
import type { BankDepositPlanId } from './types/game';
import { getCashbackRate } from './data/local/bankRewards';
import { hasPremiumBankCard } from './data/local/bankPremium';
import {
  dismissActiveAd,
  getAdProviderName,
  initializeAds,
  rewardActiveAd,
  showRewardedAd,
  useAdServiceState,
  type AdPlacement,
} from './services/adService';

function getCanClaimAccumulatedMoney(params: {
  claimPool: number;
  dailyClaimLimit: number;
  lastClaimTime: string | null;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
}) {
  const { claimPool, dailyClaimLimit, lastClaimTime, claimLockedUntil, dailyClaimedTotal } = params;

  if (claimPool <= 0) {
    return false;
  }

  const now = Date.now();

  if (claimLockedUntil && new Date(claimLockedUntil).getTime() > now) {
    return false;
  }

  if (dailyClaimedTotal >= dailyClaimLimit) {
    return false;
  }

  if (!lastClaimTime) {
    return false;
  }

  const elapsedMinutes = Math.max(0, (now - new Date(lastClaimTime).getTime()) / 60000);
  if (elapsedMinutes < 60) {
    return false;
  }

  const accumulatedMoney = Math.floor(claimPool);
  return accumulatedMoney > 0;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function App() {
  const { deviceId, isAuthenticated, user, loading: authLoading } = useAuth();
  const gameState = useGameState(deviceId, user?.id || null);
  const [showShop, setShowShop] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'job' | 'business' | 'investments' | 'stuff'>('shop');
  
  // PERFORMANS ÇÖZÜMÜ: Her saniye render tetikleyen state yerine, 
  // başlangıç anını bir kere alıp ProfileModal'a gönderiyoruz.
  const sessionStartTimeRef = useRef(Date.now());
  
  // GÜVENLİK ÇÖZÜMÜ: Sonsuz profil yaratma döngüsünü engeller
  const profileCreationAttempted = useRef(false);
  
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showHappinessModal, setShowHappinessModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  const [showStuffModal, setShowStuffModal] = useState(false);
  const [shopModalInitialTab, setShopModalInitialTab] = useState<'shop' | 'outfits'>('shop');
  const [stuffModalInitialTab, setStuffModalInitialTab] = useState<'cars' | 'houses'>('cars');
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false);
  const [showQuestList, setShowQuestList] = useState(false);
  const [moneyAnchorRect, setMoneyAnchorRect] = useState<DOMRect | null>(null);
  const [gemAnchorRect, setGemAnchorRect] = useState<DOMRect | null>(null);
  const [healthAnchorRect, setHealthAnchorRect] = useState<DOMRect | null>(null);
  const [happinessAnchorRect, setHappinessAnchorRect] = useState<DOMRect | null>(null);
  const [moneyAnimationSequenceId, setMoneyAnimationSequenceId] = useState(0);
  const [gemAnimationSequenceId, setGemAnimationSequenceId] = useState(0);
  const [healthAnimationSequenceId, setHealthAnimationSequenceId] = useState(0);
  const [happinessAnimationSequenceId, setHappinessAnimationSequenceId] = useState(0);
  const [isQuestRewardAnimating, setIsQuestRewardAnimating] = useState(false);
  const [isOfflineAdClaiming, setIsOfflineAdClaiming] = useState(false);
  const [isQuestAdClaiming, setIsQuestAdClaiming] = useState(false);
  const [isJobCooldownAdClaiming, setIsJobCooldownAdClaiming] = useState(false);
  const [questRewardModalQuest, setQuestRewardModalQuest] = useState<(typeof LOCAL_QUESTS)[number] | null>(null);
  const [moneyRewardFx, setMoneyRewardFx] = useState<{
    amount: number;
    phase: 'popup' | 'fly';
  } | null>(null);
  const [gemRewardFx, setGemRewardFx] = useState<{
    amount: number;
    phase: 'popup' | 'fly';
  } | null>(null);
  const [statRewardFx, setStatRewardFx] = useState<{
    kind: 'health' | 'happiness';
    amount: number;
    phase: 'popup' | 'fly';
  } | null>(null);
  const [jobTransitionFx, setJobTransitionFx] = useState<{
    previousJob: (typeof gameState.jobs)[number] | null;
    nextJob: (typeof gameState.jobs)[number];
  } | null>(null);
  const { activeRequest: activeAdRequest } = useAdServiceState();

  useEffect(() => {
    initializeAds().catch((error) => {
      console.warn('[ads] initialization failed', error);
    });
  }, []);

  const openQuestTarget = (quest: (typeof LOCAL_QUESTS)[number]) => {
    if (quest.target_screen === 'shop') {
      setShopModalInitialTab(quest.condition.type === 'owned_outfit_count' ? 'outfits' : 'shop');
    }

    if (quest.target_screen === 'stuff') {
      setStuffModalInitialTab(quest.condition.type === 'selected_house_level' ? 'houses' : 'cars');
    }

    handleTabChange(quest.target_screen);
  };

  const handleTabChange = (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => {
    setActiveTab(tab);
    if (tab === 'shop') {
      setShowShopModal(true);
    } else if (tab === 'job') {
      setShowJobs(true);
    } else if (tab === 'business') {
      setShowBusinessModal(true);
    } else if (tab === 'investments') {
      setShowInvestmentsModal(true);
    } else if (tab === 'stuff') {
      setShowStuffModal(true);
    }
  };

  useEffect(() => {
    if (!authLoading && !gameState.profile && !gameState.loading && isAuthenticated && user?.id) {
      if (!profileCreationAttempted.current) {
        profileCreationAttempted.current = true;
        gameState.createProfile();
      }
    }
  }, [authLoading, gameState.profile, gameState.loading, isAuthenticated, user?.id]);

  async function handlePlayerNameChange(newName: string) {
    await gameState.updatePlayerName(newName);
  }

  async function playRewardAnimationSequence(reward: { money: number; gems: number }) {
    if (reward.money > 0) {
      setMoneyRewardFx({ amount: reward.money, phase: 'popup' });
      await wait(1000);
      setMoneyRewardFx({ amount: reward.money, phase: 'fly' });
      await wait(650);
      setMoneyRewardFx(null);
    }

    if (reward.gems > 0) {
      setGemRewardFx({ amount: reward.gems, phase: 'popup' });
      await wait(1000);
      setGemRewardFx({ amount: reward.gems, phase: 'fly' });
      await wait(650);
      setGemRewardFx(null);
    }
  }

  async function playStatRewardAnimationSequence(kind: 'health' | 'happiness', amount: number) {
    if (amount <= 0) {
      return;
    }

    setStatRewardFx({ kind, amount, phase: 'popup' });
    await wait(900);
    setStatRewardFx({ kind, amount, phase: 'fly' });
    await wait(650);
    setStatRewardFx(null);
  }

  async function requestRewardedAd(placement: AdPlacement) {
    const result = await showRewardedAd(placement);
    return result.rewarded;
  }

  async function handleAnimatedDailyClaim(reward: { money: number; gems: number }) {
    setIsQuestRewardAnimating(true);

    try {
      if (reward.money > 0 || reward.gems > 0) {
        await playRewardAnimationSequence(reward);
      }

      const result = await gameState.claimDailyReward();
      if (!result) {
        return false;
      }

      if (reward.money > 0) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      if (reward.gems > 0) {
        setGemAnimationSequenceId((prev) => prev + 1);
      }

      return true;
    } finally {
      setMoneyRewardFx(null);
      setGemRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedEarningsClaim(params: { isTriple: boolean }) {
    if (params.isTriple) {
      const rewarded = await requestRewardedAd('earnings_x3');
      if (!rewarded) {
        return { success: false, claimedAmount: 0 };
      }
    }

    setIsQuestRewardAnimating(true);

    try {
      const result = await gameState.claimAccumulatedMoney(params.isTriple);
      if (!result.success || result.claimedAmount <= 0) {
        return result;
      }

      await playRewardAnimationSequence({ money: result.claimedAmount, gems: 0 });

      if (result.claimedAmount > 0) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return result;
    } finally {
      setMoneyRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedAdReward(reward: number) {
    const rewarded = await requestRewardedAd('shop_ad_reward');
    if (!rewarded) {
      return { success: false, reward: 0, cooldown: 0 };
    }

    setIsQuestRewardAnimating(true);

    try {
      if (reward > 0) {
        await playRewardAnimationSequence({ money: reward, gems: 0 });
      }

      const result = await gameState.watchAd();
      if (result.success && reward > 0) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return result;
    } finally {
      setMoneyRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleBusinessUpgradeWithAdDiscount(businessId: string) {
    const rewarded = await requestRewardedAd('business_upgrade_discount');
    if (!rewarded) {
      return false;
    }

    return gameState.upgradeBusinessWithAdDiscount(businessId);
  }

  async function handleAnimatedHealthAction(actionKey: Parameters<typeof gameState.applyHealthAction>[0]) {
    const result = await gameState.applyHealthAction(actionKey);
    if (!result.success || result.appliedAmount <= 0) {
      return result;
    }

    await playStatRewardAnimationSequence('health', result.appliedAmount);
    setHealthAnimationSequenceId((prev) => prev + 1);
    return result;
  }

  async function handleAnimatedHealthAdBoost() {
    const result = await gameState.applyHealthAdBoost();
    if (!result.success || result.appliedAmount <= 0) {
      return result;
    }

    await playStatRewardAnimationSequence('health', result.appliedAmount);
    setHealthAnimationSequenceId((prev) => prev + 1);
    return result;
  }

  async function handleAnimatedHappinessAction(actionKey: Parameters<typeof gameState.applyHappinessAction>[0]) {
    const result = await gameState.applyHappinessAction(actionKey);
    if (!result.success || result.appliedAmount <= 0) {
      return result;
    }

    await playStatRewardAnimationSequence('happiness', result.appliedAmount);
    setHappinessAnimationSequenceId((prev) => prev + 1);
    return result;
  }

  async function handleAnimatedHappinessAdBoost() {
    const result = await gameState.applyHappinessAdBoost();
    if (!result.success || result.appliedAmount <= 0) {
      return result;
    }

    await playStatRewardAnimationSequence('happiness', result.appliedAmount);
    setHappinessAnimationSequenceId((prev) => prev + 1);
    return result;
  }

  async function handleAnimatedPackagePurchase(moneyAdded: number, gemsAdded: number) {
    setIsQuestRewardAnimating(true);

    try {
      if (moneyAdded > 0 || gemsAdded > 0) {
        await playRewardAnimationSequence({ money: moneyAdded, gems: gemsAdded });
      }

      if (gameState.profile) {
        await gameState.saveProfile({
          total_money: gameState.profile.total_money + moneyAdded,
          gems: gameState.profile.gems + gemsAdded,
        });
      }

      if (moneyAdded > 0) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      if (gemsAdded > 0) {
        setGemAnimationSequenceId((prev) => prev + 1);
      }

      gameState.reload();
    } finally {
      setMoneyRewardFx(null);
      setGemRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedOfflineClaim() {
    const reward = gameState.offlineEarnings?.amount || 0;
    if (reward <= 0) {
      gameState.dismissOfflineEarnings();
      return false;
    }

    setIsQuestRewardAnimating(true);

    try {
      await playRewardAnimationSequence({ money: reward, gems: 0 });
      const result = await gameState.claimOfflineEarnings(1);

      if (result) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return result;
    } finally {
      setMoneyRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedOfflineDoubleClaim() {
    const reward = gameState.offlineEarnings?.amount || 0;
    if (reward <= 0 || isQuestRewardAnimating) {
      return false;
    }

    setIsOfflineAdClaiming(true);

    try {
      const rewarded = await requestRewardedAd('offline_x2');
      if (!rewarded) {
        return false;
      }

      setIsQuestRewardAnimating(true);
      await playRewardAnimationSequence({ money: reward * 2, gems: 0 });
      const result = await gameState.claimOfflineEarnings(2);

      if (result) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return result;
    } finally {
      setMoneyRewardFx(null);
      setIsOfflineAdClaiming(false);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleStartBankDeposit(planId: BankDepositPlanId, amount: number) {
    if (planId === 'premium_ad') {
      const rewarded = await requestRewardedAd('bank_premium_deposit');
      if (!rewarded) {
        return false;
      }
    }

    return gameState.startBankDeposit(planId, amount);
  }

  async function handleAnimatedBankDepositClaim(depositId: string) {
    if (isQuestRewardAnimating) {
      return false;
    }

    const deposit = gameState.bankDeposits.find((entry) => entry.id === depositId);
    const reward = deposit ? deposit.principal + deposit.profit : 0;
    if (!deposit || reward <= 0) {
      return false;
    }

    setIsQuestRewardAnimating(true);

    try {
      await playRewardAnimationSequence({ money: reward, gems: 0 });
      const result = await gameState.claimBankDeposit(depositId);

      if (result?.success) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return Boolean(result?.success);
    } finally {
      setMoneyRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedCashbackClaim() {
    if (isQuestRewardAnimating) {
      return false;
    }

    const reward = Math.max(0, Math.floor(Number(gameState.profile?.cashback_pool || 0)));
    if (reward <= 0) {
      return false;
    }

    setIsQuestRewardAnimating(true);

    try {
      await playRewardAnimationSequence({ money: reward, gems: 0 });
      const result = await gameState.claimCashback();

      if (result?.success) {
        setMoneyAnimationSequenceId((prev) => prev + 1);
      }

      return Boolean(result?.success);
    } finally {
      setMoneyRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handlePurchasePremiumBankCard(purchaseMethod: 'gems' | 'cash') {
    const success = await gameState.purchasePremiumBankCard(purchaseMethod);

    if (success && purchaseMethod === 'gems') {
      setGemAnimationSequenceId((prev) => prev + 1);
    }

    return success;
  }

  async function handleAnimatedQuestClaim(questId?: string, rewardMultiplier = 1) {
    if (isQuestRewardAnimating) {
      return;
    }

    const targetQuest = questId
      ? LOCAL_QUESTS.find((quest) => quest.id === questId) || null
      : gameState.currentQuest;

    const rewardMoney = targetQuest?.reward_money || 0;
    const rewardGems = targetQuest?.reward_gems || 0;

    if (rewardMoney <= 0 && rewardGems <= 0) {
      await gameState.claimQuestReward(questId);
      return;
    }

    setIsQuestRewardAnimating(true);

    try {
      const normalizedRewardMultiplier = rewardMultiplier > 1 ? 2 : 1;
      await playRewardAnimationSequence({
        money: rewardMoney * normalizedRewardMultiplier,
        gems: rewardGems > 0 ? rewardGems + (rewardMultiplier > 1 ? 2 : 0) : 0,
      });
      const result = await gameState.claimQuestReward(questId, rewardMultiplier);

      if (result?.success) {
        if (rewardMoney > 0) {
          setMoneyAnimationSequenceId((prev) => prev + 1);
        }
        if (rewardGems > 0) {
          setGemAnimationSequenceId((prev) => prev + 1);
        }
      }
    } finally {
      setMoneyRewardFx(null);
      setGemRewardFx(null);
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleQuestClaimRequest(questId?: string) {
    const targetQuest = questId
      ? LOCAL_QUESTS.find((quest) => quest.id === questId) || null
      : gameState.currentQuest;

    if (!targetQuest) return;

    if (targetQuest.reward_money > 0 || targetQuest.reward_gems > 0) {
      setQuestRewardModalQuest(targetQuest);
      return;
    }

    await handleAnimatedQuestClaim(targetQuest.id, 1);
  }

  async function handleQuestClaimWithAd() {
    if (!questRewardModalQuest) return;

    setIsQuestAdClaiming(true);
    try {
      const rewarded = await requestRewardedAd('quest_reward_x2');
      if (!rewarded) {
        return;
      }
      const targetQuestId = questRewardModalQuest.id;
      setQuestRewardModalQuest(null);
      await handleAnimatedQuestClaim(targetQuestId, 2);
    } finally {
      setIsQuestAdClaiming(false);
    }
  }

  async function handleQuestClaimNormal() {
    if (!questRewardModalQuest) return;
    const targetQuestId = questRewardModalQuest.id;
    setQuestRewardModalQuest(null);
    await handleAnimatedQuestClaim(targetQuestId, 1);
  }

  async function handleAnimatedQuestChapterClaim() {
    if (isQuestRewardAnimating || !gameState.claimableChapterReward) {
      return;
    }

    setIsQuestRewardAnimating(true);

    try {
      await gameState.claimQuestChapterReward();
    } finally {
      setIsQuestRewardAnimating(false);
    }
  }

  async function handleAnimatedJobSelect(jobId: string) {
    const previousPlayerJob = gameState.playerJobs.find((playerJob) => playerJob.is_active);
    const previousJob = previousPlayerJob
      ? gameState.jobs.find((job) => job.id === previousPlayerJob.job_id) || null
      : null;
    const nextJob = gameState.jobs.find((job) => job.id === jobId) || null;

    if (!nextJob) {
      return false;
    }

    const result = await gameState.selectJob(jobId);

    if (result) {
      setJobTransitionFx({
        previousJob,
        nextJob,
      });
    }

    return result;
  }

  async function handleJobCooldownSkip() {
    if (isJobCooldownAdClaiming) {
      return false;
    }

    setIsJobCooldownAdClaiming(true);
    try {
      const rewarded = await requestRewardedAd('job_unlock_skip');
      if (!rewarded) {
        return false;
      }
      return await gameState.skipJobCooldown();
    } finally {
      setIsJobCooldownAdClaiming(false);
    }
  }

  async function handleRescueDailyStreakWithAd() {
    const rewarded = await requestRewardedAd('daily_streak_rescue');
    if (!rewarded) {
      return { success: false, cooldown: 0 };
    }

    return gameState.rescueDailyRewardStreak();
  }

  async function handleResetProgress() {
    await gameState.resetProgress();
  }

  async function handleWatchHealthAd() {
    return await requestRewardedAd('health_boost');
  }

  async function handleWatchHappinessAd() {
    return await requestRewardedAd('happiness_boost');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Loading your game...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="text-center">
            <p className="text-white font-bold text-xl mb-4">Authentication Failed</p>
            <p className="text-white/80 mb-6">Unable to authenticate. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/30 hover:bg-white/40 text-white font-bold rounded-xl transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Loading your game...</p>
        </div>
      </div>
    );
  }

  if (!gameState.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Creating your profile...</p>
        </div>
      </div>
    );
  }

  const currentCharacter = gameState.characters.find(
    (c) => c.id === gameState.profile?.selected_character_id
  );
  const currentHouse = gameState.houses.find(
    (h) => h.id === gameState.profile?.selected_house_id
  );
  const currentCar = gameState.cars.find((c) => c.id === gameState.profile?.selected_car_id);
  const activePlayerJob = gameState.playerJobs.find((playerJob) => playerJob.is_active);
  const activeJob = activePlayerJob
    ? gameState.jobs.find((job) => job.id === activePlayerJob.job_id) || null
    : null;
  const ownedInvestmentCount = gameState.investments.filter((investment) => investment.is_owned).length;
  const scaledShopRewards = getScaledShopRewards(
    Number(gameState.profile.prestige_points ?? 0),
    ownedInvestmentCount
  );
  const hasReadyBankDeposit = gameState.bankDeposits.some(
    (deposit) => new Date(deposit.matures_at).getTime() <= Date.now()
  );
  const canClaimDailyReward = gameState.gameStats ? getDailyRewardStatus(gameState.gameStats).canClaim : false;
  const canClaimAccumulatedMoney = getCanClaimAccumulatedMoney({
    claimPool: scaledShopRewards.claimPool,
    dailyClaimLimit: scaledShopRewards.dailyClaimLimit,
    lastClaimTime: gameState.profile.last_claim_time || null,
    claimLockedUntil: gameState.claimLockedUntil,
    dailyClaimedTotal: Number(gameState.dailyClaimedTotal ?? 0),
  });
  const profileHealth = Math.max(0, Math.min(100, Number(gameState.profile.health ?? 100)));
  const profileHappiness = Math.max(0, Math.min(100, Number(gameState.profile.happiness ?? 100)));
  const wellbeingRatePerHour = sumWellbeingEffectsPerHour([activeJob, currentHouse, currentCar]);
  const healthRatePerHour = wellbeingRatePerHour.health;
  const happinessRatePerHour = wellbeingRatePerHour.happiness;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900">
      {currentHouse?.image_url ? (
        <div
          className="fixed inset-0 bg-cover bg-center z-0 opacity-65"
          style={{ backgroundImage: `url(${currentHouse.image_url})` }}
        />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black z-0" />
      )}

      <Header
        totalMoney={gameState.profile.total_money}
        moneyAnimationSequenceId={moneyAnimationSequenceId}
        moneyAnimationDelayMs={0}
        gemAnimationSequenceId={gemAnimationSequenceId}
        gemAnimationDelayMs={0}
        hourlyIncome={Number(gameState.profile.hourly_income ?? 1000)}
        jobIncome={Number(gameState.profile.job_income ?? 0)}
        businessIncome={Number(gameState.profile.business_income ?? 0)}
        investmentIncome={Number(gameState.profile.investment_income ?? 0)}
        houseRentExpense={Number(gameState.profile.house_rent_expense ?? 0)}
        vehicleExpense={Number(gameState.profile.vehicle_expense ?? 0)}
        otherExpenses={Number(gameState.profile.other_expenses ?? 0)}
        username={gameState.profile.display_name || gameState.profile.username}
        health={profileHealth}
        happiness={profileHappiness}
        healthAnimationSequenceId={healthAnimationSequenceId}
        happinessAnimationSequenceId={happinessAnimationSequenceId}
        healthRatePerHour={healthRatePerHour}
        happinessRatePerHour={happinessRatePerHour}
        gems={gameState.profile.gems || 0}
        prestigePoints={gameState.profile?.prestige_points ?? 0}
        onMoneyAnchorChange={setMoneyAnchorRect}
        onGemAnchorChange={setGemAnchorRect}
        onHealthAnchorChange={setHealthAnchorRect}
        onHappinessAnchorChange={setHappinessAnchorRect}
        onOpenProfile={() => {
          setShowProfile(true);
        }}
        onOpenHealth={() => {
          setShowHealthModal(true);
        }}
        onOpenHappiness={() => {
          setShowHappinessModal(true);
        }}
        onOpenIncomeBreakdown={() => {
          setShowIncomeBreakdown(true);
        }}
        onOpenSettings={() => {
          void 0;
        }}
      />

      <main className="flex-1 px-3 py-4 pb-40 overflow-y-auto relative z-10">
        <CharacterDisplay
          characterImage={currentCharacter?.image_url || ''}
          characterName={currentCharacter?.name || 'Character'}
          carImage={currentCar?.image_url}
          outfitImage={gameState.selectedOutfit?.image_url}
          onClickCharacter={gameState.handleClick}
        />
      </main>

      <QuestBar
        quest={gameState.currentQuest}
        isClaimable={gameState.currentQuestClaimable}
        isBusy={isQuestRewardAnimating}
        onPress={async () => {
          if (isQuestRewardAnimating) {
            return;
          }

          if (gameState.currentQuestClaimable) {
            await handleQuestClaimRequest();
          } else if (gameState.currentQuest) {
            openQuestTarget(gameState.currentQuest);
          }
        }}
      />

      <QuestListModal
        isOpen={showQuestList}
        onClose={() => setShowQuestList(false)}
        questProgress={gameState.questProgress}
        claimableChapterReward={gameState.claimableChapterReward}
        onClaimQuestReward={async (questId) => {
          await handleQuestClaimRequest(questId);
        }}
        onClaimChapterReward={handleAnimatedQuestChapterClaim}
        onGoToQuest={(quest) => {
          setShowQuestList(false);
          openQuestTarget(quest);
        }}
        isBusy={isQuestRewardAnimating}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenQuestList={() => setShowQuestList(true)}
        hasQuestAttention={gameState.hasClaimableQuestRewards || Boolean(gameState.claimableChapterReward)}
        attentionTabs={{
          shop: canClaimDailyReward || canClaimAccumulatedMoney,
          investments: hasReadyBankDeposit,
        }}
      />

      <Shop
        isOpen={showShop}
        onClose={() => {
          setShowShop(false);
          setActiveTab('shop');
        }}
        characters={gameState.characters}
        houses={gameState.houses}
        cars={gameState.cars}
        ownedCharacters={gameState.ownedCharacters}
        ownedHouses={gameState.ownedHouses}
        ownedCars={gameState.ownedCars}
        totalMoney={gameState.profile.total_money}
        onPurchase={(type, itemId, price) => gameState.purchaseitem(type, itemId, price)}
      />

      <ShopModal
        isOpen={showShopModal}
        onClose={() => {
          setShowShopModal(false);
          setActiveTab('shop');
        }}
        initialTab={shopModalInitialTab}
        userId={user.id}
        prestigePoints={gameState.profile.prestige_points || 0}
        ownedInvestmentCount={ownedInvestmentCount}
        lastClaimTime={gameState.profile.last_claim_time || null}
        lastAdWatchTime={gameState.profile.last_ad_watch_time || null}
        gems={gameState.profile.gems || 0}
        claimLockedUntil={gameState.claimLockedUntil}
        dailyClaimedTotal={gameState.dailyClaimedTotal}
        onClaimDaily={handleAnimatedDailyClaim}
        onRescueDailyStreak={handleRescueDailyStreakWithAd}
        onClaimMoney={handleAnimatedEarningsClaim}
        onWatchAd={handleAnimatedAdReward}
        onPurchaseComplete={handleAnimatedPackagePurchase}
        totalMoney={gameState.profile.total_money}
        selectedOutfitId={gameState.profile.selected_outfit_id}
        onOutfitChange={() => {
          gameState.reload();
        }}
      />

      <JobsModal
        isOpen={showJobs}
        onClose={() => {
          setShowJobs(false);
          setActiveTab('job');
        }}
        profile={gameState.profile}
        houses={gameState.houses}
        cars={gameState.cars}
        jobs={gameState.jobs}
        playerJobs={gameState.playerJobs}
        totalMoney={gameState.profile.total_money}
        onUnlockJob={gameState.unlockJob}
        onSelectJob={handleAnimatedJobSelect}
        onSkipCooldown={handleJobCooldownSkip}
        onOpenHealth={() => setShowHealthModal(true)}
        onOpenHappiness={() => setShowHappinessModal(true)}
        onOpenStuffTab={(tab) => {
          setStuffModalInitialTab(tab);
          setShowStuffModal(true);
        }}
        onOpenQuestList={() => setShowQuestList(true)}
        jobChangeLockedUntil={gameState.jobChangeLockedUntil}
        unsavedJobWorkSeconds={gameState.unsavedJobWorkSeconds}
        isSkippingCooldown={isJobCooldownAdClaiming}
      />

      <HealthModal
        isOpen={showHealthModal}
        profile={gameState.profile}
        onClose={() => setShowHealthModal(false)}
        onApplyAction={handleAnimatedHealthAction}
        onApplyAdBoost={handleAnimatedHealthAdBoost}
        onWatchAd={handleWatchHealthAd}
      />

      <HappinessModal
        isOpen={showHappinessModal}
        profile={gameState.profile}
        onClose={() => setShowHappinessModal(false)}
        onApplyAction={handleAnimatedHappinessAction}
        onApplyAdBoost={handleAnimatedHappinessAdBoost}
        onWatchAd={handleWatchHappinessAd}
      />

      {showBusinessModal && (
        <BusinessModal
          businesses={gameState.businesses}
          totalMoney={gameState.profile.total_money}
          onPurchase={gameState.purchaseBusiness}
          onUpgrade={gameState.upgradeBusiness}
          onUpgradeWithAdDiscount={handleBusinessUpgradeWithAdDiscount}
          onClose={() => {
            setShowBusinessModal(false);
            setActiveTab('business');
          }}
          loading={gameState.businessesLoading}
        />
      )}

      {showStuffModal && (
        <StuffModal
          cars={gameState.cars}
          houses={gameState.houses}
          totalMoney={gameState.profile.total_money}
          totalGems={gameState.profile.gems || 0}
          prestigePoints={gameState.profile.prestige_points || 0}
          initialTab={stuffModalInitialTab}
          selectedCarId={gameState.profile.selected_car_id}
          selectedHouseId={gameState.profile.selected_house_id}
          ownedCars={gameState.ownedCars}
          onPurchaseCar={(carId, price) => gameState.purchaseitem('car', carId, price)}
          onSelectCar={gameState.selectCar}
          onSelectHouse={gameState.selectHouse}
          onClose={() => {
            setShowStuffModal(false);
            setActiveTab('stuff');
          }}
          loading={gameState.loading}
        />
      )}

      {showInvestmentsModal && (
        <InvestmentsModal
          investments={gameState.investments}
          bankDeposits={gameState.bankDeposits}
          totalMoney={gameState.profile.total_money}
          gems={gameState.profile.gems || 0}
          cashbackPool={Number(gameState.profile.cashback_pool || 0)}
          cashbackRate={getCashbackRate(gameState.profile)}
          hasPremiumBankCard={hasPremiumBankCard(gameState.profile)}
          onPurchase={gameState.purchaseInvestment}
          onUpgrade={gameState.upgradeInvestment}
          onStartBankDeposit={handleStartBankDeposit}
          onClaimBankDeposit={handleAnimatedBankDepositClaim}
          onClaimCashback={handleAnimatedCashbackClaim}
          onPurchasePremiumBankCard={handlePurchasePremiumBankCard}
          onClose={() => {
            setShowInvestmentsModal(false);
            setActiveTab('investments');
          }}
        />
      )}

      <ProfileModal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
        }}
        playerName={gameState.profile.display_name || gameState.profile.username}
        onPlayerNameChange={handlePlayerNameChange}
        totalMoney={gameState.profile.total_money}
        lifetimeEarnings={gameState.profile.lifetime_earnings}
        totalClicks={gameState.profile.total_clicks}
        sessionStartTime={sessionStartTimeRef.current}
        onResetProgress={handleResetProgress}
        prestigePoints={gameState.profile?.prestige_points ?? 0}
      />

      <IncomeBreakdownModal
        isOpen={showIncomeBreakdown}
        onClose={() => setShowIncomeBreakdown(false)}
        jobIncome={Number(gameState.profile.job_income ?? 0)}
        businessIncome={Number(gameState.profile.business_income ?? 0)}
        investmentIncome={Number(gameState.profile.investment_income ?? 0)}
        houseRentExpense={Number(gameState.profile.house_rent_expense ?? 0)}
        vehicleExpense={Number(gameState.profile.vehicle_expense ?? 0)}
        otherExpenses={Number(gameState.profile.other_expenses ?? 0)}
        grossIncome={Number(gameState.profile.gross_income ?? 0)}
        totalExpenses={Number(gameState.profile.total_expenses ?? 0)}
        netIncome={Number(gameState.profile.hourly_income ?? 0)}
      />

      {gameState.offlineEarnings && gameState.offlineEarnings.amount > 0 && (
        <OfflineEarningsModal
          isOpen={true}
          onClaim={handleAnimatedOfflineClaim}
          onClaimDouble={handleAnimatedOfflineDoubleClaim}
          earnedAmount={gameState.offlineEarnings.amount}
          offlineMinutes={gameState.offlineEarnings.minutes}
          appliedMinutes={gameState.offlineEarnings.appliedMinutes}
          isClaiming={isQuestRewardAnimating}
          isWatchingAd={isOfflineAdClaiming}
        />
      )}

      <QuestRewardClaimModal
        isOpen={Boolean(questRewardModalQuest)}
        quest={questRewardModalQuest}
        onClose={() => setQuestRewardModalQuest(null)}
        onClaim={handleQuestClaimNormal}
        onClaimDouble={handleQuestClaimWithAd}
        isBusy={isQuestRewardAnimating}
        isWatchingAd={isQuestAdClaiming}
      />

      {moneyRewardFx && (
        <MoneyRewardAnimation
          amount={moneyRewardFx.amount}
          phase={moneyRewardFx.phase}
          targetRect={moneyAnchorRect}
        />
      )}

      {gemRewardFx && (
        <GemRewardAnimation
          amount={gemRewardFx.amount}
          phase={gemRewardFx.phase}
          targetRect={gemAnchorRect}
        />
      )}

      {statRewardFx && (
        <StatRewardAnimation
          kind={statRewardFx.kind}
          amount={statRewardFx.amount}
          phase={statRewardFx.phase}
          targetRect={statRewardFx.kind === 'health' ? healthAnchorRect : happinessAnchorRect}
        />
      )}

      {jobTransitionFx && (
        <JobTransitionAnimation
          previousJob={jobTransitionFx.previousJob}
          nextJob={jobTransitionFx.nextJob}
          onComplete={() => setJobTransitionFx(null)}
        />
      )}

      <TestRewardedAdModal
        request={activeAdRequest}
        providerName={getAdProviderName()}
        onRewarded={rewardActiveAd}
        onDismiss={dismissActiveAd}
      />
    </div>
  );
}

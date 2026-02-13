import { useState, useEffect } from 'react';
import { X, Gift, DollarSign, Gem, Play, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  hourlyIncome: number;
  lastClaimTime: string | null;
  gems: number;
  claimLockedUntil: string | null;
  dailyClaimedTotal: number;
  onClaimDaily: () => Promise<boolean>;
  onClaimMoney: (isTriple: boolean) => Promise<boolean>;
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
  hourlyIncome,
  lastClaimTime,
  gems,
  claimLockedUntil,
  dailyClaimedTotal,
  onClaimDaily,
  onClaimMoney,
}: ShopModalProps) {
  const [accumulatedMoney, setAccumulatedMoney] = useState(0);
  const [timeUntilFull, setTimeUntilFull] = useState(0);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [dailyRewardStatus, setDailyRewardStatus] = useState<{
    canClaim: boolean;
    currentStreak: number;
    nextRewardDay: number;
    hoursUntilReset: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDailyRewardStatus = async () => {
      const profileId = deviceIdentity.getProfileId();
      if (!profileId) return;

      try {
        const { data, error } = await supabase
          .rpc('get_daily_reward_status', {
            p_player_id: profileId
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

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
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

        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">

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

        </div>
      </div>
    </div>
  );
}

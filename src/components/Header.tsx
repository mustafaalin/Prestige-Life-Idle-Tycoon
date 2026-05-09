import { useState, useEffect, useRef } from 'react';
import { LOCAL_ICON_ASSETS, LOCAL_PROFILE_PLACEHOLDER } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour, formatMoneyPlain } from '../utils/money';
import type { BoostStatus } from '../hooks/useBoosts';

interface HeaderProps {
  totalMoney: number;
  moneyAnimationSequenceId?: number;
  moneyAnimationDelayMs?: number;
  gemAnimationSequenceId?: number;
  gemAnimationDelayMs?: number;
  hourlyIncome: number;
  jobIncome: number;
  businessIncome: number;
  investmentIncome: number;
  houseRentExpense: number;
  vehicleExpense: number;
  otherExpenses: number;
  username: string;
  outfitImage?: string;
  health: number;
  happiness: number;
  healthAnimationSequenceId?: number;
  happinessAnimationSequenceId?: number;
  healthRatePerHour: number;
  happinessRatePerHour: number;
  gems: number;
  prestigePoints: number;
  onMoneyAnchorChange?: (rect: DOMRect | null) => void;
  onGemAnchorChange?: (rect: DOMRect | null) => void;
  onHealthAnchorChange?: (rect: DOMRect | null) => void;
  onHappinessAnchorChange?: (rect: DOMRect | null) => void;
  onOpenProfile: () => void;
  onOpenHealth: () => void;
  onOpenHappiness: () => void;
  onOpenIncomeBreakdown: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  totalIncomeBoost: BoostStatus;
  onTotalIncomeBoostWatch: () => void;
}

export function Header({
  totalMoney,
  moneyAnimationSequenceId = 0,
  moneyAnimationDelayMs = 0,
  gemAnimationSequenceId = 0,
  gemAnimationDelayMs = 0,
  hourlyIncome,
  jobIncome,
  businessIncome,
  investmentIncome,
  houseRentExpense,
  vehicleExpense,
  otherExpenses,
  username,
  outfitImage,
  health,
  happiness,
  healthAnimationSequenceId = 0,
  happinessAnimationSequenceId = 0,
  healthRatePerHour,
  happinessRatePerHour,
  gems,
  prestigePoints,
  onMoneyAnchorChange,
  onGemAnchorChange,
  onHealthAnchorChange,
  onHappinessAnchorChange,
  onOpenProfile,
  onOpenHealth,
  onOpenHappiness,
  onOpenIncomeBreakdown,
  onOpenSettings,
  onOpenLeaderboard,
  totalIncomeBoost,
  onTotalIncomeBoostWatch,
}: HeaderProps) {
  const [isMoneyAnimating, setIsMoneyAnimating] = useState(false);
  const [displayedMoney, setDisplayedMoney] = useState(totalMoney);
  const [isGemAnimating, setIsGemAnimating] = useState(false);
  const [displayedGems, setDisplayedGems] = useState(gems);
  const [isHealthAnimating, setIsHealthAnimating] = useState(false);
  const [displayedHealth, setDisplayedHealth] = useState(health);
  const [isHappinessAnimating, setIsHappinessAnimating] = useState(false);
  const [displayedHappiness, setDisplayedHappiness] = useState(happiness);
  const prevMoneyRef = useRef(totalMoney);
  const prevGemRef = useRef(gems);
  const prevHealthRef = useRef(health);
  const prevHappinessRef = useRef(happiness);
  const moneyContainerRef = useRef<HTMLDivElement | null>(null);
  const gemContainerRef = useRef<HTMLDivElement | null>(null);
  const healthContainerRef = useRef<HTMLButtonElement | null>(null);
  const happinessContainerRef = useRef<HTMLButtonElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const lastSequenceRef = useRef(0);
  const gemAnimationFrameRef = useRef<number | null>(null);
  const gemDelayTimerRef = useRef<number | null>(null);
  const lastGemSequenceRef = useRef(0);
  const healthAnimationFrameRef = useRef<number | null>(null);
  const happinessAnimationFrameRef = useRef<number | null>(null);
  const lastHealthSequenceRef = useRef(0);
  const lastHappinessSequenceRef = useRef(0);

  const formatStatValue = (value: number) => `${Math.round(value)}`;
  const formatRate = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}/h`;

  useEffect(() => {
    setDisplayedMoney(totalMoney);
    setDisplayedGems(gems);
    setDisplayedHealth(health);
    setDisplayedHappiness(happiness);
  }, []);

  useEffect(() => {
    const startValue = prevMoneyRef.current;
    const endValue = totalMoney;

    if (startValue === endValue) {
      setDisplayedMoney(endValue);
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (delayTimerRef.current) {
      window.clearTimeout(delayTimerRef.current);
    }

    const runAnimation = () => {
      const startedAt = performance.now();
      const durationMs = 900;
      setIsMoneyAnimating(true);

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue + (endValue - startValue) * eased;
        setDisplayedMoney(nextValue);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        setDisplayedMoney(endValue);
        setIsMoneyAnimating(false);
        animationFrameRef.current = null;
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const shouldDelay = moneyAnimationSequenceId > lastSequenceRef.current && endValue > startValue;
    lastSequenceRef.current = moneyAnimationSequenceId;

    if (shouldDelay && moneyAnimationDelayMs > 0) {
      delayTimerRef.current = window.setTimeout(() => {
        runAnimation();
      }, moneyAnimationDelayMs);
    } else {
      runAnimation();
    }

    prevMoneyRef.current = totalMoney;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (delayTimerRef.current) {
        window.clearTimeout(delayTimerRef.current);
      }
    };
  }, [totalMoney, moneyAnimationSequenceId, moneyAnimationDelayMs]);

  useEffect(() => {
    const startValue = prevGemRef.current;
    const endValue = gems;

    if (startValue === endValue) {
      setDisplayedGems(endValue);
      return;
    }

    if (gemAnimationFrameRef.current) {
      cancelAnimationFrame(gemAnimationFrameRef.current);
    }
    if (gemDelayTimerRef.current) {
      window.clearTimeout(gemDelayTimerRef.current);
    }

    const runAnimation = () => {
      const startedAt = performance.now();
      const durationMs = 900;
      setIsGemAnimating(true);

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue + (endValue - startValue) * eased;
        setDisplayedGems(nextValue);

        if (progress < 1) {
          gemAnimationFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        setDisplayedGems(endValue);
        setIsGemAnimating(false);
        gemAnimationFrameRef.current = null;
      };

      gemAnimationFrameRef.current = requestAnimationFrame(tick);
    };

    const shouldDelay = gemAnimationSequenceId > lastGemSequenceRef.current && endValue > startValue;
    lastGemSequenceRef.current = gemAnimationSequenceId;

    if (shouldDelay && gemAnimationDelayMs > 0) {
      gemDelayTimerRef.current = window.setTimeout(() => {
        runAnimation();
      }, gemAnimationDelayMs);
    } else {
      runAnimation();
    }

    prevGemRef.current = gems;

    return () => {
      if (gemAnimationFrameRef.current) {
        cancelAnimationFrame(gemAnimationFrameRef.current);
      }
      if (gemDelayTimerRef.current) {
        window.clearTimeout(gemDelayTimerRef.current);
      }
    };
  }, [gems, gemAnimationSequenceId, gemAnimationDelayMs]);

  useEffect(() => {
    const startValue = prevHealthRef.current;
    const endValue = health;

    if (startValue === endValue) {
      setDisplayedHealth(endValue);
      return;
    }

    if (healthAnimationFrameRef.current) {
      cancelAnimationFrame(healthAnimationFrameRef.current);
    }

    const runAnimation = () => {
      const startedAt = performance.now();
      const durationMs = 650;
      setIsHealthAnimating(true);

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue + (endValue - startValue) * eased;
        setDisplayedHealth(nextValue);

        if (progress < 1) {
          healthAnimationFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        setDisplayedHealth(endValue);
        setIsHealthAnimating(false);
        healthAnimationFrameRef.current = null;
      };

      healthAnimationFrameRef.current = requestAnimationFrame(tick);
    };

    const shouldAnimate = healthAnimationSequenceId > lastHealthSequenceRef.current && endValue > startValue;

    if (shouldAnimate) {
      lastHealthSequenceRef.current = healthAnimationSequenceId;
      runAnimation();
    } else if (endValue > startValue) {
      // Hold the visible value until the reward animation reaches the header.
      return;
    } else {
      lastHealthSequenceRef.current = healthAnimationSequenceId;
      setDisplayedHealth(endValue);
      setIsHealthAnimating(false);
    }

    prevHealthRef.current = health;

    return () => {
      if (healthAnimationFrameRef.current) {
        cancelAnimationFrame(healthAnimationFrameRef.current);
      }
    };
  }, [health, healthAnimationSequenceId]);

  useEffect(() => {
    const startValue = prevHappinessRef.current;
    const endValue = happiness;

    if (startValue === endValue) {
      setDisplayedHappiness(endValue);
      return;
    }

    if (happinessAnimationFrameRef.current) {
      cancelAnimationFrame(happinessAnimationFrameRef.current);
    }

    const runAnimation = () => {
      const startedAt = performance.now();
      const durationMs = 650;
      setIsHappinessAnimating(true);

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue + (endValue - startValue) * eased;
        setDisplayedHappiness(nextValue);

        if (progress < 1) {
          happinessAnimationFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        setDisplayedHappiness(endValue);
        setIsHappinessAnimating(false);
        happinessAnimationFrameRef.current = null;
      };

      happinessAnimationFrameRef.current = requestAnimationFrame(tick);
    };

    const shouldAnimate =
      happinessAnimationSequenceId > lastHappinessSequenceRef.current && endValue > startValue;

    if (shouldAnimate) {
      lastHappinessSequenceRef.current = happinessAnimationSequenceId;
      runAnimation();
    } else if (endValue > startValue) {
      // Hold the visible value until the reward animation reaches the header.
      return;
    } else {
      lastHappinessSequenceRef.current = happinessAnimationSequenceId;
      setDisplayedHappiness(endValue);
      setIsHappinessAnimating(false);
    }

    prevHappinessRef.current = happiness;

    return () => {
      if (happinessAnimationFrameRef.current) {
        cancelAnimationFrame(happinessAnimationFrameRef.current);
      }
    };
  }, [happiness, happinessAnimationSequenceId]);

  useEffect(() => {
    if (!onMoneyAnchorChange || !moneyContainerRef.current) return;

    const updateRect = () => {
      onMoneyAnchorChange(moneyContainerRef.current?.getBoundingClientRect() || null);
    };

    updateRect();
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
    };
  }, [onMoneyAnchorChange, displayedMoney]);

  useEffect(() => {
    if (!onGemAnchorChange || !gemContainerRef.current) return;

    const updateRect = () => {
      onGemAnchorChange(gemContainerRef.current?.getBoundingClientRect() || null);
    };

    updateRect();
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
    };
  }, [onGemAnchorChange, displayedGems]);

  useEffect(() => {
    if (!onHealthAnchorChange || !healthContainerRef.current) return;

    const updateRect = () => {
      onHealthAnchorChange(healthContainerRef.current?.getBoundingClientRect() || null);
    };

    updateRect();
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
    };
  }, [displayedHealth, onHealthAnchorChange]);

  useEffect(() => {
    if (!onHappinessAnchorChange || !happinessContainerRef.current) return;

    const updateRect = () => {
      onHappinessAnchorChange(happinessContainerRef.current?.getBoundingClientRect() || null);
    };

    updateRect();
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
    };
  }, [displayedHappiness, onHappinessAnchorChange]);

  return (
    <header className="bg-gradient-to-br from-sky-500/45 via-cyan-600/45 to-blue-700/45 backdrop-blur-xl text-white shadow-2xl relative overflow-hidden w-full border-b border-white/30 z-20">
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

      <div className="px-3 py-2.5 relative z-10 w-full">
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onOpenProfile}
                className="flex-shrink-0 w-12 h-12 max-[420px]:w-9 max-[420px]:h-9 rounded-full overflow-hidden bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 shadow-xl transition-transform active:scale-90"
              >
                <img
                  src={outfitImage || LOCAL_PROFILE_PLACEHOLDER}
                  alt={username}
                  className="w-full h-full object-cover object-top scale-150 origin-top"
                />
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/25 to-amber-500/25 px-1.5 py-0.5 rounded-md border border-yellow-400/40 shadow-lg transition-transform active:scale-90"
              >
                <img
                  src={LOCAL_ICON_ASSETS.prestige}
                  alt="Prestige"
                  className="w-3.5 h-3.5"
                />
                <span className="text-[11px] font-black text-yellow-100 leading-none">
                  {prestigePoints}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div
                ref={moneyContainerRef}
                className={
                  'flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 border border-white/10 w-fit transition-all duration-300 ' +
                  (isMoneyAnimating
                    ? 'scale-[1.06] shadow-[0_0_16px_rgba(250,204,21,0.55)] border-yellow-400/40'
                    : 'scale-100')
                }
              >
                <img src={LOCAL_ICON_ASSETS.wallet} alt="Balance" className="w-5 h-5 max-[420px]:w-4 max-[420px]:h-4" />
                <span className="text-[13px] max-[420px]:text-[11px] font-black leading-none tracking-tight">
                  {formatMoneyFull(displayedMoney)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenIncomeBreakdown}
                  className={
                    'flex items-center gap-1.5 rounded-lg px-2 py-1 w-fit border transition-colors active:scale-[0.98] ' +
                    (hourlyIncome < 0
                      ? 'bg-red-500/25 border-red-400/35'
                      : 'bg-emerald-500/22 border-emerald-300/35')
                  }
                  title={`Job ${formatMoneyPerHour(jobIncome)} • Business ${formatMoneyPerHour(businessIncome)} • Investment ${formatMoneyPerHour(investmentIncome)} • House -$${formatMoneyPlain(houseRentExpense)}/h • Vehicle -$${formatMoneyPlain(vehicleExpense)}/h • Other -$${formatMoneyPlain(otherExpenses)}/h`}
                >
                  <img src={LOCAL_ICON_ASSETS.money} alt="Income per hour" className="w-4 h-4 max-[420px]:w-3 max-[420px]:h-3" />
                  <span className="text-[11px] max-[420px]:text-[10px] font-bold leading-none">
                    {formatMoneyPerHour(hourlyIncome)}
                  </span>
                  {totalIncomeBoost.active && (
                    <span className="text-[9px] font-black text-amber-300 bg-amber-400/20 rounded px-1">⚡2×</span>
                  )}
                </button>

                {totalIncomeBoost.active ? (
                  <div className="flex items-center gap-1 rounded-lg bg-amber-400/20 border border-amber-400/30 px-1.5 py-1">
                    <span className="text-[9px] font-black text-amber-300">⚡</span>
                    <span className="text-[9px] font-semibold text-amber-200/80">{totalIncomeBoost.remainingLabel}</span>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={LOCAL_ICON_ASSETS.ads}
                      alt="Ad"
                      className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 object-contain drop-shadow-sm z-10"
                    />
                    <button
                      onClick={onTotalIncomeBoostWatch}
                      className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[9px] font-black text-white transition-all active:scale-95 mt-0.5"
                    >
                      2× 1h
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-1">
              <button
                ref={healthContainerRef}
                onClick={onOpenHealth}
                className={
                  'flex h-7 max-[420px]:h-6 w-[120px] max-[420px]:w-[100px] items-center overflow-hidden rounded-full border border-white/35 bg-white/95 shadow-[0_4px_10px_rgba(15,23,42,0.12)] active:scale-[0.98] transition-all ' +
                  (isHealthAnimating ? 'scale-[1.03] shadow-[0_0_16px_rgba(16,185,129,0.35)]' : '')
                }
              >
                <div className="flex h-full min-w-[60px] max-[420px]:min-w-[48px] items-center gap-1 rounded-r-[14px] bg-gradient-to-r from-lime-400 to-lime-500 px-2 max-[420px]:px-1.5 text-slate-900">
                  <img src={LOCAL_ICON_ASSETS.healthy} alt="Health" className="h-3.5 w-3.5 max-[420px]:h-3 max-[420px]:w-3 shrink-0" />
                  <span className="text-[11px] max-[420px]:text-[10px] font-black leading-none">{formatStatValue(displayedHealth)}</span>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center px-2">
                  <span className={`text-[10px] font-black tracking-tight ${
                    healthRatePerHour >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {formatRate(healthRatePerHour)}
                  </span>
                </div>
              </button>
              <button
                ref={happinessContainerRef}
                onClick={onOpenHappiness}
                className={
                  'flex h-7 max-[420px]:h-6 w-[120px] max-[420px]:w-[100px] items-center overflow-hidden rounded-full border border-white/35 bg-white/95 shadow-[0_4px_10px_rgba(15,23,42,0.12)] active:scale-[0.98] transition-all ' +
                  (isHappinessAnimating ? 'scale-[1.03] shadow-[0_0_16px_rgba(245,158,11,0.35)]' : '')
                }
              >
                <div className="flex h-full min-w-[60px] max-[420px]:min-w-[48px] items-center gap-1 rounded-r-[14px] bg-gradient-to-r from-lime-400 to-lime-500 px-2 max-[420px]:px-1.5 text-slate-900">
                  <img src={LOCAL_ICON_ASSETS.happiness} alt="Happiness" className="h-3.5 w-3.5 max-[420px]:h-3 max-[420px]:w-3 shrink-0" />
                  <span className="text-[11px] max-[420px]:text-[10px] font-black leading-none">{formatStatValue(displayedHappiness)}</span>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center px-2">
                  <span className={`text-[11px] font-black tracking-tight ${
                    happinessRatePerHour >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {formatRate(happinessRatePerHour)}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div
                ref={gemContainerRef}
                className={
                  'flex items-center gap-1.5 bg-white/12 px-2 max-[420px]:px-1.5 py-1 rounded-lg min-w-[76px] max-[420px]:min-w-[58px] justify-center transition-all duration-300 ' +
                  (isGemAnimating
                    ? 'scale-[1.06] shadow-[0_0_16px_rgba(34,211,238,0.55)]'
                    : 'scale-100')
                }
              >
                <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="w-4 h-4" />
                <span className="text-sm max-[420px]:text-[11px] font-black leading-none">{Math.round(displayedGems)}</span>
              </div>

              <button
                onClick={onOpenSettings}
                className="p-2 max-[420px]:p-1.5 bg-white/12 hover:bg-white/18 active:scale-95 rounded-lg transition-all shadow-lg"
              >
                <img src={LOCAL_ICON_ASSETS.settings} alt="Settings" className="w-6 h-6 max-[420px]:w-5 max-[420px]:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

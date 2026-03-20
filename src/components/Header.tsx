import { useState, useEffect, useRef } from 'react';
import { LOCAL_ICON_ASSETS, LOCAL_PROFILE_PLACEHOLDER } from '../lib/localAssets';
import { formatMoneyFull, formatMoneyPerHour, formatMoneyPlain } from '../utils/money';

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
  characterImage?: string;
  health: number;
  happiness: number;
  gems: number;
  prestigePoints: number;
  onMoneyAnchorChange?: (rect: DOMRect | null) => void;
  onGemAnchorChange?: (rect: DOMRect | null) => void;
  onOpenProfile: () => void;
  onOpenIncomeBreakdown: () => void;
  onOpenSettings: () => void;
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
  characterImage,
  health,
  happiness,
  gems,
  prestigePoints,
  onMoneyAnchorChange,
  onGemAnchorChange,
  onOpenProfile,
  onOpenIncomeBreakdown,
  onOpenSettings
}: HeaderProps) {
  const [isMoneyAnimating, setIsMoneyAnimating] = useState(false);
  const [displayedMoney, setDisplayedMoney] = useState(totalMoney);
  const [isGemAnimating, setIsGemAnimating] = useState(false);
  const [displayedGems, setDisplayedGems] = useState(gems);
  const prevMoneyRef = useRef(totalMoney);
  const prevGemRef = useRef(gems);
  const moneyContainerRef = useRef<HTMLDivElement | null>(null);
  const gemContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const lastSequenceRef = useRef(0);
  const gemAnimationFrameRef = useRef<number | null>(null);
  const gemDelayTimerRef = useRef<number | null>(null);
  const lastGemSequenceRef = useRef(0);

  useEffect(() => {
    setDisplayedMoney(totalMoney);
    setDisplayedGems(gems);
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

  return (
    <header className="bg-gradient-to-br from-sky-500/45 via-cyan-600/45 to-blue-700/45 backdrop-blur-xl text-white shadow-2xl relative overflow-hidden w-full border-b border-white/30 z-20">
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

      <div className="px-3 py-2.5 relative z-10 w-full">
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onOpenProfile}
                className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 shadow-xl transition-transform active:scale-90"
              >
                <img
                  src={characterImage || LOCAL_PROFILE_PLACEHOLDER}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </button>

              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/25 to-amber-500/25 px-1.5 py-0.5 rounded-md border border-yellow-400/40 shadow-lg">
                <img
                  src={LOCAL_ICON_ASSETS.prestige}
                  alt="Prestige"
                  className="w-3.5 h-3.5"
                />
                <span className="text-[11px] font-black text-yellow-100 leading-none">
                  {prestigePoints}
                </span>
              </div>
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
                <img src={LOCAL_ICON_ASSETS.money} alt="Money" className="w-5 h-5" />
                <span className="text-[13px] font-black leading-none tracking-tight sm:text-[15px]">
                  {formatMoneyFull(displayedMoney)}
                </span>
              </div>

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
                <img src={LOCAL_ICON_ASSETS.wallet} alt="Wallet" className="w-4 h-4" />
                <span className="text-[11px] font-bold leading-none">
                  {formatMoneyPerHour(hourlyIncome)}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1 border-r border-white/15 pr-2">
              <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-md border border-red-400/30 w-[88px] justify-center">
                <img src={LOCAL_ICON_ASSETS.healthy} alt="Health" className="w-4 h-4" />
                <span className="text-xs font-black">{health}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/20 px-2 py-1 rounded-md border border-amber-400/30 w-[88px] justify-center">
                <img src={LOCAL_ICON_ASSETS.happiness} alt="Happiness" className="w-4 h-4" />
                <span className="text-xs font-black">{happiness}%</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div
                ref={gemContainerRef}
                className={
                  'flex items-center gap-1.5 bg-white/12 px-2 py-1 rounded-lg min-w-[76px] justify-center transition-all duration-300 ' +
                  (isGemAnimating
                    ? 'scale-[1.06] shadow-[0_0_16px_rgba(34,211,238,0.55)]'
                    : 'scale-100')
                }
              >
                <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="w-4 h-4" />
                <span className="text-sm font-black leading-none">{Math.round(displayedGems)}</span>
              </div>

              <button
                onClick={onOpenSettings}
                className="p-2 bg-white/12 hover:bg-white/18 active:scale-95 rounded-lg transition-all shadow-lg"
              >
                <img src={LOCAL_ICON_ASSETS.settings} alt="Settings" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

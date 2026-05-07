import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  CakeSlice,
  Car,
  Clapperboard,
  Headphones,
  Home,
  PartyPopper,
  Plane,
  SmilePlus,
  Users,
  X,
} from 'lucide-react';
import {
  getHappinessCooldownRemaining,
  HAPPINESS_ACTIONS,
  HAPPINESS_AD_BOOST_PERCENT,
} from '../data/local/happinessActions';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { HappinessActionKey, PlayerProfile, WellbeingFactor } from '../types/game';
import { formatMoneyFull } from '../utils/money';

const actionIcons: Record<HappinessActionKey, typeof Headphones> = {
  listen_to_music: Headphones,
  eat_a_dessert: CakeSlice,
  hang_out_with_friends: Users,
  go_to_the_cinema: Clapperboard,
  throw_a_party: PartyPopper,
  go_on_vacation: Plane,
};

const sourceIcons = { job: Briefcase, car: Car, house: Home } as const;

function formatRate(value: number): string {
  if (value === 0) return '0/h';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value % 1 === 0 ? value : value.toFixed(1)}/h`;
}

interface HappinessModalProps {
  isOpen: boolean;
  profile: PlayerProfile | null;
  onClose: () => void;
  onApplyAction: (actionKey: HappinessActionKey) => Promise<{ success: boolean; appliedAmount: number }>;
  onApplyAdBoost: () => Promise<{ success: boolean; appliedAmount: number }>;
  onWatchAd: () => Promise<boolean>;
  wellbeingFactors?: WellbeingFactor[];
}

function formatCooldown(seconds: number) {
  if (seconds <= 0) {
    return 'Ready';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export function HappinessModal({
  isOpen,
  profile,
  onClose,
  onApplyAction,
  onApplyAdBoost,
  onWatchAd,
  wellbeingFactors = [],
}: HappinessModalProps) {
  const [isApplyingAd, setIsApplyingAd] = useState(false);
  const [processingActionKey, setProcessingActionKey] = useState<HappinessActionKey | null>(null);
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTimeNow(Date.now());
    const timer = window.setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isOpen]);

  const currentHappiness = Math.max(0, Math.min(100, Number(profile?.happiness ?? 100)));
  const currentHappinessDisplay = Math.round(currentHappiness);
  const totalMoney = Math.max(0, Number(profile?.total_money ?? 0));
  const actionStates = useMemo(
    () =>
      HAPPINESS_ACTIONS.map((action) => {
        const cooldownRemaining = getHappinessCooldownRemaining(profile, action.key, timeNow);
        const isCoolingDown = cooldownRemaining > 0;
        const canAfford = totalMoney >= action.cost;
        const isMaxed = currentHappiness >= 100;

        return {
          action,
          cooldownRemaining,
          isCoolingDown,
          canAfford,
          isMaxed,
          isDisabled: processingActionKey !== null || isApplyingAd,
        };
      }),
    [currentHappiness, isApplyingAd, processingActionKey, profile, timeNow, totalMoney]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)',
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-amber-100">
        <div className="flex items-center justify-between p-4 border-b border-amber-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Happiness
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-700">
              <SmilePlus className="h-3 w-3" />
              {currentHappinessDisplay}% current happiness
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-100/60 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-3">
          {/* Faktörler kartı */}
          <div className="rounded-[20px] border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-3 shadow-[0_8px_20px_rgba(245,158,11,0.10)]">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
              Factors (per hour)
            </div>
            {wellbeingFactors.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No active factors</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {wellbeingFactors.map((f) => {
                  const Icon = sourceIcons[f.source];
                  const val = f.happinessPerHour;
                  const color = val > 0 ? 'text-amber-600' : val < 0 ? 'text-rose-500' : 'text-slate-400';
                  return (
                    <div key={f.source} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[12px] text-slate-600 truncate">{f.label}</span>
                      </div>
                      <span className={`text-[12px] font-black shrink-0 ${color}`}>{formatRate(val)}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between border-t border-amber-100 pt-1.5 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Total</span>
                  <span className={`text-[13px] font-black ${
                    wellbeingFactors.reduce((s, f) => s + f.happinessPerHour, 0) >= 0 ? 'text-amber-600' : 'text-rose-500'
                  }`}>
                    {formatRate(wellbeingFactors.reduce((s, f) => s + f.happinessPerHour, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reklam kartı */}
          <div className="rounded-[20px] border-2 border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <img src={LOCAL_ICON_ASSETS.ads} alt="Ad" className="h-14 w-14 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black text-slate-800">Watch Ad</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant <span className="font-black text-amber-600">+{HAPPINESS_AD_BOOST_PERCENT}%</span> happiness boost
                </p>
              </div>
              {currentHappiness >= 100 ? (
                <div className="shrink-0 min-w-[120px] rounded-[16px] border border-slate-200 bg-slate-100 px-4 py-2.5 text-center text-sm font-black text-slate-400">
                  Max Mood
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (isApplyingAd) return;
                    setIsApplyingAd(true);
                    try {
                      const rewarded = await onWatchAd();
                      if (!rewarded) return;
                      await onApplyAdBoost();
                    } finally {
                      setIsApplyingAd(false);
                    }
                  }}
                  disabled={isApplyingAd}
                  className={`shrink-0 min-w-[120px] rounded-[16px] px-4 py-2.5 text-center text-sm font-black transition-all border shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
                    isApplyingAd
                      ? 'border-amber-300 bg-gradient-to-r from-amber-200 to-orange-200 text-slate-700 opacity-70 cursor-not-allowed'
                      : 'border-amber-500 bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 active:scale-[0.98]'
                  }`}
                >
                  {isApplyingAd ? '...' : 'Free'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-3 pb-6">
            {actionStates.map(({ action, cooldownRemaining, isCoolingDown, canAfford, isMaxed, isDisabled }) => {
              const Icon = actionIcons[action.key];

              return (
                <div
                  key={action.id}
                  className="flex items-center gap-3 overflow-hidden rounded-[22px] border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-3 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-[0_6px_14px_rgba(15,23,42,0.06)]">
                    <Icon className="h-9 w-9 text-amber-500" strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-black leading-tight text-slate-900">
                          {action.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[13px] font-black text-amber-700">
                        <img src={LOCAL_ICON_ASSETS.happiness} alt="Happiness" className="h-4 w-4" />
                        +{action.happinessIncreasePercent}%
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div
                        className={`rounded-full border px-3 py-1 text-[11px] font-black ${
                          !canAfford
                              ? 'border-rose-200 bg-rose-50 text-rose-600'
                              : isMaxed
                                ? 'border-slate-200 bg-slate-100 text-slate-500'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {!canAfford
                          ? 'Need Cash'
                          : isMaxed
                            ? 'Max Happiness'
                            : 'Ready'}
                      </div>

                      {isCoolingDown ? (
                        <div className="min-w-[120px] rounded-[16px] border border-sky-200 bg-sky-50 px-4 py-2.5 text-center text-sm font-black text-sky-700">
                          {formatCooldown(cooldownRemaining)}
                        </div>
                      ) : isMaxed || !canAfford ? (
                        <div className="min-w-[120px] rounded-[16px] border border-slate-200 bg-slate-100 px-4 py-2.5 text-center text-sm font-black text-slate-400">
                          {formatMoneyFull(action.cost)}
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            if (isDisabled) return;
                            setProcessingActionKey(action.key);
                            try {
                              await onApplyAction(action.key);
                            } finally {
                              setProcessingActionKey(null);
                            }
                          }}
                          disabled={isDisabled}
                          className={`min-w-[120px] rounded-[16px] px-4 py-2.5 text-center text-sm font-black transition-all border shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
                            isDisabled
                              ? 'border-amber-300 bg-gradient-to-r from-amber-200 to-orange-200 text-slate-700 opacity-75'
                              : 'border-amber-400 bg-gradient-to-r from-amber-300 to-orange-300 text-slate-900 active:scale-[0.98]'
                          }`}
                        >
                          {formatMoneyFull(action.cost)}
                        </button>
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

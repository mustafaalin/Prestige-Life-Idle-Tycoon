import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Dumbbell,
  HeartPulse,
  Pill,
  ShieldPlus,
  Stethoscope,
  Syringe,
  Trees,
  X,
} from 'lucide-react';
import {
  HEALTH_ACTIONS,
  HEALTH_AD_BOOST_PERCENT,
  getHealthCooldownRemaining,
} from '../data/local/healthActions';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { HealthActionKey, PlayerProfile } from '../types/game';
import { formatMoneyFull } from '../utils/money';

const actionIcons: Record<HealthActionKey, typeof Dumbbell> = {
  exercise: Dumbbell,
  take_a_pill: Pill,
  go_to_the_doctor: Stethoscope,
  get_a_check_up: ShieldPlus,
  go_to_a_health_resort: Trees,
  get_an_operation: Syringe,
};

interface HealthModalProps {
  isOpen: boolean;
  profile: PlayerProfile | null;
  onClose: () => void;
  onApplyAction: (actionKey: HealthActionKey) => Promise<{ success: boolean; appliedAmount: number }>;
  onApplyAdBoost: () => Promise<{ success: boolean; appliedAmount: number }>;
  onWatchAd: () => Promise<boolean>;
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

export function HealthModal({
  isOpen,
  profile,
  onClose,
  onApplyAction,
  onApplyAdBoost,
  onWatchAd,
}: HealthModalProps) {
  const [isApplyingAd, setIsApplyingAd] = useState(false);
  const [processingActionKey, setProcessingActionKey] = useState<HealthActionKey | null>(null);
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

  const currentHealth = Math.max(0, Math.min(100, Number(profile?.health ?? 100)));
  const currentHealthDisplay = Math.round(currentHealth);
  const totalMoney = Math.max(0, Number(profile?.total_money ?? 0));
  const actionStates = useMemo(
    () =>
      HEALTH_ACTIONS.map((action) => {
        const cooldownRemaining = getHealthCooldownRemaining(profile, action.key, timeNow);
        const isCoolingDown = cooldownRemaining > 0;
        const canAfford = totalMoney >= action.cost;
        const isMaxed = currentHealth >= 100;

        return {
          action,
          cooldownRemaining,
          isCoolingDown,
          canAfford,
          isMaxed,
          isDisabled: processingActionKey !== null || isApplyingAd,
        };
      }),
    [currentHealth, isApplyingAd, processingActionKey, profile, timeNow, totalMoney]
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
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-emerald-100">
        <div className="flex items-center justify-between p-4 border-b border-emerald-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">
              Health
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <HeartPulse className="h-3 w-3" />
              {currentHealthDisplay}% current health
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-100/60 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-3">
          <div className="overflow-hidden rounded-[24px] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-white shadow-[0_14px_32px_rgba(16,185,129,0.12)]">
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-white/85 shadow-[0_8px_18px_rgba(16,185,129,0.12)]">
                <img src={LOCAL_ICON_ASSETS.healthy} alt="Health" className="h-14 w-14 object-contain" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
                  Recovery
                </div>
                <div className="mt-1 text-xl font-black leading-tight text-slate-900">
                  Restore your energy fast
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 transition-[width] duration-300"
                    style={{ width: `${currentHealth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-emerald-100 bg-white/70 p-3">
              <button
                onClick={async () => {
                  if (isApplyingAd) {
                    return;
                  }

                  setIsApplyingAd(true);
                  try {
                    const rewarded = await onWatchAd();
                    if (!rewarded) {
                      return;
                    }
                    await onApplyAdBoost();
                  } finally {
                    setIsApplyingAd(false);
                  }
                }}
                disabled={isApplyingAd}
                className={`ml-auto flex items-center gap-2 rounded-[16px] px-3 py-2 text-left transition-all border shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
                  isApplyingAd
                    ? 'cursor-not-allowed border-emerald-300 bg-gradient-to-r from-lime-300 to-emerald-300 text-slate-700 opacity-75'
                    : 'border-emerald-400 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 active:scale-[0.99]'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.12em]">
                  Ad
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-black">
                  {isApplyingAd ? '...' : `+${HEALTH_AD_BOOST_PERCENT}%`}
                </span>
              </button>
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
                    <Icon className="h-9 w-9 text-emerald-600" strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-black leading-tight text-slate-900">
                          {action.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-black text-emerald-700">
                        <img src={LOCAL_ICON_ASSETS.healthy} alt="Health" className="h-4 w-4" />
                        +{action.healthIncreasePercent}%
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div
                        className={`rounded-full border px-3 py-1 text-[11px] font-black ${
                          !canAfford
                              ? 'border-rose-200 bg-rose-50 text-rose-600'
                            : isMaxed
                              ? 'border-slate-200 bg-slate-100 text-slate-500'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {!canAfford
                          ? 'Need Cash'
                          : isMaxed
                            ? 'Max Health'
                            : 'Ready'}
                      </div>

                      {isCoolingDown ? (
                        <div className="min-w-[120px] rounded-[16px] border border-sky-200 bg-sky-50 px-4 py-2.5 text-center text-sm font-black text-sky-700">
                          {formatCooldown(cooldownRemaining)}
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            if (isDisabled || !canAfford || isMaxed) {
                              return;
                            }

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
                              ? 'border-emerald-400 bg-gradient-to-r from-lime-300 to-emerald-300 text-slate-700 opacity-70'
                              : 'border-emerald-500 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 active:scale-[0.98]'
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

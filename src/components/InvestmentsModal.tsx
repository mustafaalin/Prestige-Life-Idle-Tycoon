import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  Car,
  ChevronDown,
  Home,
  Lock,
  Paintbrush,
  Package,
  Wifi,
  X,
} from 'lucide-react';
import type {
  BankDeposit,
  BankDepositPlanId,
  InvestmentUpgradeKey,
  InvestmentWithPlayerData,
} from '../types/game';
import {
  INVESTMENT_UPGRADE_LABELS,
  INVESTMENT_UPGRADE_ORDER,
  calculateInvestmentRentalIncome,
} from '../data/local/investments';
import { getInvestmentUpgradeCost } from '../services/investmentService';
import {
  BANK_DEPOSIT_PLANS,
  getBankDepositCountdownMs,
  getEffectiveBankDepositPlan,
  getBankDepositMaxAmount,
  isBankDepositReady,
} from '../data/local/bankDeposits';
import { LOCAL_ICON_ASSETS, resolveLocalAsset } from '../lib/localAssets';
import {
  getPremiumRealEstateIncomeMultiplier,
  PREMIUM_BANK_CARD_PRICE_GEMS,
  PREMIUM_BANK_CARD_PRICE_USD,
} from '../data/local/bankPremium';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;
const MIN_BANK_DEPOSIT = 1000;

function formatDurationLabel(ms: number) {
  if (ms >= 24 * 60 * 60 * 1000) {
    return '1 Day';
  }

  if (ms >= 60 * 1000) {
    return `${Math.round(ms / 60000)} Minute`;
  }

  return formatCountdown(ms);
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

const upgradeIcons: Record<InvestmentUpgradeKey, typeof Paintbrush> = {
  paint: Paintbrush,
  appliances: Package,
  furniture: Home,
  internet: Wifi,
  parking: Car,
};

interface InvestmentsModalProps {
  investments: InvestmentWithPlayerData[];
  bankDeposits: BankDeposit[];
  totalMoney: number;
  gems: number;
  cashbackPool: number;
  cashbackRate: number;
  hasPremiumBankCard: boolean;
  onPurchase: (investmentId: string) => Promise<boolean>;
  onUpgrade: (investmentId: string, upgradeKey: InvestmentUpgradeKey) => Promise<boolean>;
  onStartBankDeposit: (planId: BankDepositPlanId, amount: number) => Promise<boolean>;
  onClaimBankDeposit: (depositId: string) => Promise<boolean>;
  onClaimCashback: () => Promise<boolean>;
  onPurchasePremiumBankCard: (purchaseMethod: 'gems' | 'cash') => Promise<boolean>;
  onClose: () => void;
}

export function InvestmentsModal({
  investments,
  bankDeposits,
  totalMoney,
  gems,
  cashbackPool,
  cashbackRate,
  hasPremiumBankCard,
  onPurchase,
  onUpgrade,
  onStartBankDeposit,
  onClaimBankDeposit,
  onClaimCashback,
  onPurchasePremiumBankCard,
  onClose,
}: InvestmentsModalProps) {
  const [activeTab, setActiveTab] = useState<'real-estate' | 'bank' | 'stocks'>('real-estate');
  const [activeView, setActiveView] = useState<'menu' | 'market' | 'properties'>('menu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [confirmPurchaseId, setConfirmPurchaseId] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [bankPlanModalPlanId, setBankPlanModalPlanId] = useState<BankDepositPlanId | null>(null);
  const [bankAmountInput, setBankAmountInput] = useState<number>(MIN_BANK_DEPOSIT);
  const [timeNow, setTimeNow] = useState(Date.now());

  const selectedInvestment =
    investments.find((investment) => investment.id === selectedInvestmentId) || null;
  const confirmingInvestment =
    investments.find((investment) => investment.id === confirmPurchaseId) || null;

  const sortedInvestments = useMemo(() => {
    const next = [...investments];
    next.sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
    return next;
  }, [investments, sortOrder]);

  const ownedInvestments = sortedInvestments.filter((investment) => investment.is_owned);
  const marketInvestments = sortedInvestments.filter((investment) => !investment.is_owned);
  const listedInvestments = activeView === 'market' ? marketInvestments : ownedInvestments;
  const realEstateIncomeMultiplier = getPremiumRealEstateIncomeMultiplier({
    premium_bank_card_owned: hasPremiumBankCard,
  });
  const totalInvestmentIncome = ownedInvestments.reduce(
    (sum, investment) =>
      sum + Number(investment.current_rental_income || 0) * realEstateIncomeMultiplier,
    0
  );
  const marketPreview = marketInvestments[0] || sortedInvestments[0] || null;
  const propertiesPreview = ownedInvestments[0] || sortedInvestments[0] || null;
  const selectedBankPlan = bankPlanModalPlanId
    ? getEffectiveBankDepositPlan(bankPlanModalPlanId, hasPremiumBankCard)
    : null;
  const selectedBankPlanMaxAmount = bankPlanModalPlanId ? getBankDepositMaxAmount(totalMoney, bankPlanModalPlanId) : 0;
  const parsedBankAmount = Math.max(0, Math.floor(Number(bankAmountInput || 0)));
  const bankAmountValid =
    parsedBankAmount >= MIN_BANK_DEPOSIT &&
    parsedBankAmount <= selectedBankPlanMaxAmount &&
    parsedBankAmount <= totalMoney;
  const readyBankDeposits = bankDeposits.filter((deposit) => isBankDepositReady(deposit, timeNow));

  useEffect(() => {
    if (activeTab !== 'bank') return;

    const interval = window.setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeTab]);

  const handleConfirmPurchase = async () => {
    if (!confirmingInvestment) return;
    setProcessingKey(confirmingInvestment.id);
    try {
      const success = await onPurchase(confirmingInvestment.id);
      if (success) {
        setConfirmPurchaseId(null);
        setSelectedInvestmentId(confirmingInvestment.id);
        setActiveView('properties');
      }
    } finally {
      setProcessingKey(null);
    }
  };

  const openBankPlanModal = (planId: BankDepositPlanId) => {
    const maxAmount = getBankDepositMaxAmount(totalMoney, planId);
    setBankPlanModalPlanId(planId);
    setBankAmountInput(Math.max(MIN_BANK_DEPOSIT, Math.floor(maxAmount / 2)));
  };

  const handleStartBankDeposit = async () => {
    if (!bankPlanModalPlanId || !bankAmountValid) return;

    setProcessingKey(`bank-start:${bankPlanModalPlanId}`);
    try {
      const success = await onStartBankDeposit(bankPlanModalPlanId, parsedBankAmount);
      if (success) {
        setBankPlanModalPlanId(null);
      }
    } finally {
      setProcessingKey(null);
    }
  };

  const renderBankPlanCard = (planId: BankDepositPlanId) => {
    const plan = getEffectiveBankDepositPlan(planId, hasPremiumBankCard);
    const planDeposits = bankDeposits.filter((deposit) => deposit.plan_id === plan.id);
    const activeDeposit = planDeposits[0] || null;
    const activeDepositReady = activeDeposit ? isBankDepositReady(activeDeposit, timeNow) : false;
    const planImage =
      plan.id === 'quick'
        ? LOCAL_ICON_ASSETS.money
        : plan.id === 'growth'
          ? LOCAL_ICON_ASSETS.wallet
          : LOCAL_ICON_ASSETS.buyMoreMoney;

    return (
      <div
        key={plan.id}
        className="overflow-hidden rounded-[18px] border-2 border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
      >
        <div className="px-2 pt-2 text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">
            {formatDurationLabel(plan.durationMs)}
          </div>
        </div>

        <div className="flex flex-col items-center px-2 pb-2 pt-1">
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[14px] bg-slate-50">
            <img src={planImage} alt={plan.title} className="h-11 w-11 object-contain" />
          </div>

          <div className="mt-1 text-[20px] font-black leading-none text-amber-500">
            +{Math.round(plan.profitMultiplier * 100)}%
          </div>

          {!activeDeposit ? (
            <button
              onClick={() => openBankPlanModal(plan.id)}
              className="mt-1.5 w-full rounded-[13px] bg-lime-400 px-2 py-2 text-[10px] font-black text-slate-900 shadow-[inset_0_-3px_0_rgba(0,0,0,0.14)] transition-all active:scale-[0.98]"
            >
              INVEST
            </button>
          ) : (
            <div className="mt-1.5 w-full space-y-1.5">
              <div className="rounded-[13px] border border-slate-200 bg-white px-2 py-1.5 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-center gap-1 text-[11px] font-black text-slate-800">
                  <img src={LOCAL_ICON_ASSETS.money} alt="Money" className="h-4 w-4" />
                  {formatMoney(activeDeposit.principal)}
                </div>
              </div>

              <div
                className={`rounded-[13px] border px-1.5 py-1.5 shadow-[0_2px_6px_rgba(15,23,42,0.05)] ${
                  activeDepositReady
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-sky-200 bg-sky-50'
                }`}
              >
                {!activeDepositReady && (
                  <div className="mb-1.5 flex items-center justify-center gap-1 text-[11px] font-black text-sky-700">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatCountdown(getBankDepositCountdownMs(activeDeposit, timeNow))}</span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    setProcessingKey(`bank-claim:${activeDeposit.id}`);
                    try {
                      await onClaimBankDeposit(activeDeposit.id);
                    } finally {
                      setProcessingKey(null);
                    }
                  }}
                  disabled={!activeDepositReady || processingKey === `bank-claim:${activeDeposit.id}`}
                  className={`w-full rounded-[11px] px-2 py-1.5 text-[10px] font-black transition-all ${
                    activeDepositReady
                      ? 'bg-orange-500 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.16)]'
                      : 'hidden'
                  }`}
                >
                  {processingKey === `bank-claim:${activeDeposit.id}`
                    ? 'COLLECTING...'
                    : activeDepositReady
                      ? 'COLLECT'
                      : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleUpgrade = async (upgradeKey: InvestmentUpgradeKey) => {
    if (!selectedInvestment) return;
    setProcessingKey(`${selectedInvestment.id}:${upgradeKey}`);
    try {
      await onUpgrade(selectedInvestment.id, upgradeKey);
    } finally {
      setProcessingKey(null);
    }
  };

  const renderMarketCard = (investment: InvestmentWithPlayerData) => (
    <button
      key={investment.id}
      onClick={() => setSelectedInvestmentId(investment.id)}
      className="w-full text-left bg-white rounded-2xl border-2 border-emerald-100 shadow-md overflow-hidden transition-all hover:shadow-xl"
    >
      <div className="aspect-square bg-gradient-to-br from-emerald-50 to-cyan-50 p-3">
        <img
          src={resolveLocalAsset(investment.image_url, 'house')}
          alt={investment.region}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-xs font-black tracking-wide text-slate-400 uppercase">Location</p>
        <h3 className="text-sm font-extrabold text-slate-900">{investment.region}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-black text-emerald-700">{formatMoney(investment.price)}</span>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-500">
              {formatMoney(investment.base_rental_income * realEstateIncomeMultiplier)}/hr
            </span>
            {hasPremiumBankCard && (
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">
                Premium x2
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );

  const renderEntryCard = ({
    title,
    subtitle,
    imageUrl,
    fallbackLabel,
    onClick,
  }: {
    title: string;
    subtitle: string;
    imageUrl?: string | null;
    fallbackLabel: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full overflow-hidden rounded-[28px] border border-emerald-100 bg-white text-left shadow-md transition-all hover:shadow-xl"
    >
      <div className="aspect-square bg-gradient-to-br from-emerald-100 via-cyan-50 to-white p-4">
        <img
          src={resolveLocalAsset(imageUrl, 'house')}
          alt={fallbackLabel}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">{subtitle}</p>
        <h3 className="mt-1 text-lg font-black text-slate-900">{title}</h3>
      </div>
    </button>
  );

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{ top: '88px', bottom: '0', height: 'calc(100dvh - 88px)' }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-emerald-100">
        <div className="flex items-center justify-between p-4 border-b border-emerald-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Investments
            </h2>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">
              {ownedInvestments.length}/{investments.length} properties • {formatMoney(totalInvestmentIncome)}/hr
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-emerald-100/50 rounded-full transition-all active:scale-90">
            <X className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        <div className="flex gap-2 p-3 border-b border-emerald-100 bg-white">
          <button
            onClick={() => setActiveTab('real-estate')}
            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'real-estate'
                ? 'flex-[2] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                : 'flex-1 bg-emerald-50 text-emerald-700'
            }`}
          >
            Real Estate
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`relative py-2 px-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'bank'
                ? 'flex-[2] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                : 'flex-1 bg-emerald-50 text-emerald-700'
            }`}
          >
            {readyBankDeposits.length > 0 && (
              <div className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-black leading-none text-white shadow-[0_0_14px_rgba(239,68,68,0.65)]">
                !
              </div>
            )}
            Bank
          </button>
          <button
            disabled
            aria-label="Stocks locked"
            className={`rounded-lg transition-all flex items-center justify-center ${
              activeTab === 'stocks'
                ? 'flex-[2] bg-slate-200 text-slate-500'
                : 'flex-1 bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'real-estate' && activeView === 'menu' && (
          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="flex flex-col gap-4">
              {renderEntryCard({
                title: 'Real Estate Market',
                subtitle: 'Browse And Buy',
                imageUrl: marketPreview?.image_url,
                fallbackLabel: 'Real Estate Market',
                onClick: () => setActiveView('market'),
              })}
              {renderEntryCard({
                title: 'My Properties',
                subtitle: `${ownedInvestments.length} Owned Properties`,
                imageUrl: propertiesPreview?.image_url,
                fallbackLabel: 'My Properties',
                onClick: () => setActiveView('properties'),
              })}
            </div>
          </div>
        )}

        {activeTab === 'real-estate' && activeView !== 'menu' && (
          <>
            <div className="flex items-center justify-between p-3 border-b border-emerald-100 bg-white">
              <button
                onClick={() => setActiveView('menu')}
                className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="text-right">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  {activeView === 'market' ? 'Real Estate Market' : 'My Properties'}
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {activeView === 'market' ? 'Browse all properties' : 'Your owned properties'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-b border-emerald-100 bg-white">
              <div className="text-xs font-bold text-slate-500">
                {activeView === 'market'
                  ? `${marketInvestments.length} available listings`
                  : `${ownedInvestments.length} owned properties`}
              </div>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Price {sortOrder === 'asc' ? 'Low-High' : 'High-Low'}
                <ChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-white">
              <div className="grid grid-cols-1 gap-3">
                {listedInvestments.map(renderMarketCard)}
                {activeView === 'properties' && listedInvestments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 font-semibold">
                    No properties purchased yet.
                  </div>
                )}
                {activeView === 'market' && listedInvestments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 font-semibold">
                    All listed properties are already in your portfolio.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bank' && (
          <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_38%),linear-gradient(180deg,#f8fffc_0%,#f8fafc_100%)] p-4">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[28px] border border-amber-200 bg-[linear-gradient(145deg,#fff4cc_0%,#ffd972_48%,#fff7de_100%)] shadow-[0_14px_34px_rgba(245,158,11,0.18)]">
                <div className="border-b border-amber-200/70 bg-white/35 px-4 py-3">
                  <div className="text-sm font-black uppercase tracking-[0.14em] text-amber-900">
                    Premium Bank Card
                  </div>
                  <div className="mt-1 text-xs font-bold text-amber-800/80">
                    Permanent bank boost
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="space-y-2 rounded-[20px] border border-white/60 bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <div className="text-sm font-black text-slate-800">x2 Cashback</div>
                    <div className="text-sm font-black text-slate-800">x2 Real Estate Income</div>
                    <div className="text-sm font-black text-slate-800">x2 Deposit Income</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  <button
                    onClick={async () => {
                      setProcessingKey('premium-bank-card:cash');
                      try {
                        await onPurchasePremiumBankCard('cash');
                      } finally {
                        setProcessingKey(null);
                      }
                    }}
                    disabled={
                      hasPremiumBankCard ||
                      processingKey === 'premium-bank-card:cash' ||
                      processingKey === 'premium-bank-card:gems'
                    }
                    className={`rounded-[16px] px-4 py-3 text-sm font-black transition-all ${
                      hasPremiumBankCard
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-blue-500 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.16)] active:scale-[0.99]'
                    }`}
                  >
                    {hasPremiumBankCard
                      ? 'OWNED'
                      : processingKey === 'premium-bank-card:cash'
                        ? 'BUYING...'
                        : `$${PREMIUM_BANK_CARD_PRICE_USD.toFixed(2)}`}
                  </button>

                  <button
                    onClick={async () => {
                      setProcessingKey('premium-bank-card:gems');
                      try {
                        await onPurchasePremiumBankCard('gems');
                      } finally {
                        setProcessingKey(null);
                      }
                    }}
                    disabled={
                      hasPremiumBankCard ||
                      gems < PREMIUM_BANK_CARD_PRICE_GEMS ||
                      processingKey === 'premium-bank-card:gems' ||
                      processingKey === 'premium-bank-card:cash'
                    }
                    className={`rounded-[16px] px-4 py-3 text-sm font-black transition-all ${
                      hasPremiumBankCard
                        ? 'bg-emerald-100 text-emerald-700'
                        : gems >= PREMIUM_BANK_CARD_PRICE_GEMS
                          ? 'bg-violet-500 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.16)] active:scale-[0.99]'
                          : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {hasPremiumBankCard
                      ? 'OWNED'
                      : processingKey === 'premium-bank-card:gems'
                        ? 'BUYING...'
                        : `${PREMIUM_BANK_CARD_PRICE_GEMS} GEMS`}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#effdf5_100%)] shadow-[0_10px_24px_rgba(16,185,129,0.1)]">
                <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/80 p-4">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.14em] text-emerald-900">
                      Cashback
                    </div>
                    <div className="mt-1 text-xs font-semibold text-emerald-700/80">
                      Rate {Math.round(cashbackRate * 100)}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700/70">
                      Available
                    </div>
                    <div className="mt-1 text-xl font-black text-emerald-600">
                      {formatMoney(cashbackPool)}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3">
                  <button
                    onClick={async () => {
                      setProcessingKey('cashback-claim');
                      try {
                        await onClaimCashback();
                      } finally {
                        setProcessingKey(null);
                      }
                    }}
                    disabled={cashbackPool <= 0 || processingKey === 'cashback-claim'}
                    className={`w-full rounded-[16px] px-4 py-3 text-sm font-black transition-all ${
                      cashbackPool > 0 && processingKey !== 'cashback-claim'
                        ? 'bg-orange-500 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.16)] active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {processingKey === 'cashback-claim' ? 'CLAIMING...' : 'CLAIM CASHBACK'}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[26px] border border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef7ff_100%)] shadow-[0_12px_28px_rgba(59,130,246,0.1)]">
                <div className="border-b border-sky-100 bg-sky-50/80 px-3 py-2.5">
                  <div className="text-sm font-black uppercase tracking-[0.14em] text-sky-900">
                    Deposits
                  </div>
                  <div className="mt-1 text-xs font-semibold text-sky-700/80">
                    Choose a plan and lock your money for profit
                  </div>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {BANK_DEPOSIT_PLANS.map((plan) => renderBankPlanCard(plan.id))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedInvestment && (
        <div className="fixed inset-0 z-[90] bg-black/80 p-4 pointer-events-auto">
          <div className="mx-auto h-full max-w-md bg-white rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100">
              <button
                onClick={() => setSelectedInvestmentId(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Location</p>
                <h3 className="text-sm font-extrabold text-slate-900">{selectedInvestment.region}</h3>
              </div>
            </div>

            <div className="aspect-square bg-slate-100 p-4">
              <img
                src={resolveLocalAsset(selectedInvestment.image_url, 'house')}
                alt={selectedInvestment.region}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Price</div>
                  <div className="text-sm font-black text-emerald-700">{formatMoney(selectedInvestment.price)}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Hourly Rent</div>
                  <div className="text-sm font-black text-blue-700">
                    {formatMoney(
                      Number(
                        selectedInvestment.current_rental_income || selectedInvestment.base_rental_income
                      ) * realEstateIncomeMultiplier
                    )}
                  </div>
                  {hasPremiumBankCard && (
                    <div className="mt-1 text-[11px] font-bold text-blue-500">
                      Base {formatMoney(
                        Number(
                          selectedInvestment.current_rental_income || selectedInvestment.base_rental_income
                        )
                      )} x2 Premium
                    </div>
                  )}
                </div>
              </div>

              {selectedInvestment.is_owned ? (
                <>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Applied Upgrades</div>
                    <div className="flex flex-wrap gap-2">
                      {INVESTMENT_UPGRADE_ORDER.map((upgradeKey) => {
                        const Icon = upgradeIcons[upgradeKey];
                        const isApplied = selectedInvestment.upgrades_applied?.includes(upgradeKey);
                        return (
                          <div
                            key={upgradeKey}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${
                              isApplied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {INVESTMENT_UPGRADE_LABELS[upgradeKey]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Available Upgrades</div>
                    {INVESTMENT_UPGRADE_ORDER.map((upgradeKey, index) => {
                      const Icon = upgradeIcons[upgradeKey];
                      const appliedUpgrades = selectedInvestment.upgrades_applied || [];
                      const isApplied = appliedUpgrades.includes(upgradeKey);
                      const isNextUpgrade = index === appliedUpgrades.length;
                      const cost = getInvestmentUpgradeCost(selectedInvestment.price, index);
                      const nextIncome = calculateInvestmentRentalIncome(
                        selectedInvestment.base_rental_income,
                        [...appliedUpgrades, upgradeKey]
                      ) * realEstateIncomeMultiplier;
                      const currentIncome =
                        Number(
                          selectedInvestment.current_rental_income ||
                            selectedInvestment.base_rental_income
                        ) * realEstateIncomeMultiplier;
                      const incomeGain = Math.max(0, nextIncome - currentIncome);
                      const isProcessing =
                        processingKey === `${selectedInvestment.id}:${upgradeKey}`;
                      const isDisabled =
                        isApplied ||
                        !isNextUpgrade ||
                        totalMoney < cost ||
                        isProcessing;
                      const statusLabel = isApplied
                        ? 'Done'
                        : !isNextUpgrade
                          ? 'Locked'
                          : isProcessing
                            ? 'Upgrading...'
                            : totalMoney < cost
                              ? 'Need Cash'
                              : 'Upgrade';
                      return (
                        <button
                          key={upgradeKey}
                          disabled={isDisabled}
                          onClick={() => handleUpgrade(upgradeKey)}
                          className={`w-full rounded-[22px] border p-3 text-left transition-all ${
                            isApplied
                              ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : !isNextUpgrade
                                ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : totalMoney < cost
                                ? 'bg-white border-amber-200 text-slate-500'
                                : 'bg-[linear-gradient(180deg,#ffffff_0%,#effcf6_100%)] border-emerald-300 shadow-[0_10px_24px_rgba(16,185,129,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(16,185,129,0.12)] active:scale-[0.995]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                  isApplied
                                    ? 'bg-slate-200'
                                    : !isNextUpgrade
                                      ? 'bg-slate-100'
                                      : totalMoney < cost
                                        ? 'bg-amber-50'
                                        : 'bg-emerald-50'
                                }`}
                              >
                                <Icon
                                  className={`h-5 w-5 ${
                                    isApplied
                                      ? 'text-slate-400'
                                      : !isNextUpgrade
                                        ? 'text-slate-400'
                                        : totalMoney < cost
                                          ? 'text-amber-600'
                                          : 'text-emerald-700'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={`text-sm font-extrabold ${
                                    isApplied || !isNextUpgrade
                                      ? 'text-slate-500'
                                      : totalMoney < cost
                                        ? 'text-slate-800'
                                        : 'text-slate-900'
                                  }`}
                                >
                                  {INVESTMENT_UPGRADE_LABELS[upgradeKey]}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-black ${
                                      isApplied || !isNextUpgrade
                                        ? 'bg-slate-200 text-slate-500'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    +{formatMoney(incomeGain)}/hr
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-black ${
                                      isApplied || !isNextUpgrade
                                        ? 'bg-slate-200 text-slate-500'
                                        : totalMoney < cost
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {formatMoney(cost)}
                                  </span>
                                </div>
                                {hasPremiumBankCard && (
                                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">
                                    Base {formatMoney(Math.floor(nextIncome / realEstateIncomeMultiplier))} x2 Premium
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                isApplied
                                  ? 'bg-slate-200 text-slate-500'
                                  : !isNextUpgrade
                                    ? 'bg-slate-200 text-slate-500'
                                    : totalMoney < cost
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-500 text-white'
                              }`}
                            >
                              {statusLabel}
                            </div>
                          </div>

                          <div
                            className={`mt-3 flex items-center justify-between rounded-2xl border px-3 py-2 ${
                              isApplied
                                ? 'border-slate-200 bg-white/70'
                                : !isNextUpgrade
                                  ? 'border-slate-200 bg-white/70'
                                  : totalMoney < cost
                                    ? 'border-amber-200 bg-amber-50'
                                    : 'border-emerald-200 bg-white'
                            }`}
                          >
                            <div className="text-[10px] font-black uppercase tracking-[0.12em]">
                              {isApplied
                                ? 'Completed'
                                : !isNextUpgrade
                                  ? 'Finish previous upgrade first'
                                  : totalMoney < cost
                                    ? 'Not enough cash'
                                    : 'Tap to upgrade'}
                            </div>
                            <div
                              className={`text-xs font-black ${
                                isApplied || !isNextUpgrade
                                  ? 'text-slate-400'
                                  : totalMoney < cost
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                              }`}
                            >
                              {isApplied ? formatMoney(nextIncome) : `${formatMoney(nextIncome)}/hr`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setConfirmPurchaseId(selectedInvestment.id)}
                  className="w-full rounded-2xl py-3 px-4 font-black text-white bg-gradient-to-r from-emerald-500 to-cyan-500"
                >
                  Buy Property
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmingInvestment && (
        <div className="fixed inset-0 z-[95] bg-black/85 p-4 pointer-events-auto">
          <div className="mx-auto max-w-sm bg-white rounded-3xl overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100">
              <button
                onClick={() => setConfirmPurchaseId(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Purchase Summary</div>
                <div className="text-sm font-extrabold text-slate-900">{confirmingInvestment.region}</div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square p-4">
                <img
                  src={resolveLocalAsset(confirmingInvestment.image_url, 'house')}
                  alt={confirmingInvestment.region}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Location</span>
                  <span className="text-slate-900 font-bold">{confirmingInvestment.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Price</span>
                  <span className="text-emerald-700 font-black">{formatMoney(confirmingInvestment.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Hourly Rent</span>
                  <span className="text-blue-700 font-black">
                    {formatMoney(confirmingInvestment.base_rental_income * realEstateIncomeMultiplier)}
                  </span>
                </div>
                {hasPremiumBankCard && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Premium Effect</span>
                    <span className="text-amber-600 font-black">
                      {formatMoney(confirmingInvestment.base_rental_income)} x2
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirmPurchase}
                disabled={totalMoney < confirmingInvestment.price || processingKey === confirmingInvestment.id}
                className={`w-full rounded-2xl py-3 px-4 font-black ${
                  totalMoney >= confirmingInvestment.price
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {processingKey === confirmingInvestment.id ? 'Buying...' : 'Buy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBankPlan && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm overflow-hidden rounded-[28px] border-2 border-sky-300 bg-[#eef5ff] shadow-[0_30px_90px_rgba(15,23,42,0.4)]">
            <div className="bg-[#74aee0] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="mt-1 text-2xl font-black">{formatDurationLabel(selectedBankPlan.durationMs)}</h3>
                </div>
                <button
                  onClick={() => setBankPlanModalPlanId(null)}
                  className="rounded-full bg-white/15 p-2 transition-colors hover:bg-white/25"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <div className="flex h-[110px] w-[110px] items-center justify-center rounded-[22px] bg-white shadow-sm">
                  <img
                    src={
                      selectedBankPlan.id === 'quick'
                        ? LOCAL_ICON_ASSETS.money
                        : selectedBankPlan.id === 'growth'
                          ? LOCAL_ICON_ASSETS.wallet
                          : LOCAL_ICON_ASSETS.buyMoreMoney
                    }
                    alt={selectedBankPlan.title}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-800">Choose the deposit amount.</p>
                  <p className="mt-1 text-xl font-black text-slate-800">
                    Retrieve it in {formatDurationLabel(selectedBankPlan.durationMs)} with profit
                  </p>
                  <div className="mt-3 text-5xl font-black text-amber-500">
                    +{Math.round(selectedBankPlan.profitMultiplier * 100)}%
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-transparent p-1">
                <div className="text-right text-2xl font-black text-slate-700">{formatMoney(parsedBankAmount)}</div>

                <input
                  type="range"
                  min={Math.min(MIN_BANK_DEPOSIT, selectedBankPlanMaxAmount)}
                  max={Math.max(MIN_BANK_DEPOSIT, selectedBankPlanMaxAmount)}
                  step={500}
                  value={Math.min(parsedBankAmount, Math.max(MIN_BANK_DEPOSIT, selectedBankPlanMaxAmount))}
                  onChange={(event) => setBankAmountInput(Number(event.target.value))}
                  className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-lime-600/80"
                />

                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{formatMoney(Math.min(MIN_BANK_DEPOSIT, selectedBankPlanMaxAmount))}</span>
                  <span>{formatMoney(selectedBankPlanMaxAmount)}</span>
                </div>
              </div>

              <div className="rounded-[24px] bg-emerald-50 p-4">
                <div className="text-center text-lg font-black text-slate-700">Your profit:</div>
                <div className="mt-1 text-center text-4xl font-black text-emerald-500">
                  {bankAmountValid
                    ? formatMoney(Math.floor(parsedBankAmount * selectedBankPlan.profitMultiplier))
                    : '$0'}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {selectedBankPlan.adRequired
                    ? 'Rewarded ad is required to start this premium deposit.'
                    : 'Your money will stay locked until the timer ends.'}
                </p>
              </div>

              <button
                onClick={handleStartBankDeposit}
                disabled={
                  !bankAmountValid ||
                  processingKey === `bank-start:${selectedBankPlan.id}` ||
                  selectedBankPlanMaxAmount < MIN_BANK_DEPOSIT ||
                  bankDeposits.some((deposit) => deposit.plan_id === selectedBankPlan.id)
                }
                className={`w-full rounded-2xl px-4 py-4 text-sm font-black transition-all ${
                  bankAmountValid &&
                  selectedBankPlanMaxAmount >= MIN_BANK_DEPOSIT &&
                  !bankDeposits.some((deposit) => deposit.plan_id === selectedBankPlan.id)
                    ? 'bg-lime-400 text-slate-900 shadow-[inset_0_-3px_0_rgba(0,0,0,0.14)]'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {processingKey === `bank-start:${selectedBankPlan.id}`
                  ? selectedBankPlan.adRequired
                    ? 'Starting With Ad...'
                    : 'Starting Deposit...'
                  : bankDeposits.some((deposit) => deposit.plan_id === selectedBankPlan.id)
                    ? 'Plan Already Active'
                    : 'INVEST'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

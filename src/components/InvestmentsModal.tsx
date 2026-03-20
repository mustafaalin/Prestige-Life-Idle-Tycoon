import { useMemo, useState } from 'react';
import { ArrowLeft, Car, ChevronDown, Home, Lock, Paintbrush, Package, Wifi, X } from 'lucide-react';
import type { InvestmentUpgradeKey, InvestmentWithPlayerData } from '../types/game';
import {
  INVESTMENT_UPGRADE_LABELS,
  INVESTMENT_UPGRADE_ORDER,
  calculateInvestmentRentalIncome,
} from '../data/local/investments';
import { resolveLocalAsset } from '../lib/localAssets';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

const upgradeIcons: Record<InvestmentUpgradeKey, typeof Paintbrush> = {
  paint: Paintbrush,
  appliances: Package,
  furniture: Home,
  internet: Wifi,
  parking: Car,
};

interface InvestmentsModalProps {
  investments: InvestmentWithPlayerData[];
  totalMoney: number;
  onPurchase: (investmentId: string) => Promise<boolean>;
  onUpgrade: (investmentId: string, upgradeKey: InvestmentUpgradeKey) => Promise<boolean>;
  onClose: () => void;
}

export function InvestmentsModal({
  investments,
  totalMoney,
  onPurchase,
  onUpgrade,
  onClose,
}: InvestmentsModalProps) {
  const [activeTab, setActiveTab] = useState<'real-estate' | 'crypto' | 'stocks'>('real-estate');
  const [activeView, setActiveView] = useState<'menu' | 'market' | 'properties'>('menu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [confirmPurchaseId, setConfirmPurchaseId] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

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
  const totalInvestmentIncome = ownedInvestments.reduce(
    (sum, investment) => sum + Number(investment.current_rental_income || 0),
    0
  );
  const marketPreview = marketInvestments[0] || sortedInvestments[0] || null;
  const propertiesPreview = ownedInvestments[0] || sortedInvestments[0] || null;

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
          <span className="text-[11px] font-bold text-slate-500">
            {formatMoney(investment.base_rental_income)}/hr
          </span>
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
            disabled
            aria-label="Crypto locked"
            className={`rounded-lg transition-all flex items-center justify-center ${
              activeTab === 'crypto'
                ? 'flex-[2] bg-slate-200 text-slate-500'
                : 'flex-1 bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
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
                    {formatMoney(selectedInvestment.current_rental_income || selectedInvestment.base_rental_income)}
                  </div>
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
                      const cost = Math.floor(
                        selectedInvestment.price / [10, 4, 3, 2, 1][index]
                      );
                      const nextIncome = calculateInvestmentRentalIncome(
                        selectedInvestment.base_rental_income,
                        [...appliedUpgrades, upgradeKey]
                      );
                      const isDisabled =
                        isApplied ||
                        !isNextUpgrade ||
                        totalMoney < cost ||
                        processingKey === `${selectedInvestment.id}:${upgradeKey}`;
                      return (
                        <button
                          key={upgradeKey}
                          disabled={isDisabled}
                          onClick={() => handleUpgrade(upgradeKey)}
                          className={`w-full rounded-2xl border p-3 text-left ${
                            isApplied
                              ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : !isNextUpgrade
                                ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : 'bg-white border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-emerald-700" />
                              </div>
                              <div>
                                <div className="text-sm font-extrabold text-slate-900">{INVESTMENT_UPGRADE_LABELS[upgradeKey]}</div>
                                <div className="text-[11px] font-semibold text-slate-500">
                                  New rent: {formatMoney(nextIncome)}/hr
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-emerald-700">{formatMoney(cost)}</div>
                              <div className="text-[10px] font-bold text-slate-400">
                                {isApplied ? 'Done' : !isNextUpgrade ? 'Locked' : 'Upgrade'}
                              </div>
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
                  <span className="text-blue-700 font-black">{formatMoney(confirmingInvestment.base_rental_income)}</span>
                </div>
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
    </div>
  );
}

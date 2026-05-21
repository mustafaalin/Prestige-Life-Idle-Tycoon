import { X } from 'lucide-react';
import { formatMoneyFull } from '../utils/money';

interface BoostInfo {
  active: boolean;
  multiplier: number;
  remainingLabel: string;
}

interface IncomeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobIncome: number;
  businessIncome: number;
  investmentIncome: number;
  houseRentExpense: number;
  vehicleExpense: number;
  otherExpenses: number;
  grossIncome: number;
  totalExpenses: number;
  netIncome: number;
  businessBoostActive?: boolean;
  investmentBoostActive?: boolean;
  totalBoost?: BoostInfo;
}

const n = (v: number | null | undefined) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export function IncomeBreakdownModal({
  isOpen,
  onClose,
  jobIncome,
  businessIncome,
  investmentIncome,
  houseRentExpense,
  vehicleExpense,
  otherExpenses,
  grossIncome,
  totalExpenses,
  netIncome,
  businessBoostActive = false,
  investmentBoostActive = false,
  totalBoost,
}: IncomeBreakdownModalProps) {
  if (!isOpen) return null;

  const totalBoostActive = totalBoost?.active && (totalBoost.multiplier ?? 1) > 1;
  const boostMultiplier  = totalBoost?.multiplier ?? 1;
  const baseNet          = totalBoostActive ? Math.round(n(netIncome) / boostMultiplier) : n(netIncome);
  const boostedNet       = n(netIncome);

  const incomes = [
    { label: 'Job Income',        value: n(jobIncome),        boosted: false },
    { label: 'Business Income',   value: n(businessIncome),   boosted: businessBoostActive },
    { label: 'Investment Income', value: n(investmentIncome), boosted: investmentBoostActive },
  ];

  const expenses = [
    { label: 'House Rent',      value: n(houseRentExpense) },
    { label: 'Vehicle Expense', value: n(vehicleExpense) },
    { label: 'Other Expenses',  value: n(otherExpenses) },
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] flex items-start justify-center p-4 pt-28">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Income Breakdown</h3>
            <p className="text-[11px] font-semibold text-slate-500">
              How your hourly income is calculated
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-600 active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">

          {/* Income rows */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Income</div>
            <div className="space-y-1.5">
              {incomes.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-bold text-slate-700">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    {row.boosted && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-white leading-none">⚡2×</span>
                    )}
                    <span className="text-sm font-black text-emerald-700">+{formatMoneyFull(row.value)}/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense rows */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Expenses</div>
            <div className="space-y-1.5">
              {expenses.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-2xl bg-rose-50 px-3 py-2">
                  <span className="text-sm font-bold text-slate-700">{row.label}</span>
                  <span className="text-sm font-black text-rose-700">-{formatMoneyFull(row.value)}/h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Gross Income</span>
              <span className="text-sm font-black text-emerald-700">+{formatMoneyFull(n(grossIncome))}/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Total Expenses</span>
              <span className="text-sm font-black text-rose-700">-{formatMoneyFull(n(totalExpenses))}/h</span>
            </div>
            <div className="h-px bg-slate-200" />
            {totalBoostActive ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Base Net</span>
                  <span className="text-sm font-black text-slate-600">
                    {baseNet < 0 ? '-' : '+'}{formatMoneyFull(Math.abs(baseNet))}/h
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">Net Hourly Income</span>
                <span className={`text-base font-black ${boostedNet < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {boostedNet < 0 ? '-' : '+'}{formatMoneyFull(Math.abs(boostedNet))}/h
                </span>
              </div>
            )}
          </div>

          {/* Total boost banner — only when active */}
          {totalBoostActive && (
            <div className="overflow-hidden rounded-2xl border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
                 style={{ background: 'linear-gradient(135deg,#92400e 0%,#b45309 40%,#f59e0b 100%)' }}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-amber-100">
                        {boostMultiplier}× Income Boost Active
                      </div>
                      {totalBoost?.remainingLabel && (
                        <div className="text-[10px] font-bold text-amber-200/80 mt-0.5">
                          {totalBoost.remainingLabel} remaining
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-white/20 px-2 py-1">
                    <span className="text-[10px] font-black text-white tracking-wider">BUFF</span>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-black text-amber-100">Boosted Net Income</span>
                <span className={`text-lg font-black ${boostedNet < 0 ? 'text-rose-300' : 'text-white'}`}>
                  {boostedNet < 0 ? '-' : '+'}{formatMoneyFull(Math.abs(boostedNet))}/h
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { formatMoneyFull } from '../utils/money';

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
}

const normalizeAmount = (amount: number | null | undefined) => {
  const normalized = Number(amount);
  return Number.isFinite(normalized) ? normalized : 0;
};

const rows = (
  jobIncome: number,
  businessIncome: number,
  investmentIncome: number,
  houseRentExpense: number,
  vehicleExpense: number,
  otherExpenses: number
) => ({
  incomes: [
    { label: 'Job Income', value: normalizeAmount(jobIncome) },
    { label: 'Business Income', value: normalizeAmount(businessIncome) },
    { label: 'Investment Income', value: normalizeAmount(investmentIncome) },
  ],
  expenses: [
    { label: 'House Rent', value: normalizeAmount(houseRentExpense) },
    { label: 'Vehicle Expense', value: normalizeAmount(vehicleExpense) },
    { label: 'Other Expenses', value: normalizeAmount(otherExpenses) },
  ],
});

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
}: IncomeBreakdownModalProps) {
  if (!isOpen) return null;

  const { incomes, expenses } = rows(
    jobIncome,
    businessIncome,
    investmentIncome,
    houseRentExpense,
    vehicleExpense,
    otherExpenses
  );

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] flex items-start justify-center p-4 pt-28">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Income Breakdown</h3>
            <p className="text-[11px] font-semibold text-slate-500">
              See how your hourly income is calculated
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-600 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wide text-emerald-600 mb-2">
              Income
            </div>
            <div className="space-y-2">
              {incomes.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2"
                >
                  <span className="text-sm font-bold text-slate-700">{row.label}</span>
                  <span className="text-sm font-black text-emerald-700">
                    +{formatMoneyFull(row.value)}/h
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-wide text-red-600 mb-2">
              Expenses
            </div>
            <div className="space-y-2">
              {expenses.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-2xl bg-red-50 px-3 py-2"
                >
                  <span className="text-sm font-bold text-slate-700">{row.label}</span>
                  <span className="text-sm font-black text-red-700">
                    -{formatMoneyFull(row.value)}/h
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">Gross Income</span>
              <span className="text-sm font-black text-emerald-700">
                +{formatMoneyFull(grossIncome)}/h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">Total Expenses</span>
              <span className="text-sm font-black text-red-700">
                -{formatMoneyFull(totalExpenses)}/h
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">Net Hourly Income</span>
              <span
                className={`text-base font-black ${
                  normalizeAmount(netIncome) < 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {normalizeAmount(netIncome) < 0 ? '-' : '+'}
                {formatMoneyFull(Math.abs(normalizeAmount(netIncome)))}/h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

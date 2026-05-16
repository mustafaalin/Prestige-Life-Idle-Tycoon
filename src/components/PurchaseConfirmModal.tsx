import { X, ShoppingBag } from 'lucide-react';
import { formatMoneyFull } from '../utils/money';

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageInfo: {
    type: 'money' | 'gem';
    amount: number;
    price: number;
  } | null;
  isProcessing: boolean;
}

export function PurchaseConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  packageInfo,
  isProcessing,
}: PurchaseConfirmModalProps) {
  if (!isOpen || !packageInfo) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 pointer-events-auto">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-800">Confirm Purchase</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Package</span>
            <span className="text-lg font-black text-slate-800">
              {packageInfo.type === 'money'
                ? formatMoneyFull(packageInfo.amount)
                : `${packageInfo.amount} Gems`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">Price</span>
            <span className="text-lg font-black text-green-600">
              ${packageInfo.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

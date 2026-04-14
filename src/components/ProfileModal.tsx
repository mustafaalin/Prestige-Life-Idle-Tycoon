import { useState, useEffect } from 'react';
import { X, Pencil, Check, Clock, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResetProgressModal } from './ResetProgressModal';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import { formatMoneyFull } from '../utils/money';

const toSafeNumber = (value: number | null | undefined) => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};

const formatTime = (totalSeconds: number | null | undefined) => {
  const safeSeconds = Math.max(0, toSafeNumber(totalSeconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `<1m`;
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onPlayerNameChange: (newName: string) => Promise<void>;
  totalMoney: number;
  lifetimeEarnings: number;
  sessionStartTime: number;
  onResetProgress: () => Promise<void>;
  prestigePoints: number;
  selectedOutfitImage?: string | null;
  gems?: number;
  iapGems?: number;
  iapMoney?: number;
}

export default function ProfileModal({
  isOpen,
  onClose,
  playerName,
  onPlayerNameChange,
  totalMoney,
  lifetimeEarnings,
  sessionStartTime,
  onResetProgress,
  prestigePoints,
  selectedOutfitImage,
  gems = 0,
  iapGems = 0,
  iapMoney = 0,
}: ProfileModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [sessionPlayTime, setSessionPlayTime] = useState(0);

  useEffect(() => {
    setEditName(playerName);
  }, [playerName]);

  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      setSessionPlayTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen, sessionStartTime]);

  if (!isOpen) return null;

  const handleSaveName = async () => {
    if (editName.trim() === '' || editName === playerName) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    await onPlayerNameChange(editName);
    setIsSaving(false);
    setIsEditingName(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    await onResetProgress();
    setIsResetting(false);
    setShowResetConfirm(false);
    onClose();
  };

  const stats = [
    {
      icon: <img src={LOCAL_ICON_ASSETS.wallet} alt="" className="h-5 w-5 object-contain" />,
      label: 'Net Worth',
      value: formatMoneyFull(toSafeNumber(totalMoney)),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      label: 'Lifetime Earned',
      value: formatMoneyFull(toSafeNumber(lifetimeEarnings)),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: <img src={LOCAL_ICON_ASSETS.prestige} alt="" className="h-5 w-5 object-contain" />,
      label: 'Prestige',
      value: toSafeNumber(prestigePoints).toLocaleString(),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      label: 'Session',
      value: formatTime(sessionPlayTime),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 px-5 pb-5 pt-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Character + name row */}
          <div className="flex items-center gap-4">
            {/* Portrait card */}
            <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-3xl bg-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              {selectedOutfitImage ? (
                <img
                  src={selectedOutfitImage}
                  alt="character"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Wallet className="h-10 w-10 text-white/60" />
                </div>
              )}
            </div>

            {/* Name + label */}
            <div className="flex flex-1 flex-col gap-1.5 pb-1 pr-8">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Player</p>

              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl bg-white/20 px-3 py-1.5 text-white placeholder-white/50 outline-none ring-1 ring-white/30 focus:ring-white/60 font-bold text-base w-36"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="rounded-full bg-white/20 p-1.5 text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black leading-tight text-white">{playerName}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="rounded-full bg-white/20 p-1.5 text-white transition-all active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl ${stat.bg} p-3`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {stat.icon}
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{stat.label}</span>
                </div>
                <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-black text-red-500 transition-all active:scale-[0.98]"
          >
            <AlertTriangle className="h-4 w-4" />
            Reset Game Progress
          </button>
        </div>
      </div>

      <ResetProgressModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        isResetting={isResetting}
        currentGems={gems}
        iapGems={iapGems}
        iapMoney={iapMoney}
      />
    </div>
  );
}

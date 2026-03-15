import { useState, useEffect } from 'react';
import { X, User, Trophy, MousePointerClick, Clock, Save, LogOut } from 'lucide-react';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onPlayerNameChange: (newName: string) => Promise<void>;
  totalMoney: number;
  lifetimeEarnings: number;
  totalClicks: number;
  sessionStartTime: number; 
  onResetProgress: () => void;
  prestigePoints: number;
}

export default function ProfileModal({
  isOpen,
  onClose,
  playerName,
  onPlayerNameChange,
  totalMoney,
  lifetimeEarnings,
  totalClicks,
  sessionStartTime,
  onResetProgress,
  prestigePoints,
}: ProfileModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
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

  const handleReset = () => {
    onResetProgress();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-inner">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white mb-1">Player Profile</h2>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-black/20 text-white px-3 py-1.5 rounded-xl border border-white/20 outline-none focus:border-white/40 w-full font-medium"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white/90 font-medium text-lg">{playerName}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-white/50 hover:text-white/90 text-sm underline decoration-white/30 underline-offset-4"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-sm">Net Worth</span>
              </div>
              <p className="text-xl font-black text-white">{formatMoney(totalMoney)}</p>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-sm">Lifetime Earned</span>
              </div>
              <p className="text-xl font-black text-white">{formatMoney(lifetimeEarnings)}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <MousePointerClick className="w-5 h-5" />
                <span className="font-bold text-sm">Total Clicks</span>
              </div>
              <p className="text-xl font-black text-white">{totalClicks.toLocaleString()}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-sm">Session Time</span>
              </div>
              <p className="text-xl font-black text-white">{formatTime(sessionPlayTime)}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 col-span-2">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-sm">Prestige Points</span>
              </div>
              <p className="text-xl font-black text-white">{prestigePoints}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-red-500/20">
            <h3 className="text-red-400 font-bold mb-4 uppercase text-sm tracking-wider">Danger Zone</h3>
            
            {showResetConfirm ? (
              <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <p className="text-white text-sm mb-4">
                  Are you absolutely sure? This will delete all your money, items, and progress. This action cannot be undone!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3.5 rounded-xl transition-colors border border-red-500/20"
              >
                <LogOut className="w-5 h-5" />
                Reset Game Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

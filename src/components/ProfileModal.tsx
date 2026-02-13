import { useState } from 'react';
import { X, User, TrendingUp, MousePointer, Clock, AlertTriangle } from 'lucide-react';
import { deviceIdentity } from '../lib/deviceIdentity';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onPlayerNameChange: (newName: string) => void;
  totalMoney: number;
  lifetimeEarnings: number;
  totalClicks: number;
  playTimeSeconds: number;
  onResetProgress: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  playerName,
  onPlayerNameChange,
  totalMoney,
  lifetimeEarnings,
  totalClicks,
  playTimeSeconds,
  onResetProgress,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playerName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  function handleSaveName() {
    if (editedName.trim().length >= 3) {
      onPlayerNameChange(editedName.trim());
      deviceIdentity.setPlayerName(editedName.trim());
      setIsEditing(false);
    }
  }

  function handleReset() {
    onResetProgress();
    setShowResetConfirm(false);
    onClose();
  }

  function formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function formatNumber(num: number): string {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num}`;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Player Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 rounded-full p-3">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:outline-none"
                      placeholder="Enter player name"
                      minLength={3}
                      maxLength={20}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={editedName.trim().length < 3}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(playerName);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Display Name</p>
                      <p className="text-2xl font-bold text-white">{playerName}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Game Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <p className="text-sm text-gray-300">Current Money</p>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(totalMoney)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <p className="text-sm text-gray-300">Total Earned</p>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(lifetimeEarnings)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <MousePointer className="w-6 h-6 text-purple-400" />
                  <p className="text-sm text-gray-300">Total Clicks</p>
                </div>
                <p className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-orange-400" />
                  <p className="text-sm text-gray-300">Play Time</p>
                </div>
                <p className="text-2xl font-bold text-white">{formatPlayTime(playTimeSeconds)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Account Actions</h3>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full px-4 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/50 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Reset Progress
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300 text-sm font-medium mb-2">Are you sure?</p>
                  <p className="text-gray-300 text-sm">
                    This will delete all your progress and let you choose a new character. This action cannot be undone!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

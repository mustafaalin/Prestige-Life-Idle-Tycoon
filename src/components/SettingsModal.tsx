import { X, Volume2, Music, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ResetProgressModal } from './ResetProgressModal';
import {
  getAudioSettings,
  setSoundEnabled,
  setMusicEnabled,
  setMusicVolume,
} from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => Promise<void>;
  currentGems?: number;
  iapMoney?: number;
  claimedQuestCount?: number;
  currentBonusPrestige?: number;
}

export function SettingsModal({
  isOpen,
  onClose,
  onResetProgress,
  currentGems = 0,
  iapMoney = 0,
  claimedQuestCount = 0,
  currentBonusPrestige = 0,
}: SettingsModalProps) {
  const [soundEnabled, setSoundState] = useState(true);
  const [musicEnabled, setMusicState] = useState(true);
  const [musicVol, setMusicVol] = useState(0.6);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const s = getAudioSettings();
      setSoundState(s.soundEnabled);
      setMusicState(s.musicEnabled);
      setMusicVol(s.musicVolume);
    }
  }, [isOpen]);

  function handleSoundToggle() {
    const next = !soundEnabled;
    setSoundState(next);
    setSoundEnabled(next);
  }

  function handleMusicToggle() {
    const next = !musicEnabled;
    setMusicState(next);
    setMusicEnabled(next);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const vol = Number(e.target.value);
    setMusicVol(vol);
    setMusicVolume(vol);
    if (!musicEnabled) { setMusicState(true); setMusicEnabled(true); }
  }

  const handleReset = async () => {
    setIsResetting(true);
    await onResetProgress();
    setIsResetting(false);
    setShowResetConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 z-[100] flex flex-col pointer-events-none"
        style={{ top: '88px', bottom: '0', height: 'calc(100dvh - 88px)' }}
      >
        <div className="pointer-events-auto w-full bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.12)] border-t border-slate-100 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">Settings</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            {/* Sound Effects */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Volume2 className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Sound Effects</p>
                  <p className="text-[11px] font-semibold text-slate-400">Taps, rewards, alerts</p>
                </div>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Music + Volume */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Music className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Background Music</p>
                    <p className="text-[11px] font-semibold text-slate-400">Ambient game soundtrack</p>
                  </div>
                </div>
                <button
                  onClick={handleMusicToggle}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    musicEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      musicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume slider */}
              <div className="flex items-center gap-3 px-1">
                <Volume2 className={`h-3.5 w-3.5 shrink-0 ${musicEnabled ? 'text-slate-400' : 'text-slate-300'}`} />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={musicVol}
                  onChange={handleVolumeChange}
                  disabled={false}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-slate-200 accent-emerald-500 cursor-pointer disabled:opacity-40"
                />
                <span className={`text-[11px] font-black w-8 text-right ${musicEnabled ? 'text-slate-500' : 'text-slate-300'}`}>
                  {Math.round(musicVol * 100)}%
                </span>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 transition-all active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <RotateCcw className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-red-600">Reset Game Progress</p>
                <p className="text-[11px] font-semibold text-red-400">All gems are kept, everything else resets</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <ResetProgressModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        isResetting={isResetting}
        currentGems={currentGems}
        iapMoney={iapMoney}
        claimedQuestCount={claimedQuestCount}
        currentBonusPrestige={currentBonusPrestige}
      />
    </>
  );
}

import { X, Volume2, Music, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ResetProgressModal } from './ResetProgressModal';

const SETTINGS_KEY = 'idle_guy_settings';

interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { soundEnabled: true, musicEnabled: true, ...JSON.parse(stored) };
  } catch {}
  return { soundEnabled: true, musicEnabled: true };
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => Promise<void>;
  currentGems?: number;
  iapGems?: number;
  iapMoney?: number;
}

export function SettingsModal({
  isOpen,
  onClose,
  onResetProgress,
  currentGems = 0,
  iapGems = 0,
  iapMoney = 0,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) setSettings(loadSettings());
  }, [isOpen]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveSettings(next);
      return next;
    });
  };

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
            {/* Sound */}
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
                onClick={() => toggle('soundEnabled')}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Music */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
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
                onClick={() => toggle('musicEnabled')}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  settings.musicEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                <p className="text-[11px] font-semibold text-red-400">Gems are kept, everything else resets</p>
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
        iapGems={iapGems}
        iapMoney={iapMoney}
      />
    </>
  );
}

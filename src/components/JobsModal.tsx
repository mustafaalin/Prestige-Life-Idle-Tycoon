import { useState, useEffect } from 'react';
import { X, Briefcase, Lock, Check, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Database } from '../lib/database.types';

type Job = Database['public']['Tables']['jobs']['Row'];
type PlayerJob = Database['public']['Tables']['player_jobs']['Row'];

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  playerJobs: PlayerJob[];
  totalMoney: number;
  onUnlockJob: (jobId: string) => Promise<boolean>;
  onSelectJob: (jobId: string) => Promise<boolean>;
  jobChangeLockedUntil: number | null;
}

export function JobsModal({
  isOpen,
  onClose,
  jobs,
  playerJobs,
  totalMoney,
  onUnlockJob,
  onSelectJob,
  jobChangeLockedUntil,
}: JobsModalProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!jobChangeLockedUntil) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, jobChangeLockedUntil - Date.now());
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [jobChangeLockedUntil]);

  if (!isOpen) return null;

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Briefcase;
    return Icon;
  };

  const handleUnlock = async (jobId: string) => {
    await onUnlockJob(jobId);
  };

  const handleSelect = async (jobId: string) => {
    if (remainingTime > 0) return;
    await onSelectJob(jobId);
  };

  return (
    /* Modalın Header altında başlayıp ekranın altına kadar uzanması */
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',    // Header yüksekliği (padding + içerik)
        bottom: '0',    // Ekranın altına kadar uzat (footer'ı kapat)
        height: 'calc(100dvh - 88px)' // Dinamik yükseklik hesaplama
      }}
    >
      {/* Modal Gövdesi - Tıklamaları tekrar aktif ediyoruz */}
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-teal-100">
        
        {/* Modal Başlık Bölümü */}
        <div className="flex items-center justify-between p-4 border-b border-teal-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Jobs
            </h2>
            {remainingTime > 0 && (
              <p className="text-[10px] text-orange-600 font-bold mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time: {formatTime(remainingTime)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-teal-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-teal-700" />
          </button>
        </div>

        {/* Kaydırılabilir İş Listesi */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-white">
          {jobs.map((job) => {
            const playerJob = playerJobs.find(pj => pj.job_id === job.id);
            const isUnlocked = playerJob?.is_unlocked || false;
            const isActive = playerJob?.is_active || false;

            // Find the active job to determine level restriction
            const activePlayerJob = playerJobs.find(pj => pj.is_active);
            const activeJob = activePlayerJob ? jobs.find(j => j.id === activePlayerJob.job_id) : null;
            const activeJobLevel = activeJob?.level || 0;

            // Check if this job can be unlocked based on level and money
            const hasEnoughMoney = totalMoney >= job.unlock_requirement_money;
            const isLevelAllowed = job.level <= activeJobLevel + 1;
            const canUnlock = !isUnlocked && hasEnoughMoney && isLevelAllowed;

            const canSelect = isUnlocked && !isActive && remainingTime === 0;
            const Icon = getIconComponent(job.icon_name);

            return (
              <div
                key={job.id}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : isUnlocked
                    ? 'bg-emerald-50/30 border-emerald-100 hover:shadow-sm'
                    : canUnlock
                    ? 'bg-yellow-50/30 border-yellow-100'
                    : hasEnoughMoney && !isLevelAllowed
                    ? 'bg-red-50/30 border-red-100 opacity-75'
                    : 'bg-gray-50 border-gray-100 opacity-75'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-blue-500' : isUnlocked ? 'bg-emerald-500' : 'bg-gray-400'}
                    `}
                  >
                    {isUnlocked ? (
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <Lock className="w-5 h-5 text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 truncate">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          {job.name}
                          {isActive && <Check className="w-3 h-3 text-blue-600" />}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate leading-tight">
                          {job.description}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Income</p>
                        <p className="text-sm font-black text-green-600">
                          {formatMoney(job.hourly_income)}/hr
                        </p>
                      </div>
                    </div>

                    {!isUnlocked && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-orange-600">
                            Required: {formatMoney(job.unlock_requirement_money)}
                          </span>
                          {canUnlock && (
                            <button
                              onClick={() => handleUnlock(job.id)}
                              className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md shadow-sm active:scale-95"
                            >
                              Unlock
                            </button>
                          )}
                        </div>
                        {hasEnoughMoney && !isLevelAllowed && (
                          <div className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            Complete Level {activeJobLevel + 1} job first
                          </div>
                        )}
                      </div>
                    )}

                    {isUnlocked && !isActive && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleSelect(job.id)}
                          disabled={!canSelect}
                          className={`
                            w-full py-1.5 font-bold rounded-md shadow-sm text-[11px] transition-all
                            ${canSelect
                              ? 'bg-blue-500 text-white active:scale-95'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {remainingTime > 0 ? 'Wait...' : 'Select Job'}
                        </button>
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="mt-1.5 text-center text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                        Active Job
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
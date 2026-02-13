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

  const activeJob = playerJobs.find(pj => pj.is_active);

  const handleUnlock = async (jobId: string) => {
    await onUnlockJob(jobId);
  };

  const handleSelect = async (jobId: string) => {
    if (remainingTime > 0) return;
    await onSelectJob(jobId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-white/40 max-h-[85vh] flex flex-col relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-teal-200/50">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Jobs
            </h2>
            {remainingTime > 0 && (
              <p className="text-sm text-orange-600 font-bold mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Next job change in {formatTime(remainingTime)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-teal-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-teal-700" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {jobs.map((job) => {
            const playerJob = playerJobs.find(pj => pj.job_id === job.id);
            const isUnlocked = playerJob?.is_unlocked || false;
            const isActive = playerJob?.is_active || false;
            const canUnlock = !isUnlocked && totalMoney >= job.unlock_requirement_money;
            const canSelect = isUnlocked && !isActive && remainingTime === 0;
            const Icon = getIconComponent(job.icon_name);

            return (
              <div
                key={job.id}
                className={`
                  p-5 rounded-2xl border-2 transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400 shadow-lg'
                    : isUnlocked
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 hover:shadow-lg'
                    : canUnlock
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-400 hover:shadow-lg'
                    : 'bg-gradient-to-br from-gray-100 to-slate-100 border-gray-300 opacity-70'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isActive
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                        : isUnlocked
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-gray-400 to-slate-500'
                      }
                    `}
                  >
                    {isUnlocked ? (
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    ) : (
                      <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-teal-900 flex items-center gap-2">
                          {job.name}
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                              <Check className="w-3 h-3" />
                              ACTIVE
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-teal-700 mt-1 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-teal-600 font-bold uppercase">Hourly Income</p>
                        <p className="text-2xl font-black text-green-600">
                          {formatMoney(job.hourly_income)}
                        </p>
                      </div>
                    </div>

                    {!isUnlocked && (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-orange-600" />
                          <span className="font-bold text-orange-700">
                            Required: {formatMoney(job.unlock_requirement_money)}
                          </span>
                        </div>
                        {canUnlock && (
                          <button
                            onClick={() => handleUnlock(job.id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg text-sm"
                          >
                            Unlock Job
                          </button>
                        )}
                      </div>
                    )}

                    {isUnlocked && !isActive && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleSelect(job.id)}
                          disabled={!canSelect}
                          className={`
                            w-full px-4 py-2 font-bold rounded-lg transition-all shadow-lg text-sm
                            ${canSelect
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white active:scale-95'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          {remainingTime > 0 ? 'Wait to change job' : 'Select This Job'}
                        </button>
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

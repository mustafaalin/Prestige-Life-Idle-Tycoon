import { useEffect, useRef, useState } from 'react';
import { X, Briefcase, Lock, Check, Clock, Play } from 'lucide-react';
import type { Job, PlayerJob } from '../types/game';
import { resolveLocalAsset } from '../lib/localAssets';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  playerJobs: PlayerJob[];
  totalMoney: number;
  onUnlockJob: (jobId: string) => Promise<boolean>;
  onSelectJob: (jobId: string) => Promise<boolean>;
  onSkipCooldown: () => Promise<boolean>;
  jobChangeLockedUntil: number | null;
  unsavedJobWorkSeconds: number;
  isSkippingCooldown?: boolean;
}

export function JobsModal({
  isOpen,
  onClose,
  jobs,
  playerJobs,
  onUnlockJob,
  onSelectJob,
  onSkipCooldown,
  jobChangeLockedUntil,
  unsavedJobWorkSeconds,
  isSkippingCooldown = false,
}: JobsModalProps) {
  const activeJobCardRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const activePlayerJob = playerJobs.find((playerJob) => playerJob.is_active);
  const activeJob = activePlayerJob ? jobs.find((job) => job.id === activePlayerJob.job_id) : null;
  const activeJobTotalTime = activePlayerJob
    ? (activePlayerJob.total_time_worked_seconds || 0) + unsavedJobWorkSeconds
    : 0;

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      activeJobCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, activePlayerJob?.job_id]);

  useEffect(() => {
    if (!isOpen || jobChangeLockedUntil === null) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen, jobChangeLockedUntil]);

  if (!isOpen) return null;

  const requiredSeconds = 180;
  const isCooldownActive = jobChangeLockedUntil !== null && now < jobChangeLockedUntil;
  const sortedJobs = [...jobs].sort((a, b) => a.level - b.level);
  const unlockedCount = playerJobs.filter((job) => job.is_unlocked).length + (playerJobs.some((job) => job.job_id === sortedJobs[0]?.id) ? 0 : 1);
  const activeJobProgress = Math.min(activeJobTotalTime / requiredSeconds, 1);
  const handleSkipCooldown = async () => {
    const success = await onSkipCooldown();
    if (success) {
      setNow(Date.now());
    }
  };

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)',
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-blue-100">
        <div className="flex items-center justify-between p-4 border-b border-blue-50 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Jobs
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {unlockedCount}/{sortedJobs.length} unlocked
              </p>
              {activeJob && (
                <p className="text-[10px] text-slate-500 font-semibold">
                  Active: {activeJob.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-blue-100/50 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-blue-700" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-blue-100 bg-white">
          <p className="text-xs text-slate-500">
            Work at your current job for at least 3 minutes to unlock the next one.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedJobs.map((job) => {
              const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
              const isUnlocked = playerJob?.is_unlocked || job.level === 1;
              const isActive = Boolean(playerJob?.is_active);
              const isCompleted = Boolean(playerJob?.is_completed);
              const isNextJob = activeJob ? job.level === activeJob.level + 1 : job.level === 1;
              const canUnlock = isNextJob && activeJobTotalTime >= requiredSeconds;
              const remainingSeconds = Math.max(0, requiredSeconds - activeJobTotalTime);
              const remainingMinutesPart = Math.floor(remainingSeconds / 60);
              const remainingSecondsPart = remainingSeconds % 60;
              const activeProgressDegrees = Math.max(activeJobProgress * 360, 2);

              return (
                <div
                  key={job.id}
                  ref={isActive ? activeJobCardRef : undefined}
                  className={`relative rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                    isActive
                      ? 'p-[2px] bg-slate-200'
                      : isCompleted
                        ? 'border-2 border-emerald-300 opacity-80 bg-white'
                        : isUnlocked
                          ? 'border-2 border-blue-200 bg-white'
                          : 'border-2 border-slate-200 bg-white'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `conic-gradient(from -90deg, #ef4444 0deg, #ef4444 ${activeProgressDegrees}deg, rgba(59, 130, 246, 0.18) ${activeProgressDegrees}deg, rgba(59, 130, 246, 0.18) 360deg)`,
                        }
                      : undefined
                  }
                >
                  <div
                    className={`p-3 flex gap-3 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50'
                        : isCompleted
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50'
                          : isUnlocked
                            ? 'bg-gradient-to-br from-slate-50 to-blue-50'
                            : 'bg-gradient-to-br from-slate-50 to-slate-100'
                    }`}
                  >
                    <div className="shrink-0 w-[104px] flex items-center justify-center">
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border flex items-center justify-center overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-200'
                            : isCompleted
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-200'
                              : isUnlocked
                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-200'
                                : 'bg-gray-100 border-gray-200'
                        }`}
                      >
                        {job.icon_url ? (
                          <img
                            src={resolveLocalAsset(job.icon_url, 'job')}
                            alt={job.name}
                            className="w-[86%] h-[86%] object-contain"
                            loading="lazy"
                          />
                        ) : isUnlocked ? (
                          <img
                            src={resolveLocalAsset(undefined, 'job')}
                            alt={job.name}
                            className="w-[86%] h-[86%] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Lock className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Level {job.level}
                        </p>
                        <h3 className="font-extrabold text-sm text-gray-900 leading-tight line-clamp-2">
                          {job.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-white/80 rounded-lg px-2 py-1 border border-white/70">
                          <div className="text-[11px] font-black text-blue-700 truncate">
                            {formatMoney(job.hourly_income)}/hr
                          </div>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="text-[11px] font-bold text-emerald-700 bg-gradient-to-r from-emerald-100 to-teal-100 py-2 px-2 rounded-lg border border-emerald-300 text-center">
                          <Check className="w-3 h-3 inline mr-1" />
                          Completed
                        </div>
                      ) : isActive ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 py-2 px-2 rounded-lg border border-blue-300 text-center">
                            <Clock className="w-3 h-3 inline mr-1 animate-pulse" />
                            Working Now · {remainingMinutesPart > 0 ? `${remainingMinutesPart}m ` : ''}{remainingSecondsPart}s to next unlock
                          </div>
                          {remainingSeconds > 0 && (
                            <button
                              onClick={handleSkipCooldown}
                              disabled={isSkippingCooldown}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-xs font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
                            >
                              <Play className="h-4 w-4 fill-white" />
                              {isSkippingCooldown
                                ? 'Watching Ad...'
                                : `Watch Ad to Skip ${remainingMinutesPart > 0 ? `${remainingMinutesPart}m ` : ''}${remainingSecondsPart}s`}
                            </button>
                          )}
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => onSelectJob(job.id)}
                          disabled={isCooldownActive}
                          className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                            isCooldownActive
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:scale-95'
                          }`}
                        >
                          Select Job
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnlockJob(job.id)}
                          disabled={!canUnlock}
                          className={`w-full rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                            canUnlock
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canUnlock
                            ? 'Unlock Job'
                            : isNextJob
                              ? `Work ${remainingMinutesPart > 0 ? `${remainingMinutesPart}m ` : ''}${remainingSecondsPart}s more`
                              : 'Finish Previous Jobs'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

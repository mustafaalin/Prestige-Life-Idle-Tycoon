import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Lock, Check, Clock, Play, ChevronRight } from 'lucide-react';
import type { Job, PlayerJob } from '../types/game';
import { resolveLocalAsset } from '../lib/localAssets';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;
const REQUIRED_WORK_SECONDS = 180;
const MANAGER_PLACEHOLDER_COUNT = 20;

type JobTrackKey = 'worker' | 'specialist' | 'manager';

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
  managerJobs?: Job[];
}

function formatDurationLabel(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function getTrackedJobSeconds(playerJob: PlayerJob | undefined, activeJobId: string | undefined, unsavedSeconds: number) {
  if (!playerJob) {
    return 0;
  }

  return (playerJob.total_time_worked_seconds || 0) + (playerJob.job_id === activeJobId ? unsavedSeconds : 0);
}

function getTrackForJobLevel(level: number | undefined): JobTrackKey {
  if (!level) return 'worker';
  if (level <= 20) return 'worker';
  if (level <= 40) return 'specialist';
  return 'manager';
}

function TrackTabButton({
  isSelected,
  isLocked,
  iconSrc,
  onClick,
}: {
  isSelected: boolean;
  isLocked: boolean;
  iconSrc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={`relative flex h-14 items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 ${
        isSelected
          ? 'z-10 scale-[1.02] border-blue-400 bg-gradient-to-b from-white to-blue-50/50 shadow-[0_4px_12px_-2px_rgba(59,130,246,0.25)]'
          : isLocked
            ? 'cursor-not-allowed border-slate-200/60 bg-slate-50/50 text-slate-400'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
      }`}
      aria-label={isLocked ? 'Locked track' : 'Job track'}
    >
      {isLocked ? (
        <div className="flex items-center justify-center rounded-xl bg-slate-100/50 p-2">
          <Lock className="h-5 w-5 shrink-0 text-slate-400/70" />
        </div>
      ) : (
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
            isSelected ? 'bg-white shadow-sm ring-1 ring-blue-100/50' : 'bg-transparent'
          }`}
        >
          <img
            src={iconSrc}
            alt=""
            className={`h-7 w-7 object-contain transition-all duration-300 ${
              isSelected
                ? 'scale-110 opacity-100 drop-shadow-md'
                : 'scale-100 opacity-60 drop-shadow-none hover:opacity-80'
            }`}
            loading="lazy"
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Seçili Sekme Belirteci (Indicator) */}
      {isSelected && (
        <div className="absolute -bottom-1.5 h-1 w-5 rounded-full bg-blue-500 shadow-sm" />
      )}
    </button>
  );
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
  managerJobs = [],
}: JobsModalProps) {
  const activeJobCardRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [selectedTrack, setSelectedTrack] = useState<JobTrackKey>('worker');

  const sortedJobs = useMemo(() => [...jobs].sort((a, b) => a.level - b.level), [jobs]);
  const workerJobs = useMemo(() => sortedJobs.filter((job) => job.level <= 20), [sortedJobs]);
  const specialistJobs = useMemo(
    () => sortedJobs.filter((job) => job.level >= 21 && job.level <= 40),
    [sortedJobs]
  );
  const sortedManagerJobs = useMemo(() => [...managerJobs].sort((a, b) => a.level - b.level), [managerJobs]);
  const allJobs = useMemo(() => [...sortedJobs, ...sortedManagerJobs], [sortedJobs, sortedManagerJobs]);
  const activePlayerJob = playerJobs.find((playerJob) => playerJob.is_active);
  const activeJob = activePlayerJob ? allJobs.find((job) => job.id === activePlayerJob.job_id) : null;
  const activeJobTotalTime = getTrackedJobSeconds(activePlayerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      activeJobCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, selectedTrack, activePlayerJob?.job_id]);

  useEffect(() => {
    if (!isOpen) return;

    if (activeJob) {
      setSelectedTrack(getTrackForJobLevel(activeJob.level));
      return;
    }

    setSelectedTrack('worker');
  }, [activeJob, isOpen]);

  useEffect(() => {
    if (!isOpen || jobChangeLockedUntil === null) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen, jobChangeLockedUntil]);
  const workerUnlockedCount = workerJobs.filter((job) => {
    if (job.level === 1) return true;
    return playerJobs.some((entry) => entry.job_id === job.id && entry.is_unlocked);
  }).length;

  const workerCompletedCount = workerJobs.filter((job) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const trackedSeconds = getTrackedJobSeconds(playerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);
    return Boolean(playerJob?.is_completed) || trackedSeconds >= REQUIRED_WORK_SECONDS;
  }).length;

  const specialistCompletedCount = specialistJobs.filter((job) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const trackedSeconds = getTrackedJobSeconds(playerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);
    return Boolean(playerJob?.is_completed) || trackedSeconds >= REQUIRED_WORK_SECONDS;
  }).length;

  const specialistUnlocked = workerCompletedCount >= workerJobs.length && workerJobs.length > 0;
  const managerUnlocked = specialistJobs.length > 0 && specialistCompletedCount >= specialistJobs.length;
  const isCooldownActive = jobChangeLockedUntil !== null && now < jobChangeLockedUntil;
  const currentWorkerTrackProgress = Math.min(activeJobTotalTime / REQUIRED_WORK_SECONDS, 1);
  const managerPlaceholderJobs = Array.from({ length: MANAGER_PLACEHOLDER_COUNT }, (_, index) => index + 1);

  useEffect(() => {
    if (selectedTrack === 'specialist' && !specialistUnlocked) {
      setSelectedTrack('worker');
      return;
    }

    if (selectedTrack === 'manager' && !managerUnlocked) {
      setSelectedTrack(specialistUnlocked ? 'specialist' : 'worker');
    }
  }, [managerUnlocked, selectedTrack, specialistUnlocked]);

  if (!isOpen) return null;

  const renderJobCard = (job: Job, trackLabel: string) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const isPersistedUnlocked = Boolean(playerJob?.is_unlocked) || job.level === 1;
    const isActive = Boolean(playerJob?.is_active);
    const trackedSeconds = getTrackedJobSeconds(playerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);
    const isCompleted = Boolean(playerJob?.is_completed);
    const isNextJob = activeJob ? job.level === activeJob.level + 1 : job.level === 1;
    const canUnlock = isNextJob && activeJobTotalTime >= REQUIRED_WORK_SECONDS;
    const isVisibleUnlocked = isPersistedUnlocked || canUnlock;
    const remainingSeconds = Math.max(0, REQUIRED_WORK_SECONDS - activeJobTotalTime);
    const actionLabel = isCompleted
      ? 'Completed'
      : isActive
        ? 'Working'
        : isVisibleUnlocked
          ? 'Select Job'
          : canUnlock
            ? 'Unlock Job'
            : isNextJob
              ? `Work ${formatDurationLabel(remainingSeconds)} more`
              : 'Finish previous jobs';

    return (
      <div
        key={job.id}
        ref={isActive ? activeJobCardRef : undefined}
        className={`group relative overflow-hidden rounded-[24px] border p-3 shadow-sm transition-all ${
          isActive
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-100/90 to-teal-100/80 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.45)]'
            : isCompleted
              ? 'border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30'
              : isVisibleUnlocked
                ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-blue-200'
                : 'border-slate-200/90 bg-gradient-to-br from-slate-50 to-slate-100/80'
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            isActive
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
              : isCompleted
                ? 'bg-slate-200'
                : 'bg-slate-100'
          }`}
        />

        {isCompleted && <div className="pointer-events-none absolute inset-0 z-10 bg-white/35" />}

        {!isVisibleUnlocked ? (
          <div className="relative flex min-h-[132px] items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-50 to-slate-100/90">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Lock className="h-8 w-8 text-slate-400" />
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Locked
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative flex gap-3 pt-2 ${isCompleted ? 'opacity-60 saturate-[0.8]' : ''}`}>
            <div className="w-[92px] shrink-0">
              <div
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border ${
                  isActive
                    ? 'border-emerald-100 bg-white'
                    : isCompleted
                      ? 'border-emerald-100/70 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                {job.icon_url ? (
                  <img
                    src={resolveLocalAsset(job.icon_url, 'job')}
                    alt={job.name}
                    className="h-[84%] w-[84%] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={resolveLocalAsset(undefined, 'job')}
                    alt={job.name}
                    className="h-[84%] w-[84%] object-contain"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
                {formatMoney(job.hourly_income)}/hr
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {trackLabel} {trackLabel === 'Worker' ? job.level : job.level - 20}
                  </p>
                  <h3 className="mt-1 text-sm font-black leading-tight text-slate-900">
                    {job.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                    {job.description}
                  </p>
                </div>
                <div
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    isActive
                      ? 'bg-white text-emerald-700'
                      : isCompleted
                        ? 'bg-white/80 text-emerald-500'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isActive ? 'Working' : isCompleted ? 'Done' : 'Ready'}
                </div>
              </div>

              {isActive && (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 px-2 py-2">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="absolute inset-y-0 right-0 z-10 w-1.5 rounded-full bg-white shadow-[0_0_0_2px_rgba(16,185,129,0.18)]" />
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.max(currentWorkerTrackProgress * 100, 0)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isActive && remainingSeconds > 0 && (
                  <button
                    type="button"
                    onClick={handleSkipCooldown}
                    disabled={isSkippingCooldown}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isSkippingCooldown ? 'Watching...' : `Skip ${remainingSeconds}s`}
                  </button>
                )}

                {isCompleted ? (
                  <div className="inline-flex items-center justify-between gap-3 rounded-full border border-emerald-100 bg-white/85 px-3 py-2 text-xs font-black text-emerald-600">
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Completed
                    </span>
                  </div>
                ) : isActive ? null : isVisibleUnlocked ? (
                  <button
                    type="button"
                    onClick={() => (isPersistedUnlocked ? onSelectJob(job.id) : onUnlockJob(job.id))}
                    disabled={isCooldownActive}
                    className={`inline-flex items-center justify-between gap-2 rounded-full border px-3 py-2 text-xs font-black transition-all ${
                      isCooldownActive
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                        : isPersistedUnlocked
                          ? 'border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <span>
                      {isCooldownActive
                        ? 'Job change cooling down'
                        : isPersistedUnlocked
                          ? 'Select Job'
                          : 'Unlock Job'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUnlockJob(job.id)}
                    disabled={!canUnlock}
                    className={`inline-flex items-center justify-between gap-2 rounded-full border px-3 py-2 text-xs font-black transition-all ${
                      canUnlock
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{actionLabel}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
      <div className="h-full w-full pointer-events-auto border-y border-slate-200 bg-[#f7f8fb] shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Jobs</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Move through Worker, Specialist, and then Manager roles.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-2">
                <div className="grid grid-cols-3 gap-2">
                  <TrackTabButton
                    isSelected={selectedTrack === 'worker'}
                    isLocked={false}
                    iconSrc="/assets/icons/worker.png"
                    onClick={() => setSelectedTrack('worker')}
                  />
                  <TrackTabButton
                    isSelected={selectedTrack === 'specialist'}
                    isLocked={!specialistUnlocked}
                    iconSrc="/assets/icons/specialist.png"
                    onClick={() => setSelectedTrack('specialist')}
                  />
                  <TrackTabButton
                    isSelected={selectedTrack === 'manager'}
                    isLocked={!managerUnlocked}
                    iconSrc="/assets/icons/manager.png"
                    onClick={() => setSelectedTrack('manager')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
            {selectedTrack === 'worker' && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {workerJobs.map((job) => renderJobCard(job, 'Worker'))}
              </div>
            )}

            {selectedTrack === 'specialist' && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {specialistJobs.map((job) => renderJobCard(job, 'Specialist'))}
              </div>
            )}

            {selectedTrack === 'manager' && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(sortedManagerJobs.length > 0 ? sortedManagerJobs.map((job) => job.level) : managerPlaceholderJobs).map((level) => (
                    <div
                      key={`manager-slot-${level}`}
                      className="rounded-[24px] border border-dashed border-slate-200 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                          {managerUnlocked ? <Star className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Manager {level}
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {managerUnlocked ? 'Reserved manager slot' : 'Locked manager slot'}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            {managerUnlocked
                              ? 'Waiting for role name, icon and reward tuning.'
                              : 'This role becomes available after the Worker path is fully completed.'}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {managerUnlocked ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {managerUnlocked ? 'Ready for content' : 'Progress gated'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Lock, Check, Play, ChevronRight } from 'lucide-react';
import type { Car, House, Job, JobCategory, PlayerJob, PlayerProfile } from '../types/game';
import { resolveLocalAsset } from '../lib/localAssets';
import { getJobUnlockRequirementSeconds } from '../data/local/jobs';
import { evaluateJobRequirements, type JobRequirementRouteTarget } from '../data/local/jobRequirements';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;
type JobTrackKey = 'worker' | 'specialist' | 'manager';

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile | null;
  houses: House[];
  cars: Car[];
  jobs: Job[];
  playerJobs: PlayerJob[];
  totalMoney: number;
  onUnlockJob: (jobId: string) => Promise<boolean>;
  onSelectJob: (jobId: string) => Promise<boolean>;
  onSkipCooldown: () => Promise<boolean>;
  onOpenHealth: () => void;
  onOpenHappiness: () => void;
  onOpenStuffTab: (tab: 'cars' | 'houses') => void;
  onOpenQuestList: () => void;
  jobChangeLockedUntil: number | null;
  unsavedJobWorkSeconds: number;
  isSkippingCooldown?: boolean;
}

function getTrackedJobSeconds(playerJob: PlayerJob | undefined, activeJobId: string | undefined, unsavedSeconds: number) {
  if (!playerJob) {
    return 0;
  }

  return (playerJob.total_time_worked_seconds || 0) + (playerJob.job_id === activeJobId ? unsavedSeconds : 0);
}

function getTrackForJobCategory(category: JobCategory | undefined): JobTrackKey {
  return category || 'worker';
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
  profile,
  houses,
  cars,
  jobs,
  playerJobs,
  onUnlockJob,
  onSelectJob,
  onSkipCooldown,
  onOpenHealth,
  onOpenHappiness,
  onOpenStuffTab,
  onOpenQuestList,
  jobChangeLockedUntil,
  unsavedJobWorkSeconds,
  isSkippingCooldown = false,
}: JobsModalProps) {
  const activeJobCardRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [selectedTrack, setSelectedTrack] = useState<JobTrackKey>('worker');
  const [requirementsJob, setRequirementsJob] = useState<Job | null>(null);
  const [isStartingFromRequirements, setIsStartingFromRequirements] = useState(false);

  const sortedJobs = useMemo(() => [...jobs].sort((a, b) => a.order - b.order), [jobs]);
  const workerJobs = useMemo(() => sortedJobs.filter((job) => job.category === 'worker'), [sortedJobs]);
  const specialistJobs = useMemo(() => sortedJobs.filter((job) => job.category === 'specialist'), [sortedJobs]);
  const managerJobs = useMemo(() => sortedJobs.filter((job) => job.category === 'manager'), [sortedJobs]);
  const allJobs = sortedJobs;
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
      setSelectedTrack(getTrackForJobCategory(activeJob.category));
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
  const workerCompletedCount = workerJobs.filter((job) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const trackedSeconds = getTrackedJobSeconds(playerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);
    return Boolean(playerJob?.is_completed) || trackedSeconds >= getJobUnlockRequirementSeconds(job);
  }).length;

  const specialistCompletedCount = specialistJobs.filter((job) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const trackedSeconds = getTrackedJobSeconds(playerJob, activePlayerJob?.job_id, unsavedJobWorkSeconds);
    return Boolean(playerJob?.is_completed) || trackedSeconds >= getJobUnlockRequirementSeconds(job);
  }).length;

  const specialistUnlocked = workerCompletedCount >= workerJobs.length && workerJobs.length > 0;
  const managerUnlocked = specialistJobs.length > 0 && specialistCompletedCount >= specialistJobs.length;
  const isCooldownActive = jobChangeLockedUntil !== null && now < jobChangeLockedUntil;
  const activeJobRequiredSeconds = activeJob ? getJobUnlockRequirementSeconds(activeJob) : 150;
  const currentWorkerTrackProgress = Math.min(activeJobTotalTime / activeJobRequiredSeconds, 1);

  useEffect(() => {
    if (selectedTrack === 'specialist' && !specialistUnlocked) {
      setSelectedTrack('worker');
      return;
    }

    if (selectedTrack === 'manager' && !managerUnlocked) {
      setSelectedTrack(specialistUnlocked ? 'specialist' : 'worker');
    }
  }, [managerUnlocked, selectedTrack, specialistUnlocked]);

  const requirementStatuses = useMemo(() => {
    if (!requirementsJob) {
      return [];
    }

    return evaluateJobRequirements({
      job: requirementsJob,
      jobs: allJobs,
      playerJobs,
      profile,
      houses,
      cars,
      activeJobId: activePlayerJob?.job_id,
      unsavedJobWorkSeconds,
    });
  }, [requirementsJob, allJobs, playerJobs, profile, houses, cars, activePlayerJob?.job_id, unsavedJobWorkSeconds]);

  const areAllRequirementsMet = requirementStatuses.every((status) => status.isMet);

  const handleRequirementRoute = (target: JobRequirementRouteTarget) => {
    setRequirementsJob(null);

    switch (target) {
      case 'jobs':
        return;
      case 'quest_list':
        onClose();
        onOpenQuestList();
        return;
      case 'health':
        onClose();
        onOpenHealth();
        return;
      case 'happiness':
        onClose();
        onOpenHappiness();
        return;
      case 'houses':
        onClose();
        onOpenStuffTab('houses');
        return;
      case 'cars':
        onClose();
        onOpenStuffTab('cars');
        return;
    }
  };

  if (!isOpen) return null;

  const renderJobCard = (job: Job, trackLabel: string) => {
    const playerJob = playerJobs.find((entry) => entry.job_id === job.id);
    const isPersistedUnlocked = Boolean(playerJob?.is_unlocked) || job.is_default_unlocked;
    const isActive = Boolean(playerJob?.is_active);
    const isCompleted = Boolean(playerJob?.is_completed);
    const isNextJob = activeJob ? job.order === activeJob.order + 1 : job.is_default_unlocked;
    const currentJobRequirement = activeJob ? getJobUnlockRequirementSeconds(activeJob) : getJobUnlockRequirementSeconds(1);
    const isVisibleUnlocked = isPersistedUnlocked || isNextJob;
    const remainingSeconds = Math.max(0, currentJobRequirement - activeJobTotalTime);

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
                    {trackLabel} {job.tier} · <span className="text-slate-300">Lv {job.order}</span>
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
                    onClick={async () => {
                      if (isPersistedUnlocked) {
                        await onSelectJob(job.id);
                        return;
                      }

                      setRequirementsJob(job);
                    }}
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
                          : 'Select Job'}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                  <div className="inline-flex items-center justify-between gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-black text-slate-400">
                    <span>Finish previous jobs</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
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
                {managerJobs.map((job) => renderJobCard(job, 'Manager'))}
              </div>
            )}
          </div>
        </div>
      </div>

      {requirementsJob && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 pointer-events-auto">
          <div className="w-full max-w-sm overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Job Requirements
                </div>
                <div className="mt-1 text-base font-black text-slate-900">
                  {requirementsJob.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequirementsJob(null)}
                className="rounded-full p-1.5 text-slate-500 transition-all hover:bg-slate-100 active:scale-90"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              {requirementStatuses.map((status) => (
                <div
                  key={`${requirementsJob.id}-${status.requirement.type}`}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900">{status.label}</div>
                    <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                      {status.targetValueLabel}
                    </div>
                  </div>

                  {status.isMet ? (
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-4.5 w-4.5" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequirementRoute(status.routeTarget)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 transition-all active:scale-[0.98]"
                    >
                      Go
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              <button
                type="button"
                disabled={!areAllRequirementsMet || isStartingFromRequirements || isCooldownActive}
                onClick={async () => {
                  if (!requirementsJob || !areAllRequirementsMet) {
                    return;
                  }

                  setIsStartingFromRequirements(true);
                  try {
                    const unlocked = await onUnlockJob(requirementsJob.id);
                    if (!unlocked) {
                      return;
                    }

                    const selected = await onSelectJob(requirementsJob.id);
                    if (selected) {
                      setRequirementsJob(null);
                    }
                  } finally {
                    setIsStartingFromRequirements(false);
                  }
                }}
                className={`w-full rounded-[16px] px-4 py-3 text-sm font-black transition-all ${
                  !areAllRequirementsMet || isStartingFromRequirements || isCooldownActive
                    ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                    : 'border border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)] active:scale-[0.99]'
                }`}
              >
                {isStartingFromRequirements ? 'Starting...' : 'Start Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

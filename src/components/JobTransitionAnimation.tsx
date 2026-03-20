import { X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { Job } from '../types/game';
import { resolveLocalAsset } from '../lib/localAssets';

interface JobTransitionAnimationProps {
  previousJob: Job | null;
  nextJob: Job;
  onComplete: () => void;
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

// 1. Maaş animasyonunu izole bir bileşene ayırdık. 
// Böylece rAF döngüsü ana bileşenin CSS geçişlerini bozmayacak.
function AnimatedSalary({ startSalary, endSalary, hasStarted }: { startSalary: number, endSalary: number, hasStarted: boolean }) {
  const [displaySalary, setDisplaySalary] = useState(startSalary);

  useEffect(() => {
    if (!hasStarted) return;

    let frameId = 0;
    let animationStart = 0;

    const step = (timestamp: number) => {
      if (animationStart === 0) animationStart = timestamp;

      const progress = Math.min((timestamp - animationStart) / 850, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplaySalary(Math.round(startSalary + (endSalary - startSalary) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frameId);
  }, [hasStarted, startSalary, endSalary]);

  return <span className="text-3xl font-black text-slate-900">{formatMoney(displaySalary)}</span>;
}

export function JobTransitionAnimation({
  previousJob,
  nextJob,
  onComplete,
}: JobTransitionAnimationProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const startSalary = previousJob?.hourly_income ?? 0;
  const endSalary = nextJob.hourly_income;
  const salaryGain = Math.max(0, endSalary - startSalary);

  const previousJobAsset = resolveLocalAsset(previousJob?.icon_url, 'job');
  const nextJobAsset = resolveLocalAsset(nextJob.icon_url, 'job');

  // 2. Parent'tan gelen render'ların timeout'ları bozmaması için referans kullanıyoruz.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      setHasStarted(true);
    }, 700);

    const closeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, 3400);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(closeTimer);
    };
  }, []); // Bağımlılık dizisi boş, timer'lar sadece mount anında kurulur.

  return (
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center bg-black/35 p-4"
      onClick={() => onCompleteRef.current()}
    >
      <div
        className="relative w-[min(88vw,360px)] rounded-[28px] border border-white/50 bg-white/95 px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={() => onCompleteRef.current()}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-sky-500">
          Job Upgraded
        </p>

        <div className="relative mt-5 h-28 overflow-hidden">
          {previousJob && (
            <div
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2 transition-all duration-700 ease-out"
              style={{
                transform: hasStarted
                  ? 'translate(calc(-50% - 160px), -50%) scale(0.78)'
                  : 'translate(-50%, -50%) scale(1)',
                opacity: hasStarted ? 0.18 : 1,
              }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-md">
                <img
                  src={previousJobAsset}
                  alt={previousJob.name}
                  className="h-[76%] w-[76%] object-contain"
                  loading="eager"
                />
              </div>
              <span className="max-w-[110px] truncate text-[10px] font-black text-slate-500">
                {previousJob.name}
              </span>
            </div>
          )}

          <div
            className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2 transition-all duration-700 ease-out"
            style={{
              transform: hasStarted
                ? 'translate(-50%, -50%) scale(1)'
                : 'translate(calc(-50% + 160px), -50%) scale(0.84)',
              opacity: hasStarted ? 1 : 0.22,
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_18px_45px_rgba(14,165,233,0.35)]">
              <img
                src={nextJobAsset}
                alt={nextJob.name}
                className="h-[76%] w-[76%] object-contain"
                loading="eager"
              />
            </div>
            <span className="max-w-[120px] truncate text-[10px] font-black text-sky-700">
              {nextJob.name}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <div className="flex items-end justify-center gap-2">
            {/* 3. Animasyonu yapan component buraya eklendi */}
            <AnimatedSalary startSalary={startSalary} endSalary={endSalary} hasStarted={hasStarted} />
            <span className="pb-1 text-xs font-black text-slate-500">/hr</span>
          </div>
          {salaryGain > 0 && (
            <div
              className={
                'mt-1 text-sm font-black text-emerald-600 transition-all duration-500 ' +
                (hasStarted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')
              }
            >
              +{formatMoney(salaryGain)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
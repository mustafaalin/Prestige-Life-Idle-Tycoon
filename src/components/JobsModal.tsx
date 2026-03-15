import React from 'react';
import { X, Briefcase, Lock, Check, Clock } from 'lucide-react';
import type { Job, PlayerJob } from '../types/game';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  playerJobs: PlayerJob[];
  totalMoney: number;
  onUnlockJob: (jobId: string) => Promise<void>;
  onSelectJob: (jobId: string) => Promise<void>;
  jobChangeLockedUntil: number | null;
  unsavedJobWorkSeconds: number;
}

export function JobsModal({
  isOpen,
  onClose,
  jobs,
  playerJobs,
  onUnlockJob,
  onSelectJob,
  jobChangeLockedUntil,
  unsavedJobWorkSeconds,
}: JobsModalProps) {
  if (!isOpen) return null;

  // Aktif iş ve o işte geçen toplam süre (kayıtlı + canlı saniye) hesaplaması
  const activePlayerJob = playerJobs.find(pj => pj.is_active);
  const activeJobObj = activePlayerJob ? jobs.find(j => j.id === activePlayerJob.job_id) : null;
  const activeJobTotalTime = activePlayerJob 
    ? (activePlayerJob.total_time_worked_seconds || 0) + unsavedJobWorkSeconds 
    : 0;

  // 3 Dakika Kuralı (180 Saniye)
  const REQUIRED_SECONDS = 180;
  const isCooldownActive = jobChangeLockedUntil !== null && Date.now() < jobChangeLockedUntil;

  // İşleri seviyesine göre sırala
  const sortedJobs = [...jobs].sort((a, b) => a.level - b.level);

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 bg-slate-800 border-b border-white/5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Kariyer & İş</h2>
          </div>
          <p className="text-slate-400 text-sm">Bir sonraki işe geçmek için mevcut işte 3 dakika çalışmalısın.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedJobs.map((job) => {
            const playerJob = playerJobs.find(pj => pj.job_id === job.id);
            
            // Level 1 iş her zaman "Kilidi Açık" kabul edilir.
            const isUnlocked = playerJob?.is_unlocked || job.level === 1;
            const isActive = playerJob?.is_active;
            const isCompleted = playerJob?.is_completed;
            
            // Bu iş "bir sonraki" iş mi? (Aktif işin seviyesinin bir üstü mü)
            const isNextJob = activeJobObj 
               ? job.level === activeJobObj.level + 1 
               : job.level === 1;

            // Kilit açma şartı sağlandı mı? (Aktif işte 180 sn doldu mu?)
            const canUnlock = isNextJob && activeJobTotalTime >= REQUIRED_SECONDS;
            
            // Kalan süre hesaplaması (Gösterim için)
            const remainingSeconds = Math.max(0, REQUIRED_SECONDS - activeJobTotalTime);
            const remainingMins = Math.floor(remainingSeconds / 60);
            const remainingSecs = remainingSeconds % 60;

            return (
              <div
                key={job.id}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                  isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-slate-800' :
                  isCompleted ? 'border-emerald-500/30 bg-slate-800/50 opacity-75' :
                  isUnlocked ? 'border-slate-600 bg-slate-800' :
                  'border-slate-800 bg-slate-800/50'
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-slate-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
                        {job.icon_url ? <img src={job.icon_url} alt={job.title} className="w-8 h-8" /> : '💼'}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{job.title}</h3>
                        <p className="text-blue-400 font-bold">{formatMoney(job.income_per_hour)}/saat</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {/* Durumuna göre Buton Render'ı */}
                    {isCompleted ? (
                      <button disabled className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400">
                        <Check className="w-5 h-5" />
                        Tamamlandı (Eski İş)
                      </button>
                    ) : isActive ? (
                      <button disabled className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Clock className="w-5 h-5 animate-pulse" />
                        Şu An Çalışıyorsun
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onSelectJob(job.id)}
                        disabled={isCooldownActive}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors ${
                          isCooldownActive 
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                        }`}
                      >
                        İşi Seçip Başla
                      </button>
                    ) : (
                      // Henüz Kilidi Açılmamışsa
                      <button
                        onClick={() => onUnlockJob(job.id)}
                        disabled={!canUnlock}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                          canUnlock
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canUnlock ? (
                          'Kilidi Aç'
                        ) : isNextJob ? (
                          <>
                            <Lock className="w-4 h-4" />
                            {remainingMins > 0 ? `${remainingMins} dk ` : ''}{remainingSecs} sn daha çalış
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Önceki işleri tamamla
                          </>
                        )}
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
  );
}

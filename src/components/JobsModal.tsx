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

  // ... (useEffect ve format fonksiyonları aynı kalıyor)

  if (!isOpen) return null;

  const activeJob = playerJobs.find(pj => pj.is_active);

  return (
    /* Z-INDEX NOTU: Header ve Footer'ın z-index değerinin 50'den büyük (örn: 60) 
       olduğundan emin olmalısın ki butonlar modalın üstünde kalsın.
    */
    <div className="fixed inset-x-0 z-50 flex flex-col pointer-events-none" 
         style={{ top: '64px', bottom: '66px' }}> 
      
      {/* pointer-events-none: Bu ana divin tıklamaları engellememesini sağlar.
         Aşağıdaki modal içeriğinde ise 'pointer-events-auto' ile tıklamayı geri açıyoruz.
      */}

      <div className="bg-white w-full h-full shadow-2xl flex flex-col relative pointer-events-auto border-t border-b border-teal-200/50">
        
        {/* Header Kısmı */}
        <div className="flex items-center justify-between p-6 border-b border-teal-200/50 bg-cyan-50/50">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              İş İlanları
            </h2>
            {remainingTime > 0 && (
              <p className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Yeni iş için: {formatTime(remainingTime)}
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

        {/* Kaydırılabilir İçerik Alanı */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-white">
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
                  p-4 rounded-2xl border-2 transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 border-blue-400 shadow-md'
                    : isUnlocked
                    ? 'bg-emerald-50 border-green-300'
                    : canUnlock
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-80'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-blue-500' : isUnlocked ? 'bg-emerald-500' : 'bg-gray-400'}
                    `}>
                    {isUnlocked ? <Icon className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-teal-900 truncate">{job.name}</h3>
                      <div className="text-right">
                        <span className="text-lg font-black text-green-600 block">
                          {formatMoney(job.hourly_income)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-teal-700 mt-1 line-clamp-2">{job.description}</p>

                    {!isUnlocked && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-700 uppercase">
                          Gereken: {formatMoney(job.unlock_requirement_money)}
                        </span>
                        {canUnlock && (
                          <button
                            onClick={() => onUnlockJob(job.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow-md"
                          >
                            Kilidi Aç
                          </button>
                        )}
                      </div>
                    )}

                    {isUnlocked && !isActive && (
                      <button
                        onClick={() => handleSelect(job.id)}
                        disabled={!canSelect}
                        className={`w-full mt-3 py-2 text-xs font-bold rounded-lg shadow-md transition-all
                          ${canSelect ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                      >
                        {remainingTime > 0 ? 'Bekle...' : 'Bu İşe Gir'}
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
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
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [jobChangeLockedUntil]);

  // EĞER MODAL KAPALIYSA HİÇBİR ŞEY DÖNDÜRME (Beyaz ekranı önleyen en kritik satır)
  if (!isOpen) return null;

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${remainingSeconds}s`;
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Briefcase;
    return Icon;
  };

  return (
    <div 
      className="fixed inset-x-0 z-[60] flex flex-col pointer-events-none" 
      style={{ 
        top: '64px',    // Header yüksekliğin
        bottom: '70px', // Footer yüksekliğin
        height: 'calc(100% - 134px)' // Ekranın tamamından header+footer'ı çıkar
      }}
    >
      {/* pointer-events-auto: Sadece bu kutunun içi tıklanabilir olsun */}
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-y border-teal-200/50">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-teal-100/50 bg-white">
          <h2 className="text-xl font-black text-teal-700">İş İlanları</h2>
          <button onClick={onClose} className="p-2 bg-teal-50 rounded-full">
            <X className="w-5 h-5 text-teal-700" />
          </button>
        </div>

        {/* Liste */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50">
          {jobs.map((job) => {
            const playerJob = playerJobs.find(pj => pj.job_id === job.id);
            const isUnlocked = playerJob?.is_unlocked || false;
            const isActive = playerJob?.is_active || false;
            const canUnlock = !isUnlocked && totalMoney >= job.unlock_requirement_money;
            const canSelect = isUnlocked && !isActive && remainingTime === 0;
            const Icon = getIconComponent(job.icon_name);

            return (
              <div key={job.id} className={`p-4 rounded-xl border ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {isUnlocked ? <Icon className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800">{job.name}</span>
                      <span className="text-green-600 font-bold text-sm">{formatMoney(job.hourly_income)}</span>
                    </div>
                    
                    {!isUnlocked && (
                      <button onClick={() => onUnlockJob(job.id)} disabled={!canUnlock} className="mt-2 text-[10px] font-bold text-orange-600 uppercase">
                        Kilit Aç: {formatMoney(job.unlock_requirement_money)}
                      </button>
                    )}

                    {isUnlocked && !isActive && (
                      <button onClick={() => onSelectJob(job.id)} disabled={!canSelect} className="w-full mt-2 py-1 bg-blue-500 text-white text-xs rounded-md">
                        {remainingTime > 0 ? 'Bekle' : 'İşe Gir'}
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
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';

type StatKind = 'health' | 'happiness';

interface StatRewardAnimationProps {
  kind: StatKind;
  amount: number;
  phase: 'popup' | 'fly';
  targetRect: DOMRect | null;
}

const STAT_CONFIG = {
  health: {
    icon: LOCAL_ICON_ASSETS.healthy,
    alt: 'Health reward',
    border: 'border-emerald-300',
    bg: 'bg-emerald-500',
    shadow: 'shadow-[0_20px_60px_rgba(16,185,129,0.45)]',
  },
  happiness: {
    icon: LOCAL_ICON_ASSETS.happiness,
    alt: 'Happiness reward',
    border: 'border-amber-300',
    bg: 'bg-amber-500',
    shadow: 'shadow-[0_20px_60px_rgba(245,158,11,0.45)]',
  },
} as const;

export function StatRewardAnimation({
  kind,
  amount,
  phase,
  targetRect,
}: StatRewardAnimationProps) {
  if (typeof window === 'undefined') return null;

  const config = STAT_CONFIG[kind];
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;
  const targetX = targetRect ? targetRect.left + targetRect.width / 2 : startX;
  const targetY = targetRect ? targetRect.top + targetRect.height / 2 : startY;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  return (
    <div className="pointer-events-none fixed inset-0 z-[140]">
      <div
        className="absolute left-1/2 top-1/2 transition-all duration-700 ease-in-out"
        style={{
          transform:
            phase === 'popup'
              ? 'translate(-50%, -50%) scale(1)'
              : `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0.35)`,
          opacity: phase === 'popup' ? 1 : 0,
        }}
      >
        <div className={`flex items-center gap-2 rounded-2xl border px-5 py-3 ${config.border} ${config.bg} ${config.shadow}`}>
          <img src={config.icon} alt={config.alt} className="h-7 w-7" />
          <span className="text-xl font-black text-white">+{Math.round(amount)}%</span>
        </div>
      </div>
    </div>
  );
}

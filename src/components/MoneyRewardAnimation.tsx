import { LOCAL_ICON_ASSETS } from '../lib/localAssets';

interface MoneyRewardAnimationProps {
  amount: number;
  phase: 'popup' | 'fly';
  targetRect: DOMRect | null;
}

export function MoneyRewardAnimation({
  amount,
  phase,
  targetRect,
}: MoneyRewardAnimationProps) {
  if (typeof window === 'undefined') return null;

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;
  const targetX = targetRect ? targetRect.left + targetRect.width / 2 : startX;
  const targetY = targetRect ? targetRect.top + targetRect.height / 2 : startY;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
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
        <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-emerald-500 px-5 py-3 shadow-[0_20px_60px_rgba(16,185,129,0.45)]">
          <img src={LOCAL_ICON_ASSETS.money} alt="Money reward" className="h-7 w-7" />
          <span className="text-xl font-black text-white">+${amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

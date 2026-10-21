import { useMemo } from 'react';

// Falling confetti over a celebration (class-up ceremony, a business taking on a new look). Fills its
// positioned parent and ignores taps.

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];

export function Confetti({ count = 36 }: { count?: number }) {
  // Fixed per mount, so pieces don't jump on re-render.
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 120,
      })),
    [count],
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="v2-confetti absolute top-0 rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--drift' as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

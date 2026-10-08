import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { emitWalletHit, onCoinBurst } from './coins';

// Draws coin bursts: each coin pops out a little, then curves into the wallet in the top bar.
// Every arrival bumps the balance (TopBar listens to emitWalletHit).

interface Coin {
  id: number;
  x: number;
  y: number;
  /** Burst offset, then the full trip to the wallet (px). */
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
}

const STAGGER_MS = 45;

export function CoinLayer() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    const stop = onCoinBurst(({ x, y, count }) => {
      const wallet = document.querySelector('[data-wallet-icon]')?.getBoundingClientRect();
      if (!wallet) return;
      const targetX = wallet.left + wallet.width / 2;
      const targetY = wallet.top + wallet.height / 2;
      const burst: Coin[] = Array.from({ length: count }, (_, index) => ({
        id: nextId.current++,
        x,
        y,
        sx: (Math.random() - 0.5) * (40 + count * 6),
        sy: -20 - Math.random() * (30 + count * 3),
        dx: targetX - x,
        dy: targetY - y,
        delay: index * STAGGER_MS,
        duration: 620 + Math.random() * 160,
      }));
      setCoins((list) => [...list, ...burst]);
      for (const coin of burst) {
        const timer = window.setTimeout(() => {
          pending.delete(timer);
          emitWalletHit();
          setCoins((list) => list.filter((other) => other.id !== coin.id));
        }, coin.delay + coin.duration);
        pending.add(timer);
      }
    });
    return () => {
      stop();
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {coins.map((coin) => {
        const timing = { '--delay': `${coin.delay}ms`, '--dur': `${coin.duration}ms` };
        return (
          <span
            key={coin.id}
            className="v2-coin-x absolute"
            style={
              {
                left: coin.x - 12,
                top: coin.y - 12,
                '--sx': `${coin.sx}px`,
                '--dx': `${coin.dx}px`,
                ...timing,
              } as CSSProperties
            }
          >
            <span
              className="v2-coin-y block w-6 h-6 rounded-full border-2 border-amber-600 bg-[radial-gradient(circle_at_35%_30%,#fffbe0_0%,#fcd34d_35%,#f59e0b_70%,#b45309_100%)] shadow-md flex items-center justify-center text-[11px] font-black text-amber-800"
              style={{ '--sy': `${coin.sy}px`, '--dy': `${coin.dy}px`, ...timing } as CSSProperties}
            >
              $
            </span>
          </span>
        );
      })}
    </div>
  );
}

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ICONS } from '../icons';
import { emitWalletHit, onCoinBurst, onCoinSpill } from './coins';

// Draws coin bursts: each coin pops out a little, then curves into the wallet in the top bar.
// Every arrival bumps the balance (TopBar listens to emitWalletHit). A burst with a label shows the
// amount first, so the player reads it before the coins take it to the wallet. A spill is the other
// way round: coins tumble out of the wallet with the lost amount in red under it.

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
/** How long a burst's label shows alone before its coins leave. */
const LABEL_HOLD_MS = 600;
const LABEL_SHOW_MS = 1300;

interface Label {
  id: number;
  x: number;
  y: number;
  text: string;
  loss?: boolean;
}

/** A coin falling out of the wallet. */
interface FallingCoin {
  id: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  dy: number;
  delay: number;
  duration: number;
}

const SPILL_MS = 1500;

export function CoinLayer() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [falling, setFalling] = useState<FallingCoin[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    const stop = onCoinBurst(({ x, y, count, label }) => {
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
        delay: (label ? LABEL_HOLD_MS : 0) + index * STAGGER_MS,
        duration: 620 + Math.random() * 160,
      }));
      setCoins((list) => [...list, ...burst]);
      if (label) {
        const shown: Label = { id: nextId.current++, x, y, text: label };
        setLabels((list) => [...list, shown]);
        const timer = window.setTimeout(() => {
          pending.delete(timer);
          setLabels((list) => list.filter((other) => other.id !== shown.id));
        }, LABEL_SHOW_MS);
        pending.add(timer);
      }
      for (const coin of burst) {
        const timer = window.setTimeout(() => {
          pending.delete(timer);
          emitWalletHit();
          setCoins((list) => list.filter((other) => other.id !== coin.id));
        }, coin.delay + coin.duration);
        pending.add(timer);
      }
    });
    const stopSpill = onCoinSpill(({ count, label }) => {
      const wallet = document.querySelector('[data-wallet-icon]')?.getBoundingClientRect();
      if (!wallet) return;
      const x = wallet.left + wallet.width / 2;
      const y = wallet.top + wallet.height / 2;
      const spill: FallingCoin[] = Array.from({ length: count }, (_, index) => ({
        id: nextId.current++,
        x,
        y,
        sx: (Math.random() - 0.3) * 90,
        sy: -14 - Math.random() * 18,
        dy: 120 + Math.random() * 80,
        delay: index * 70,
        duration: 800 + Math.random() * 250,
      }));
      const shown: Label = { id: nextId.current++, x: x + 36, y: wallet.bottom + 22, text: label, loss: true };
      setFalling((list) => [...list, ...spill]);
      setLabels((list) => [...list, shown]);
      const timer = window.setTimeout(() => {
        pending.delete(timer);
        const ids = new Set(spill.map((coin) => coin.id));
        setFalling((list) => list.filter((coin) => !ids.has(coin.id)));
        setLabels((list) => list.filter((other) => other.id !== shown.id));
      }, SPILL_MS + count * 70);
      pending.add(timer);
    });
    return () => {
      stop();
      stopSpill();
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {labels.map((label) => (
        <span key={label.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: label.x, top: label.y }}>
          <span
            className={`block whitespace-nowrap v2-display v2-outline ${
              label.loss ? 'v2-loss-label text-[28px] text-rose-400' : 'v2-coin-label text-[32px] text-emerald-300'
            }`}
          >
            {label.text}
          </span>
        </span>
      ))}
      {falling.map((coin) => (
        <img
          key={coin.id}
          src={ICONS.coin}
          alt=""
          draggable={false}
          className="v2-coin-fall absolute w-6 h-6 drop-shadow-md"
          style={
            {
              left: coin.x - 12,
              top: coin.y - 12,
              '--sx': `${coin.sx}px`,
              '--sy': `${coin.sy}px`,
              '--dy': `${coin.dy}px`,
              '--delay': `${coin.delay}ms`,
              '--dur': `${coin.duration}ms`,
            } as CSSProperties
          }
        />
      ))}
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
            <img
              src={ICONS.coin}
              alt=""
              draggable={false}
              className="v2-coin-y block w-6 h-6 drop-shadow-md"
              style={{ '--sy': `${coin.sy}px`, '--dy': `${coin.dy}px`, ...timing } as CSSProperties}
            />
          </span>
        );
      })}
    </div>
  );
}

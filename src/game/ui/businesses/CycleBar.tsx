import { useEffect, useRef } from 'react';

// Production cycle bar. The game ticks 4× a second; between ticks the bar is extrapolated every
// animation frame (written straight to the DOM, no React re-render) so it fills smoothly.

interface CycleBarProps {
  progress: number;
  running: boolean;
  managed: boolean;
  cycleSeconds: number;
  /** Wall-clock ms of the last game tick (RuntimeState.lastActiveAt). */
  lastActiveAt: number;
  speed: number;
  label: string;
  /** Right-hand text, e.g. time left. */
  detail?: string;
}

/** Cycles faster than this show as a full, pulsing bar; a flickering bar reads as noise. */
const MIN_VISIBLE_CYCLE_SECONDS = 0.5;

export function CycleBar(props: CycleBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const fast = props.managed && props.cycleSeconds / Math.max(props.speed, 1e-9) < MIN_VISIBLE_CYCLE_SECONDS;

  useEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    if (fast) return;
    let frame = 0;
    const draw = () => {
      const p = latest.current;
      let value = p.progress;
      if (p.running) {
        value += ((Date.now() - p.lastActiveAt) / 1000) * (p.speed / p.cycleSeconds);
        value = p.managed ? value % 1 : Math.min(value, 1);
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${value})`;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [fast]);

  return (
    <div className="relative h-6 rounded-full bg-slate-100 overflow-hidden">
      <div
        ref={fillRef}
        className={`absolute inset-0 origin-left rounded-full bg-gradient-to-r from-emerald-500 to-green-500 ${
          fast ? 'animate-pulse' : ''
        }`}
        style={{ transform: `scaleX(${fast ? 1 : props.progress})` }}
      />
      <div className="relative h-full flex items-center justify-between px-3">
        <span className="text-[11px] font-black text-slate-900 tabular-nums drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
          {props.label}
        </span>
        {props.detail && <span className="text-[10px] font-black text-slate-600 tabular-nums">{props.detail}</span>}
      </div>
    </div>
  );
}

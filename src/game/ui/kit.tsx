import type { ButtonHTMLAttributes, ReactNode } from 'react';

// The game look for screens inside sheets (2026-10-08): glossy buttons, white cards with a soft
// colored edge, rounded display font. One place, so every tab reads the same.

type Tone = 'buy' | 'manager' | 'gold' | 'soft';

const TONES: Record<Tone, string> = {
  buy: 'from-emerald-400 to-green-600 text-white',
  manager: 'from-violet-400 to-indigo-600 text-white',
  gold: 'from-amber-300 to-orange-500 text-white',
  soft: 'from-white to-indigo-50 text-indigo-700',
};

export function GameButton({
  tone = 'buy',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      {...rest}
      className={`rounded-2xl border-2 ${tone === 'soft' ? 'border-indigo-100' : 'border-white/70'} bg-gradient-to-b ${TONES[tone]} v2-glossy transition-all active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}

/** A white card. `accent` marks the one big next step on a screen. */
export function Panel({
  accent,
  className = '',
  children,
}: {
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[22px] bg-white border-2 ${
        accent
          ? 'border-amber-300 shadow-[0_6px_18px_rgba(245,158,11,0.25)]'
          : 'border-white shadow-[0_4px_14px_rgba(30,41,99,0.12)]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="v2-display text-[13px] uppercase tracking-wide text-indigo-900/60 px-1">{children}</h3>;
}

/** Picture box for a business, job or item. */
export function ImageTile({ className = 'w-16 h-16', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`shrink-0 rounded-2xl bg-gradient-to-b from-sky-100 to-indigo-100 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

/** Glossy progress bar with a label on top. */
export function GlossyBar({
  progress,
  label,
  fill = 'from-amber-300 to-orange-500',
}: {
  progress: number;
  label: ReactNode;
  fill?: string;
}) {
  return (
    <div className="relative h-5 rounded-full bg-indigo-100 border border-indigo-200/60 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${fill} transition-all duration-300`}
        style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
      />
      <div className="absolute inset-x-1 top-0.5 h-1.5 rounded-full bg-white/30" />
      <span className="absolute inset-0 flex items-center justify-center v2-display text-[11px] text-white v2-shadow tabular-nums">
        {label}
      </span>
    </div>
  );
}

/** Pill on a tile or card (OTOMATİK, Kiracısın, ...). */
export function Chip({ tone = 'manager', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 rounded-full border border-white/70 bg-gradient-to-b ${TONES[tone]} px-2 py-0.5 v2-display text-[11px] ${tone === 'soft' ? '' : 'v2-shadow'}`}
    >
      {children}
    </span>
  );
}

/** Segmented control (buy amount, shop categories). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  dot,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  /** Options with something to do get a red dot. */
  dot?: (value: T) => boolean;
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-white/70 border-2 border-white p-1 shadow-sm">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 min-h-9 rounded-xl px-2.5 py-1.5 v2-display text-[13px] transition-all active:scale-95 ${
              selected
                ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-white v2-shadow v2-glossy'
                : 'text-indigo-900/60'
            }`}
          >
            {option.label}
            {dot?.(option.value) && !selected && (
              <span className="absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

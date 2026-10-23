import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { UiIcon } from './UiIcon';

// The game look for screens inside sheets (2026-10-08): glossy buttons, white cards with a soft
// colored edge, rounded display font. One place, so every tab reads the same.

type Tone = 'buy' | 'manager' | 'gold' | 'soft' | 'ad';

const TONES: Record<Tone, string> = {
  buy: 'from-emerald-400 to-green-600 text-white',
  manager: 'from-violet-400 to-indigo-600 text-white',
  gold: 'from-amber-300 to-orange-500 text-white',
  soft: 'from-white to-indigo-50 text-indigo-700',
  // "Watch an ad" buttons, everywhere.
  ad: 'from-orange-400 to-orange-600 text-white',
};

export const GameButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }>(
  function GameButton({ tone = 'buy', className = '', children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={`rounded-2xl border-2 ${tone === 'soft' ? 'border-indigo-100' : 'border-white/70'} bg-gradient-to-b ${TONES[tone]} v2-glossy transition-all active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${className}`}
      >
        {children}
      </button>
    );
  },
);

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
      className={`v2-panel rounded-[22px] bg-white border-2 ${
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
  return <h3 className="v2-section-label v2-display text-[13px] uppercase tracking-wide text-indigo-900/60 px-1">{children}</h3>;
}

/** Picture box for a business, job or item. */
export function ImageTile({ className = 'w-16 h-16', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`v2-tile shrink-0 rounded-2xl bg-gradient-to-b from-sky-100 to-indigo-100 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center ${className}`}
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
    <div className="v2-bar relative h-5 rounded-full bg-indigo-100 border border-indigo-200/60 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${fill} transition-all duration-300`}
        style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
      />
      <div className="absolute inset-x-1 top-0.5 h-1.5 rounded-full bg-white/30" />
      <span className="v2-bar-label absolute inset-0 flex items-center justify-center v2-display text-[11px] text-white v2-shadow tabular-nums">
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

/** The blinking "!" on a tab or button with something the player can do right now. */
export function AlertBadge({ small = false, className = '' }: { small?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`v2-alert absolute rounded-full bg-gradient-to-b from-rose-400 to-rose-600 border-2 border-white flex items-center justify-center v2-display text-white shadow ${
        small ? 'w-[18px] h-[18px] text-[11px]' : 'w-6 h-6 text-[13px]'
      } ${className}`}
    >
      !
    </span>
  );
}

/** Segmented control (buy amount, shop categories, a screen's tabs). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  dot,
}: {
  /** A `locked` option shows a lock and its `note` ("Soon") and can't be picked. */
  options: { value: T; label: ReactNode; locked?: boolean; note?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  /** Options with something to do get a blinking "!". */
  dot?: (value: T) => boolean;
}) {
  return (
    <div className="v2-segmented flex gap-1 rounded-2xl bg-white/70 border-2 border-white p-1 shadow-sm">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={option.locked}
            onClick={() => onChange(option.value)}
            className={`relative v2-hit flex-1 min-h-9 rounded-xl px-2.5 py-1.5 v2-display text-[13px] transition-all active:scale-95 disabled:active:scale-100 ${
              selected
                ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-white v2-shadow v2-glossy'
                : option.locked
                  ? 'text-indigo-900/40'
                  : 'text-indigo-900/60'
            }`}
          >
            {option.locked ? (
              <span className="flex flex-col items-center leading-none">
                <span className="flex items-center gap-1">
                  <UiIcon name="lock" />
                  {option.label}
                </span>
                {option.note && <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider">{option.note}</span>}
              </span>
            ) : (
              option.label
            )}
            {dot?.(option.value) && !selected && (
              <AlertBadge small className="-top-1.5 -right-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** The raised white-to-lilac face of a small tile (a deal, an heirloom, an owned item). */
export const TILE_FACE =
  'rounded-[18px] border-2 border-white bg-gradient-to-b from-white to-indigo-50 shadow-[0_3px_0_rgba(90,70,160,0.18),0_6px_14px_rgba(56,42,106,0.08)]';

/**
 * A tile three to a row (2026-10-22, after Idle Guy's bank): a coloured band with its name, a chip,
 * a picture, a big figure and a button at the foot. Tiles in a row keep one height.
 */
export function BandTile({
  band,
  title,
  chip,
  picture,
  figure,
  button,
  corner,
  dimmed = false,
  onClick,
}: {
  /** The band's gradient, e.g. `from-sky-400 to-blue-500`. */
  band: string;
  title: ReactNode;
  chip?: ReactNode;
  picture: ReactNode;
  figure: ReactNode;
  button: ReactNode;
  corner?: ReactNode;
  dimmed?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled: dimmed } : {})}
      className={`relative w-[calc(33.333%-6px)] min-w-[100px] overflow-hidden ${TILE_FACE} flex flex-col items-center pb-2 transition-all ${
        onClick ? 'active:scale-95' : ''
      } ${dimmed ? 'opacity-60' : ''}`}
    >
      <span className={`w-full bg-gradient-to-r ${band} px-1 py-1 v2-display text-[12px] leading-tight text-white v2-shadow line-clamp-2`}>
        {title}
      </span>
      <span className="mt-1 h-[18px] flex items-center">{chip}</span>
      {picture}
      {figure}
      <span className="h-1.5 shrink-0" aria-hidden />
      <span className="mt-auto self-stretch mx-1.5">{button}</span>
      {corner}
    </Tag>
  );
}

/** A small pill button for a tile's foot (the tile itself or the pill takes the tap). */
export function TilePill({ tone = 'buy', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`flex items-center justify-center gap-1 rounded-full border-2 border-white/70 bg-gradient-to-b ${TONES[tone]} v2-glossy py-1 v2-display text-[12px] v2-shadow tabular-nums`}
    >
      {children}
    </span>
  );
}

/** A character's one line at the top of a screen: portrait, name, what they say. */
export function SpeakerLine({ portrait, name, text }: { portrait: string; name: ReactNode; text: ReactNode }) {
  return (
    <Panel className="p-3 flex items-center gap-3">
      <img
        src={portrait}
        alt=""
        draggable={false}
        className="shrink-0 w-14 h-14 rounded-full object-cover border-[3px] border-white shadow-md bg-amber-100"
      />
      <div className="flex-1 min-w-0">
        <p className="v2-display text-[13px] text-violet-700">{name}</p>
        <p className="text-[13px] font-bold leading-snug text-slate-700">{text}</p>
      </div>
    </Panel>
  );
}

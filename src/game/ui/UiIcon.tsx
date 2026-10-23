import type { CSSProperties } from 'react';
import { UI_ICONS } from './icons';

export type UiIconName = keyof typeof UI_ICONS;

/** One of our own interface icons; size and placement come from `className` (e.g. "w-4 h-4"). */
export function UiIcon({ name, className = 'w-4 h-4', style }: { name: UiIconName; className?: string; style?: CSSProperties }) {
  return (
    <img
      src={UI_ICONS[name]}
      alt=""
      aria-hidden
      draggable={false}
      className={`shrink-0 object-contain pointer-events-none ${className}`}
      style={style}
    />
  );
}

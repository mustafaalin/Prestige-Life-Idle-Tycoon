import { useState } from 'react';
import type { CareerDef } from '../../core/types';
import { UiIcon } from '../UiIcon';

// A job's picture, with a ring that fills with its mastery. A job whose icon fails to load shows a
// briefcase; hidden jobs show a dark silhouette.

export function JobIcon({
  career,
  size,
  mastery,
  hidden = false,
  plain = false,
}: {
  career: CareerDef;
  size: number;
  /** 0–1 draws the mastery ring around the picture. */
  mastery?: number;
  hidden?: boolean;
  /** The picture alone, for a card that draws its own medallion. */
  plain?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  const inner = Math.round(size * 0.78);
  if (plain) {
    return missing ? (
      <UiIcon name="job" className={hidden ? 'brightness-0 opacity-30' : ''} style={{ width: size * 0.6, height: size * 0.6 }} />
    ) : (
      <img
        src={career.image}
        alt=""
        draggable={false}
        onError={() => setMissing(true)}
        className={`relative object-contain drop-shadow-md ${hidden ? 'brightness-0 opacity-30' : ''}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      {mastery !== undefined && <MasteryRing size={size} progress={mastery} />}
      <div
        className="rounded-full bg-gradient-to-b from-sky-100 to-indigo-100 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden"
        style={{ width: inner, height: inner }}
      >
        {missing ? (
          <UiIcon name="job" className={hidden ? 'brightness-0 opacity-40' : ''} style={{ width: inner * 0.5, height: inner * 0.5 }} />
        ) : (
          <img
            src={career.image}
            alt=""
            draggable={false}
            onError={() => setMissing(true)}
            className={`object-contain ${hidden ? 'brightness-0 opacity-25' : ''}`}
            style={{ width: inner * 0.86, height: inner * 0.86 }}
          />
        )}
      </div>
    </div>
  );
}

/** A ring that fills clockwise from the top; gold while working, green when mastered. */
export function MasteryRing({ size, progress }: { size: number; progress: number }) {
  const stroke = Math.max(3, Math.round(size * 0.07));
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const done = progress >= 1;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-indigo-200/70" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - Math.max(0, Math.min(1, progress)))}
        className={`transition-all duration-500 ${done ? 'stroke-emerald-500' : 'stroke-amber-400'}`}
      />
    </svg>
  );
}

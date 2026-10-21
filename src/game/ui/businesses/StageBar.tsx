import type { BusinessDef } from '../../core/types';

// Where a line is on its way up (2026-10-21, design review: 15 dots did not read): three parts, one
// per look (stand, shop, store), a notch per level of that look.

export function StageBar({ def, level }: { def: BusinessDef; level: number }) {
  const stages = [...new Set(def.levels.map((step) => step.stage))];
  return (
    <span className="flex gap-1" aria-hidden>
      {stages.map((stage) => (
        <span key={stage} className="flex-1 flex gap-[2px] rounded-full bg-indigo-100 p-[2px]">
          {def.levels.map((step, index) =>
            step.stage === stage ? (
              <span
                key={index}
                className={`flex-1 h-1.5 rounded-full ${index < level ? 'bg-gradient-to-b from-amber-300 to-orange-500' : 'bg-white'}`}
              />
            ) : null,
          )}
        </span>
      ))}
    </span>
  );
}

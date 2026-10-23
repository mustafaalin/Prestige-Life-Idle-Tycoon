import { Circle } from 'lucide-react';
import { isMet, masteryOf } from '../../core/requirements';
import type { GameStateV2, Requirement } from '../../core/types';
import type { Translator } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import type { FocusTarget } from '../home/focus';
import { requirementTarget, requirementText } from './requirementText';
import { UiIcon } from '../UiIcon';

// What a locked job (or course) still needs, one line per condition, each with "Go" to where it is
// done (docs/game-design-v2.md §4.4). Shared by every screen that shows conditions.

/** How far a job's mastery is ("40%") when it is started but not done; an anyOf shows its best option. */
function progress(state: GameStateV2, requirement: Requirement, t: Translator['t']): string | null {
  const share =
    requirement.type === 'mastered'
      ? masteryOf(state, requirement.careerId)
      : requirement.type === 'anyOf'
        ? Math.max(0, ...requirement.options.map((option) => (option.type === 'mastered' ? masteryOf(state, option.careerId) : 0)))
        : 0;
  return share > 0 && share < 1 ? t('requirement.progress', { percent: Math.floor(share * 100) }) : null;
}

export function RequirementList({
  state,
  requirements,
  onGo,
}: {
  state: GameStateV2;
  requirements: readonly Requirement[];
  onGo: (target: FocusTarget) => void;
}) {
  const words = useT();
  const { t } = words;
  return (
    <ul className="flex flex-col gap-1">
      {requirements.map((requirement, index) => {
        const met = isMet(state, requirement);
        // "Go" for an anyOf goes where its first option is done.
        const target = met ? null : requirementTarget(requirement.type === 'anyOf' ? requirement.options[0] : requirement);
        const step = progress(state, requirement, t);
        return (
          <li key={index} className="flex items-center gap-1.5 text-[11px] font-bold leading-tight">
            {met ? (
              <UiIcon name="check" />
            ) : (
              <Circle className="w-3 h-3 shrink-0 text-indigo-300" />
            )}
            <span className={`flex-1 min-w-0 ${met ? 'text-slate-400 line-through' : 'text-indigo-900/70'}`}>
              {requirementText(requirement, words)}
              {step && <span className="ml-1 text-violet-600 tabular-nums">{step}</span>}
            </span>
            {target && (
              <button
                type="button"
                onClick={() => onGo(target)}
                className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700 transition-all active:scale-95"
              >
                {t('requirement.go')}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

import { Briefcase, ChevronRight } from 'lucide-react';
import type { Requirement } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { requirementTarget, requirementText } from '../career/requirementText';
import type { FocusTarget } from '../home/focus';
import { GameButton } from '../kit';

// A home or a vehicle that asks for a career the player lacks (config/housing.ts careerAsk): the job
// row it needs, and "Go" to the job tree's tab of that row.

export function CareerAsk({ asks, onGo }: { asks: Requirement[]; onGo: (target: FocusTarget) => void }) {
  const words = useT();
  const first = asks[0];
  if (!first) return null;
  const target = requirementTarget(first);
  return (
    <GameButton
      tone="soft"
      onClick={() => {
        if (!target) return;
        playSfx('click');
        haptic('light');
        onGo(target);
      }}
      className="min-h-11 -mt-1 py-2 pl-3 pr-2 flex items-center justify-center gap-1.5"
    >
      <Briefcase className="w-4 h-4 shrink-0 text-violet-600" />
      <span className="v2-display text-[13px] text-indigo-900">{requirementText(first, words)}</span>
      <span className="ml-auto flex items-center rounded-full bg-violet-100 pl-2 pr-1 py-0.5 text-[11px] font-black text-violet-700">
        {words.t('requirement.go')}
        <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </GameButton>
  );
}

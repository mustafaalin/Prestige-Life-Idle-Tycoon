import { useEffect, useRef, useState } from 'react';
import { SKILL_IDS } from '../../core/config/skills';
import type { SkillId } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';

// A skill trained a level while playing (docs/game-design-v2.md §4.15): a banner drops in at the top
// for a few seconds wherever the player is, saying the level waits to be collected; a tap opens the
// "Me" tab.

const SHOW_MS = 3500;

export function SkillToast({ onOpen }: { onOpen: () => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  const banks = SKILL_IDS.map((id) => game.skillBank[id] ?? 0).join(',');
  const seen = useRef(banks);
  const [shown, setShown] = useState<{ skillId: SkillId; level: number } | null>(null);

  useEffect(() => {
    const before = seen.current.split(',').map(Number);
    seen.current = banks;
    const now = banks.split(',').map(Number);
    const index = now.findIndex((bank, i) => bank > before[i]);
    if (index < 0) return;
    const skillId = SKILL_IDS[index];
    setShown({ skillId, level: (game.skills[skillId] ?? 0) + now[index] });
    playSfx('unlock');
    haptic('light');
  }, [banks, game.skills]);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(null), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [shown]);

  if (!shown) return null;
  return (
    <div className="pointer-events-none absolute inset-x-3 top-2 z-[60] flex justify-center">
      <button
        type="button"
        onClick={() => {
          setShown(null);
          onOpen();
        }}
        className="v2-pop-in pointer-events-auto w-full max-w-[360px] flex items-center gap-2.5 rounded-[20px] border-2 border-white bg-gradient-to-b from-violet-400 to-indigo-600 v2-glossy px-3 py-2 text-left shadow-xl"
      >
        <span className="v2-display text-[14px] leading-tight text-white v2-shadow">
          {t('skills.toast', { skill: t(`skills.names.${shown.skillId}`), level: shown.level })}
        </span>
      </button>
    </div>
  );
}

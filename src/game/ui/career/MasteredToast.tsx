import { useEffect, useRef, useState } from 'react';
import { careerDef } from '../../core/config/careers';
import { isMastered } from '../../core/requirements';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { JobIcon } from './JobIcon';

// The "Master!" moment (docs/career-redesign.md §4): the job held reaches 100% mastery wherever the
// player is, so a banner drops in at the top for a few seconds; a tap opens the career screen.

const SHOW_MS = 4000;

export function MasteredToast({ onOpen }: { onOpen: () => void }) {
  const { game } = useGameV2();
  const { t, name } = useT();
  const careerId = game.careerId;
  const mastered = careerId !== null && isMastered(game, careerId);
  // The job and whether it was mastered at the last render: only a change while playing counts.
  const seen = useRef({ careerId, mastered });
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const before = seen.current;
    seen.current = { careerId, mastered };
    if (!mastered || careerId === null || before.careerId !== careerId || before.mastered) return;
    setShown(careerId);
    playSfx('unlock');
    haptic('medium');
  }, [careerId, mastered]);

  useEffect(() => {
    if (shown === null) return;
    const timer = window.setTimeout(() => setShown(null), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [shown]);

  const career = careerDef(shown);
  if (!career) return null;
  return (
    <button
      type="button"
      onClick={() => {
        setShown(null);
        onOpen();
      }}
      className="v2-pop-in pointer-events-auto absolute left-1/2 -translate-x-1/2 top-2 z-[60] w-[calc(100%-24px)] max-w-[360px] flex items-center gap-2.5 rounded-[20px] border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy px-2.5 py-2 text-left shadow-xl"
    >
      <JobIcon career={career} size={44} mastery={1} />
      <span className="flex-1 min-w-0 v2-display text-[14px] leading-tight text-white v2-shadow">
        {t('career.masteredToast', { job: name('career', career) })}
      </span>
    </button>
  );
}

import { Heart, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { GameButton } from '../kit';
import { portraitOf } from './ceremonyScript';
import { portalRoot } from '../stage';

// Mom's message on a return session (story-v2.md §4): a phone-style card with her portrait. The only
// answer is a heart; it floats up and the card closes. Also the opt-in card for reminders.

/** Mom's face for the messages that are not plain cheerful. */
const FACE: Record<string, 'smile' | 'teary'> = { stair: 'teary', workshop: 'teary', job: 'teary' };

const HEART_MS = 650;

export function MomMessage({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  useEffect(() => playSfx('message'), []);

  const send = () => {
    if (sent) return;
    setSent(true);
    playSfx('click');
    haptic('light');
    window.setTimeout(onClose, HEART_MS);
  };

  useBackButton(true, 80, send);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-center justify-center px-6">
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-gradient-to-b from-amber-50 to-white shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400">
          <img
            src={portraitOf('mom', FACE[messageId] ?? 'smile') ?? ''}
            alt=""
            draggable={false}
            className="w-14 h-14 rounded-full object-cover border-[3px] border-white shadow"
          />
          <div className="flex-1">
            <p className="v2-display v2-outline-thin text-xl text-white">{t('mom.from')}</p>
          </div>
          <Phone className="w-5 h-5 text-white/90" />
        </div>
        <div className="px-4 pt-4 pb-5">
          {/* Chat bubble from Mom. */}
          <div className="relative rounded-[20px] rounded-tl-md bg-white border-2 border-amber-100 px-4 py-3 shadow-sm">
            <p className="text-[16px] font-bold leading-snug text-slate-800">
              {t(`mom.${messageId}` as Parameters<typeof t>[0])}
            </p>
          </div>
          <div className="relative mt-4">
            {sent && (
              <Heart className="v2-float-up absolute left-1/2 -translate-x-1/2 -top-6 w-10 h-10 fill-rose-500 text-rose-500 pointer-events-none" />
            )}
            <GameButton tone="gold" onClick={send} className="w-full py-3 v2-display text-lg v2-shadow flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 fill-white" />
              {t('mom.reply')}
            </GameButton>
          </div>
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}

/** Asked once, after the first ceremony, before the OS dialog (so the system prompt comes with a reason). */
export function NotifyPrompt({ onAnswer }: { onAnswer: (yes: boolean) => void }) {
  const { t } = useT();

  useBackButton(true, 80, () => onAnswer(false));

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-end">
      <div className="v2-sheet-in w-full rounded-t-[28px] bg-white shadow-2xl px-5 pt-5 pb-[calc(var(--safe-bottom)+20px)] text-center">
        <div className="flex justify-center -space-x-3">
          <img src={portraitOf('mom', 'smile') ?? ''} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" />
          <img src="/assets/scene/sans-sit.webp" alt="" className="w-16 h-16 rounded-full object-contain bg-amber-100 border-4 border-white shadow-lg" />
        </div>
        <h2 className="v2-display text-xl text-slate-900 mt-3">{t('notify.askTitle')}</h2>
        <p className="text-sm font-bold text-slate-600 mt-1">{t('notify.askBody')}</p>
        <GameButton tone="buy" onClick={() => onAnswer(true)} className="w-full mt-4 py-3 v2-display text-lg v2-shadow">
          {t('notify.askYes')}
        </GameButton>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="w-full mt-2 rounded-2xl py-3 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
        >
          {t('notify.askNo')}
        </button>
      </div>
    </div>,
    portalRoot(),
  );
}

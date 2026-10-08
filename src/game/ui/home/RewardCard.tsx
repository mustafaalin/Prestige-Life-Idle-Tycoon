import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';

// A moment the player confirms with one tap: a reward (Şans's find, offline earnings; the amount is
// large enough to read, then coins fly from it into the wallet) or a new manager joining.

interface RewardCardProps {
  image: string;
  title: string;
  body?: string;
  amount?: string;
  note?: string;
  /** Button text; "Collect" by default. */
  actionLabel?: string;
  /** Show the image as a round portrait (people) instead of a cut-out. */
  portrait?: boolean;
  /** Gets the amount's position on screen, so coins can start there. */
  onCollect: (from: { x: number; y: number }) => void;
}

export function RewardCard({ image, title, body, amount, note, actionLabel, portrait, onCollect }: RewardCardProps) {
  const { t } = useT();
  const amountRef = useRef<HTMLParagraphElement>(null);

  const collect = () => {
    const rect = amountRef.current?.getBoundingClientRect();
    onCollect(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 });
  };

  // Android back collects (the card's only action).
  useBackButton(true, 70, collect);

  // Portaled to <body>: a sheet's slide-in animation would otherwise trap the fixed overlay inside it.
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6">
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
        <div className="relative h-36 bg-gradient-to-b from-amber-300 to-orange-500 overflow-hidden">
          <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />
          {portrait ? (
            <img
              src={image}
              alt=""
              draggable={false}
              className="relative mx-auto mt-3 w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
            />
          ) : (
            <img
              src={image}
              alt=""
              draggable={false}
              className="relative mx-auto mt-3 h-32 object-contain drop-shadow-xl"
            />
          )}
        </div>
        <div className="px-5 pt-3 pb-5">
          <h2 className="v2-display text-xl text-slate-900">{title}</h2>
          {body && <p className="text-sm font-bold text-slate-600 mt-1">{body}</p>}
          {amount && (
            <p
              ref={amountRef}
              className="v2-display v2-outline text-[40px] leading-tight text-emerald-400 tabular-nums my-2"
            >
              {amount}
            </p>
          )}
          {note && <p className="text-[11px] font-semibold text-slate-500 mt-2 mb-3">{note}</p>}
          <button
            type="button"
            onClick={collect}
            className="w-full rounded-2xl py-3 v2-display text-lg text-white v2-shadow bg-gradient-to-b from-emerald-400 to-green-600 border-2 border-white/70 v2-glossy transition-all active:scale-[0.98]"
          >
            {actionLabel ?? t('common.collect')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

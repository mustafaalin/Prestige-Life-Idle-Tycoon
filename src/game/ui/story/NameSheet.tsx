import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { HERO_NAME_MAX } from '../../runtime/story';
import { GameButton } from '../kit';
import { portalRoot } from '../stage';

// A character asks for a name (the hero's after the first business, his daughter's when she is born):
// the default is filled in, so one tap keeps it.

const TONES = {
  emerald: { bubble: 'bg-emerald-50 border-emerald-100', label: 'text-emerald-600' },
  pink: { bubble: 'bg-pink-50 border-pink-100', label: 'text-pink-600' },
} as const;

interface NameSheetProps {
  /** Who asks: name tag, portrait (none until the art lands) and bubble colour. */
  speaker: string;
  portrait: string | null;
  tone: keyof typeof TONES;
  question: string;
  label: string;
  defaultName: string;
  confirm: string;
  onDone: (name: string) => void;
}

export function NameSheet({ speaker, portrait, tone, question, label, defaultName, confirm, onDone }: NameSheetProps) {
  const [name, setName] = useState(defaultName);

  const finish = () => {
    playSfx('levelUp');
    haptic('medium');
    onDone(name.trim() || defaultName);
  };

  useBackButton(true, 80, finish);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    finish();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-end">
      <form
        onSubmit={submit}
        className="v2-sheet-in w-full rounded-t-[28px] bg-white shadow-2xl px-5 pt-5 pb-[calc(var(--safe-bottom)+20px)]"
      >
        <div className="flex items-start gap-3">
          {portrait && (
            <img
              src={portrait}
              alt=""
              draggable={false}
              className="shrink-0 w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg bg-slate-200"
            />
          )}
          <div className={`flex-1 rounded-[18px] rounded-tl-md border-2 px-3 py-2 ${TONES[tone].bubble}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${TONES[tone].label}`}>{speaker}</p>
            <p className="text-[15px] font-bold leading-snug text-slate-800">{question}</p>
          </div>
        </div>
        <label className="block mt-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, HERO_NAME_MAX))}
            onFocus={(event) => event.target.select()}
            maxLength={HERO_NAME_MAX}
            autoComplete="off"
            enterKeyHint="done"
            className="mt-1 w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/60 px-4 py-3 v2-display text-xl text-indigo-950 outline-none focus:border-violet-400"
          />
        </label>
        <GameButton tone="buy" type="submit" className="w-full mt-4 py-3 v2-display text-lg v2-shadow">
          {confirm}
        </GameButton>
      </form>
    </div>,
    portalRoot(),
  );
}

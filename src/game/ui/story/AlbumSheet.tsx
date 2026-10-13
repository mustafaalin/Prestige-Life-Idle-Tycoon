import { Lock, Play, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { WEALTH_CLASSES } from '../../core/config/classes';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { ICONS } from '../icons';
import { ALBUM, albumAge, albumCover, albumKey, albumSeen, type AlbumEntry } from './album';
import { StoryReplay } from './Ceremony';

// The family album (story-v2.md §7): one page with every story moment, the ones lived as pictures,
// the rest locked. Tapping a picture plays that moment again; nothing is saved, paid or stopped by it.

/** One album picture, cropped to the box `className` gives it. */
export function AlbumPicture({ entry, className = '' }: { entry: AlbumEntry; className?: string }) {
  const cover = albumCover(entry);
  if (!cover) return <div className={`bg-gradient-to-b from-amber-200 to-orange-300 ${className}`} />;
  return cover.portrait ? (
    <div className={`bg-gradient-to-b from-amber-200 to-orange-300 flex items-center justify-center ${className}`}>
      <img src={cover.src} alt="" draggable={false} className="w-[72%] aspect-square rounded-full object-cover border-2 border-white shadow" />
    </div>
  ) : (
    // A story frame keeps its lower third empty for the speech bubble: the page shows its top.
    <img src={cover.src} alt="" draggable={false} className={`object-cover object-top ${className}`} />
  );
}

export function AlbumSheet({ onClose, onReplay }: { onClose: () => void; onReplay: (playing: boolean) => void }) {
  const { state } = useGameV2();
  const { t, name } = useT();
  const [playing, setPlaying] = useState<AlbumEntry | null>(null);

  useBackButton(true, 50, onClose);

  const seenCount = ALBUM.filter((entry) => albumSeen(entry, state.story)).length;

  const play = (entry: AlbumEntry | null) => {
    setPlaying(entry);
    onReplay(entry !== null);
  };

  return (
    <div className="v2-sheet-in absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-indigo-100 shadow-2xl overflow-hidden pointer-events-auto">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500">
        <img src={ICONS.album} alt="" draggable={false} className="w-9 h-9 object-contain drop-shadow" />
        <h2 className="flex-1 min-w-0 v2-display v2-outline-thin text-xl text-white truncate">{t('album.title')}</h2>
        <span className="shrink-0 rounded-full bg-black/25 px-2.5 py-0.5 v2-display text-[12px] text-white tabular-nums">
          {seenCount}/{ALBUM.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="relative v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 bg-gradient-to-b from-sky-100 to-indigo-100">
        <p className="px-1 text-[12px] font-bold text-indigo-900/60">{t(seenCount > 0 ? 'album.hint' : 'album.empty')}</p>
        <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
          {ALBUM.map((entry) => {
            const seen = albumSeen(entry, state.story);
            const label =
              entry.kind === 'ceremony' ? t('ceremony.newClass') : t('hud.ageShort', { age: albumAge(entry) });
            // The class ladder is no secret; what a coming year of life holds is.
            const title =
              entry.kind === 'ceremony'
                ? name('wealthClass', WEALTH_CLASSES[entry.classIndex])
                : seen
                  ? t(`moments.${entry.id}.title` as MessageKey)
                  : '?';
            const caption = (
              <div className="px-1 pt-1.5 pb-1 text-left">
                <p className={`text-[10px] font-black uppercase tracking-widest ${seen ? 'text-amber-600' : 'text-slate-400'}`}>
                  {label}
                </p>
                <p className={`text-[13px] font-black leading-tight break-words ${seen ? 'text-slate-900' : 'text-slate-400'}`}>
                  {title}
                </p>
              </div>
            );
            return (
              <li key={albumKey(entry)}>
                {seen ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      haptic('light');
                      play(entry);
                    }}
                    className="block w-full h-full rounded-[22px] bg-white border-2 border-white p-1.5 shadow-[0_4px_14px_rgba(30,41,99,0.12)] transition-all active:scale-[0.98]"
                  >
                    <div className="relative">
                      <AlbumPicture entry={entry} className="w-full aspect-[4/5] rounded-2xl" />
                      <span className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-full bg-black/45 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </span>
                    </div>
                    {caption}
                  </button>
                ) : (
                  <div className="h-full rounded-[22px] bg-white/60 border-2 border-white p-1.5">
                    <div className="w-full aspect-[4/5] rounded-2xl bg-slate-200 flex flex-col items-center justify-center gap-1.5 px-2 text-center">
                      <Lock className="w-6 h-6 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-500">{t('album.locked')}</span>
                    </div>
                    {caption}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {playing &&
        createPortal(
          <StoryReplay
            key={albumKey(playing)}
            entry={playing}
            onDone={(skipped) => {
              track('story_view', { kind: 'album', id: albumKey(playing), skipped, replay: true });
              play(null);
            }}
          />,
          document.body,
        )}
    </div>
  );
}

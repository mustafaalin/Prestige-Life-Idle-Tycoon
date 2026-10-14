import { Lock, Newspaper, Trophy, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { RICH_LIST_ENTRY, RICH_RIVALS, type RichMilestoneDef } from '../../core/config/richList';
import { richListRank, richListTarget, rivalFortune } from '../../core/formulas';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { managerPortrait } from '../businesses/managers';
import { GameButton } from '../kit';
import { portraitOf } from '../story/ceremonyScript';

// The Rich List (discussion-notes §10): a button on the home scene with the hero's place, a sheet with
// the named top 20, and the short card a new place brings. Fictional; the rank follows this life's
// earnings, so it never drops.

/** The button shows from the Millionaire ceremony on, locked until the list opens at $1B. */
export const RICH_BUTTON_CLASS = 4;

function useRankText() {
  const { locale } = useT();
  const format = new Intl.NumberFormat(locale);
  return (rank: number) => `#${format.format(rank)}`;
}

export function RichListButton({ onOpen }: { onOpen: () => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  const rankText = useRankText();
  const rank = richListRank(game.generationEarnings);

  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        haptic('light');
        onOpen();
      }}
      aria-label={t('richList.open')}
      className="pointer-events-auto relative w-14 h-14 rounded-full border-2 border-white bg-gradient-to-b from-amber-200 to-orange-400 shadow-xl v2-glossy flex items-center justify-center transition-all active:scale-90"
    >
      <Trophy className="w-7 h-7 text-white drop-shadow" />
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white bg-indigo-600 px-1.5 py-px v2-display text-[11px] leading-tight text-white tabular-nums shadow">
        {rank === null ? <Lock className="w-3 h-3 my-0.5" /> : rankText(rank)}
      </span>
    </button>
  );
}

export function RichListSheet({ onClose }: { onClose: () => void }) {
  const { game, state } = useGameV2();
  const { t, money } = useT();
  const rankText = useRankText();
  useBackButton(true, 50, onClose);

  const earnings = game.generationEarnings;
  const rank = richListRank(earnings);
  const target = richListTarget(earnings);
  const heroName = state.story.heroName || t('richList.you');
  const rivalName = (index: number) =>
    RICH_RIVALS[index].family ? t('richList.family', { name: RICH_RIVALS[index].name }) : RICH_RIVALS[index].name;

  const goal =
    target.kind === 'entry'
      ? t('richList.locked', { amount: money(RICH_LIST_ENTRY) })
      : target.kind === 'place'
        ? t('richList.nextPlace', { rank: target.rank })
        : target.kind === 'rival'
          ? t('richList.next', { name: rivalName(target.rivalIndex) })
          : t('richList.top');

  const rows = RICH_RIVALS.map((rival, index) => ({
    key: rival.name,
    name: rivalName(index),
    detail: t(`richList.sector.${rival.sector}` as MessageKey),
    fortune: rivalFortune(index, earnings),
    hero: false,
  }));
  const heroRow = { key: 'hero', name: heroName, detail: t('richList.basis'), fortune: earnings, hero: true };
  const inTop = rank !== null && rank <= rows.length + 1;
  if (inTop) rows.splice(rank - 1, 0, heroRow);

  const row = (entry: (typeof rows)[number], place: number | null) => (
    <li
      key={entry.key}
      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 ${
        entry.hero ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300' : 'bg-white'
      }`}
    >
      <span className="min-w-12 shrink-0 v2-display text-[15px] text-indigo-700 tabular-nums">
        {place === null ? '—' : rankText(place)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-black leading-tight text-slate-900 break-words">{entry.name}</p>
        <p className="text-[11px] font-semibold text-slate-500 leading-tight">{entry.detail}</p>
      </div>
      <span className="shrink-0 text-[14px] font-black text-emerald-600 tabular-nums">{money(entry.fortune)}</span>
    </li>
  );

  return (
    <div className="v2-sheet-in absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-indigo-100 shadow-2xl overflow-hidden pointer-events-auto">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500">
        <Trophy className="w-8 h-8 text-amber-300 drop-shadow" />
        <h2 className="flex-1 min-w-0 v2-display v2-outline-thin text-xl text-white truncate">{t('richList.title')}</h2>
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
        <div className="rounded-[22px] bg-white border-2 border-amber-200 px-4 py-3 text-center shadow-[0_4px_14px_rgba(30,41,99,0.12)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{heroName}</p>
          <p className="v2-display text-4xl text-indigo-700 tabular-nums leading-tight">
            {rank === null ? <Lock className="inline w-8 h-8 text-slate-400" /> : rankText(rank)}
          </p>
          <p className="text-[12px] font-bold text-slate-500">
            {t('richList.basis')}: {money(earnings)}
          </p>
          <p className="mt-1.5 text-[13px] font-black text-slate-800">{goal}</p>
          {target.kind !== 'top' && (
            <p className="text-[12px] font-bold text-emerald-600">{t('richList.toGo', { amount: money(target.gap) })}</p>
          )}
        </div>

        <ul className="mt-3 flex flex-col gap-1.5">
          {rows.map((entry, index) => row(entry, index + 1))}
          {!inTop && (
            <>
              <li aria-hidden className="text-center v2-display text-slate-400 leading-none py-0.5">···</li>
              {row(heroRow, rank)}
            </>
          )}
        </ul>
        <p className="mt-3 px-1 text-[11px] font-semibold text-indigo-900/50 text-center">{t('richList.fiction')}</p>
      </div>
    </div>
  );
}

const SPEAKER_FACE = { bryce: 'smug', mom: 'smile', riza: 'warm' } as const;

/** The short card a new place on the list brings: who reacts, the place, one line. */
export function RichMoment({
  milestone,
  onClose,
  onOpenList,
}: {
  milestone: RichMilestoneDef;
  onClose: () => void;
  onOpenList: () => void;
}) {
  const { game } = useGameV2();
  const { t } = useT();
  const rankText = useRankText();
  const rank = richListRank(game.generationEarnings);
  useBackButton(true, 80, onClose);

  const { speaker } = milestone;
  const portrait =
    speaker === 'news' ? null : speaker === 'cousin' ? managerPortrait('tech-startup') : portraitOf(speaker, SPEAKER_FACE[speaker]);
  const speakerName =
    speaker === 'news'
      ? t('richList.news')
      : speaker === 'cousin'
        ? t('managers.tech-startup.name')
        : speaker === 'mom'
          ? t('mom.from')
          : t(`ceremony.cast.${speaker}`);
  const key = `richList.moments.${milestone.id}`;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-center justify-center px-6">
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-gradient-to-b from-amber-50 to-white shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-500">
          {portrait ? (
            <img src={portrait} alt="" draggable={false} className="w-14 h-14 rounded-full object-cover border-[3px] border-white shadow bg-amber-100" />
          ) : (
            <span className="w-14 h-14 rounded-full border-[3px] border-white bg-white/90 shadow flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-slate-700" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{t('richList.title')}</p>
            <p className="v2-display v2-outline-thin text-xl text-white leading-tight break-words">{speakerName}</p>
          </div>
          {rank !== null && (
            <span className="shrink-0 v2-display v2-outline-thin text-2xl text-amber-300 tabular-nums">{rankText(rank)}</span>
          )}
        </div>
        <div className="px-4 pt-3 pb-5">
          <p className="v2-display text-lg text-slate-900 leading-tight">{t(`${key}.title` as MessageKey)}</p>
          {milestone.id === 'entry' && (
            <p className="mt-1 text-[12px] font-semibold text-slate-500">{t('richList.moments.entry.note')}</p>
          )}
          <div className="mt-3 rounded-[20px] rounded-tl-md bg-white border-2 border-amber-100 px-4 py-3 shadow-sm">
            <p className="text-[16px] font-bold leading-snug text-slate-800">{t(`${key}.line` as MessageKey)}</p>
          </div>
          <GameButton tone="gold" onClick={onClose} className="w-full mt-4 py-3 v2-display text-lg v2-shadow">
            {t('richList.ok')}
          </GameButton>
          <button
            type="button"
            onClick={onOpenList}
            className="w-full mt-2 rounded-2xl py-3 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('richList.open')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

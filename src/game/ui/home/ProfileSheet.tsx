import { Pencil, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BUSINESSES } from '../../core/config/businesses';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { currentCareer, heroAge, richListRank } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { Cash } from '../CashAmount';
import { useRankText } from '../richList/useRankText';
import { NameSheet } from '../story/NameSheet';
import { portraitOf } from '../story/ceremonyScript';
import { portalRoot } from '../stage';
import { heroPortrait } from './heroPortrait';

// The hero's profile (2026-10-23, user): his face in the top bar, wearing what he wears on the scene
// (the grandfather's after 60), and a card with his name (it can be changed here), age, class and what
// this life has added up to. Nothing new is saved: every line is read from the game.

/** The round face at the left of the top bar; opens the profile. */
export function HeroAvatar({ onOpen }: { onOpen: () => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        onOpen();
      }}
      aria-label={t('profile.open')}
      className="shrink-0 w-12 h-12 max-[420px]:w-10 max-[420px]:h-10 max-[340px]:w-9 max-[340px]:h-9 rounded-full border-2 border-white/70 bg-gradient-to-b from-sky-300 to-indigo-500 shadow-md overflow-hidden transition-all active:scale-90"
    >
      <img src={heroPortrait(game)} alt="" draggable={false} className="w-full h-full object-cover" />
    </button>
  );
}

export function ProfileSheet({ onClose }: { onClose: () => void }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money } = useT();
  const rankText = useRankText();
  const [renaming, setRenaming] = useState(false);
  useBackButton(!renaming, 60, onClose);

  const heroName = state.story.heroName;
  const age = heroAge(game).years;
  const career = currentCareer(game);
  const opened = BUSINESSES.filter((def) => (game.businesses[def.id]?.level ?? 0) > 0).length;
  const rank = richListRank(game.generationEarnings);

  // The name sheet sits outside the card's overlay: a tap in it must not reach the overlay and close the card.
  return (
    <>
      {createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6" onClick={onClose}>
      <div
        className="v2-pop-in relative w-full max-w-[340px] rounded-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 shadow-2xl overflow-hidden text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-b from-violet-500 to-indigo-500 overflow-hidden">
          <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square opacity-60" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute right-3 top-3 v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <img
          src={heroPortrait(game)}
          alt=""
          draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-10 w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl bg-sky-200"
        />

        <div className="px-5 pt-16 pb-5 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setRenaming(true);
            }}
            className="flex items-center gap-1.5 rounded-full px-3 py-0.5 transition-all active:scale-95"
          >
            <span className="v2-display text-[24px] leading-tight text-indigo-950 break-all">{heroName || t('richList.you')}</span>
            <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-b from-violet-400 to-indigo-600 border-2 border-white shadow flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-white" aria-label={t('profile.rename')} />
            </span>
          </button>
          <p className="v2-display text-[14px] text-indigo-700">
            {t('profile.ageClass', { age, class: name('wealthClass', WEALTH_CLASSES[game.classIndex]) })}
          </p>

          <dl className="mt-3 w-full grid grid-cols-2 gap-2 text-left">
            <Stat label={t('profile.earned')}>
              <Cash size={16} className="tabular-nums">{money(game.generationEarnings)}</Cash>
            </Stat>
            <Stat label={t('profile.businesses')}>
              {t('profile.ofTotal', { count: opened, total: BUSINESSES.length })}
            </Stat>
            <Stat label={t('profile.job')}>{career ? name('career', career) : t('career.unemployed')}</Stat>
            <Stat label={t('richList.title')}>{rank === null ? '—' : rankText(rank)}</Stat>
            <Stat label={t('profile.bottles')}>{game.bottles.toLocaleString()}</Stat>
            <Stat label={t('profile.finds')}>{game.finds.toLocaleString()}</Stat>
          </dl>
        </div>
      </div>
    </div>,
        portalRoot(),
      )}
      {renaming && (
        <NameSheet
          speaker={t('ceremony.cast.riza')}
          portrait={portraitOf('riza', 'warm')}
          tone="emerald"
          question={t('profile.renameAsk')}
          label={t('guide.nameLabel')}
          defaultName={heroName || t('guide.defaultName')}
          confirm={t('guide.nameOk')}
          onDone={(next) => {
            actions.story.setHeroName(next);
            setRenaming(false);
          }}
        />
      )}
    </>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 border-2 border-white px-3 py-2">
      <dt className="text-[10px] font-black uppercase tracking-wide text-indigo-900/50">{label}</dt>
      <dd className="v2-display text-[15px] leading-tight text-indigo-950 break-words">{children}</dd>
    </div>
  );
}

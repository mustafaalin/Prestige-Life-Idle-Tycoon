import { useState, type ReactNode } from 'react';
import { BUSINESSES } from '../../core/config/businesses';
import { heroAge, legacyAvailable, pendingLegacyPoints } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { storyRuns } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { ICONS } from '../icons';
import { GameButton, ImageTile } from '../kit';
import { ALBUM, albumKey, albumSeen } from '../story/album';
import { AlbumPicture } from '../story/AlbumSheet';

// The end of a life (game-design-v2 §4.9): what this life was (its pictures, its businesses) and what
// it leaves the heir (the family legacy), then the one button that hands the family over. The rules
// are the core's (state.ts `retire`); the foundation ceremony and the family tree are Faz 2.1.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`${wide ? 'flex-[1.4]' : 'flex-1'} min-w-0 rounded-2xl bg-slate-50 px-1 py-1.5 text-center`}>
      <p className="text-base font-black leading-tight text-slate-900 tabular-nums whitespace-nowrap">{value}</p>
      <p className="text-[10px] font-black uppercase text-slate-400 truncate">{label}</p>
    </div>
  );
}

export function RetirementPanel() {
  const { game, state, actions } = useGameV2();
  const { t, name, money } = useT();
  // The hand-over happens once: a second tap finds the button spent.
  const [retired, setRetired] = useState(false);

  const age = heroAge(game).years;
  const { heroName, daughterName } = state.story;
  const gained = pendingLegacyPoints(game);
  // Points the heir can spend: what is left unspent plus this life's.
  const total = legacyAvailable(game) + gained;
  const owned = BUSINESSES.filter((def) => (game.businesses[def.id]?.owned ?? 0) > 0);
  const managers = owned.filter((def) => game.businesses[def.id].managed).length;
  // The pictures are the first generation's life; an heir has none of their own yet (story §6).
  const pictures = storyRuns(game) ? ALBUM.filter((entry) => albumSeen(entry, state.story)) : [];

  const retire = () => {
    if (retired) return;
    setRetired(true);
    playSfx('levelUp');
    haptic('medium');
    actions.retire();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/35 flex items-center justify-center px-4 pt-[calc(var(--safe-top)+16px)] pb-[calc(var(--safe-bottom)+16px)]">
      <div className="v2-pop-in w-full max-w-[380px] max-h-full flex flex-col rounded-[28px] bg-white shadow-2xl overflow-hidden">
        <div className="shrink-0 flex items-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3">
          <img src={ICONS.retirement} alt="" draggable={false} className="shrink-0 w-14 h-14 object-contain drop-shadow" />
          <div className="min-w-0">
            <h2 className="v2-display v2-outline-thin text-xl leading-tight text-white">{t('life.title')}</h2>
            <p className="text-[12px] font-bold leading-snug text-white/90 break-words">
              {heroName ? t('life.retiresAtNamed', { name: heroName, age }) : t('life.retiresAt', { age })}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-600">
              {t('life.generation', { count: game.generation })}
            </span>
            {storyRuns(game) && daughterName && (
              <span className="min-w-0 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-black text-pink-600 break-words">
                {t('life.daughter', { name: daughterName })}
              </span>
            )}
          </div>

          {pictures.length > 0 && (
            <Section title={t('life.moments')}>
              <ul className="-mx-4 px-4 flex gap-2 overflow-x-auto">
                {pictures.map((entry) => (
                  <li key={albumKey(entry)} className="shrink-0">
                    <AlbumPicture entry={entry} className="w-[68px] h-[85px] rounded-xl border-2 border-white shadow" />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title={t('life.businesses')}>
            <div className="flex gap-2">
              <Stat label={t('life.statBusinesses')} value={String(owned.length)} />
              <Stat label={t('life.statManagers')} value={String(managers)} />
              <Stat label={t('life.statEarned')} value={money(game.generationEarnings)} wide />
            </div>
            {owned.length > 0 ? (
              <ul className="mt-2 grid grid-cols-5 gap-x-1.5 gap-y-2">
                {owned.map((def) => (
                  <li key={def.id} className="flex flex-col items-center">
                    <ImageTile className="w-12 h-12">
                      <img src={def.image} alt={name('business', def)} draggable={false} className="w-[85%] h-[85%] object-contain" />
                    </ImageTile>
                    <span className="mt-0.5 text-[11px] font-black text-slate-500 tabular-nums">×{game.businesses[def.id].owned}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('life.noBusiness')}</p>
            )}
          </Section>

          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <img src={ICONS.legacy} alt="" draggable={false} className="shrink-0 w-14 h-14 object-contain drop-shadow" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t('life.legacy')}</p>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-2xl font-black leading-tight text-slate-900 tabular-nums">{total}</span>
                <span className="text-[12px] font-black text-emerald-500 tabular-nums">{t('life.legacyGain', { gained })}</span>
              </p>
              <p className="text-[11px] font-semibold leading-snug text-slate-500">
                {t('life.legacySpend')}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 pt-3 pb-4">
          <GameButton tone="manager" onClick={retire} disabled={retired} className="w-full py-3 v2-display text-lg v2-shadow">
            {t('life.retire')}
          </GameButton>
        </div>
      </div>
    </div>
  );
}

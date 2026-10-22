import { useState } from 'react';
import { HEIRLOOMS, type HeirloomDef, type HeirloomId } from '../../core/config/heirlooms';
import { RETIREMENT_AGE } from '../../core/config/life';
import { heirloomCap, heirloomLevel, heirloomPrice, heroAge, jamCash, legacyAvailable, pendingLegacyPoints } from '../../core/formulas';
import { canHandOverEarly } from '../../core/state';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { ICONS } from '../icons';
import { BandTile, Chip, GameButton, Panel, SectionLabel, SpeakerLine } from '../kit';
import { requestYearsPassed } from '../story/storyEvents';

// The family tab (plan 2.12, game-design-v2.md §4.10): from the top class on, what the heir would get
// now ("Hand over now" skips the remaining years; staying grows it), and the family heirlooms that
// legacy points buy and every later heir keeps. Rules: core/state.ts (handOverEarly, buyHeirloom).

const ICON: Record<HeirloomId, string> = {
  watch: ICONS.heirloomWatch,
  jam: ICONS.heirloomJam,
  notebook: ICONS.heirloomNotebook,
  collar: ICONS.heirloomCollar,
  album: ICONS.album,
};

/** Each heirloom's band on its tile. */
const BAND: Record<HeirloomId, string> = {
  watch: 'from-amber-400 to-orange-600',
  jam: 'from-rose-400 to-pink-600',
  notebook: 'from-sky-400 to-blue-500',
  collar: 'from-emerald-400 to-green-600',
  album: 'from-violet-400 to-indigo-600',
};

/** Who speaks on the family tab: Mom in the first life, the hero as grandpa to the heirs after. */
function useSpeaker() {
  const { game } = useGameV2();
  const { t } = useT();
  return game.generation > 1
    ? { portrait: '/assets/story/portraits/grandpa-soft.webp', name: t('family.grandpa'), text: t('family.grandpaLine') }
    : { portrait: '/assets/story/portraits/mom-smile.webp', name: t('prologue.speaker.mom'), text: t('family.momLine') };
}
export function FamilyScreen({ onClose }: { onClose: () => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  const available = legacyAvailable(game);
  const speaker = useSpeaker();

  return (
    <section className="flex flex-col gap-3">
      {canHandOverEarly(game) && <HandOver onClose={onClose} />}

      <SpeakerLine {...speaker} />

      <Panel className="p-3 flex items-center gap-3">
        <img src={ICONS.legacy} alt="" draggable={false} className="shrink-0 w-16 h-16 object-contain drop-shadow" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t('family.points')}</p>
          <p className="v2-display v2-outline text-[34px] leading-none text-amber-300 tabular-nums">{available}</p>
          <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">{t('family.pointsHint')}</p>
        </div>
      </Panel>

      <SectionLabel>{t('family.heirlooms')}</SectionLabel>
      <div className="flex flex-wrap justify-center gap-2">
        {HEIRLOOMS.map((def) => (
          <HeirloomTile key={def.id} def={def} available={available} />
        ))}
      </div>
    </section>
  );
}

function HandOver({ onClose }: { onClose: () => void }) {
  const { game, actions } = useGameV2();
  const { t } = useT();
  const [confirming, setConfirming] = useState(false);
  const pending = pendingLegacyPoints(game);

  const handOver = () => {
    const age = heroAge(game).years;
    if (!actions.handOverEarly()) return;
    playSfx('levelUp');
    haptic('medium');
    // Back to the scene: the skipped years pass, then the last life moments play (StoryDirector).
    onClose();
    requestYearsPassed(age);
  };

  return (
    <Panel accent className="overflow-hidden">
      <div className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500">
        <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">{t('family.handTitle')}</p>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <p className="v2-display text-[26px] leading-tight text-emerald-500 v2-outline-thin tabular-nums">
          {t('family.pending', { points: pending })}
        </p>
        <p className="text-[12px] font-semibold leading-snug text-slate-500">{t('family.stayHint')}</p>
        {confirming ? (
          <>
            <p className="text-[13px] font-bold leading-snug text-slate-700">{t('family.confirm', { age: RETIREMENT_AGE })}</p>
            <div className="flex gap-2.5">
              <GameButton tone="soft" onClick={() => setConfirming(false)} className="flex-1 py-2.5 v2-display text-[15px]">
                {t('family.cancel')}
              </GameButton>
              <GameButton tone="manager" onClick={handOver} className="flex-1 py-2.5 v2-display text-[15px] v2-shadow">
                {t('family.confirmYes')}
              </GameButton>
            </div>
          </>
        ) : (
          <div className="flex gap-2.5">
            <GameButton
              tone="soft"
              onClick={() => {
                playSfx('click');
                onClose();
              }}
              className="flex-1 py-2.5 v2-display text-[15px]"
            >
              {t('family.stay')}
            </GameButton>
            <GameButton
              tone="manager"
              onClick={() => {
                playSfx('click');
                setConfirming(true);
              }}
              className="flex-1 py-2.5 v2-display text-[15px] v2-shadow"
            >
              {t('family.handNow')}
            </GameButton>
          </div>
        )}
      </div>
    </Panel>
  );
}

/** An heirloom on its tile: band, level, icon, what it gives now (big) and next, and the price in points. */
function HeirloomTile({ def, available }: { def: HeirloomDef; available: number }) {
  const { game, actions } = useGameV2();
  const { t, money } = useT();
  const level = heirloomLevel(game, def.id);
  const cap = heirloomCap(def, game.generation);
  const price = heirloomPrice(def, level);
  const maxed = level >= cap;
  const [bump, setBump] = useState(0);

  const figure = (at: number) =>
    def.id === 'jam'
      ? money(jamCash(at))
      : t(def.id === 'notebook' ? 'family.figure.cheaper' : 'family.figure.percent', { percent: Math.round(at * def.perLevel * 100) });

  const buy = () => {
    if (!actions.buyHeirloom(def.id)) return;
    playSfx('unlock');
    haptic('medium');
    setBump(Date.now());
  };

  return (
    <BandTile
      band={BAND[def.id]}
      title={t(`family.items.${def.id}.name`)}
      chip={<Chip tone="soft">{t('family.level', { level, cap })}</Chip>}
      picture={
        <span className="relative">
          <img key={bump} src={ICON[def.id]} alt="" draggable={false} className={`${bump ? 'v2-bump' : ''} w-[50px] h-[50px] object-contain drop-shadow`} />
          {bump > 0 && (
            <span
              key={`up-${bump}`}
              className="v2-float-up pointer-events-none absolute left-1/2 top-0 whitespace-nowrap v2-display v2-outline-thin text-[15px] text-emerald-400 tabular-nums"
              aria-hidden
            >
              {figure(level)}
            </span>
          )}
        </span>
      }
      figure={
        <span className="flex flex-col items-center leading-none px-1 text-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t(`family.what.${def.id}`)}</span>
          <span className={`v2-display v2-outline-thin tabular-nums text-[20px] max-w-full truncate ${level > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {level > 0 ? figure(level) : '—'}
          </span>
          {!maxed && !def.comingSoon && (
            <span className="mt-0.5 text-[10px] font-black text-slate-400 tabular-nums">{t('family.next', { figure: figure(level + 1) })}</span>
          )}
        </span>
      }
      button={
        def.comingSoon || maxed ? (
          <span className="flex items-center justify-center rounded-full bg-slate-200 py-1 v2-display text-[12px] text-slate-500">
            {t(def.comingSoon ? 'family.soonShort' : 'family.maxedShort')}
          </span>
        ) : (
          <GameButton tone="gold" onClick={buy} disabled={price > available} className="w-full min-h-0 py-1 rounded-full v2-display text-[12px] v2-shadow tabular-nums">
            {t('family.buy', { points: price })}
          </GameButton>
        )
      }
    />
  );
}

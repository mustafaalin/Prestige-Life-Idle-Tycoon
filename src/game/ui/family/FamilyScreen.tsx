import { Cherry, Images, NotebookPen, PawPrint, Watch, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { HEIRLOOMS, type HeirloomDef, type HeirloomId } from '../../core/config/heirlooms';
import { RETIREMENT_AGE } from '../../core/config/life';
import { heirloomCap, heirloomLevel, heirloomPrice, jamCash, legacyAvailable, pendingLegacyPoints } from '../../core/formulas';
import { canHandOverEarly } from '../../core/state';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { ICONS } from '../icons';
import { Chip, GameButton, Panel, SectionLabel } from '../kit';

// The family tab (plan 2.12, game-design-v2.md §4.5): from the top class on, what the heir would get
// now ("Hand over now" skips the remaining years; staying grows it), and the family heirlooms that
// legacy points buy and every later heir keeps. Rules: core/state.ts (handOverEarly, buyHeirloom).

const LOOK: Record<HeirloomId, { icon: LucideIcon; tile: string }> = {
  watch: { icon: Watch, tile: 'from-amber-300 to-orange-500' },
  jam: { icon: Cherry, tile: 'from-fuchsia-300 to-purple-600' },
  notebook: { icon: NotebookPen, tile: 'from-sky-300 to-blue-500' },
  collar: { icon: PawPrint, tile: 'from-rose-300 to-red-500' },
  album: { icon: Images, tile: 'from-emerald-300 to-green-500' },
};

export function FamilyScreen({ onClose }: { onClose: () => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  const available = legacyAvailable(game);

  return (
    <section className="flex flex-col gap-3">
      {canHandOverEarly(game) && <HandOver onStay={onClose} />}

      <Panel className="p-3 flex items-center gap-3">
        <img src={ICONS.legacy} alt="" draggable={false} className="shrink-0 w-14 h-14 object-contain drop-shadow" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t('family.points')}</p>
          <p className="v2-display text-[26px] leading-tight text-indigo-950 tabular-nums">{available}</p>
          <p className="text-[11px] font-semibold leading-snug text-slate-500">{t('family.pointsHint')}</p>
        </div>
      </Panel>

      <SectionLabel>{t('family.heirlooms')}</SectionLabel>
      {HEIRLOOMS.map((def) => (
        <HeirloomCard key={def.id} def={def} available={available} />
      ))}
    </section>
  );
}

function HandOver({ onStay }: { onStay: () => void }) {
  const { game, actions } = useGameV2();
  const { t } = useT();
  const [confirming, setConfirming] = useState(false);
  const pending = pendingLegacyPoints(game);

  const handOver = () => {
    if (!actions.handOverEarly()) return;
    playSfx('levelUp');
    haptic('medium');
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
                onStay();
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

function HeirloomCard({ def, available }: { def: HeirloomDef; available: number }) {
  const { game, actions } = useGameV2();
  const { t, money } = useT();
  const look = LOOK[def.id];
  const level = heirloomLevel(game, def.id);
  const cap = heirloomCap(def, game.generation);
  const price = heirloomPrice(def, level);
  const maxed = level >= cap;

  const effect = (at: number) =>
    def.id === 'jam'
      ? t('family.effects.jam', { amount: money(jamCash(at)) })
      : t(`family.effects.${def.id}`, { percent: Math.round(at * def.perLevel * 100) });

  const buy = () => {
    if (!actions.buyHeirloom(def.id)) return;
    playSfx('purchase');
    haptic('medium');
  };

  return (
    <Panel className="p-3 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 w-12 h-12 rounded-2xl border-2 border-white v2-glossy bg-gradient-to-b ${look.tile} flex items-center justify-center`}
        >
          <look.icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="flex-1 min-w-0 v2-display text-[16px] leading-tight text-indigo-950">{t(`family.items.${def.id}.name`)}</p>
            <Chip tone="soft">{t('family.level', { level, cap })}</Chip>
          </div>
          <p className="text-[11px] font-semibold leading-snug text-slate-500">{t(`family.items.${def.id}.body`)}</p>
        </div>
      </div>
      <p className="v2-display text-[14px] text-emerald-600 tabular-nums">
        {level > 0 ? effect(level) : t('family.none')}
        {!maxed && <span className="text-slate-400"> → {effect(level + 1)}</span>}
      </p>
      {maxed ? (
        <p className="text-[11px] font-black text-center text-slate-400">{t('family.maxed')}</p>
      ) : (
        <GameButton
          tone="gold"
          onClick={buy}
          disabled={price > available}
          className="w-full py-2 v2-display text-[15px] v2-shadow tabular-nums"
        >
          {t('family.buy', { points: price })}
        </GameButton>
      )}
    </Panel>
  );
}

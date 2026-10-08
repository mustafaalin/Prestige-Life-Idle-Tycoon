import { Check, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { autoIncomePerSecond, statusBonus } from '../../core/formulas';
import { canMoveUp, nextLifestyle } from '../../core/state';
import type { GameStateV2, LifestyleKind } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { Focusable } from '../home/Focusable';
import { useFocus, type ShopTabId } from '../home/focus';
import { Chip, GameButton, Panel, Segmented, SectionLabel } from '../kit';
import { HousingPanel } from './HousingPanel';
import { Thumb } from './Thumb';

type ShopTab = ShopTabId;

const TABS: { kind: ShopTab; label: MessageKey }[] = [
  { kind: 'house', label: 'shop.house' },
  { kind: 'vehicle', label: 'shop.vehicle' },
  { kind: 'outfit', label: 'shop.outfit' },
  { kind: 'toy', label: 'shop.toy' },
];

/** How many not-yet-affordable dreams are previewed after the next one. */
const UPCOMING_COUNT = 3;

const percent = (fraction: number) => Math.round(fraction * 100);

/** Whether a tab has something the player can do right now (red dot). */
function tabReady(game: GameStateV2, tab: ShopTab) {
  if (tab === 'house') return canMoveUp(game);
  const next = nextLifestyle(game, tab);
  return next !== null && game.cash >= next.cost;
}

/** Homes, vehicles, outfits and luxury toys. Status items are bought in order: one clear next dream per category. */
export function ShopScreen() {
  const { game } = useGameV2();
  const { t } = useT();
  const focus = useFocus();
  const [tab, setTab] = useState<ShopTab>(focus?.target.shopTab ?? 'house');

  // "Go" from a goal switches to the category it needs.
  const focusTab = focus?.target.shopTab;
  useEffect(() => {
    if (focusTab) setTab(focusTab);
  }, [focusTab, focus?.id]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white v2-glossy px-3 py-1.5">
        <img src="/assets/icons/prestige-points.png" alt="" draggable={false} className="w-6 h-6 object-contain" />
        <p className="v2-display text-[13px] text-white v2-shadow">
          {t('shop.statusTotal', { percent: percent(statusBonus(game)) })}
        </p>
      </div>

      <Segmented
        options={TABS.map((entry) => ({ value: entry.kind, label: t(entry.label) }))}
        value={tab}
        onChange={setTab}
        dot={(kind) => tabReady(game, kind)}
      />

      {tab === 'house' ? <HousingPanel /> : <LifestylePanel kind={tab} />}
    </section>
  );
}

function LifestylePanel({ kind }: { kind: LifestyleKind }) {
  const { game, actions } = useGameV2();
  const { t, name, money, duration } = useT();

  const items = LIFESTYLE_ITEMS.filter((item) => item.kind === kind);
  const owned = items.filter((item) => game.lifestyleOwned.includes(item.id));
  const next = nextLifestyle(game, kind);
  const nextIndex = next ? items.indexOf(next) : items.length;
  const upcoming = items.slice(nextIndex + 1, nextIndex + 1 + UPCOMING_COUNT);
  const hiddenCount = Math.max(0, items.length - (nextIndex + 1 + UPCOMING_COUNT));

  const income = autoIncomePerSecond(game);
  const canBuy = next !== null && game.cash >= next.cost;
  const secondsToAfford = next && !canBuy && income > 0 ? (next.cost - game.cash) / income : null;

  return (
    <div className="flex flex-col gap-3">
      {next ? (
        <Panel accent className="overflow-hidden">
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-300 to-orange-500">
            <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">{t('shop.next')}</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Thumb image={next.image} large />
              <div className="flex-1 min-w-0">
                <p className="v2-display text-xl leading-tight text-indigo-950">{name('lifestyle', next)}</p>
                <div className="mt-1">
                  <Chip>{t('shop.bonus', { percent: percent(next.statusBonus) })}</Chip>
                </div>
              </div>
            </div>
            <Focusable focusKey={`shop:${kind}:next`}>
              <GameButton
                onClick={() => actions.buyLifestyle(next.id)}
                disabled={!canBuy}
                className="w-full py-3 px-4 flex items-center justify-between"
              >
                <span className="v2-display text-[16px] v2-shadow">{t('shop.buy')}</span>
                <span className="v2-display text-[16px] v2-shadow tabular-nums">{money(next.cost)}</span>
              </GameButton>
            </Focusable>
            {secondsToAfford !== null && (
              <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">
                {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
              </p>
            )}
          </div>
        </Panel>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('shop.allOwned')}</p>
        </Panel>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>{t('shop.upcoming')}</SectionLabel>
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-2.5 flex items-center gap-3"
              >
                <Thumb image={item.image} dim />
                <div className="flex-1 min-w-0">
                  <p className="v2-display text-[15px] text-indigo-900/50 truncate">{name('lifestyle', item)}</p>
                  <p className="text-[11px] font-bold text-indigo-900/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {money(item.cost)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <p className="text-[11px] font-bold text-indigo-900/40 text-center">
              {t('shop.more', { count: hiddenCount })}
            </p>
          )}
        </>
      )}

      {owned.length > 0 && (
        <>
          <SectionLabel>{t('shop.collection')}</SectionLabel>
          <ul className="grid grid-cols-4 gap-2">
            {[...owned].reverse().map((item) => (
              <li
                key={item.id}
                className="relative bg-white rounded-2xl border-2 border-white shadow-[0_4px_14px_rgba(30,41,99,0.12)] p-1.5 flex flex-col items-center gap-1"
              >
                <Thumb image={item.image} />
                <span className="w-full text-center text-[9px] font-bold text-slate-500 leading-tight line-clamp-2">
                  {name('lifestyle', item)}
                </span>
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

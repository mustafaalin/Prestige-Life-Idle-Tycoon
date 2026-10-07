import { Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { autoIncomePerSecond, statusBonus } from '../../core/formulas';
import { canMoveUp, nextLifestyle } from '../../core/state';
import type { GameStateV2, LifestyleKind } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { HousingPanel } from './HousingPanel';
import { ScenePreview } from './ScenePreview';
import { Thumb } from './Thumb';

type ShopTab = 'house' | LifestyleKind;

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
  const [tab, setTab] = useState<ShopTab>('house');

  return (
    <section className="flex flex-col gap-3">
      <ScenePreview game={game} />
      <p className="text-[11px] font-black text-violet-600 text-center">
        {t('shop.statusTotal', { percent: percent(statusBonus(game)) })}
      </p>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            onClick={() => setTab(entry.kind)}
            className={`relative flex-1 min-h-9 rounded-lg py-1.5 text-[11px] font-black transition-all active:scale-95 ${
              tab === entry.kind ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow' : 'text-slate-500'
            }`}
          >
            {t(entry.label)}
            {tabReady(game, entry.kind) && tab !== entry.kind && (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        ))}
      </div>

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
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-violet-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Thumb image={next.image} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{t('shop.next')}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{name('lifestyle', next)}</p>
              <p className="text-[11px] font-black text-violet-600">{t('shop.bonus', { percent: percent(next.statusBonus) })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.buyLifestyle(next.id)}
            disabled={!canBuy}
            className="rounded-2xl py-3.5 px-4 flex items-center justify-between font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{t('shop.buy')}</span>
            <span className="tabular-nums">{money(next.cost)}</span>
          </button>
          {secondsToAfford !== null && (
            <p className="text-[11px] font-semibold text-slate-500 text-center -mt-1">
              {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-amber-200 text-center">
          <p className="text-lg font-black text-slate-900">{t('shop.allOwned')}</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('shop.upcoming')}</h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li key={item.id} className="rounded-2xl border-2 border-dashed border-slate-200 p-2.5 flex items-center gap-3">
                <Thumb image={item.image} dim />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-500 truncate">{name('lifestyle', item)}</p>
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {money(item.cost)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <p className="text-[11px] font-semibold text-slate-400 text-center">{t('shop.more', { count: hiddenCount })}</p>
          )}
        </>
      )}

      {owned.length > 0 && (
        <>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('shop.collection')}</h2>
          <ul className="grid grid-cols-4 gap-2">
            {[...owned].reverse().map((item) => (
              <li key={item.id} className="relative bg-white rounded-2xl shadow-sm p-1.5 flex flex-col items-center gap-1">
                <Thumb image={item.image} />
                <span className="w-full text-center text-[9px] font-bold text-slate-500 leading-tight line-clamp-2">
                  {name('lifestyle', item)}
                </span>
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
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

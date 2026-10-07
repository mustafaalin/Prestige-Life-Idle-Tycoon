import { Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { incomePerSecond, statusBonus } from '../../core/formulas';
import { nextLifestyle } from '../../core/state';
import type { LifestyleDef, LifestyleKind } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { ScenePreview } from './ScenePreview';

const KINDS: { kind: LifestyleKind; label: MessageKey }[] = [
  { kind: 'house', label: 'shop.house' },
  { kind: 'vehicle', label: 'shop.vehicle' },
  { kind: 'outfit', label: 'shop.outfit' },
  { kind: 'toy', label: 'shop.toy' },
];

/** How many not-yet-affordable dreams are previewed after the next one. */
const UPCOMING_COUNT = 3;

const percent = (fraction: number) => Math.round(fraction * 100);

function Thumb({ item, dim }: { item: LifestyleDef; dim?: boolean }) {
  const cover = item.kind === 'house';
  return (
    <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
      <img
        src={item.image}
        alt=""
        className={`${cover ? 'w-full h-full object-cover object-[center_30%]' : 'w-14 h-14 object-contain'} ${
          dim ? 'grayscale opacity-40' : ''
        }`}
        draggable={false}
      />
    </div>
  );
}

/** Houses, vehicles, outfits and luxury toys. Items are bought in order: one clear next dream per category. */
export function ShopScreen() {
  const { game, actions } = useGameV2();
  const { t, name, money, duration } = useT();
  const [kind, setKind] = useState<LifestyleKind>('house');

  const items = LIFESTYLE_ITEMS.filter((item) => item.kind === kind);
  const owned = items.filter((item) => game.lifestyleOwned.includes(item.id));
  const next = nextLifestyle(game, kind);
  const nextIndex = next ? items.indexOf(next) : items.length;
  const upcoming = items.slice(nextIndex + 1, nextIndex + 1 + UPCOMING_COUNT);
  const hiddenCount = Math.max(0, items.length - (nextIndex + 1 + UPCOMING_COUNT));

  const income = incomePerSecond(game, 'active');
  const canBuy = next !== null && game.cash >= next.cost;
  const secondsToAfford = next && !canBuy && income > 0 ? (next.cost - game.cash) / income : null;

  return (
    <section className="flex flex-col gap-3">
      <ScenePreview game={game} />
      <p className="text-[11px] font-black text-violet-600 text-center">
        {t('shop.statusTotal', { percent: percent(statusBonus(game)) })}
      </p>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {KINDS.map((entry) => {
          const entryNext = nextLifestyle(game, entry.kind);
          const ready = entryNext !== null && game.cash >= entryNext.cost;
          return (
            <button
              key={entry.kind}
              type="button"
              onClick={() => setKind(entry.kind)}
              className={`relative flex-1 rounded-lg py-1.5 text-[11px] font-black transition-all active:scale-95 ${
                kind === entry.kind ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow' : 'text-slate-500'
              }`}
            >
              {t(entry.label)}
              {ready && kind !== entry.kind && (
                <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {next ? (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-violet-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Thumb item={next} />
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
                <Thumb item={item} dim />
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
                <Thumb item={item} />
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
    </section>
  );
}

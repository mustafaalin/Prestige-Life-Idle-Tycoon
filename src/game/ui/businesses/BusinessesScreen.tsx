import { Lock } from 'lucide-react';
import { useState } from 'react';
import { BUSINESSES } from '../../core/config/businesses';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { BusinessCard, type BuyMode } from './BusinessCard';

const BUY_MODES: BuyMode[] = [1, 10, 'max'];

/**
 * Business list. Lines are revealed one at a time: everything owned, the next one to buy,
 * and a locked teaser of the one after, so a new player is never facing ten choices.
 */
export function BusinessesScreen() {
  const { game } = useGameV2();
  const { t, name, money } = useT();
  const [buyMode, setBuyMode] = useState<BuyMode>(1);

  const firstUnowned = BUSINESSES.findIndex((def) => game.businesses[def.id].owned === 0);
  const visible = firstUnowned < 0 ? BUSINESSES : BUSINESSES.slice(0, firstUnowned + 1);
  const teaser = firstUnowned < 0 ? undefined : BUSINESSES[firstUnowned + 1];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('business.title')}</h2>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {BUY_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBuyMode(mode)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition-all active:scale-95 ${
                buyMode === mode ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow' : 'text-slate-500'
              }`}
            >
              {mode === 'max' ? t('business.max') : `×${mode}`}
            </button>
          ))}
        </div>
      </div>

      {visible.map((def) => (
        <BusinessCard key={def.id} def={def} buyMode={buyMode} />
      ))}

      {teaser && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-3 flex items-center gap-3 opacity-70">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <img src={teaser.image} alt="" className="w-14 h-14 object-contain grayscale opacity-40" draggable={false} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-500 truncate">{name('business', teaser)}</p>
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {t('business.teaser', { price: money(teaser.baseCost) })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

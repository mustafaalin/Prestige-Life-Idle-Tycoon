import { Lock } from 'lucide-react';
import { useState } from 'react';
import { BUSINESSES } from '../../core/config/businesses';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { ImageTile, Segmented, SectionLabel } from '../kit';
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
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>{t('business.buyAmount')}</SectionLabel>
        <div className="w-44">
          <Segmented
            options={BUY_MODES.map((mode) => ({ value: mode, label: mode === 'max' ? t('business.max') : `×${mode}` }))}
            value={buyMode}
            onChange={setBuyMode}
          />
        </div>
      </div>

      {visible.map((def) => (
        <BusinessCard key={def.id} def={def} buyMode={buyMode} />
      ))}

      {teaser && (
        <div className="rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-3 flex items-center gap-3">
          <ImageTile>
            <img
              src={teaser.image}
              alt=""
              className="w-14 h-14 object-contain grayscale opacity-40"
              draggable={false}
            />
          </ImageTile>
          <div className="flex-1 min-w-0">
            <p className="v2-display text-[16px] text-indigo-900/50 truncate">{name('business', teaser)}</p>
            <p className="text-[11px] font-bold text-indigo-900/40 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {t('business.teaser', { price: money(teaser.baseCost) })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

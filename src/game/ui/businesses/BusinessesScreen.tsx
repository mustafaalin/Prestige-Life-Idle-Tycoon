import { BUSINESSES } from '../../core/config/businesses';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { businessOpenClass } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { useMusic } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { ImageTile } from '../kit';
import { BusinessCard } from './BusinessCard';
import { UiIcon } from '../UiIcon';

/**
 * Business list. Lines are revealed one at a time: everything owned (a ceremony's gift can be
 * further down the line), the next one to buy, and a locked teaser of the one after, so a new
 * player is never facing ten choices. A line opens with its class (game-design-v2 §4.3): until
 * then the next line is only the teaser, with the class that opens it.
 */
export function BusinessesScreen() {
  useMusic('calm');
  const { game } = useGameV2();
  const { t, name, money } = useT();

  const owns = (def: (typeof BUSINESSES)[number]) => (game.businesses[def.id]?.level ?? 0) > 0;
  const firstUnowned = BUSINESSES.findIndex((def) => !owns(def));
  const isOpen = (def: (typeof BUSINESSES)[number]) => businessOpenClass(def) <= game.classIndex;
  // The next line gets a full card only once its class has opened it.
  const nextShown = firstUnowned >= 0 && isOpen(BUSINESSES[firstUnowned]) ? firstUnowned : firstUnowned - 1;
  const visible = firstUnowned < 0 ? BUSINESSES : BUSINESSES.filter((def, index) => index <= nextShown || owns(def));
  const teaser = firstUnowned < 0 ? undefined : BUSINESSES.find((def, index) => index > nextShown && !owns(def));
  const teaserClass = teaser && !isOpen(teaser) ? WEALTH_CLASSES[businessOpenClass(teaser)] : undefined;

  return (
    <section className="flex flex-col gap-3">
      {visible.map((def) => (
        <BusinessCard key={def.id} def={def} />
      ))}

      {teaser && (
        <div className="v2-teaser rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-3 flex items-center gap-3">
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
              <UiIcon name="lock" />
              {teaserClass
                ? t('business.classLocked', { class: name('wealthClass', teaserClass) })
                : t('business.teaser', { price: money(teaser.levels[0].cost) })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

import { careersNeedingHome, careersNeedingItem } from '../../core/formulas';
import { useT } from '../../i18n/useT';

/** "Opens: Bike Courier, Taxi Driver" under an item that some jobs need (docs/economy-rebuild.md §5). */
export function OpensJobs({ itemId, homeIndex }: { itemId?: string; homeIndex?: number }) {
  const { t, name } = useT();
  const careers = itemId !== undefined ? careersNeedingItem(itemId) : homeIndex !== undefined ? careersNeedingHome(homeIndex) : [];
  if (careers.length === 0) return null;
  return (
    <p className="text-[11px] font-bold leading-snug text-violet-600">
      {t('career.opens', { jobs: careers.map((career) => name('career', career)).join(', ') })}
    </p>
  );
}

import { careersNeedingHome, careersNeedingItem } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { JobIcon } from '../career/JobIcon';

/**
 * The jobs an item or a home opens (docs/game-design-v2.md §4.5), as job pills with their icons
 * (2026-10-23; was a purple "Opens: …" line nobody read as jobs).
 */
export function OpensJobs({ itemId, homeIndex, compact = false }: { itemId?: string; homeIndex?: number; compact?: boolean }) {
  const { t, name } = useT();
  const careers = itemId !== undefined ? careersNeedingItem(itemId) : homeIndex !== undefined ? careersNeedingHome(homeIndex) : [];
  if (careers.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center justify-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      <span className="v2-display text-[11px] uppercase tracking-wide text-violet-700/80">{t('shop.opensJobs')}</span>
      {careers.map((career) => (
        <span
          key={career.id}
          className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 pl-0.5 pr-2 py-0.5 max-w-full"
        >
          <JobIcon career={career} size={compact ? 18 : 22} plain />
          <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-bold leading-tight text-violet-800 truncate`}>
            {name('career', career)}
          </span>
        </span>
      ))}
    </div>
  );
}

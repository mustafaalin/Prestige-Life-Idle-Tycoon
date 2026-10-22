import { X } from 'lucide-react';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { BusinessesScreen } from '../businesses/BusinessesScreen';
import type { FocusTarget } from './focus';
import { CareerScreen } from '../career/CareerScreen';
import { FamilyScreen } from '../family/FamilyScreen';
import { InvestScreen } from '../invest/InvestScreen';
import { useLook } from '../look';
import { ShopScreen } from '../shop/ShopScreen';
import { QuestStrip, type GoToQuest } from './QuestPanel';
import { TABS, type TabId } from './tabs';

// A tab opens as a sheet between the top bar and the menu, so money and the menu stay visible.
// A goal strip under the header keeps the current goal in sight while the player works on it.

export function TabSheet({
  tab,
  onClose,
  pinnedQuest,
  onGo,
  onGoTo,
  onOpenStore,
}: {
  tab: TabId;
  onClose: () => void;
  pinnedQuest: string | null;
  onGo: GoToQuest;
  /** Opens another tab on a button ("Go" from a job's condition to the shop). */
  onGoTo: (target: FocusTarget) => void;
  onOpenStore: () => void;
}) {
  const { t } = useT();
  const def = TABS.find((item) => item.id === tab)!;
  // The look trial covers one screen (ui/look.ts).
  const look = useLook();

  useBackButton(true, 50, onClose);

  return (
    <div
      data-look={tab === 'businesses' && look !== 'classic' ? look : undefined}
      className="v2-sheet v2-sheet-in absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-indigo-100 shadow-2xl overflow-hidden pointer-events-auto"
    >
      <div className="v2-sheet-head shrink-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500">
        <img src={def.icon} alt="" draggable={false} className="w-9 h-9 object-contain drop-shadow" />
        <h2 className="flex-1 v2-display v2-outline-thin text-xl text-white">{t(def.label)}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="relative v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <QuestStrip tab={tab} pinnedId={pinnedQuest} onGo={onGo} />
      <div key={tab} className="v2-sheet-body flex-1 overflow-y-auto px-3 py-3 bg-gradient-to-b from-sky-100 to-indigo-100">
        {tab === 'businesses' && <BusinessesScreen />}
        {tab === 'career' && <CareerScreen onGoTo={onGoTo} />}
        {tab === 'shop' && <ShopScreen onOpenStore={onOpenStore} onGoTo={onGoTo} />}
        {tab === 'invest' && <InvestScreen />}
        {tab === 'family' && <FamilyScreen onClose={onClose} />}
      </div>
    </div>
  );
}

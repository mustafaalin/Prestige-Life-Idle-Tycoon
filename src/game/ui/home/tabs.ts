import type { MessageKey } from '../../i18n/translate';
import { ICONS } from '../icons';

// The tabs of the bottom menu; each opens as a sheet over the scene.

export type TabId = 'businesses' | 'career' | 'shop' | 'invest' | 'family';

export const TABS: { id: TabId; label: MessageKey; icon: string }[] = [
  { id: 'businesses', label: 'tabs.businesses', icon: ICONS.business },
  { id: 'career', label: 'tabs.career', icon: ICONS.career },
  { id: 'shop', label: 'tabs.shop', icon: ICONS.shop },
  { id: 'invest', label: 'tabs.invest', icon: ICONS.invest },
  { id: 'family', label: 'tabs.family', icon: ICONS.legacy },
];

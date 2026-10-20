import { CONTENT } from '../../core/config/content';
import type { MessageKey } from '../../i18n/translate';
import { ICONS } from '../icons';

// The tabs of the bottom menu; each opens as a sheet over the scene.

export type TabId = 'businesses' | 'career' | 'shop' | 'invest' | 'family';

export const TABS: { id: TabId; label: MessageKey; icon: string }[] = [
  { id: 'businesses', label: 'tabs.businesses', icon: ICONS.business },
  { id: 'career', label: 'tabs.career', icon: ICONS.career },
  { id: 'shop', label: 'tabs.shop', icon: ICONS.shop },
  { id: 'invest', label: 'tabs.invest', icon: ICONS.invest },
  // Legacy and heirlooms come back with generation 2 (config/content.ts).
  ...(CONTENT.legacy ? [{ id: 'family' as const, label: 'tabs.family' as const, icon: ICONS.legacy }] : []),
];

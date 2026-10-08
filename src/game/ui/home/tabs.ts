import type { MessageKey } from '../../i18n/translate';

// The tabs of the bottom menu; each opens as a sheet over the scene.

export type TabId = 'businesses' | 'career' | 'shop';

export const TABS: { id: TabId; label: MessageKey; icon: string }[] = [
  { id: 'businesses', label: 'tabs.businesses', icon: '/assets/icons/business.png' },
  { id: 'career', label: 'tabs.career', icon: '/assets/icons/job.png' },
  { id: 'shop', label: 'tabs.shop', icon: '/assets/icons/shop.png' },
];

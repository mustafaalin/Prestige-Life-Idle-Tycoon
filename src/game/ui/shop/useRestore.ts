import { useState } from 'react';
import { track } from '../../runtime/analytics';
import { restoreProducts } from '../../runtime/iap';
import { useGameV2 } from '../../runtime/useGameV2';

export type RestoreStatus = 'idle' | 'busy' | 'done' | 'none' | 'failed';

/** "Restore purchases" (Apple requires it; docs/monetization-v2.md §7), in Settings and in the Store. */
export function useRestore() {
  const { actions } = useGameV2();
  const [status, setStatus] = useState<RestoreStatus>('idle');

  const restore = async () => {
    if (status === 'busy') return;
    setStatus('busy');
    const ids = await restoreProducts();
    track('purchase_restore', { found: ids?.length ?? -1 });
    if (ids) actions.purchases.restore(ids);
    setStatus(ids === null ? 'failed' : ids.length > 0 ? 'done' : 'none');
  };

  return { status, restore };
}

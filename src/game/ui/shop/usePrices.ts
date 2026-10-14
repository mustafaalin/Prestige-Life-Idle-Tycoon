import { useEffect, useState } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { loadPrices } from '../../runtime/iap';

/**
 * The store's local prices ("₺79,99") by store id; the config's fallback until (or unless) the store
 * answers. `id` picks one of a product's prices (its welcome price, config/iap.ts); left out: the regular one.
 */
export function usePrices() {
  const [prices, setPrices] = useState<Record<string, string>>({});
  useEffect(() => {
    void loadPrices().then(setPrices);
  }, []);
  return (product: ProductDef, id = product.id) =>
    prices[id] ?? (id === product.welcome?.id ? product.welcome.fallbackPrice : product.fallbackPrice);
}

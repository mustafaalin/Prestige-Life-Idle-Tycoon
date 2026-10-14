import { useEffect, useState } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { loadPrices } from '../../runtime/iap';

/** The store's local prices ("₺79,99"); the config's fallback until (or unless) the store answers. */
export function usePrices() {
  const [prices, setPrices] = useState<Record<string, string>>({});
  useEffect(() => {
    void loadPrices().then(setPrices);
  }, []);
  return (product: ProductDef) => prices[product.id] ?? product.fallbackPrice;
}

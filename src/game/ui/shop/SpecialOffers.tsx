import { Check, Gift, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PRODUCTS, STARTER_OFFER_SECONDS, type ProductDef } from '../../core/config/iap';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { haptic, playSfx } from '../../runtime/feedback';
import { buyProduct, loadPrices } from '../../runtime/iap';
import { offersFor } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { GameButton, Panel, SectionLabel } from '../kit';

// The shop's "Special" section (docs/monetization-v2.md §6): from the first class-up, the Starter Pack
// for its first three days and the Comfort Pack. Prices are the store's local ones.

const LINES: Record<ProductDef['key'], MessageKey[]> = {
  starter: ['iap.starter.line1', 'iap.starter.line2', 'iap.starter.line3'],
  comfort: ['iap.comfort.line1', 'iap.comfort.line2'],
};

export function SpecialOffers() {
  const { state, actions } = useGameV2();
  const { t, duration } = useT();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<'thanks' | 'failed' | null>(null);
  const now = Date.now();
  const offers = offersFor(state, now);
  const shown = offers.map((product) => product.id).join(',');

  useEffect(() => {
    void loadPrices().then(setPrices);
  }, []);
  useEffect(() => {
    if (shown) track('offer_view', { products: shown });
  }, [shown]);

  if (offers.length === 0 && note !== 'thanks') return null;

  const buy = async (product: ProductDef) => {
    if (busy) return;
    playSfx('click');
    setBusy(product.id);
    setNote(null);
    const outcome = await buyProduct(product.id);
    setBusy(null);
    if (outcome === 'purchased') {
      actions.purchases.apply(product.id);
      playSfx('purchase');
      haptic('medium');
      setNote('thanks');
    } else if (outcome === 'unavailable') {
      setNote('failed');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{t('iap.title')}</SectionLabel>
      {offers.map((product) => {
        const starter = product === PRODUCTS.starter;
        const left = starter ? STARTER_OFFER_SECONDS - (now - state.purchases.offersFrom) / 1000 : 0;
        return (
          <Panel key={product.id} accent className="p-3 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <span
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-b ${starter ? 'from-rose-400 to-rose-600' : 'from-violet-400 to-indigo-600'}`}
              >
                {starter ? <Gift className="w-7 h-7 text-white" /> : <Sparkles className="w-7 h-7 text-white" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="v2-display text-[17px] leading-tight text-indigo-950">{t(`iap.${product.key}.name`)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  {starter ? `${t('iap.once')} · ${t('iap.starter.ends', { duration: duration(Math.max(0, left)) })}` : t('iap.forever')}
                </p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {LINES[product.key].map((line) => (
                    <li key={line} className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      {t(line)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <GameButton
              tone="gold"
              onClick={() => void buy(product)}
              disabled={busy !== null}
              className="w-full min-h-11 py-2 px-4 v2-display text-[16px] v2-shadow tabular-nums"
            >
              {prices[product.id] ?? product.fallbackPrice}
            </GameButton>
          </Panel>
        );
      })}
      {note && (
        <p className={`text-[12px] font-bold text-center ${note === 'thanks' ? 'text-emerald-600' : 'text-slate-500'}`}>
          {t(note === 'thanks' ? 'iap.thanks' : 'iap.failed')}
        </p>
      )}
    </div>
  );
}

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '../../i18n/useT';
import { finishMockAd } from '../../runtime/ads';
import { useAdsState } from '../../runtime/useAds';

// Web/dev stand-in for a rewarded ad: a few seconds of "ad", then the reward. Closing early gives none.

const MOCK_SECONDS = 4;

export function MockAdOverlay() {
  const { mock } = useAdsState();
  return mock ? <MockAd key={mock.id} placement={mock.placement} /> : null;
}

function MockAd({ placement }: { placement: string }) {
  const { t } = useT();
  const [left, setLeft] = useState(MOCK_SECONDS);

  useEffect(() => {
    if (left <= 0) {
      finishMockAd('rewarded');
      return;
    }
    const timer = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center px-8 text-center">
      <button
        type="button"
        onClick={() => finishMockAd('dismissed')}
        className="absolute right-4 top-[calc(var(--safe-top)+12px)] flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white transition-all active:scale-90"
      >
        <X className="w-4 h-4" />
        {t('ads.mockClose')}
      </button>
      <span className="rounded-full bg-amber-400 px-3 py-1 v2-display text-[12px] text-slate-900">{placement}</span>
      <h2 className="mt-4 v2-display text-3xl text-white">{t('ads.mockTitle')}</h2>
      <p className="mt-2 text-sm font-bold text-white/70">{t('ads.mockBody')}</p>
      <div className="mt-6 w-full max-w-[260px] h-3 rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((MOCK_SECONDS - left) / MOCK_SECONDS) * 100}%` }}
        />
      </div>
      <p className="mt-2 v2-display text-2xl text-white tabular-nums">{left}</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/useT';
import { haptic } from '../../runtime/feedback';
import { playerId } from '../../runtime/iap';
import { UiIcon } from '../UiIcon';

// Settings → Player ID (docs/monetization-v2.md §8, "Destek"): the RevenueCat id, so a player who
// writes "I paid but got nothing" can send it and their purchases are found in RevenueCat → Customers.

/** Copies text; the old way when the clipboard API is not there. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    return done;
  }
}

export function PlayerId() {
  const { t } = useT();
  const [id, setId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void playerId().then(setId);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!id) return null;
  return (
    <div className="rounded-2xl bg-white/60 border-2 border-indigo-100 px-3 py-2 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-indigo-900/70">{t('iap.playerId')}</p>
        <p className="select-text text-[11px] font-mono font-semibold text-slate-700 break-all leading-snug">{id}</p>
        <p className="text-[10px] font-bold text-indigo-900/50 leading-snug">{t('iap.playerIdBody')}</p>
      </div>
      <button
        type="button"
        onClick={() =>
          void copyText(id).then((done) => {
            if (!done) return;
            haptic('light');
            setCopied(true);
          })
        }
        className="shrink-0 flex items-center gap-1 rounded-xl bg-indigo-100 px-2.5 py-2 text-[12px] font-black text-indigo-700 transition-all active:scale-95"
      >
        <UiIcon name={copied ? 'check' : 'copy'} className="w-5 h-5" />
        {t(copied ? 'iap.copied' : 'iap.copy')}
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/useT';
import { EXIT_HINT_MS, onExitHint } from '../../runtime/backButton';

// Android back on the home screen: a short "press again to exit" pill (runtime/backButton.ts).

export function ExitHint() {
  const { t } = useT();
  const [shown, setShown] = useState(0);

  useEffect(() => onExitHint(() => setShown(Date.now())), []);
  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(0), EXIT_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [shown]);

  if (!shown) return null;
  return (
    <div className="fixed inset-x-0 bottom-28 z-[150] flex justify-center px-4 pointer-events-none">
      <p key={shown} role="status" className="v2-pop-in rounded-full bg-slate-900/85 px-4 py-2 text-[13px] font-bold text-white shadow-lg">
        {t('common.exitHint')}
      </p>
    </div>
  );
}

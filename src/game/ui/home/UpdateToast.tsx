import { useEffect, useState } from 'react';
import { useT } from '../../i18n/useT';
import { restartIntoUpdate, subscribeUpdateReady, updateReady } from '../../runtime/appUpdate';
import { haptic, playSfx } from '../../runtime/feedback';

// A newer version finished downloading in the background (runtime/appUpdate.ts): a banner drops in
// at the top for a few seconds; a tap restarts into it. Not tapped, it comes back at the next launch.

const SHOW_MS = 8000;

export function UpdateToast() {
  const { t } = useT();
  const [shown, setShown] = useState(updateReady);

  useEffect(
    () =>
      subscribeUpdateReady(() => {
        setShown(true);
        playSfx('unlock');
        haptic('light');
      }),
    [],
  );

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(false), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [shown]);

  if (!shown) return null;
  return (
    <div className="pointer-events-none absolute inset-x-3 top-2 z-[60] flex justify-center">
      <button
        type="button"
        onClick={() => {
          setShown(false);
          restartIntoUpdate();
        }}
        className="v2-pop-in pointer-events-auto w-full max-w-[360px] flex items-center gap-2.5 rounded-[20px] border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy px-3 py-2 text-left shadow-xl"
      >
        <span className="v2-display text-[14px] leading-tight text-white v2-shadow">{t('common.updateReady')}</span>
      </button>
    </div>
  );
}

import { ShieldCheck, X } from 'lucide-react';
import { LOCALES, type Locale } from '../../i18n/locales';
import { useT } from '../../i18n/useT';
import { showPrivacyOptions } from '../../runtime/ads';
import { useBackButton } from '../../runtime/backButton';
import { useAdsState } from '../../runtime/useAds';
import { GameButton, Segmented, SectionLabel } from '../kit';

// Settings: language, and the privacy options the consent rules require players to be able to
// reopen (EEA/UK/Switzerland). Restore purchases joins here with IAP (docs/monetization-v2.md).

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useT();
  const { privacyOptionsRequired } = useAdsState();

  useBackButton(true, 60, onClose);

  return (
    <div className="fixed inset-0 z-[60] bg-black/35 flex items-end" onClick={onClose}>
      <div
        className="v2-sheet-in w-full rounded-t-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 shadow-2xl pb-[calc(var(--safe-bottom)+20px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-[28px] bg-gradient-to-r from-violet-500 to-indigo-500">
          <h2 className="flex-1 v2-display v2-outline-thin text-xl text-white">{t('settings.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-3">
          <SectionLabel>{t('settings.language')}</SectionLabel>
          <Segmented
            options={(Object.keys(LOCALES) as Locale[]).map((code) => ({
              value: code,
              label: LOCALES[code].nativeName,
            }))}
            value={locale}
            onChange={setLocale}
          />

          {privacyOptionsRequired && (
            <GameButton
              tone="soft"
              onClick={() => void showPrivacyOptions()}
              className="mt-1 py-2.5 px-4 flex items-center gap-3 text-left"
            >
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <span className="flex flex-col">
                <span className="v2-display text-[15px]">{t('settings.privacy')}</span>
                <span className="text-[11px] font-bold text-indigo-900/60">{t('settings.privacyBody')}</span>
              </span>
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
}

import { Bell, Music, RotateCcw, ShieldCheck, Volume2, X } from 'lucide-react';
import { useState } from 'react';
import { LOCALES, type Locale } from '../../i18n/locales';
import { useT } from '../../i18n/useT';
import { showPrivacyOptions } from '../../runtime/ads';
import { musicEnabled, playSfx, setMusicEnabled, setSoundEnabled, soundEnabled } from '../../runtime/feedback';
import { storeAvailable } from '../../runtime/iap';
import {
  notificationsEnabled,
  notificationsSupported,
  requestNotificationPermission,
  setNotificationsEnabled,
} from '../../runtime/notifications';
import { useBackButton } from '../../runtime/backButton';
import { useAdsState } from '../../runtime/useAds';
import { GameButton, Segmented, SectionLabel } from '../kit';
import { PlayerId } from '../shop/PlayerId';
import { useRestore } from '../shop/useRestore';

// Settings: language, sound effects and music (this device only), reminders (Mom and Lucky, phones only), and the privacy options the consent rules require players to be able to
// reopen (EEA/UK/Switzerland), "Restore purchases" (Apple requires it; docs/monetization-v2.md §7) and
// the player id for purchase support, then the privacy policy and the support address (2026-10-22).

/** The privacy policy on the studio site, in the game's language (Play asks for it inside the app too). */
const PRIVACY_URL: Partial<Record<Locale, string>> & { en: string } = {
  en: 'https://mathgamesstudio.com/privacy/prestige-life',
  tr: 'https://mathgamesstudio.com/tr/privacy/prestige-life',
};
const SUPPORT_MAIL = 'mailto:mathgamesstudio@gmail.com?subject=Prestige%20Life';

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useT();
  const { privacyOptionsRequired } = useAdsState();
  const [notify, setNotify] = useState(notificationsEnabled);
  const [sound, setSound] = useState(soundEnabled);
  const [music, setMusic] = useState(musicEnabled);
  const { status: restore, restore: restorePurchases } = useRestore();

  const toggleNotify = () => {
    const next = !notify;
    setNotify(next);
    setNotificationsEnabled(next);
    if (next) void requestNotificationPermission();
  };

  const toggleSound = () => {
    setSound(!sound);
    setSoundEnabled(!sound);
    playSfx('click');
  };

  const toggleMusic = () => {
    setMusic(!music);
    setMusicEnabled(!music);
  };

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
            className="relative v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
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

          <GameButton tone="soft" onClick={toggleSound} className="mt-1 py-2.5 px-4 flex items-center gap-3 text-left">
            <Volume2 className="w-6 h-6 shrink-0" />
            <span className="flex-1 v2-display text-[15px]">{t('settings.sound')}</span>
            <Switch on={sound} />
          </GameButton>

          <GameButton tone="soft" onClick={toggleMusic} className="py-2.5 px-4 flex items-center gap-3 text-left">
            <Music className="w-6 h-6 shrink-0" />
            <span className="flex-1 v2-display text-[15px]">{t('settings.music')}</span>
            <Switch on={music} />
          </GameButton>

          {notificationsSupported && (
            <GameButton
              tone="soft"
              onClick={toggleNotify}
              className="mt-1 py-2.5 px-4 flex items-center gap-3 text-left"
            >
              <Bell className="w-6 h-6 shrink-0" />
              <span className="flex-1 flex flex-col">
                <span className="v2-display text-[15px]">{t('settings.notifications')}</span>
                <span className="text-[11px] font-bold text-indigo-900/60">{t('settings.notificationsBody')}</span>
              </span>
              <Switch on={notify} />
            </GameButton>
          )}

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

          {storeAvailable && (
            <GameButton
              tone="soft"
              onClick={() => void restorePurchases()}
              disabled={restore === 'busy'}
              className="mt-1 py-2.5 px-4 flex items-center gap-3 text-left"
            >
              <RotateCcw className="w-6 h-6 shrink-0" />
              <span className="flex flex-col">
                <span className="v2-display text-[15px]">{t('iap.restore')}</span>
                <span className="text-[11px] font-bold text-indigo-900/60">
                  {restore === 'done'
                    ? t('iap.restored')
                    : restore === 'none'
                      ? t('iap.restoreNone')
                      : restore === 'failed'
                        ? t('iap.failed')
                        : t('iap.restoreBody')}
                </span>
              </span>
            </GameButton>
          )}
          {storeAvailable && <PlayerId />}
          <div className="mt-2 border-t border-indigo-100 pt-3 flex flex-col gap-3 text-center v2-display text-[14px] text-indigo-800">
            <a href={PRIVACY_URL[locale] ?? PRIVACY_URL.en} target="_blank" rel="noopener noreferrer">
              {t('settings.privacyPolicy')}
            </a>
            <a href={SUPPORT_MAIL}>{t('settings.support')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`relative w-11 h-6 rounded-full shrink-0 transition-all ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
  );
}

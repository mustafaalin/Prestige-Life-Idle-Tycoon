import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Settings, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LOCALES, type Locale } from '../../i18n/locales';
import { useT } from '../../i18n/useT';
import { showPrivacyOptions } from '../../runtime/ads';
import {
  haptic,
  hapticsEnabled,
  musicEnabled,
  playSfx,
  setHapticsEnabled,
  setMusicEnabled,
  setSoundEnabled,
  soundEnabled,
} from '../../runtime/feedback';
import { storeAvailable } from '../../runtime/iap';
import {
  notificationsEnabled,
  notificationsSupported,
  requestNotificationPermission,
  setNotificationsEnabled,
} from '../../runtime/notifications';
import { useBackButton } from '../../runtime/backButton';
import { useAdsState } from '../../runtime/useAds';
import { useGameV2 } from '../../runtime/useGameV2';
import { GameButton, Segmented, SectionLabel } from '../kit';
import { PlayerId } from '../shop/PlayerId';
import { useRestore } from '../shop/useRestore';
import { portalRoot } from '../stage';
import { UiIcon, type UiIconName } from '../UiIcon';

// Settings in three groups (2026-10-23, user, after the reference game's page): the game (sound,
// music, haptics, reminders), the language, purchases and privacy (restore, the privacy options the
// consent rules require players to be able to reopen, the player id for purchase support). At the
// foot the privacy policy, terms and support as small buttons, "Start over" in red behind a warning,
// and the version, so a player writing to support can say which one they have.

/** The studio site's pages, in the game's language (Play asks for the privacy policy inside the app too). */
const PRIVACY_URL: Partial<Record<Locale, string>> & { en: string } = {
  en: 'https://mathgamesstudio.com/privacy/prestige-life',
  tr: 'https://mathgamesstudio.com/tr/privacy/prestige-life',
};
const TERMS_URL: Partial<Record<Locale, string>> & { en: string } = {
  en: 'https://mathgamesstudio.com/terms/prestige-life',
  tr: 'https://mathgamesstudio.com/tr/terms/prestige-life',
};
const SUPPORT_MAIL = 'mailto:mathgamesstudio@gmail.com?subject=Prestige%20Life';

/** "2.0 (35)" on a phone; the web build has no store version. */
function useAppVersion() {
  const [version, setVersion] = useState<string | null>(Capacitor.isNativePlatform() ? null : 'web');
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    App.getInfo()
      .then((info) => setVersion(`${info.version} (${info.build})`))
      .catch(() => setVersion(null));
  }, []);
  return version;
}

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useT();
  const { privacyOptionsRequired } = useAdsState();
  const [notify, setNotify] = useState(notificationsEnabled);
  const [sound, setSound] = useState(soundEnabled);
  const [music, setMusic] = useState(musicEnabled);
  const [haptics, setHaptics] = useState(hapticsEnabled);
  const [startingOver, setStartingOver] = useState(false);
  const { status: restore, restore: restorePurchases } = useRestore();
  const version = useAppVersion();

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

  const toggleHaptics = () => {
    setHaptics(!haptics);
    setHapticsEnabled(!haptics);
    // The buzz says it is on again.
    haptic('medium');
  };

  useBackButton(!startingOver, 60, onClose);

  return (
    <div className="fixed inset-0 z-[60] bg-black/35 flex items-end" onClick={onClose}>
      <div
        className="v2-sheet-in w-full max-h-[calc(100%-var(--safe-top)-16px)] flex flex-col rounded-t-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-t-[28px] bg-gradient-to-r from-violet-500 to-indigo-500">
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </span>
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

        <div className="overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(var(--safe-bottom)+20px)] flex flex-col gap-2.5">
          <SectionLabel>{t('settings.game')}</SectionLabel>
          <Row icon="sound" title={t('settings.sound')} onClick={toggleSound} right={<Switch on={sound} />} />
          <Row icon="music" title={t('settings.music')} onClick={toggleMusic} right={<Switch on={music} />} />
          <Row icon="call" title={t('settings.haptics')} onClick={toggleHaptics} right={<Switch on={haptics} />} />
          {notificationsSupported && (
            <Row
              icon="bell"
              title={t('settings.notifications')}
              body={t('settings.notificationsBody')}
              onClick={toggleNotify}
              right={<Switch on={notify} />}
            />
          )}

          <SectionLabel>{t('settings.language')}</SectionLabel>
          <Segmented
            options={(Object.keys(LOCALES) as Locale[]).map((code) => ({
              value: code,
              label: LOCALES[code].nativeName,
            }))}
            value={locale}
            onChange={setLocale}
          />

          {(storeAvailable || privacyOptionsRequired) && <SectionLabel>{t('settings.account')}</SectionLabel>}
          {storeAvailable && (
            <Row
              icon="restore"
              title={t('iap.restore')}
              body={
                restore === 'done'
                  ? t('iap.restored')
                  : restore === 'none'
                    ? t('iap.restoreNone')
                    : restore === 'failed'
                      ? t('iap.failed')
                      : t('iap.restoreBody')
              }
              onClick={() => void restorePurchases()}
              disabled={restore === 'busy'}
            />
          )}
          {privacyOptionsRequired && (
            <Row icon="privacy" title={t('settings.privacy')} body={t('settings.privacyBody')} onClick={() => void showPrivacyOptions()} />
          )}
          {storeAvailable && <PlayerId />}

          <div className="mt-2 grid grid-cols-3 gap-2">
            <LinkButton href={PRIVACY_URL[locale] ?? PRIVACY_URL.en}>{t('settings.privacyPolicy')}</LinkButton>
            <LinkButton href={TERMS_URL[locale] ?? TERMS_URL.en}>{t('settings.terms')}</LinkButton>
            <LinkButton href={SUPPORT_MAIL}>{t('settings.support')}</LinkButton>
          </div>

          <GameButton
            tone="danger"
            onClick={() => {
              playSfx('click');
              setStartingOver(true);
            }}
            className="mt-3 mx-auto px-8 py-2.5 v2-display text-[15px] v2-shadow"
          >
            {t('settings.newGame')}
          </GameButton>
          {version && <p className="text-center text-[11px] font-bold text-indigo-900/50 tabular-nums">{t('settings.version', { version })}</p>}
        </div>
      </div>
      {startingOver && (
        <StartOver
          onCancel={() => setStartingOver(false)}
          onDone={() => {
            setStartingOver(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

/** One setting: its icon, name and a line under it, and a switch (or nothing) on the right. */
function Row({
  icon,
  title,
  body,
  right,
  onClick,
  disabled,
}: {
  icon: UiIconName;
  title: string;
  body?: string;
  right?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <GameButton tone="soft" onClick={onClick} disabled={disabled} className="py-2.5 px-4 flex items-center gap-3 text-left">
      <UiIcon name={icon} className="w-7 h-7 shrink-0" />
      <span className="flex-1 flex flex-col">
        <span className="v2-display text-[15px]">{title}</span>
        {body && <span className="text-[11px] font-bold text-indigo-900/60">{body}</span>}
      </span>
      {right}
    </GameButton>
  );
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  const web = href.startsWith('http');
  return (
    <a
      href={href}
      target={web ? '_blank' : undefined}
      rel={web ? 'noopener noreferrer' : undefined}
      onClick={() => playSfx('click')}
      className="rounded-2xl border-2 border-white/70 bg-gradient-to-b from-sky-400 to-blue-600 v2-glossy py-2 text-center v2-display text-[13px] text-white v2-shadow transition-all active:scale-95"
    >
      {children}
    </a>
  );
}

/** The warning before "Start over": staying is the big green button, wiping the red one. */
function StartOver({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const { t } = useT();
  const { actions } = useGameV2();
  useBackButton(true, 80, onCancel);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/20 flex items-center justify-center px-6" onClick={onCancel}>
      <div
        className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-3 bg-gradient-to-b from-rose-400 to-rose-600">
          <h2 className="v2-display v2-outline-thin text-2xl text-white">{t('settings.newGameTitle')}</h2>
        </div>
        <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
          <p className="text-[15px] font-bold leading-snug text-slate-700">{t('settings.newGameBody')}</p>
          <p className="text-[12px] font-semibold leading-snug text-slate-500">{t('settings.newGameKeep')}</p>
          <GameButton
            tone="buy"
            onClick={() => {
              playSfx('click');
              onCancel();
            }}
            className="mt-1 w-full py-3 v2-display text-lg v2-shadow"
          >
            {t('settings.newGameCancel')}
          </GameButton>
          <GameButton
            tone="danger"
            onClick={() => {
              haptic('medium');
              actions.newGame();
              onDone();
            }}
            className="w-full py-2.5 v2-display text-[15px] v2-shadow"
          >
            {t('settings.newGameYes')}
          </GameButton>
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`relative w-11 h-6 rounded-full shrink-0 transition-all ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
  );
}

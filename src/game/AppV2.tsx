import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect, useState } from 'react';
import './mobile.css';
import { I18nProvider } from './i18n/I18nProvider';
import { installBackButton } from './runtime/backButton';
import { GameV2Provider } from './runtime/GameV2Provider';
import { readSave } from './runtime/storage';
import { DevMenu } from './ui/DevMenu';
import { HomeShell } from './ui/HomeShell';

// v2 root, mounted instead of v1's App when VITE_GAME_V2=true (see src/main.tsx).

const DEV_MENU_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEV_MENU === 'true';

export default function AppV2() {
  // undefined = still reading the save (native storage is async); the splash stays up until then.
  const [saveText, setSaveText] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    readSave().then((text) => {
      if (!cancelled) setSaveText(text);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => installBackButton(), []);

  const loaded = saveText !== undefined;
  useEffect(() => {
    // The native splash waits for the app (launchAutoHide: false).
    if (loaded) SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <I18nProvider>
      <GameV2Provider saveText={saveText}>
        <HomeShell />
        {DEV_MENU_ENABLED && <DevMenu />}
      </GameV2Provider>
    </I18nProvider>
  );
}

import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';
import { I18nProvider } from './i18n/I18nProvider';
import { GameV2Provider } from './runtime/GameV2Provider';
import { DevMenu } from './ui/DevMenu';
import { HomeShell } from './ui/HomeShell';

// v2 root, mounted instead of v1's App when VITE_GAME_V2=true (see src/main.tsx).

const DEV_MENU_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEV_MENU === 'true';

export default function AppV2() {
  useEffect(() => {
    // The native splash waits for the app (launchAutoHide: false); v2 loads synchronously from localStorage.
    SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
  }, []);

  return (
    <I18nProvider>
      <GameV2Provider>
        <HomeShell />
        {DEV_MENU_ENABLED && <DevMenu />}
      </GameV2Provider>
    </I18nProvider>
  );
}

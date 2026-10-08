import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect, useState } from 'react';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './mobile.css';
import { I18nProvider } from './i18n/I18nProvider';
import { installBackButton } from './runtime/backButton';
import { GameV2Provider } from './runtime/GameV2Provider';
import { readSave } from './runtime/storage';
import { DevMenu } from './ui/DevMenu';
import { HomeScreen } from './ui/home/HomeScreen';
import { MockAdOverlay } from './ui/ads/MockAdOverlay';
import { Prologue } from './ui/story/Prologue';

// v2 root, mounted instead of v1's App when VITE_GAME_V2=true (see src/main.tsx).

const DEV_MENU_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEV_MENU === 'true';

export default function AppV2() {
  // undefined = still reading the save (native storage is async); the splash stays up until then.
  const [saveText, setSaveText] = useState<string | null | undefined>(undefined);
  // 'intro': a new player sees the prologue before the game (and its life clock) starts.
  // 'replay': shown over a running game (dev menu; later the story album).
  const [prologue, setPrologue] = useState<'none' | 'intro' | 'replay'>('none');

  useEffect(() => {
    let cancelled = false;
    readSave().then((text) => {
      if (cancelled) return;
      setSaveText(text);
      if (text === null) setPrologue('intro');
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

  const endPrologue = () => setPrologue('none');

  return (
    <I18nProvider>
      {prologue === 'intro' ? (
        <Prologue onDone={endPrologue} />
      ) : (
        <GameV2Provider saveText={saveText}>
          <HomeScreen />
          {DEV_MENU_ENABLED && <DevMenu onReplayPrologue={() => setPrologue('replay')} />}
          {prologue === 'replay' && <Prologue onDone={endPrologue} />}
        </GameV2Provider>
      )}
      <MockAdOverlay />
    </I18nProvider>
  );
}

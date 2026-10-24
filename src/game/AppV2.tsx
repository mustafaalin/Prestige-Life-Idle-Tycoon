import { SplashScreen } from "@capacitor/splash-screen";
import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "./mobile.css";
import { I18nProvider } from "./i18n/I18nProvider";
import { loadLocale, type Locale } from "./i18n/locales";
import { useT } from "./i18n/useT";
import { checkConsentEarly } from "./runtime/ads";
import { installBackButton } from "./runtime/backButton";
import { installCrashReports } from "./runtime/crashReports";
import {
  installNotificationTracking,
  loadNotificationsPref,
} from "./runtime/notifications";
import { GameV2Provider } from "./runtime/GameV2Provider";
import { readSave } from "./runtime/storage";
import { CrashBoundary } from "./ui/CrashScreen";
import { DevMenu } from "./ui/DevMenu";
import { ExitHint } from "./ui/home/ExitHint";
import { HomeScreen } from "./ui/home/HomeScreen";
import { MockAdOverlay } from "./ui/ads/MockAdOverlay";
import { Prologue } from "./ui/story/Prologue";
import { STAGE_ID } from "./ui/stage";

// v2 root, mounted instead of v1's App when VITE_GAME_V2=true (see src/main.tsx).

const DEV_MENU_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_DEV_MENU === "true";

export default function AppV2() {
  // undefined / null = still reading the save, language and reminder switch (native storage is async); the splash stays up until then.
  const [saveText, setSaveText] = useState<string | null | undefined>(
    undefined,
  );
  const [locale, setLocale] = useState<Locale | null>(null);
  // 'intro': a new player sees the prologue before the game (and its life clock) starts.
  // 'replay': shown over a running game (dev menu; later the story album).
  const [prologue, setPrologue] = useState<"none" | "intro" | "replay">("none");

  useEffect(() => {
    let cancelled = false;
    Promise.all([readSave(), loadLocale(), loadNotificationsPref()]).then(
      ([text, savedLocale]) => {
        if (cancelled) return;
        setLocale(savedLocale);
        setSaveText(text);
        if (text === null) setPrologue("intro");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => installBackButton(), []);
  useEffect(() => installCrashReports(), []);
  // Installed at launch: a tap on a reminder is what opened the app.
  useEffect(() => installNotificationTracking(), []);
  // Before the prologue, so its events count for the player (runtime/ads.ts).
  useEffect(() => checkConsentEarly(), []);

  const loaded = saveText !== undefined && locale !== null;
  useEffect(() => {
    // The native splash waits for the app (launchAutoHide: false).
    if (loaded) SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
  }, [loaded]);

  if (!loaded || locale === null) return null;

  const endPrologue = () => setPrologue("none");

  return (
    <I18nProvider initialLocale={locale}>
      <div className="v2-backdrop" />
      <div id={STAGE_ID} className="v2-stage">
        <CrashBoundary>
          {prologue === "intro" ? (
            <Prologue onDone={endPrologue} />
          ) : (
            <GameV2Provider saveText={saveText}>
              <HomeScreen />
              {DEV_MENU_ENABLED && (
                <DevMenu onReplayPrologue={() => setPrologue("replay")} />
              )}
              {prologue === "replay" && <Prologue onDone={endPrologue} />}
            </GameV2Provider>
          )}
        </CrashBoundary>
        <MockAdOverlay />
        <ExitHint />
      </div>
      <RotateHint />
    </I18nProvider>
  );
}

/** Shown only on a short landscape window (mobile.css .v2-rotate): the game is portrait. */
function RotateHint() {
  const { t } = useT();
  return (
    <div className="v2-rotate">
      <Smartphone className="w-12 h-12" />
      <p className="v2-display text-xl">{t("common.rotate")}</p>
    </div>
  );
}

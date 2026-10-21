import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';

// Crash reports (Firebase Crashlytics, 2026-10-21). Native crashes are caught by the SDK itself; the
// game runs in a web view, so its own errors never crash the app and are sent here as non-fatal
// reports: uncaught errors, rejected promises and a screen that failed to draw (CrashScreen).
// On the web nothing is sent; without google-services.json the native SDK stays off.

const native = Capacitor.isNativePlatform();
/** Long stacks are cut: one report is enough to find the line, and the SDK limits its size. */
const MAX_LENGTH = 4000;

function describe(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack ?? ''}`;
  return typeof error === 'string' ? error : JSON.stringify(error);
}

/** Sends a handled error as a non-fatal report; `where` names the place that caught it. */
export function reportError(error: unknown, where: string) {
  if (import.meta.env.DEV) console.error(`[crash] ${where}`, error);
  if (!native) return;
  const message = `[${where}] ${describe(error)}`.slice(0, MAX_LENGTH);
  FirebaseCrashlytics.recordException({ message }).catch(() => {});
}

/** Catches what nothing else caught. Returns the cleanup. */
export function installCrashReports() {
  const onError = (event: ErrorEvent) => reportError(event.error ?? event.message, 'window');
  const onRejection = (event: PromiseRejectionEvent) => reportError(event.reason, 'promise');
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

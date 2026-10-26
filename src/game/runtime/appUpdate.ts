import { Capacitor } from '@capacitor/core';
import {
  AppUpdate,
  AppUpdateAvailability,
  AppUpdateResultCode,
  FlexibleUpdateInstallStatus,
} from '@capawesome/capacitor-app-update';
import { track } from './analytics';

// A newer version on Google Play (In-App Updates, flexible; decided 2026-10-26): a while after launch
// Play's own dialog offers it, and the download runs while the player keeps playing. Once it is down,
// a banner (ui/home/UpdateToast.tsx) offers the restart; never forced. A download left unfinished is
// offered again at the next launch. Android only; on the web and iOS nothing happens.

/** After the splash and the consent form, so the dialogs don't stack. */
const CHECK_DELAY_MS = 8000;

let ready = false;
const listeners = new Set<() => void>();

function markReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
}

/** Whether a downloaded update waits for a restart; `onChange` is called once it does. */
export function subscribeUpdateReady(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export const updateReady = () => ready;

async function check() {
  const info = await AppUpdate.getAppUpdateInfo();
  if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
    markReady();
    return;
  }
  if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE || !info.flexibleUpdateAllowed) return;
  await AppUpdate.addListener('onFlexibleUpdateStateChange', (state) => {
    if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) markReady();
  });
  const result = await AppUpdate.startFlexibleUpdate();
  track('app_update', {
    id: info.availableVersionCode ?? '',
    outcome: result.code === AppUpdateResultCode.OK ? 'accepted' : 'declined',
  });
}

/** Called once at launch; returns the cleanup. Never throws. */
export function installAppUpdateCheck() {
  if (Capacitor.getPlatform() !== 'android') return () => {};
  const timer = window.setTimeout(() => {
    check().catch(() => {
      // Not installed from Play (dev build, sideload) or no Play services: nothing to offer.
    });
  }, CHECK_DELAY_MS);
  return () => window.clearTimeout(timer);
}

/** Restarts into the downloaded version. */
export function restartIntoUpdate() {
  track('app_update', { outcome: 'restart' });
  AppUpdate.completeFlexibleUpdate().catch(() => {});
}

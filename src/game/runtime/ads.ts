import {
  AdMob,
  AdmobConsentDebugGeography,
  RewardAdPluginEvents,
  type RewardAdOptions,
} from '@capacitor-community/admob';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';

// Rewarded ads for v2 (docs/monetization-v2.md). One entry point: showRewardedAd(placement).
// Native: AdMob with Google's consent flow (UMP for the EEA/UK/Switzerland first, then iOS ATT the
// first time the player chooses to watch an ad). Web and dev: a mock ad drawn by <MockAdOverlay />.
// Framework-free; React reads the state through useAdsState().

/** Where an ad was offered; kept for analytics and per-placement rules. */
export type AdPlacement = 'offline_x2' | 'find_x2' | 'income_boost' | 'dream_help' | 'dev_test';

/** rewarded: watched to the end. dismissed: closed early. unavailable: no ad (no fill, no consent, busy). */
export type AdOutcome = 'rewarded' | 'dismissed' | 'unavailable';

export interface AdsState {
  /** Consent allows requesting ads (always true on web). */
  canRequestAds: boolean;
  /** The player must be able to reopen the consent choices (EEA etc.): show "Privacy options". */
  privacyOptionsRequired: boolean;
  /** A mock ad is on screen (web/dev only). */
  mock: { id: number; placement: AdPlacement } | null;
}

const REWARDED_UNIT_IDS = {
  android: 'ca-app-pub-8950990027285549/1720602351',
  ios: 'ca-app-pub-8950990027285549/1908304619',
};

const native = Capacitor.isNativePlatform();
/** Never show live ads while developing: invalid traffic can get the AdMob account banned. */
const testing = import.meta.env.DEV || import.meta.env.VITE_ADMOB_TESTING === 'true';
const testDevices = String(import.meta.env.VITE_ADMOB_TEST_DEVICE_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
/** Dev only: pretend to be in the EEA so the consent form shows on a phone outside Europe. */
const debugEea = import.meta.env.DEV && import.meta.env.VITE_ADMOB_DEBUG_EEA === 'true';
const unitId = Capacitor.getPlatform() === 'ios' ? REWARDED_UNIT_IDS.ios : REWARDED_UNIT_IDS.android;

let state: AdsState = { canRequestAds: !native, privacyOptionsRequired: false, mock: null };
const listeners = new Set<() => void>();

function setState(patch: Partial<AdsState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function getAdsState() {
  return state;
}

export function subscribeAds(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ── Setup and consent ──

let initPromise: Promise<void> | null = null;

async function refreshConsent(showFormIfNeeded: boolean) {
  let info = await AdMob.requestConsentInfo({
    testDeviceIdentifiers: testDevices,
    debugGeography: debugEea ? AdmobConsentDebugGeography.EEA : undefined,
  });
  if (showFormIfNeeded && !info.canRequestAds && info.isConsentFormAvailable) {
    info = await AdMob.showConsentForm();
  }
  setState({
    canRequestAds: info.canRequestAds,
    // The plugin doesn't export its PrivacyOptionsRequirementStatus enum; 'REQUIRED' is its value.
    privacyOptionsRequired: info.privacyOptionsRequirementStatus === 'REQUIRED',
  });
}

/**
 * Starts the SDK and asks for consent where the law requires it. Call once the player is in the
 * game (after the prologue), so the consent form never covers the story. Safe to call repeatedly.
 */
export function initAds(): Promise<void> {
  if (!native) return Promise.resolve();
  initPromise ??= (async () => {
    try {
      await AdMob.initialize({ initializeForTesting: testing, testingDevices: testDevices });
      await refreshConsent(true);
      if (state.canRequestAds) void preload();
    } catch (error) {
      console.warn('[ads] setup failed', error);
    }
  })();
  return initPromise;
}

/** Reopens the consent choices (Settings → Privacy options). */
export async function showPrivacyOptions() {
  if (!native) return;
  try {
    await AdMob.showPrivacyOptionsForm();
    await refreshConsent(false);
  } catch (error) {
    console.warn('[ads] privacy options failed', error);
  }
}

/** iOS: ask for tracking only when the player has just chosen to watch an ad, so the reason is clear. */
async function askTrackingOnce() {
  if (Capacitor.getPlatform() !== 'ios') return;
  try {
    const { status } = await AdMob.trackingAuthorizationStatus();
    if (status === 'notDetermined') await AdMob.requestTrackingAuthorization();
  } catch {
    // Tracking is optional: ads still show without it.
  }
}

// ── Loading and showing ──

let loaded = false;
let loading: Promise<boolean> | null = null;
let busy = false;

function preload(): Promise<boolean> {
  if (loaded) return Promise.resolve(true);
  loading ??= AdMob.prepareRewardVideoAd({ adId: unitId, isTesting: testing } as RewardAdOptions)
    .then(() => {
      loaded = true;
      return true;
    })
    .catch((error) => {
      console.warn('[ads] load failed', error);
      return false;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

async function showNative(): Promise<AdOutcome> {
  await initAds();
  if (!state.canRequestAds) return 'unavailable';
  await askTrackingOnce();
  if (!(await preload())) return 'unavailable';

  return new Promise<AdOutcome>((resolve) => {
    let rewarded = false;
    let handles: PluginListenerHandle[] = [];
    const finish = (outcome: AdOutcome) => {
      handles.forEach((handle) => void handle.remove());
      handles = [];
      loaded = false;
      void preload(); // the next offer opens instantly
      resolve(outcome);
    };
    // The reward is granted after the ad closes, so the player sees it land.
    Promise.all([
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      }),
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(rewarded ? 'rewarded' : 'dismissed')),
      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish('unavailable')),
    ])
      .then((added) => {
        handles = added;
        return AdMob.showRewardVideoAd();
      })
      .catch((error) => {
        console.warn('[ads] show failed', error);
        finish('unavailable');
      });
  });
}

// Web/dev: <MockAdOverlay /> plays a short fake ad and settles it.
let settleMock: ((outcome: AdOutcome) => void) | null = null;
let mockCount = 0;

function showMock(placement: AdPlacement): Promise<AdOutcome> {
  return new Promise((resolve) => {
    settleMock = resolve;
    mockCount += 1;
    setState({ mock: { id: mockCount, placement } });
  });
}

/** Called by the mock overlay when the fake ad ends or is closed. */
export function finishMockAd(outcome: AdOutcome) {
  settleMock?.(outcome);
  settleMock = null;
  setState({ mock: null });
}

/**
 * Shows a rewarded ad the player chose to watch. Grant the reward only on 'rewarded'.
 * The offer itself must say what the ad gives before this is called (AdMob policy).
 */
export async function showRewardedAd(placement: AdPlacement): Promise<AdOutcome> {
  if (busy) return 'unavailable';
  busy = true;
  try {
    return native ? await showNative() : await showMock(placement);
  } finally {
    busy = false;
  }
}

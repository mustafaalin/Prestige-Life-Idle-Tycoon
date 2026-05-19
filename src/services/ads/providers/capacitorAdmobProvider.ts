import { AdMob, RewardAdPluginEvents, type RewardAdOptions } from '@capacitor-community/admob';
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { getRewardedAdUnitId } from '../adMobConfig';
import {
  createEmptyAdState,
  type AdPlacement,
  type RewardedAdProvider,
  type RewardedAdResult,
} from '../types';
import { pauseMusic, resumeMusic } from '../../audioService';

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

let state = createEmptyAdState('capacitor-admob');
let initializePromise: Promise<void> | null = null;
let initialized = false;
let rewardListenerHandles: PluginListenerHandle[] = [];
let adInProgress = false;

// Preload state — keep an ad ready so showRewardedAd can display instantly
let preloadedAdId: string | null = null;
let preloadPromise: Promise<boolean> | null = null;

function setState(nextState: typeof state) {
  state = nextState;
  emit();
}

async function clearRewardListeners() {
  if (!rewardListenerHandles.length) return;

  await Promise.all(
    rewardListenerHandles.map(async (handle) => {
      try {
        await handle.remove();
      } catch (error) {
        console.warn('[ads] Failed removing AdMob listener', error);
      }
    })
  );

  rewardListenerHandles = [];
}

async function ensureInitialized() {
  if (initialized) return;
  if (initializePromise) return initializePromise;

  initializePromise = (async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const isTesting = import.meta.env.VITE_ADMOB_TESTING === 'true';
    const testDeviceIds = (import.meta.env.VITE_ADMOB_TEST_DEVICE_IDS || '')
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);

    await AdMob.initialize({
      initializeForTesting: isTesting,
      testingDevices: testDeviceIds.length ? testDeviceIds : undefined,
    });

    try {
      if (Capacitor.getPlatform() === 'ios') {
        const tracking = await AdMob.trackingAuthorizationStatus();
        if (tracking.status === 'notDetermined') {
          await AdMob.requestTrackingAuthorization();
        }
      }

      let consentInfo = await AdMob.requestConsentInfo();
      if (!consentInfo.canRequestAds && consentInfo.isConsentFormAvailable) {
        consentInfo = await AdMob.showConsentForm();
      }

      void consentInfo;
    } catch (error) {
      console.warn('[ads] Consent initialization failed, continuing with test setup.', error);
    }

    initialized = true;
  })().finally(() => {
    initializePromise = null;
  });

  return initializePromise;
}

async function ensurePreloaded(adId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (preloadedAdId === adId) return true;

  // If a preload is already in flight, await it and re-check
  if (preloadPromise) {
    await preloadPromise;
    if (preloadedAdId === adId) return true;
  }

  preloadPromise = (async () => {
    try {
      await ensureInitialized();
      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: import.meta.env.VITE_ADMOB_TESTING === 'true',
        npa: false,
      } as RewardAdOptions);
      preloadedAdId = adId;
      return true;
    } catch (error) {
      console.warn('[ads] preload failed', error);
      preloadedAdId = null;
      return false;
    }
  })();

  const ok = await preloadPromise;
  preloadPromise = null;
  return ok;
}

export const capacitorAdmobProvider: RewardedAdProvider = {
  name: 'capacitor-admob',
  async showRewardedAd(placement: AdPlacement): Promise<RewardedAdResult> {
    if (!Capacitor.isNativePlatform()) {
      return { rewarded: false };
    }

    if (adInProgress) {
      return { rewarded: false };
    }
    adInProgress = true;

    await ensureInitialized();
    await clearRewardListeners();

    return new Promise<RewardedAdResult>(async (resolve) => {
      let settled = false;
      const targetAdId = getRewardedAdUnitId(placement);

      const finish = async (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        adInProgress = false;
        resumeMusic();
        await clearRewardListeners();
        setState(createEmptyAdState('capacitor-admob'));
        // Warm up next ad in background — keeps subsequent taps instant
        void ensurePreloaded(targetAdId);
        resolve(result);
      };

      rewardListenerHandles = await Promise.all([
        AdMob.addListener(RewardAdPluginEvents.Rewarded, async () => {
          await finish({ rewarded: true });
        }),
        AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
          await finish({ rewarded: false });
        }),
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, async (error) => {
          console.warn('[ads] Rewarded ad failed to load', error);
          preloadedAdId = null;
          await finish({ rewarded: false });
        }),
        AdMob.addListener(RewardAdPluginEvents.FailedToShow, async (error) => {
          console.warn('[ads] Rewarded ad failed to show', error);
          preloadedAdId = null;
          await finish({ rewarded: false });
        }),
      ]);

      try {
        const isReady = preloadedAdId === targetAdId || (await ensurePreloaded(targetAdId));
        if (!isReady) {
          await finish({ rewarded: false });
          return;
        }

        preloadedAdId = null; // ad is consumed by show
        pauseMusic();
        await AdMob.showRewardVideoAd();
      } catch (error) {
        console.warn('[ads] Rewarded ad request failed', error);
        await finish({ rewarded: false });
      }
    });
  },
  async rewardActiveAd() {
    console.warn('[ads] rewardActiveAd is only used by the mock provider.');
  },
  async dismissActiveAd() {
    console.warn('[ads] dismissActiveAd is only used by the mock provider.');
  },
  getState() {
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export async function initializeCapacitorAdMob() {
  await ensureInitialized();
  // Warm up first ad so the user's first tap doesn't wait on a network round-trip
  if (Capacitor.isNativePlatform()) {
    void ensurePreloaded(getRewardedAdUnitId('total_income_boost'));
  }
}

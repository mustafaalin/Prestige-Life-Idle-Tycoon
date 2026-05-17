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

      const finish = async (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        adInProgress = false;
        resumeMusic();
        await clearRewardListeners();
        setState(createEmptyAdState('capacitor-admob'));
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
          await finish({ rewarded: false });
        }),
        AdMob.addListener(RewardAdPluginEvents.FailedToShow, async (error) => {
          console.warn('[ads] Rewarded ad failed to show', error);
          await finish({ rewarded: false });
        }),
      ]);

      try {
        const options: RewardAdOptions = {
          adId: getRewardedAdUnitId(placement),
          isTesting: import.meta.env.VITE_ADMOB_TESTING === 'true',
          npa: false,
        };

        await AdMob.prepareRewardVideoAd(options);
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
}

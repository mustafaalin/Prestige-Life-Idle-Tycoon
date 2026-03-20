import { Capacitor } from '@capacitor/core';
import type { AdPlacement } from './types';

const DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';
const DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1712485313';

const REWARDED_AD_UNIT_IDS: Record<AdPlacement, { android: string; ios: string }> = {
  quest_reward_x2: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
  offline_x2: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
  daily_streak_rescue: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
  shop_ad_reward: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
  earnings_x3: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
  job_unlock_skip: {
    android: DEFAULT_ANDROID_REWARDED_TEST_AD_UNIT_ID,
    ios: DEFAULT_IOS_REWARDED_TEST_AD_UNIT_ID,
  },
};

export function getRewardedAdUnitId(placement: AdPlacement) {
  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
  return REWARDED_AD_UNIT_IDS[placement][platform];
}

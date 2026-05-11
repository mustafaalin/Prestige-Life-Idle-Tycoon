import { Capacitor } from '@capacitor/core';
import type { AdPlacement } from './types';

const ANDROID_REWARDED_AD_UNIT_ID = 'ca-app-pub-8950990027285549/1720602351';
const IOS_REWARDED_AD_UNIT_ID = 'ca-app-pub-8950990027285549/1908304619';

const REWARDED_AD_UNIT_IDS: Record<AdPlacement, { android: string; ios: string }> = {
  quest_reward_x2:        { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  offline_x2:             { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  daily_streak_rescue:    { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  shop_ad_reward:         { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  earnings_x3:            { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  job_unlock_skip:        { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  bank_premium_deposit:   { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  business_upgrade_discount: { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  health_boost:           { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  happiness_boost:        { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  business_income_boost:  { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  investment_income_boost: { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
  total_income_boost:     { android: ANDROID_REWARDED_AD_UNIT_ID, ios: IOS_REWARDED_AD_UNIT_ID },
};

export function getRewardedAdUnitId(placement: AdPlacement) {
  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
  return REWARDED_AD_UNIT_IDS[placement][platform];
}

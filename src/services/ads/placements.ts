import type { AdPlacement, RewardedAdRequest } from './types';

const DEFAULT_MIN_WATCH_SECONDS = 3;

export const PLACEMENT_COPY: Record<
  AdPlacement,
  Pick<RewardedAdRequest, 'title' | 'description' | 'ctaLabel' | 'minWatchSeconds'>
> = {
  quest_reward_x2: {
    title: 'Quest Reward Boost',
    description: 'Finish this rewarded ad to double your quest reward.',
    ctaLabel: 'Complete Ad',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  offline_x2: {
    title: 'Offline Earnings Boost',
    description: 'Finish this rewarded ad to collect double offline earnings.',
    ctaLabel: 'Collect x2',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  daily_streak_rescue: {
    title: 'Daily Streak Rescue',
    description: 'Finish this rewarded ad to save your streak.',
    ctaLabel: 'Rescue Streak',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  shop_ad_reward: {
    title: 'Ad Reward',
    description: 'Finish this rewarded ad to collect the shop ad payout.',
    ctaLabel: 'Claim Reward',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  earnings_x3: {
    title: 'Triple Earnings',
    description: 'Finish this rewarded ad to triple this earnings claim.',
    ctaLabel: 'Claim x3',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  business_upgrade_discount: {
    title: 'Business Upgrade Discount',
    description: 'Finish this rewarded ad to cut this business upgrade cost in half.',
    ctaLabel: 'Unlock 50% Off',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  job_unlock_skip: {
    title: 'Job Unlock Skip',
    description: 'Finish this rewarded ad to skip the remaining job unlock wait.',
    ctaLabel: 'Skip Timer',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  bank_premium_deposit: {
    title: 'Premium Bank Deposit',
    description: 'Finish this rewarded ad to start your premium bank investment.',
    ctaLabel: 'Start Deposit',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  health_boost: {
    title: 'Health Boost',
    description: 'Finish this rewarded ad to restore 50% health instantly.',
    ctaLabel: 'Boost Health',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  happiness_boost: {
    title: 'Happiness Boost',
    description: 'Finish this rewarded ad to restore 50% happiness instantly.',
    ctaLabel: 'Boost Happiness',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  business_income_boost: {
    title: '2× Business Income',
    description: 'Watch an ad to double your business income for 1 hour.',
    ctaLabel: 'Activate 2× Boost',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  investment_income_boost: {
    title: '2× Investment Income',
    description: 'Watch an ad to double your investment income for 1 hour.',
    ctaLabel: 'Activate 2× Boost',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
  total_income_boost: {
    title: '2× Total Income',
    description: 'Watch an ad to double your total income for 1 hour.',
    ctaLabel: 'Activate 2× Boost',
    minWatchSeconds: DEFAULT_MIN_WATCH_SECONDS,
  },
};

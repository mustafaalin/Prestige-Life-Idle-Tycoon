import { capacitorAdmobProvider } from './providers/capacitorAdmobProvider';
import { mockRewardedProvider } from './providers/mockRewardedProvider';
import type { RewardedAdProvider } from './types';

function hasCapacitorRuntime() {
  if (typeof window === 'undefined') return false;

  const runtime = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(runtime?.isNativePlatform?.());
}

export function selectRewardedAdProvider(): RewardedAdProvider {
  if (hasCapacitorRuntime()) {
    return capacitorAdmobProvider;
  }

  return mockRewardedProvider;
}

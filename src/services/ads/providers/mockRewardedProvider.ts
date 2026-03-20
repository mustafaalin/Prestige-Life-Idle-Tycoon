import { PLACEMENT_COPY } from '../placements';
import {
  createEmptyAdState,
  type AdServiceState,
  type AdPlacement,
  type RewardedAdProvider,
  type RewardedAdRequest,
  type RewardedAdResult,
} from '../types';

let nextRequestId = 1;
let state: AdServiceState = createEmptyAdState('mock');
let activeResolver: ((value: RewardedAdResult) => void) | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: AdServiceState) {
  state = nextState;
  emit();
}

function settleActiveRequest(result: RewardedAdResult) {
  const resolver = activeResolver;
  activeResolver = null;
  setState(createEmptyAdState('mock'));
  resolver?.(result);
}

export const mockRewardedProvider: RewardedAdProvider = {
  name: 'mock',
  async showRewardedAd(placement: AdPlacement): Promise<RewardedAdResult> {
    if (state.activeRequest) {
      return { rewarded: false };
    }

    const copy = PLACEMENT_COPY[placement];
    const request: RewardedAdRequest = {
      id: nextRequestId++,
      placement,
      title: copy.title,
      description: copy.description,
      ctaLabel: copy.ctaLabel,
      minWatchSeconds: copy.minWatchSeconds,
    };

    setState({
      activeRequest: request,
      providerName: 'mock',
    });

    return new Promise<RewardedAdResult>((resolve) => {
      activeResolver = resolve;
    });
  },
  rewardActiveAd() {
    settleActiveRequest({ rewarded: true });
  },
  dismissActiveAd() {
    settleActiveRequest({ rewarded: false });
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

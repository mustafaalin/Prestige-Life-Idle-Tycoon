import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

// Analytics events (plan 1.14), sent to Firebase Analytics on phones. Firebase itself records
// first_open, session_start and engagement time, which give session length and D1/D7 retention;
// these events add what the playtest gate needs on top (class reached, what players do, story skips).
// On the web nothing is sent; in dev every event is also logged to the console.
// Without google-services.json the native SDK stays disabled and the calls do nothing.

export type AnalyticsEvent =
  | 'class_up'
  | 'business_buy'
  | 'manager_hire'
  | 'upgrade_buy'
  | 'promotion'
  | 'lifestyle_buy'
  | 'home_change'
  | 'quest_claim'
  | 'find_claim'
  | 'offline_claim'
  | 'retire'
  | 'ad_watch'
  | 'story_view'
  | 'daughter_named'
  | 'notification_prompt'
  | 'notification_open'
  | 'tutorial_step';

type Params = Record<string, string | number | boolean>;

const native = Capacitor.isNativePlatform();

/** Firebase params take strings and numbers only; booleans go as 0/1. */
function clean(params: Params): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, typeof value === 'boolean' ? Number(value) : value]),
  );
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (import.meta.env.DEV) console.debug('[analytics]', event, params);
  if (native) FirebaseAnalytics.logEvent({ name: event, params: clean(params) }).catch(() => {});
}

/** The open screen (home or a tab); Firebase turns it into screen_view events. */
export function trackScreen(screen: string) {
  if (import.meta.env.DEV) console.debug('[analytics] screen', screen);
  if (native) FirebaseAnalytics.setCurrentScreen({ screenName: screen }).catch(() => {});
}

/** Lets every report be split by where the player is (wealth class, generation). */
export function setPlayerProperties(properties: { classIndex: number; generation: number }) {
  if (!native) return;
  FirebaseAnalytics.setUserProperty({ key: 'class_index', value: String(properties.classIndex) }).catch(() => {});
  FirebaseAnalytics.setUserProperty({ key: 'generation', value: String(properties.generation) }).catch(() => {});
}

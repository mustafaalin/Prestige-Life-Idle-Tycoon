import { ConsentStatus, ConsentType, FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

// Analytics events (plan 1.14), sent to Firebase Analytics on phones. Firebase itself records
// first_open, session_start and engagement time, which give session length and D1/D7 retention;
// these events add what the playtest gate needs on top (class reached, what players do, story skips).
// On the web nothing is sent; in dev every event is also logged to the console.
// Without google-services.json the native SDK stays disabled and the calls do nothing.

export type AnalyticsEvent =
  | 'class_up'
  | 'business_level'
  | 'business_branch'
  | 'manager_hire'
  | 'job_take'
  | 'course_start'
  | 'skill_train'
  | 'skill_pause'
  | 'skill_collect'
  | 'lifestyle_buy'
  | 'home_change'
  | 'quest_claim'
  | 'find_claim'
  | 'event_card'
  | 'offline_claim'
  | 'daily_claim'
  | 'invest_start'
  | 'invest_collect'
  | 'retire'
  | 'hand_over_early'
  | 'new_game'
  | 'heirloom_buy'
  | 'ad_offer'
  | 'ad_watch'
  | 'story_view'
  | 'story_gift'
  | 'review_prompt'
  | 'app_update'
  | 'daughter_named'
  | 'grandchild_named'
  | 'notification_prompt'
  | 'notification_open'
  | 'tutorial_step'
  | 'offer_view'
  | 'offer_card'
  | 'purchase_start'
  | 'purchase_result'
  | 'purchase_restore'
  | 'purchase_applied'
  | 'purchase_revoked';

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

/**
 * Consent mode (2026-10-22): Analytics starts with every consent denied (AndroidManifest.xml). Where EU
 * rules apply, Google's consent form (UMP) passes the player's own choices to Analytics; where they do
 * not, the game grants them with this. Called after each consent check (runtime/ads.ts); Firebase keeps
 * the choice across launches.
 */
export function grantAnalyticsConsent() {
  if (!native) return;
  const types = [ConsentType.AnalyticsStorage, ConsentType.AdStorage, ConsentType.AdUserData, ConsentType.AdPersonalization];
  for (const type of types) FirebaseAnalytics.setConsent({ type, status: ConsentStatus.Granted }).catch(() => {});
}

/** This install's Firebase Analytics id; RevenueCat needs it to send purchase events to Firebase. */
export async function firebaseInstanceId(): Promise<string | null> {
  if (!native) return null;
  try {
    return (await FirebaseAnalytics.getAppInstanceId()).appInstanceId ?? null;
  } catch {
    return null;
  }
}

/** Lets every report be split by where the player is (wealth class, generation). */
export function setPlayerProperties(properties: { classIndex: number; generation: number }) {
  if (!native) return;
  FirebaseAnalytics.setUserProperty({ key: 'class_index', value: String(properties.classIndex) }).catch(() => {});
  FirebaseAnalytics.setUserProperty({ key: 'generation', value: String(properties.generation) }).catch(() => {});
}

// Analytics events (plan 1.14). The Firebase wrapper is not in yet: events are only logged in dev,
// so the call sites are ready when it lands.

export type AnalyticsEvent = 'story_view' | 'notification_prompt';

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  if (import.meta.env.DEV) console.debug('[analytics]', event, params);
}

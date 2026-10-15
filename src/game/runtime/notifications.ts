import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { track } from './analytics';

// Local notifications (docs/discussion-notes.md §8 → Faz 1, 2026-10-09): Mom's next message and
// Lucky waiting when the offline earnings are full. No server: they are scheduled when the app goes
// to the background and cancelled when it comes back. At most one a day, only in the daytime.
// Web has none (every call is a no-op).

const native = Capacitor.isNativePlatform();
const PREF_KEY = 'prestige_life_v2_notifications';
const CHANNEL_ID = 'story';
const LUCKY_ID = 101;
const MOM_ID = 102;
const INVEST_ID = 103;
const DEV_TEST_ID = 199;

/** Local hours a reminder may arrive in: from 10:00 up to (not including) 21:00. */
const DAY_START_HOUR = 10;
const DAY_END_HOUR = 21;
/** Two reminders closer than this count as the same day; only Mom's is kept. */
const MIN_SEPARATION_MS = 12 * 60 * 60 * 1000;

export interface Reminder {
  title: string;
  body: string;
  /** When it should arrive (ms); moved into the daytime window. */
  at: number;
}

function readLocal(): string | null {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
}

// Read once at launch (loadNotificationsPref); the switch and the scheduler read this copy.
let enabled = readLocal() !== 'off';

/**
 * On phones the switch lives in Preferences like the save (the OS may clear a WebView's
 * localStorage, which would turn reminders back on for a player who switched them off); a choice
 * made before that only exists in localStorage and is copied over. Never throws.
 */
export async function loadNotificationsPref(): Promise<void> {
  if (!native) return;
  const local = readLocal();
  try {
    const stored = (await Preferences.get({ key: PREF_KEY })).value;
    if (stored === 'on' || stored === 'off') enabled = stored === 'on';
    else if (local !== null) await Preferences.set({ key: PREF_KEY, value: local });
  } catch {
    // Native storage unavailable: the local copy stays.
  }
}

/** The player's switch in Settings (on by default; the OS permission is separate). */
export function notificationsEnabled(): boolean {
  return enabled;
}

export function setNotificationsEnabled(value: boolean) {
  enabled = value;
  const text = value ? 'on' : 'off';
  try {
    localStorage.setItem(PREF_KEY, text);
  } catch {
    // The native copy below is the one that counts on phones.
  }
  if (native) Preferences.set({ key: PREF_KEY, value: text }).catch(() => {});
  if (!value) void cancelReminders();
}

export const notificationsSupported = native;

const KIND_BY_ID: Record<number, string> = { [LUCKY_ID]: 'lucky', [MOM_ID]: 'mom', [INVEST_ID]: 'invest', [DEV_TEST_ID]: 'dev_test' };

/** Counts taps on our reminders (they open the app; nothing else to do). Returns the stop function. */
export function installNotificationTracking(): () => void {
  if (!native) return () => {};
  const handle = LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
    track('notification_open', { kind: KIND_BY_ID[notification.id] ?? 'other' });
  });
  return () => void handle.then((h) => h.remove()).catch(() => {});
}

let channelReady: Promise<void> | null = null;

function ensureChannel(channelName: string) {
  if (Capacitor.getPlatform() !== 'android') return Promise.resolve();
  channelReady ??= LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: channelName,
    importance: 3,
    visibility: 1,
  }).catch(() => {});
  return channelReady;
}

/** Shows the OS permission dialog (Android 13+, iOS). Resolves to whether reminders may be shown. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!native) return false;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    return (await LocalNotifications.requestPermissions()).display === 'granted';
  } catch {
    return false;
  }
}

/** Moves a time into the daytime window: too early → 10:00 that day, too late → 10:00 the next day. */
export function intoDaytime(at: number): number {
  const date = new Date(at);
  const hour = date.getHours();
  if (hour >= DAY_START_HOUR && hour < DAY_END_HOUR) return at;
  if (hour >= DAY_END_HOUR) date.setDate(date.getDate() + 1);
  date.setHours(DAY_START_HOUR, 0, 0, 0);
  return date.getTime();
}

export async function cancelReminders() {
  if (!native) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: LUCKY_ID }, { id: MOM_ID }, { id: INVEST_ID }] });
  } catch {
    // Nothing scheduled.
  }
}

/** Replaces any scheduled reminders. Mom's wins when both would land on the same day. */
/**
 * `invest`: Old Ray's deal is due. It takes Lucky's place (both say "come back and collect"), so the
 * one-a-day rule stays.
 */
export async function scheduleReminders(
  { lucky: luckyReminder, mom, invest }: { lucky: Reminder | null; mom: Reminder | null; invest?: Reminder | null },
  channelName: string,
) {
  const lucky = invest ?? luckyReminder;
  const luckyId = invest ? INVEST_ID : LUCKY_ID;
  if (!native || !notificationsEnabled()) return;
  try {
    await cancelReminders();
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return;
    await ensureChannel(channelName);

    const momAt = mom ? intoDaytime(mom.at) : null;
    let luckyAt = lucky ? intoDaytime(lucky.at) : null;
    if (luckyAt !== null && momAt !== null && Math.abs(momAt - luckyAt) < MIN_SEPARATION_MS) luckyAt = null;

    const notifications = [];
    if (lucky && luckyAt !== null) notifications.push(toNotification(luckyId, lucky, luckyAt));
    if (mom && momAt !== null) notifications.push(toNotification(MOM_ID, mom, momAt));
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
  } catch {
    // Scheduling failed; the game works the same without reminders.
  }
}

function toNotification(id: number, reminder: Reminder, at: number) {
  return {
    id,
    title: reminder.title,
    body: reminder.body,
    channelId: CHANNEL_ID,
    // Inexact on purpose: the plugin's default (exact) opens Android's "Alarms & reminders" settings
    // on every schedule, since the exact-alarm permission is removed from the manifest (AAB 28 bug).
    isExactNotification: false,
    schedule: { at: new Date(at), allowWhileIdle: true },
  };
}

/** Dev menu: one reminder in a few seconds, to check the icon, text and tap on a phone. */
export async function scheduleTestReminder(reminder: Omit<Reminder, 'at'>, channelName: string) {
  if (!native || !(await requestNotificationPermission())) return;
  await ensureChannel(channelName);
  await LocalNotifications.schedule({
    notifications: [toNotification(DEV_TEST_ID, { ...reminder, at: 0 }, Date.now() + 5000)],
  }).catch(() => {});
}

import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

import { prefs } from './storage';

export type ReminderPrefs = { enabled: boolean; hour: number; minute: number };
export const DEFAULT_REMINDER: ReminderPrefs = { enabled: true, hour: 16, minute: 0 };
const FRIDAY = 6; // expo-notifications weekday: 1 = Sunday … 7 = Saturday

// expo-notifications is unavailable on web, and Expo Go for Android no longer bundles all of its
// native modules (importing it there crashes). It is loaded lazily and only where it works;
// development and store builds always have it.
export const notificationsSupported =
  Platform.OS !== 'web' && !(Platform.OS === 'android' && isRunningInExpoGo());

let N: typeof import('expo-notifications') | null = null;
function notifications() {
  if (!notificationsSupported) return null;
  if (!N) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: must not load where unsupported
    N = require('expo-notifications') as typeof import('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  }
  return N;
}

export async function getReminderPrefs() {
  return prefs.get<ReminderPrefs>('reminder', DEFAULT_REMINDER);
}

export async function requestPermission(): Promise<boolean> {
  const n = notifications();
  if (!n) return false;
  if (Platform.OS === 'android') {
    await n.setNotificationChannelAsync('reminders', { name: 'Cuma hatırlatması', importance: n.AndroidImportance.HIGH });
  }
  const current = await n.getPermissionsAsync();
  if (current.granted || current.ios?.status === n.IosAuthorizationStatus.PROVISIONAL) return true;
  return (await n.requestPermissionsAsync()).granted;
}

export async function cancelReminders() {
  await notifications()?.cancelAllScheduledNotificationsAsync();
}

// One weekly local notification on Friday; no server or push token needed.
export async function scheduleFridayReminder(p: ReminderPrefs): Promise<boolean> {
  await prefs.set('reminder', p);
  const n = notifications();
  if (!n) return false;
  await n.cancelAllScheduledNotificationsAsync();
  if (!p.enabled) return true;
  if (!(await requestPermission())) return false;
  await n.scheduleNotificationAsync({
    content: {
      title: 'Cuma kaydı zamanı ✍️',
      body: 'Bu haftayı 5 dakikada arşivle. Altı ay sonraki sen teşekkür edecek.',
      data: { url: '/entry' },
    },
    trigger: {
      type: n.SchedulableTriggerInputTypes.WEEKLY,
      weekday: FRIDAY,
      hour: p.hour,
      minute: p.minute,
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    },
  });
  return true;
}

// Tapping the reminder opens the route stored in its data.
export function onReminderTap(open: (url: string) => void) {
  const n = notifications();
  if (!n) return () => {};
  const sub = n.addNotificationResponseReceivedListener((r) => {
    const url = r.notification.request.content.data?.url;
    if (typeof url === 'string') open(url);
  });
  return () => sub.remove();
}

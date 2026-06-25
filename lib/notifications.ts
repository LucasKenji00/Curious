import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { NotificationFrequency, Category, Angle, SurpriseType } from '@/types';
import { pickUnseen, markAsSeen } from './storage';
import { buildCuriosityPool } from './curiosities';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function deliveryHours(
  frequency: NotificationFrequency,
  startHour: number,
  endHour: number
): number[] {
  if (frequency === 1) return [startHour];
  const span = endHour - startHour;
  const step = span / (frequency - 1);
  return Array.from({ length: frequency }, (_, i) =>
    Math.round(startHour + i * step)
  );
}

export async function scheduleDailyNotifications(
  categories: Category[],
  frequency: NotificationFrequency,
  angle: Angle,
  shareType: SurpriseType,
  startTime: string,
  endTime: string
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const pool = await buildCuriosityPool(categories, angle, shareType);
  if (pool.length === 0) return;

  const picks = await pickUnseen(pool, frequency);
  await markAsSeen(picks.map((c) => c.id));

  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);
  const hours = deliveryHours(frequency, startHour, endHour);

  for (let i = 0; i < picks.length; i++) {
    const item = picks[i];

    // Title: full hook, word-truncated at 70 chars
    const title = (() => {
      const h = item.hook;
      if (h.length <= 70) return h;
      const cut = h.slice(0, 70);
      const lastSpace = cut.lastIndexOf(' ');
      return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
    })();

    // Body: full body text, capped at 180 chars at a sentence boundary
    let body = item.body;
    if (body.length > 180) {
      const sentences = body.match(/[^.!?]+[.!?]+/g) ?? [body];
      body = '';
      for (const s of sentences) {
        if ((body + s).length > 180) break;
        body += s;
      }
      body = body.trim() || sentences[0].slice(0, 177) + '…';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { curiosityId: item.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours[i] ?? startHour,
        minute: 0,
        repeats: true,
      },
    });
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

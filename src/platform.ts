// Thin layer over device features. In the Android app these use Capacitor plugins;
// in a browser they fall back to web APIs or quietly do nothing.
import { Capacitor } from '@capacitor/core';
import type { Settings } from './model/store';

export const isNative = () => Capacitor.isNativePlatform();

export async function buzz(strength: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: strength === 'heavy' ? ImpactStyle.Heavy : strength === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    } else if ('vibrate' in navigator) navigator.vibrate(strength === 'heavy' ? 40 : strength === 'medium' ? 25 : 12);
  } catch { /* no haptics available */ }
}

/** Save or share a text file: share sheet on Android, download in a browser. */
export async function saveTextFile(name: string, text: string) {
  if (isNative()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const res = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    const { Share } = await import('@capacitor/share');
    await Share.share({ title: name, url: res.uri, dialogTitle: name });
    return;
  }
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/** Schedule the weekly nudges and the gap alert as local notifications (Android app only). */
export async function scheduleNudges(s: Settings, lastSession: string | null, lang: 'en' | 'de') {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') { const r = await LocalNotifications.requestPermissions(); if (r.display !== 'granted') return; }
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    const [hh, mm] = s.nudgeTime.split(':').map(Number);
    const title = 'Orbitarium';
    const body = lang === 'de' ? 'Zeit für eine kurze Einheit – drei Fragen zum Aufwärmen warten.' : 'Time for a short session — three warm-up questions are waiting.';
    const notifications = s.nudgeDays.map((d, i) => ({
      id: 100 + i, title, body,
      // Capacitor weekdays: 1 = Sunday … 7 = Saturday; ours: 0 = Monday … 6 = Sunday
      schedule: { on: { weekday: ((d + 1) % 7) + 1, hour: hh, minute: mm }, allowWhileIdle: true },
    }));
    if (lastSession) {
      const at = new Date(lastSession + 'T00:00:00');
      at.setDate(at.getDate() + s.gapDays);
      at.setHours(hh, mm, 0, 0);
      if (at.getTime() > Date.now()) notifications.push({
        id: 200, title,
        body: lang === 'de' ? `Seit ${s.gapDays} Tagen keine Sitzung. Ein kurzes Aufwärmen hält das Wissen frisch.` : `No session for ${s.gapDays} days. A short warm-up keeps things from fading.`,
        schedule: { at, allowWhileIdle: true } as any,
      });
    }
    await LocalNotifications.schedule({ notifications: notifications as any });
  } catch (e) { console.warn('Notifications unavailable', e); }
}

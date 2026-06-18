import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';

// Expo Go (SDK 53+) ถอดฟีเจอร์ push ของ expo-notifications ออก แค่ import ก็ error
// => ตรวจว่าอยู่ใน Expo Go ไหม ถ้าใช่จะไม่แตะ expo-notifications เลย (redbox หาย)
//    การแจ้งเตือนเด้งจริงจะใช้ได้เมื่อ build เป็น development build / standalone
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let _Notifications = null;
function getNotifications() {
  if (isExpoGo) return null; // ใน Expo Go: ไม่โหลดโมดูลนี้
  if (!_Notifications) {
    _Notifications = require('expo-notifications');
    _Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return _Notifications;
}

// แจ้งเตือนเด้งจริงใช้ได้ไหม (เฉพาะนอก Expo Go)
export const notificationsAvailable = () => !isExpoGo;

// อ่านข้อความออกเสียงภาษาไทย — ใช้ได้ทุกที่ รวมถึง Expo Go
export function speak(text) {
  if (!text) return;
  try {
    Speech.stop();
    Speech.speak(String(text), { language: 'th-TH', rate: 0.95, pitch: 1.0 });
  } catch (e) {
    /* เงียบไว้ */
  }
}

export async function ensurePermissions() {
  const N = getNotifications();
  if (!N) return false;
  const current = await N.getPermissionsAsync();
  let granted = current.granted || current.status === 'granted';
  if (!granted) {
    const req = await N.requestPermissionsAsync();
    granted = req.granted || req.status === 'granted';
  }
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('meds', {
      name: 'แจ้งเตือนทานยา',
      importance: N.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  return granted;
}

// ตั้งแจ้งเตือนรายวันจากรายการในตาราง medication_notifications
export async function scheduleDailyReminders(notifications = []) {
  const N = getNotifications();
  if (!N) return 0;
  await N.cancelAllScheduledNotificationsAsync();
  let count = 0;
  for (const n of notifications) {
    const m = String(n.time || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!m) continue;
    const hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    if (hour > 23 || minute > 59) continue;
    await N.scheduleNotificationAsync({
      content: {
        title: 'ถึงเวลาทานยา',
        body: n.message || 'ทานยาตามที่กำหนด',
        data: { speak: n.message || 'ถึงเวลาทานยาแล้วค่ะ' },
        sound: 'default',
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'meds',
      },
    });
    count += 1;
  }
  return count;
}

// ตั้งแจ้งเตือนนัดหมายแพทย์ (ครั้งเดียว ณ วันเวลานัด) — เอกสาร 1.4(3.1)
export async function scheduleAppointmentReminders(appointments = []) {
  const N = getNotifications();
  if (!N) return 0;
  let count = 0;
  for (const a of appointments) {
    if (!a.datetime) continue;
    const d = new Date(String(a.datetime).replace(' ', 'T'));
    if (isNaN(d.getTime()) || d.getTime() <= Date.now()) continue; // ข้ามนัดที่ผ่านมาแล้ว
    const who = [a.doctor_name, a.hospital_name].filter(Boolean).join(' · ');
    await N.scheduleNotificationAsync({
      content: {
        title: 'นัดหมายพบแพทย์',
        body: who || 'มีนัดหมายพบแพทย์',
        data: { speak: `มีนัดหมายพบแพทย์ ${a.doctor_name || ''}` },
        sound: 'default',
      },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: d, channelId: 'meds' },
    });
    count += 1;
  }
  return count;
}

// แจ้งเตือนทดสอบ (เด้ง + พูด) อีก N วินาที
export async function testReminder(seconds = 8, message = 'ถึงเวลาทานยาแล้วค่ะ') {
  const N = getNotifications();
  if (!N) return false;
  await N.scheduleNotificationAsync({
    content: {
      title: 'ทดสอบแจ้งเตือนทานยา',
      body: message,
      data: { speak: message },
      sound: 'default',
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
      channelId: 'meds',
    },
  });
  return true;
}

// ฟังเมื่อแจ้งเตือนเด้ง แล้วอ่านออกเสียง (ใน Expo Go จะข้าม)
export function attachSpeechListener() {
  const N = getNotifications();
  if (!N) return null;
  return N.addNotificationReceivedListener((notif) => {
    const text =
      notif && notif.request && notif.request.content && notif.request.content.data
        ? notif.request.content.data.speak
        : null;
    if (text) speak(text);
  });
}

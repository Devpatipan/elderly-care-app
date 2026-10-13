import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TimePickerModal from '../components/TimePickerModal';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';
import { ensurePermissions, scheduleDailyReminders, scheduleAppointmentReminders, testReminder, speak, notificationsAvailable } from '../notifications';

// หน้าบันทึกการแจ้งเตือนการทานยา (ภาพที่ 11)
export default function ReminderScreen() {
  const { data, addNotification, removeItem, showToast } = useApp();
  const [med, setMed] = useState('');
  const [time, setTime] = useState('09:00');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [repeat, setRepeat] = useState('ทุกวัน');

  const add = () => {
    if (!med || !time) return showToast('กรุณากรอกชื่อยาและเวลา', 'warning');
    addNotification({ message: `ทาน ${med}`, time, repeat });
    setMed(''); setTime('09:00');
    showToast('ตั้งการแจ้งเตือนแล้ว — กด "เปิดแจ้งเตือนทั้งหมด" เพื่อให้เด้งตามเวลา', 'success');
  };

  // เปิด/อัปเดตการแจ้งเตือนรายวันจากรายการทั้งหมดในระบบ
  const enableAll = async () => {
    if (!notificationsAvailable()) {
      return showToast('แจ้งเตือนเด้งใช้ได้เฉพาะใน development build — Expo Go ไม่รองรับ (เสียงพูดยังใช้ได้)', 'warning');
    }
    const ok = await ensurePermissions();
    if (!ok) return showToast('ยังไม่ได้อนุญาตการแจ้งเตือน — เปิดสิทธิ์ในตั้งค่าก่อน', 'warning');
    const n = await scheduleDailyReminders(data.notifications);
    const a = await scheduleAppointmentReminders(data.appointments);
    showToast(`ตั้งแจ้งเตือน: ยา ${n} รายการ + นัดหมาย ${a} รายการ`, 'success');
  };

  // ทดสอบ: เด้งแจ้งเตือน + อ่านออกเสียงใน 8 วินาที (Expo Go: พูดอย่างเดียว)
  const test = async () => {
    if (!notificationsAvailable()) {
      speak('ถึงเวลาทานยาแล้วค่ะ');
      return showToast('Expo Go ไม่รองรับแจ้งเตือนเด้ง — เล่นเฉพาะเสียงพูด (เด้งจริงต้อง build)', 'info');
    }
    const ok = await ensurePermissions();
    if (!ok) return showToast('ยังไม่ได้อนุญาตการแจ้งเตือน', 'warning');
    await testReminder(8, 'ถึงเวลาทานยาแล้วค่ะ');
    showToast('จะเด้งแจ้งเตือน + อ่านออกเสียงใน 8 วินาที', 'info');
  };

  return (
    <Screen title="แจ้งเตือนการทานยา">
      <SectionTitle>การแจ้งเตือนที่ตั้งไว้</SectionTitle>
      {data.notifications.map((n) => (
        <Card key={n.id} style={styles.row}>
          <View style={styles.timeBox}>
            <Text style={styles.time}>{n.time}</Text>
            <Text style={styles.repeat}>{n.repeat}</Text>
          </View>
          <MaterialCommunityIcons name="bell-ring" size={20} color={colors.warning} style={{ marginRight: 6 }} />
          <Text style={styles.msg}>{n.message}</Text>
          <TouchableOpacity onPress={() => removeItem('medication_notifications', n.id, 'notifications')} activeOpacity={0.7} style={{ padding: 6 }}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </Card>
      ))}

      <SectionTitle>เพิ่มการแจ้งเตือน</SectionTitle>
      <Card>
        <Field label="ชื่อยา" value={med} onChangeText={setMed} placeholder="เช่น Metformin 500mg" />
        <TouchableOpacity style={styles.pickerButton} onPress={() => setPickerOpen(true)} activeOpacity={0.82}>
          <MaterialCommunityIcons name="clock-edit-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerTitle}>เวลาแจ้งเตือน</Text>
            <Text style={styles.pickerSub}>แตะเพื่อเลือกชั่วโมงและนาที</Text>
          </View>
          <Text style={styles.pickerTime}>{time}</Text>
        </TouchableOpacity>
        <Field label="ความถี่" value={repeat} onChangeText={setRepeat} placeholder="เช่น ทุกวัน" />
      </Card>
      <BigButton label="บันทึก" icon="content-save" onPress={add} />

      <SectionTitle>เปิดใช้งานแจ้งเตือนจริง</SectionTitle>
      <BigButton label="เปิด/อัปเดตแจ้งเตือนทั้งหมด" icon="bell-ring" onPress={enableAll} />
      <BigButton label="ทดสอบ (เด้ง + อ่านออกเสียงใน 8 วิ)" icon="volume-high" light onPress={test} />
      <BigButton label="ทดสอบเสียงพูดทันที" icon="account-voice" light color={colors.accent} onPress={() => speak('ถึงเวลาทานยาแล้วค่ะ')} />

      <Text style={styles.note}>
        กด "เปิด/อัปเดตแจ้งเตือนทั้งหมด" เพื่อให้แอปเด้งแจ้งเตือนทุกวันตามเวลาที่ตั้งไว้
        พร้อมอ่านข้อความออกเสียงภาษาไทย (เอกสารข้อ 3.3)
      </Text>

      <TimePickerModal
        visible={pickerOpen}
        value={time}
        onClose={() => setPickerOpen(false)}
        onSelect={(nextTime) => {
          setTime(nextTime);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  timeBox: {
    backgroundColor: '#E3EDFB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginRight: 14,
    minWidth: 78,
  },
  time: { fontSize: sizes.h2, fontWeight: '900', color: colors.primaryDark },
  repeat: { fontSize: 12, color: colors.textMuted },
  msg: { fontSize: sizes.body, fontWeight: '700', color: colors.text, flex: 1 },
  note: { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.6, borderColor: colors.primary,
    backgroundColor: colors.primarySoft, borderRadius: 14,
    padding: 14, marginBottom: 16,
  },
  pickerTitle: { fontSize: sizes.small, color: colors.primaryDark, fontWeight: '900' },
  pickerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickerTime: { fontSize: sizes.h2, color: colors.primaryDark, fontWeight: '900' },
});

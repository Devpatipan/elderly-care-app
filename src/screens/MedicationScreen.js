import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TimePickerModal from '../components/TimePickerModal';
import { Card, SectionTitle, Field, BigButton, IconCircle } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';
import { localDay } from '../data';
import {
  ensurePermissions,
  scheduleDailyReminders,
  scheduleAppointmentReminders,
  testReminder,
  speakAfterBell,
  notificationsAvailable,
} from '../notifications';

const MEAL_OPTIONS = ['ก่อนอาหาร', 'พร้อมอาหาร', 'หลังอาหาร'];

// หน้า "การรักษาด้วยยา" — รวมแผนยา (แยกตามโรค) + การทานยา + แจ้งเตือน ไว้หน้าเดียว
export default function MedicationScreen() {
  const { data, takeMed, addMedication, addNotification, removeItem, getAllReminders, showToast } = useApp();

  // ฟอร์มเพิ่มยา
  const [name, setName] = useState('');
  const [disease, setDisease] = useState('');
  const [dosage, setDosage] = useState('');
  const [freq, setFreq] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [properties, setProperties] = useState('');

  const [time, setTime] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [repeat, setRepeat] = useState('ทุกวัน');
  const medPreview = name.trim() || 'ชื่อยา';
  const medDetail = [dosage || 'ปริมาณ', freq || 'ความถี่', timeOfDay || 'ช่วงเวลา'].join(' · ');
  const remindPreview = time ? `แจ้งเตือน ${time} · ${repeat || 'ทุกวัน'}` : 'ยังไม่ได้ตั้งเวลาแจ้งเตือน';

  // จัดกลุ่มยาตามโรค (ข้อ 5)
  const groups = {};
  data.medication_records.forEach((m) => {
    const key = (m.disease && String(m.disease).trim()) || 'ทั่วไป';
    (groups[key] = groups[key] || []).push(m);
  });
  const groupKeys = Object.keys(groups);
  const today = localDay();
  const takenNamesToday = new Set(
    data.medication_log
      .filter((l) => String(l.taken_at).startsWith(today))
      .map((l) => l.medication_name)
  );

  const confirmTake = (m) => {
    takeMed(m);
    showToast(`บันทึกการทาน ${m.medication_name} แล้ว`, 'success');
  };

  const saveMedAndReminder = () => {
    if (!name) return showToast('กรุณากรอกชื่อยา', 'warning');
    if (!time) return showToast('กรุณาเลือกเวลาแจ้งเตือน', 'warning');
    addMedication({
      medication_name: name,
      disease: disease.trim() || null,
      dosage,
      frequency: freq,
      time_of_day: timeOfDay,
      notes: properties.trim(),
    });
    addNotification({ message: `ทาน ${name.trim()}`, time, repeat: repeat.trim() || 'ทุกวัน' });
    setName(''); setDisease(''); setDosage(''); setFreq(''); setTimeOfDay(''); setProperties(''); setTime(''); setRepeat('ทุกวัน');
    showToast('บันทึกแผนยาและตั้งแจ้งเตือนแล้ว', 'success');
  };

  // เปิดแจ้งเตือนจริง: รวมของผู้ป่วยทุกคน (หลายคนเวลาเดียวกัน = แจ้งแยกทีละคน ข้อ 7)
  const enableAll = async () => {
    if (!notificationsAvailable()) {
      return showToast('แจ้งเตือนเด้งใช้ได้เฉพาะใน development build — Expo Go ไม่รองรับ (เสียงพูดยังใช้ได้)', 'warning');
    }
    const ok = await ensurePermissions();
    if (!ok) return showToast('ยังไม่ได้อนุญาตการแจ้งเตือน — เปิดสิทธิ์ในตั้งค่าก่อน', 'warning');
    const reminders = await getAllReminders();
    const n = await scheduleDailyReminders(reminders);
    const a = await scheduleAppointmentReminders(data.appointments);
    showToast(`ตั้งแจ้งเตือน: ยา ${n} รายการ (ทุกผู้ป่วย) + นัดหมาย ${a} รายการ`, 'success');
  };

  const test = async () => {
    if (!notificationsAvailable()) {
      speakAfterBell('ถึงเวลาทานยาแล้วค่ะ');
      return showToast('Expo Go ไม่รองรับแจ้งเตือนเด้ง — เล่นเฉพาะเสียงพูด (เด้งจริงต้อง build)', 'info');
    }
    const ok = await ensurePermissions();
    if (!ok) return showToast('ยังไม่ได้อนุญาตการแจ้งเตือน', 'warning');
    await testReminder(8, 'ถึงเวลาทานยาแล้วค่ะ');
    showToast('จะเด้งแจ้งเตือน (มีเสียงกริ่งก่อน) + อ่านออกเสียงใน 8 วินาที', 'info');
  };

  return (
    <Screen title="การรักษาด้วยยา">
      {/* ===== แผนการรักษาด้วยยา (แยกตามโรค) ===== */}
      <Card style={styles.summaryCard}>
        <IconCircle icon="pill-multiple" color={colors.primary} soft={colors.card} size={48} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.summaryTitle}>ยาและการแจ้งเตือน</Text>
          <Text style={styles.summarySub}>เพิ่มข้อมูลยาและเวลาเตือนได้ในหน้านี้ โดยรายการเดิมยังอยู่ครบ</Text>
        </View>
      </Card>

      <SectionTitle hint="แยกตามโรคของผู้ป่วย">แผนการรักษาด้วยยา</SectionTitle>
      {data.medication_records.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีแผนยา — เพิ่มด้านล่าง</Text></Card>
      ) : (
        groupKeys.map((g) => (
          <View key={g}>
            <View style={styles.diseaseTag}>
              <MaterialCommunityIcons name="stethoscope" size={16} color={colors.primary} />
              <Text style={styles.diseaseText}>{g}</Text>
            </View>
            {groups[g].map((m) => {
              const taken = takenNamesToday.has(m.medication_name);
              return (
                <Card key={m.id} style={styles.row}>
                  <IconCircle icon="pill" color={taken ? colors.textTertiary : colors.primary} soft={taken ? colors.border : colors.primarySoft} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{m.medication_name}</Text>
                    <Text style={styles.sub}>{m.dosage} · {m.frequency}</Text>
                    <Text style={styles.sub}>{m.time_of_day}</Text>
                    {!!m.notes && <Text style={styles.sub}>สรรพคุณ: {m.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.btn, taken && styles.btnDone]}
                    onPress={() => !taken && confirmTake(m)}
                    activeOpacity={taken ? 1 : 0.85}
                    disabled={taken}
                  >
                    <Text style={[styles.btnText, taken && styles.btnTextDone]}>{taken ? 'ทานแล้ว' : 'กดยืนยัน'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.del}
                    onPress={() => removeItem('medication_records', m.id, 'medication_records')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        ))
      )}

      {/* ===== เพิ่มยาใหม่ ===== */}
      <SectionTitle hint="กรอกครั้งเดียวเพื่อสร้างแผนยาและแจ้งเตือน">เพิ่มยาใหม่</SectionTitle>
      <Card>
        <Field label="ชื่อยา" value={name} onChangeText={setName} placeholder="เช่น Metformin 500mg" />
        <Field label="สำหรับโรค" value={disease} onChangeText={setDisease} placeholder="เช่น เบาหวาน / ความดัน" />
        <Field label="สรรพคุณยา" value={properties} onChangeText={setProperties} placeholder="เช่น ลดน้ำตาลในเลือด" />
        <Field label="ปริมาณ" value={dosage} onChangeText={setDosage} placeholder="เช่น 1 เม็ด" />
        <Field label="ความถี่" value={freq} onChangeText={setFreq} placeholder="เช่น วันละ 2 ครั้ง" />
        <Text style={styles.pickLabel}>ช่วงเวลา</Text>
        <View style={styles.pickRow}>
          {MEAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, timeOfDay === opt && styles.chipActive]}
              onPress={() => setTimeOfDay(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, timeOfDay === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inlineDivider} />
        <Text style={styles.pickLabel}>แจ้งเตือนการทานยา</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setPickerOpen(true)} activeOpacity={0.82}>
          <MaterialCommunityIcons name="clock-edit-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerTitle}>เวลาแจ้งเตือน</Text>
            <Text style={styles.pickerSub}>แตะเพื่อเลือกชั่วโมงและนาที</Text>
          </View>
          <Text style={styles.pickerTime}>{time || '--:--'}</Text>
        </TouchableOpacity>
        <Field label="ความถี่แจ้งเตือน" value={repeat} onChangeText={setRepeat} placeholder="เช่น ทุกวัน" />
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>ตัวอย่างรายการยา</Text>
          <Text style={styles.previewName}>{medPreview}</Text>
          <Text style={styles.previewSub}>{medDetail}</Text>
          {!!properties.trim() && <Text style={styles.previewSub}>สรรพคุณ: {properties.trim()}</Text>}
          <Text style={styles.previewSub}>{remindPreview}</Text>
        </View>
      </Card>
      <BigButton label="บันทึกยาและแจ้งเตือน" icon="content-save" onPress={saveMedAndReminder} />

      {/* ===== แจ้งเตือนการทานยา ===== */}
      <SectionTitle hint="รายการนี้สร้างจากฟอร์มเพิ่มยาด้านบน">แจ้งเตือนการทานยา</SectionTitle>
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
      <BigButton label="เปิด/อัปเดตแจ้งเตือนทั้งหมด" icon="bell-ring" light onPress={enableAll} />
      <BigButton label="ทดสอบ (กริ่ง + อ่านออกเสียงใน 8 วิ)" icon="volume-high" light color={colors.accent} onPress={test} />

      {/* ===== ประวัติการทานยาจริง ===== */}
      <SectionTitle>ประวัติการทานยาจริง</SectionTitle>
      {data.medication_log.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีประวัติ — กด "ทานแล้ว" เพื่อบันทึก</Text></Card>
      ) : (
        data.medication_log
          .slice()
          .reverse()
          .map((l) => (
            <Card key={l.id} style={styles.logRow}>
              <View style={styles.logHead}>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                <Text style={styles.logName}>{l.medication_name}</Text>
              </View>
              <Text style={styles.sub}>{l.taken_at}</Text>
            </Card>
          ))
      )}

      <Text style={styles.note}>
        กด "เปิด/อัปเดตแจ้งเตือนทั้งหมด" เพื่อให้แอปเด้งแจ้งเตือนทุกวันตามเวลา (รวมผู้ป่วยทุกคน
        ถ้าหลายคนเวลาเดียวกันจะแจ้งแยกทีละข้อความ) พร้อมเสียงกริ่งและอ่านข้อความออกเสียงภาษาไทย
      </Text>

      <TimePickerModal
        visible={pickerOpen}
        value={time || '09:00'}
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
  diseaseTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 6, marginBottom: 8,
  },
  diseaseText: { fontSize: sizes.body, fontWeight: '800', color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: sizes.body, fontWeight: '700', color: colors.text },
  sub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  btn: { backgroundColor: colors.success, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  btnDone: { backgroundColor: colors.border, borderWidth: 1, borderColor: '#D7DDD9' },
  del: { marginLeft: 8, padding: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: sizes.small },
  btnTextDone: { color: colors.textMuted },
  empty: { color: colors.textMuted, fontSize: sizes.small },
  logRow: { paddingVertical: 12 },
  logHead: { flexDirection: 'row', alignItems: 'center' },
  logName: { fontSize: sizes.body, fontWeight: '700', color: colors.text, marginLeft: 8 },
  timeBox: {
    backgroundColor: colors.primarySoft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
    alignItems: 'center', marginRight: 14, minWidth: 78,
  },
  time: { fontSize: sizes.h2, fontWeight: '900', color: colors.primaryDark },
  repeat: { fontSize: 12, color: colors.textMuted },
  msg: { fontSize: sizes.body, fontWeight: '700', color: colors.text, flex: 1 },
  note: { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  pickLabel: { fontSize: sizes.small, color: colors.textMuted, marginBottom: 8, fontWeight: '700' },
  pickRow: { flexDirection: 'row', gap: 8 },
  inlineDivider: { height: 1, backgroundColor: colors.border, marginTop: 16, marginBottom: 16 },
  chip: {
    flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.6,
    borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: sizes.small, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.primaryDark },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary },
  summaryTitle: { fontSize: sizes.h2, fontWeight: '900', color: colors.white },
  summarySub: { fontSize: sizes.small, color: colors.white, opacity: 0.9, marginTop: 3, lineHeight: 21 },
  previewBox: {
    marginTop: 14, padding: 14, borderRadius: sizes.radiusSm,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint2,
  },
  previewLabel: { fontSize: sizes.tiny, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  previewName: { fontSize: sizes.body, fontWeight: '900', color: colors.text },
  previewSub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 3 },
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

import React, { useState } from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

const pad2 = (n) => String(n).padStart(2, '0');
const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TIME_OPTIONS = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];

function dateValue(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dateLabel(d, index) {
  if (index === 0) return 'วันนี้';
  if (index === 1) return 'พรุ่งนี้';
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]}`;
}

// หน้าบันทึกการนัดหมายพบแพทย์ (ภาพที่ 10)
export default function AppointmentScreen() {
  const { data, addAppointment, removeItem, showToast } = useApp();
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(dateValue(new Date()));
  const [time, setTime] = useState('09:00');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { value: dateValue(d), label: dateLabel(d, i), sub: `${d.getDate()}/${d.getMonth() + 1}` };
  });
  const datetime = `${date} ${time}`;

  const add = () => {
    if (!doctor) return showToast('กรุณากรอกชื่อแพทย์', 'warning');
    addAppointment({ doctor_name: doctor, hospital_name: hospital, location, datetime, notes });
    setDoctor(''); setHospital(''); setLocation(''); setDate(dateValue(new Date())); setTime('09:00'); setNotes('');
    showToast('บันทึกการนัดหมายแล้ว', 'success');
  };

  return (
    <Screen title="นัดหมายพบแพทย์">
      <Card style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons name="calendar-heart" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>{data.patient?.name || 'ผู้ป่วย'}</Text>
          <Text style={styles.summarySub}>จัดการนัดหมายและประวัติการพบแพทย์</Text>
        </View>
      </Card>

      <SectionTitle>รายการนัดหมาย</SectionTitle>
      {data.appointments.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีนัดหมาย</Text></Card>
      ) : (
        data.appointments.map((a) => (
          <Card key={a.id}>
            <View style={styles.dtRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.primary} />
                <Text style={styles.dt}>{a.datetime}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem('appointments', a.id, 'appointments')} activeOpacity={0.7} style={{ padding: 6 }}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
            <Text style={styles.line}>แพทย์: {a.doctor_name}</Text>
            <Text style={styles.line}>โรงพยาบาล: {a.hospital_name}</Text>
            {!!a.location && <Text style={styles.line}>สถานที่: {a.location}</Text>}
            {!!a.notes && <Text style={styles.note}>หมายเหตุ: {a.notes}</Text>}
          </Card>
        ))
      )}

      <SectionTitle>เพิ่มการนัดหมาย</SectionTitle>
      <Card>
        <Field label="ชื่อแพทย์" value={doctor} onChangeText={setDoctor} placeholder="เช่น นพ. วิชัย" />
        <Field label="ชื่อโรงพยาบาล" value={hospital} onChangeText={setHospital} />
        <Field label="สถานที่" value={location} onChangeText={setLocation} placeholder="เช่น ตึก OPD ชั้น 3" />
        <Text style={styles.pickLabel}>เลือกวันที่</Text>
        <View style={styles.choiceGrid}>
          {dateOptions.map((opt) => {
            const active = date === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dateChip, active && styles.chipActive]}
                onPress={() => setDate(opt.value)}
                activeOpacity={0.82}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
                <Text style={[styles.chipSub, active && styles.chipTextActive]}>{opt.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.pickLabel}>เลือกเวลา</Text>
        <View style={styles.choiceGrid}>
          {TIME_OPTIONS.map((opt) => {
            const active = time === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.timeChip, active && styles.chipActive]}
                onPress={() => setTime(opt)}
                activeOpacity={0.82}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setPickerOpen(true)} activeOpacity={0.82}>
          <MaterialCommunityIcons name="clock-edit-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerTitle}>ตั้งเวลาเอง</Text>
            <Text style={styles.pickerSub}>เลือกชั่วโมงและนาที ไม่ต้องพิมพ์เอง</Text>
          </View>
          <Text style={styles.pickerTime}>{time}</Text>
        </TouchableOpacity>
        <View style={styles.previewBox}>
          <MaterialCommunityIcons name="calendar-check" size={18} color={colors.primary} />
          <Text style={styles.previewText}>วันและเวลาที่เลือก: {datetime}</Text>
        </View>
        <Field label="หมายเหตุ" value={notes} onChangeText={setNotes} />
      </Card>
      <BigButton label="บันทึกนัดหมาย" icon="content-save" onPress={add} />

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

function TimePickerModal({ visible, value, onSelect, onClose }) {
  const [hour, minute] = value.split(':');
  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 12 }, (_, i) => pad2(i * 5));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>เลือกเวลา</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerColumns}>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnTitle}>ชั่วโมง</Text>
              <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                {hours.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.timeOption, h === hour && styles.timeOptionActive]}
                    onPress={() => onSelect(`${h}:${minute}`)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.timeOptionText, h === hour && styles.timeOptionTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnTitle}>นาที</Text>
              <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                {minutes.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.timeOption, m === minute && styles.timeOptionActive]}
                    onPress={() => onSelect(`${hour}:${m}`)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.timeOptionText, m === minute && styles.timeOptionTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint2 },
  summaryIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  summaryTitle: { fontSize: sizes.body, fontWeight: '900', color: colors.text },
  summarySub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  dtRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dt: { fontSize: sizes.body, fontWeight: '800', color: colors.primary, marginLeft: 6 },
  line: { fontSize: sizes.small, color: colors.text, marginTop: 2 },
  note: { fontSize: sizes.small, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  empty: { color: colors.textMuted, fontSize: sizes.small },
  pickLabel: { fontSize: sizes.small, color: colors.textMuted, marginBottom: 8, fontWeight: '800' },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dateChip: {
    width: '23%',
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1.6,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  timeChip: {
    minWidth: 82,
    borderRadius: 12,
    borderWidth: 1.6,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: sizes.small, color: colors.textMuted, fontWeight: '900' },
  chipSub: { fontSize: 12, color: colors.textTertiary, marginTop: 2, fontWeight: '700' },
  chipTextActive: { color: colors.primaryDark },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.6,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  pickerTitle: { fontSize: sizes.small, color: colors.primaryDark, fontWeight: '900' },
  pickerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickerTime: { fontSize: sizes.h2, color: colors.primaryDark, fontWeight: '900' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,42,38,0.38)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '72%',
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: sizes.h2, color: colors.text, fontWeight: '900' },
  pickerColumns: { flexDirection: 'row', gap: 12 },
  pickerColumn: { flex: 1 },
  columnTitle: { fontSize: sizes.small, color: colors.textMuted, fontWeight: '800', marginBottom: 8 },
  timeList: { maxHeight: 300 },
  timeOption: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  timeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeOptionText: { fontSize: sizes.body, color: colors.textMuted, fontWeight: '900' },
  timeOptionTextActive: { color: colors.white },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  previewText: { flex: 1, fontSize: sizes.small, color: colors.primaryDark, fontWeight: '800' },
});

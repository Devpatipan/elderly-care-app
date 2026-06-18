import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton, IconCircle } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าบันทึกการทานยา (ภาพที่ 9): แสดงแผนยา + ยืนยัน "ทานแล้ว" + เพิ่มยาใหม่ + ประวัติ
export default function MedicationScreen() {
  const { data, takeMed, addMedication, removeItem, showToast } = useApp();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [freq, setFreq] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  const confirmTake = (m) => {
    takeMed(m);
    showToast(`บันทึกการทาน ${m.medication_name} แล้ว`, 'success');
  };

  const add = () => {
    if (!name) return showToast('กรุณากรอกชื่อยา', 'warning');
    addMedication({ medication_name: name, dosage, frequency: freq, time_of_day: timeOfDay, notes: '' });
    setName(''); setDosage(''); setFreq(''); setTimeOfDay('');
    showToast('เพิ่มแผนยาใหม่แล้ว', 'success');
  };

  return (
    <Screen title="บันทึกการทานยา">
      <SectionTitle>แผนการทานยา</SectionTitle>
      {data.medication_records.map((m) => (
        <Card key={m.id} style={styles.row}>
          <IconCircle icon="pill" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{m.medication_name}</Text>
            <Text style={styles.sub}>{m.dosage} · {m.frequency}</Text>
            <Text style={styles.sub}>{m.time_of_day}</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => confirmTake(m)} activeOpacity={0.85}>
            <Text style={styles.btnText}>ทานแล้ว</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.del}
            onPress={() => removeItem('medication_records', m.id, 'medication_records')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </Card>
      ))}

      <SectionTitle>เพิ่มยาใหม่</SectionTitle>
      <Card>
        <Field label="ชื่อยา" value={name} onChangeText={setName} placeholder="เช่น Metformin 500mg" />
        <Field label="ปริมาณ" value={dosage} onChangeText={setDosage} placeholder="เช่น 1 เม็ด" />
        <Field label="ความถี่" value={freq} onChangeText={setFreq} placeholder="เช่น วันละ 2 ครั้ง" />
        <Field label="ช่วงเวลา" value={timeOfDay} onChangeText={setTimeOfDay} placeholder="เช่น หลังอาหารเช้า" />
      </Card>
      <BigButton label="เพิ่มแผนยา" icon="plus" onPress={add} />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: sizes.body, fontWeight: '700', color: colors.text },
  sub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  btn: { backgroundColor: colors.success, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  del: { marginLeft: 8, padding: 6 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: sizes.small },
  empty: { color: colors.textMuted, fontSize: sizes.small },
  logRow: { paddingVertical: 12 },
  logHead: { flexDirection: 'row', alignItems: 'center' },
  logName: { fontSize: sizes.body, fontWeight: '700', color: colors.text, marginLeft: 8 },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าบันทึกการนัดหมายพบแพทย์ (ภาพที่ 10)
export default function AppointmentScreen() {
  const { data, addAppointment, removeItem, showToast } = useApp();
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [datetime, setDatetime] = useState('');
  const [notes, setNotes] = useState('');

  const add = () => {
    if (!doctor || !datetime) return showToast('กรุณากรอกชื่อแพทย์และวันเวลา', 'warning');
    addAppointment({ doctor_name: doctor, hospital_name: hospital, location, datetime, notes });
    setDoctor(''); setHospital(''); setLocation(''); setDatetime(''); setNotes('');
    showToast('บันทึกการนัดหมายแล้ว', 'success');
  };

  return (
    <Screen title="นัดหมายพบแพทย์">
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
        <Field label="วันและเวลา" value={datetime} onChangeText={setDatetime} placeholder="2026-06-25 09:00" />
        <Field label="หมายเหตุ" value={notes} onChangeText={setNotes} />
      </Card>
      <BigButton label="บันทึกนัดหมาย" icon="content-save" onPress={add} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dtRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dt: { fontSize: sizes.body, fontWeight: '800', color: colors.primary, marginLeft: 6 },
  line: { fontSize: sizes.small, color: colors.text, marginTop: 2 },
  note: { fontSize: sizes.small, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  empty: { color: colors.textMuted, fontSize: sizes.small },
});

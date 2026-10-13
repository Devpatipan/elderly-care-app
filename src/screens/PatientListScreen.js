import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, BigButton, Badge } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าเลือก/สลับผู้ป่วย (รองรับหลายคน — เอกสาร 1.4 ข้อ 1.3)
export default function PatientListScreen() {
  const { patients, activePatientId, selectPatient, navigate, reset } = useApp();

  const choose = (id) => {
    selectPatient(id);
    reset('Home');           // เลือกผู้ป่วยแล้วเข้าหน้าหลักของผู้ป่วยคนนั้น
  };

  return (
    <Screen title="เลือกผู้ป่วย" showBack={true} showTabs={false} onBack={() => reset('Home')}>
      {patients.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีผู้ป่วย — กดเพิ่มด้านล่าง</Text></Card>
      ) : (
        patients.map((p) => {
          const active = p.id === activePatientId;
          return (
            <TouchableOpacity key={p.id} activeOpacity={0.85} onPress={() => choose(p.id)}>
              <Card style={[styles.row, active && styles.activeRow]}>
                <View style={[styles.avatar, active && styles.avatarActive]}>
                  <MaterialCommunityIcons name="account-heart" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>อายุ {p.age || '-'} ปี{p.blood_type ? ` · กรุ๊ป ${p.blood_type}` : ''}</Text>
                  <Text style={styles.disease} numberOfLines={1}>{p.congenital_disease || 'ยังไม่มีโรคประจำตัวที่ระบุ'}</Text>
                </View>
                {active ? (
                  <Badge text="กำลังดูแล" level="success" />
                ) : (
                  <Text style={styles.pick}>เลือก</Text>
                )}
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      <BigButton label="เพิ่มผู้ป่วยใหม่" icon="account-plus" onPress={() => navigate('AddPatient', { mode: 'new' })} />
      <BigButton label="กลับหน้าผู้ดูแล" icon="account-arrow-left" light onPress={() => reset('CaregiverHome')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  activeRow: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  avatar: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarActive: { backgroundColor: colors.card },
  name: { fontSize: sizes.body, fontWeight: '800', color: colors.text },
  sub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  disease: { fontSize: sizes.tiny, color: colors.primaryDark, fontWeight: '700', marginTop: 4 },
  pick: { fontSize: sizes.small, fontWeight: '800', color: colors.primary },
  empty: { color: colors.textMuted, fontSize: sizes.small },
});

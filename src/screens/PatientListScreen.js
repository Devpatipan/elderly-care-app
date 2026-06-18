import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าเลือก/สลับผู้ป่วย (รองรับหลายคน — เอกสาร 1.4 ข้อ 1.3)
export default function PatientListScreen() {
  const { patients, activePatientId, selectPatient, navigate, goBack } = useApp();

  const choose = (id) => {
    selectPatient(id);
    goBack();
  };

  return (
    <Screen title="เลือกผู้ป่วย">
      {patients.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีผู้ป่วย — กดเพิ่มด้านล่าง</Text></Card>
      ) : (
        patients.map((p) => {
          const active = p.id === activePatientId;
          return (
            <TouchableOpacity key={p.id} activeOpacity={0.85} onPress={() => choose(p.id)}>
              <Card style={[styles.row, active && styles.activeRow]}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>อายุ {p.age || '-'} ปี · {p.congenital_disease || '-'}</Text>
                </View>
                {active ? (
                  <MaterialCommunityIcons name="check-circle" size={26} color={colors.success} />
                ) : (
                  <Text style={styles.pick}>เลือก</Text>
                )}
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      <BigButton label="เพิ่มผู้ป่วยใหม่" icon="account-plus" onPress={() => navigate('AddPatient', { mode: 'new' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  activeRow: { borderWidth: 2, borderColor: colors.success },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  name: { fontSize: sizes.body, fontWeight: '800', color: colors.text },
  sub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  pick: { fontSize: sizes.small, fontWeight: '800', color: colors.primary },
  empty: { color: colors.textMuted, fontSize: sizes.small },
});

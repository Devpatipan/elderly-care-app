import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าข้อมูลผู้ป่วย (ภาพที่ 8): แสดงข้อมูลที่บันทึกไว้ + ปุ่มไปแก้ไข
export default function PatientInfoScreen() {
  const { data, navigate, reset, setUser, showToast } = useApp();
  const p = data.patient;

  const logout = () => {
    setUser(null);
    reset('Login');
    showToast('ออกจากระบบแล้ว', 'success');
  };

  const rows = [
    ['อายุ', `${p.age} ปี`],
    ['เพศ', p.gender || '-'],
    ['น้ำหนัก', `${p.weight} กก.`],
    ['ส่วนสูง', `${p.height} ซม.`],
    ['กรุ๊ปเลือด', p.blood_type],
    ['โรคประจำตัว', p.congenital_disease],
    ['ประวัติการแพ้', p.allergies],
    ['เบอร์โทร', p.phone],
  ];

  return (
    <Screen title="ข้อมูลผู้ป่วย">
      <Card>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={34} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.id}>ID : {p.id}</Text>
          </View>
        </View>

        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
      </Card>

      <BigButton label="แก้ไขข้อมูล" icon="pencil" onPress={() => navigate('AddPatient')} />
      <BigButton label="ออกจากระบบ" icon="logout" light color={colors.danger} onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3EDFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  name: { fontSize: sizes.h2, fontWeight: '800', color: colors.text },
  id: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  k: { fontSize: sizes.body, color: colors.textMuted, flex: 1 },
  v: { fontSize: sizes.body, color: colors.text, fontWeight: '700', flex: 1.4, textAlign: 'right' },
});

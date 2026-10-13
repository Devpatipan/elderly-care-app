import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้าข้อมูลผู้ดูแล — แก้ไขโปรไฟล์บัญชีที่ล็อกอินจริง (app_users)
export default function CaregiverScreen() {
  const { user, updateProfile, goBack, showToast } = useApp();
  const [name, setName] = useState((user && user.name) || '');
  const [age, setAge] = useState(user && user.age != null ? String(user.age) : '');
  const [phone, setPhone] = useState((user && user.phone) || '');

  const save = async () => {
    if (!name.trim()) return showToast('กรุณากรอกชื่อผู้ดูแล', 'warning');
    if (age && isNaN(Number(age))) return showToast('อายุต้องเป็นตัวเลข', 'warning');
    await updateProfile({
      name: name.trim(),
      age: age ? Number(age) : null,
      phone: phone.trim() || null,
    });
    goBack();
  };

  return (
    <Screen title="ข้อมูลผู้ดูแล">
      <SectionTitle hint="ข้อมูลบัญชีของผู้ที่ดูแลผู้สูงอายุ">โปรไฟล์ผู้ดูแล</SectionTitle>
      <Card>
        <View style={styles.emailRow}>
          <Text style={styles.emailLabel}>อีเมล (ใช้เข้าสู่ระบบ)</Text>
          <Text style={styles.emailValue}>{(user && user.email) || '-'}</Text>
        </View>
        <Field label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="เช่น สมศรี ใจดี" />
        <Field label="อายุ (ปี)" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="เช่น 45" />
        <Field label="เบอร์โทร" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="เช่น 081-234-5678" />
      </Card>
      <BigButton label="บันทึก" icon="content-save" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emailRow: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emailLabel: { fontSize: sizes.small, color: colors.textMuted, marginBottom: 4, fontWeight: '700' },
  emailValue: { fontSize: sizes.body, color: colors.text, fontWeight: '700' },
});

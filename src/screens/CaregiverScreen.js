import React, { useState } from 'react';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { useApp } from '../store';

// หน้าข้อมูลผู้ดูแล (ผู้ใช้งานระบบ) — ดู/แก้ไข (เอกสาร 1.3.1.1)
export default function CaregiverScreen() {
  const { data, updateCaregiver, goBack, showToast } = useApp();
  const c = data.caregiver || {};
  const [name, setName] = useState(c.name || '');
  const [phone, setPhone] = useState(c.phone || '');

  const save = () => {
    if (!name.trim()) return showToast('กรุณากรอกชื่อผู้ดูแล', 'warning');
    updateCaregiver({ name: name.trim(), phone });
    showToast('บันทึกข้อมูลผู้ดูแลแล้ว', 'success');
    goBack();
  };

  return (
    <Screen title="ข้อมูลผู้ดูแล">
      <SectionTitle hint="ข้อมูลของผู้ใช้งานที่ดูแลผู้สูงอายุ">ข้อมูลผู้ดูแล</SectionTitle>
      <Card>
        <Field label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="เช่น สมศรี ใจดี" />
        <Field label="เบอร์โทร" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="เช่น 081-234-5678" />
      </Card>
      <BigButton label="บันทึก" icon="content-save" onPress={save} />
    </Screen>
  );
}

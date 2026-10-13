import React, { useState } from 'react';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { useApp } from '../store';

// หน้าเพิ่ม/แก้ไขข้อมูลผู้ป่วย — ช่องข้อมูล: ชื่อ อายุ เพศ น้ำหนัก ส่วนสูง กรุ๊ปเลือด
export default function AddPatientScreen() {
  const { data, route, updatePatient, addPatient, goBack, showToast } = useApp();
  const isNew = route.params && route.params.mode === 'new';
  const p = isNew ? {} : (data.patient || {});

  const [name, setName] = useState(p.name || '');
  const [age, setAge] = useState(String(p.age ?? ''));
  const [gender, setGender] = useState(p.gender || '');
  const [weight, setWeight] = useState(String(p.weight ?? ''));
  const [height, setHeight] = useState(String(p.height ?? ''));
  const [blood, setBlood] = useState(p.blood_type || '');
  const [disease, setDisease] = useState(p.congenital_disease || '');

  const save = () => {
    if (!name.trim()) return showToast('กรุณากรอกชื่อ-นามสกุล', 'warning');
    if (age && isNaN(Number(age))) return showToast('อายุต้องเป็นตัวเลข', 'warning');
    if (weight && isNaN(Number(weight))) return showToast('น้ำหนักต้องเป็นตัวเลข', 'warning');
    if (height && isNaN(Number(height))) return showToast('ส่วนสูงต้องเป็นตัวเลข', 'warning');

    const payload = {
      name: name.trim(),
      age: age ? Number(age) : (isNew ? null : p.age),
      gender,
      weight: weight ? Number(weight) : (isNew ? null : p.weight),
      height: height ? Number(height) : (isNew ? null : p.height),
      blood_type: blood,
      congenital_disease: disease.trim(),
    };
    if (isNew) {
      addPatient(payload);
    } else {
      updatePatient(payload);
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
    }
    goBack();
  };

  return (
    <Screen title={isNew ? 'เพิ่มผู้ป่วยใหม่' : 'แก้ไขข้อมูลผู้ป่วย'}>
      <SectionTitle>กรอกข้อมูล</SectionTitle>
      <Card>
        <Field label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="เช่น สมหญิง ใจดี" />
        <Field label="อายุ (ปี)" value={age} onChangeText={setAge} keyboardType="numeric" />
        <Field label="เพศ" value={gender} onChangeText={setGender} placeholder="ชาย / หญิง" />
        <Field label="น้ำหนัก (กก.)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <Field label="ส่วนสูง (ซม.)" value={height} onChangeText={setHeight} keyboardType="numeric" />
        <Field label="กรุ๊ปเลือด" value={blood} onChangeText={setBlood} placeholder="A / B / AB / O" />
        <Field label="โรคประจำตัว" value={disease} onChangeText={setDisease} placeholder="เช่น โรคหัวใจ, เบาหวาน, ความดัน" />
      </Card>
      <BigButton label="บันทึก" icon="content-save" onPress={save} />
    </Screen>
  );
}

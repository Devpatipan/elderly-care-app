import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton, Badge } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';
import { classifyBP, classifySugar, classifyHeartRate } from '../data';

// หน้าบันทึกค่าสุขภาพ — บันทึกความดัน/น้ำตาล แล้วแปลผลตามเกณฑ์ทันที
// (เอกสารระบุปุ่ม "บันทึกค่าสุขภาพ" บนหน้าหลัก หน้านี้ทำให้ใช้งานได้จริง)
export default function HealthScreen() {
  const { data, addBP, addSugar, addHeartRate, showToast } = useApp();
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [sugar, setSugar] = useState('');
  const [hr, setHr] = useState('');

  const saveBP = () => {
    if (!sys || !dia) return showToast('กรุณากรอกค่าความดันให้ครบ', 'warning');
    if (isNaN(Number(sys)) || isNaN(Number(dia))) return showToast('ค่าความดันต้องเป็นตัวเลข', 'warning');
    if (Number(sys) < 50 || Number(sys) > 300 || Number(dia) < 30 || Number(dia) > 200)
      return showToast('ค่าความดันดูไม่สมเหตุสมผล กรุณาตรวจสอบ', 'warning');
    const c = classifyBP(sys, dia);
    addBP(sys, dia);
    setSys(''); setDia('');
    showToast(`ความดัน ${sys}/${dia} → ${c.label}`, c.level);
  };

  const saveSugar = () => {
    if (!sugar) return showToast('กรุณากรอกค่าน้ำตาล', 'warning');
    if (isNaN(Number(sugar))) return showToast('ค่าน้ำตาลต้องเป็นตัวเลข', 'warning');
    if (Number(sugar) < 20 || Number(sugar) > 800)
      return showToast('ค่าน้ำตาลดูไม่สมเหตุสมผล กรุณาตรวจสอบ', 'warning');
    const c = classifySugar(sugar);
    addSugar(sugar);
    setSugar('');
    showToast(`น้ำตาล ${sugar} mg/dL → ${c.label}`, c.level);
  };

  const saveHR = () => {
    if (!hr) return showToast('กรุณากรอกอัตราการเต้นหัวใจ', 'warning');
    if (isNaN(Number(hr))) return showToast('ค่าหัวใจต้องเป็นตัวเลข', 'warning');
    if (Number(hr) < 20 || Number(hr) > 300)
      return showToast('ค่าหัวใจดูไม่สมเหตุสมผล กรุณาตรวจสอบ', 'warning');
    const c = classifyHeartRate(hr);
    addHeartRate(hr);
    setHr('');
    showToast(`หัวใจ ${hr} bpm → ${c.label}`, c.level);
  };

  const lastBP = data.blood_pressure_logs[data.blood_pressure_logs.length - 1];
  const lastSugar = data.blood_sugar_logs[data.blood_sugar_logs.length - 1];
  const lastHR = data.heart_rate_logs[data.heart_rate_logs.length - 1];
  const bpC = lastBP ? classifyBP(lastBP.systolic, lastBP.diastolic) : null;
  const sgC = lastSugar ? classifySugar(lastSugar.sugar_level) : null;
  const hrC = lastHR ? classifyHeartRate(lastHR.bpm) : null;

  return (
    <Screen title="บันทึกค่าสุขภาพ">
      <Card style={styles.patientCard}>
        <View style={styles.patientIcon}>
          <Text style={styles.patientInitial}>{data.patient?.name ? data.patient.name.slice(0, 1) : 'ผ'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{data.patient?.name || 'ผู้ป่วย'}</Text>
          <Text style={styles.patientSub}>{data.patient?.congenital_disease || 'ยังไม่มีโรคประจำตัวที่ระบุ'}</Text>
        </View>
      </Card>

      <SectionTitle>ค่าล่าสุด</SectionTitle>
      <Card>
        <View style={styles.latestRow}>
          <Text style={styles.latestLabel}>ความดันโลหิต</Text>
          {lastBP ? (
            <View style={styles.latestRight}>
              <Text style={styles.latestVal}>{lastBP.systolic}/{lastBP.diastolic}</Text>
              <Badge text={bpC.label} level={bpC.level} />
            </View>
          ) : (
            <Text style={styles.latestVal}>-</Text>
          )}
        </View>
        <View style={[styles.latestRow, styles.divider]}>
          <Text style={styles.latestLabel}>น้ำตาลในเลือด</Text>
          {lastSugar ? (
            <View style={styles.latestRight}>
              <Text style={styles.latestVal}>{lastSugar.sugar_level} mg/dL</Text>
              <Badge text={sgC.label} level={sgC.level} />
            </View>
          ) : (
            <Text style={styles.latestVal}>-</Text>
          )}
        </View>
        <View style={[styles.latestRow, styles.divider]}>
          <Text style={styles.latestLabel}>อัตราการเต้นหัวใจ</Text>
          {lastHR ? (
            <View style={styles.latestRight}>
              <Text style={styles.latestVal}>{lastHR.bpm} bpm</Text>
              <Badge text={hrC.label} level={hrC.level} />
            </View>
          ) : (
            <Text style={styles.latestVal}>-</Text>
          )}
        </View>
      </Card>

      <SectionTitle>บันทึกความดันโลหิต</SectionTitle>
      <Card>
        <Field label="ตัวบน (Systolic)" value={sys} onChangeText={setSys} keyboardType="numeric" placeholder="เช่น 120" />
        <Field label="ตัวล่าง (Diastolic)" value={dia} onChangeText={setDia} keyboardType="numeric" placeholder="เช่น 80" />
      </Card>
      <BigButton label="บันทึกความดัน" icon="content-save" onPress={saveBP} />

      <SectionTitle>บันทึกระดับน้ำตาล</SectionTitle>
      <Card>
        <Field label="ระดับน้ำตาล (mg/dL)" value={sugar} onChangeText={setSugar} keyboardType="numeric" placeholder="เช่น 95" />
      </Card>
      <BigButton label="บันทึกน้ำตาล" icon="content-save" onPress={saveSugar} color={colors.success} />

      <SectionTitle>บันทึกอัตราการเต้นหัวใจ</SectionTitle>
      <Card>
        <Field label="อัตราการเต้นหัวใจ (bpm)" value={hr} onChangeText={setHr} keyboardType="numeric" placeholder="เช่น 78" />
      </Card>
      <BigButton label="บันทึกหัวใจ" icon="heart-pulse" onPress={saveHR} color={colors.accent} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  latestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  latestLabel: { fontSize: sizes.body, color: colors.textMuted },
  latestRight: { alignItems: 'flex-end' },
  latestVal: { fontSize: sizes.h2, fontWeight: '800', color: colors.text, marginBottom: 4 },
  patientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint2 },
  patientIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  patientInitial: { fontSize: sizes.h2, fontWeight: '900', color: colors.primary },
  patientName: { fontSize: sizes.body, fontWeight: '900', color: colors.text },
  patientSub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
});

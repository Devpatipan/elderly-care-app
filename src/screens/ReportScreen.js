import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { Card, SectionTitle } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';
import { localDay } from '../data';

// หน้ารายงานสรุปสุขภาพ ราย 7 วัน / 30 วัน (เอกสาร 1.4 ข้อ 2.2)
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDay(d);
}
const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
const fmt = (v) => (v == null ? '-' : v);

function Summary({ title, days, data }) {
  const cut = daysAgo(days);
  const today = localDay();
  const bp = data.blood_pressure_logs.filter((r) => r.created_at >= cut);
  const sg = data.blood_sugar_logs.filter((r) => r.created_at >= cut);
  const hr = data.heart_rate_logs.filter((r) => r.created_at >= cut);
  const meds = data.medication_log.filter((l) => String(l.taken_at).slice(0, 10) >= cut);

  const sysAvg = avg(bp.map((r) => r.systolic));
  const diaAvg = avg(bp.map((r) => r.diastolic));
  const sgAvg = avg(sg.map((r) => r.sugar_level));
  const hrAvg = avg(hr.map((r) => r.bpm));

  const rows = [
    ['ความดันเฉลี่ย', sysAvg ? `${sysAvg}/${diaAvg} mmHg` : '-'],
    ['น้ำตาลเฉลี่ย', sgAvg ? `${sgAvg} mg/dL` : '-'],
    ['หัวใจเฉลี่ย', hrAvg ? `${hrAvg} bpm` : '-'],
    ['จำนวนครั้งทานยา', `${meds.length} ครั้ง`],
    ['จำนวนครั้งวัดความดัน', `${bp.length} ครั้ง`],
  ];

  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Text style={styles.range}>ช่วงวันที่ {cut} ถึง {today}</Text>
      <Card>
        {rows.map(([k, v], i) => (
          <View key={k} style={[styles.row, i > 0 && styles.divider]}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{fmt(v)}</Text>
          </View>
        ))}
      </Card>
    </>
  );
}

export default function ReportScreen() {
  const { data } = useApp();
  return (
    <Screen title="รายงานสรุปสุขภาพ">
      <Summary title="สรุป 7 วันล่าสุด" days={7} data={data} />
      <Summary title="สรุป 30 วันล่าสุด" days={30} data={data} />
      <Text style={styles.note}>
        รายงานสรุปค่าเฉลี่ยจากข้อมูลที่บันทึกไว้ ใช้ติดตามแนวโน้มสุขภาพและประกอบการพบแพทย์
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  k: { fontSize: sizes.body, color: colors.textMuted },
  v: { fontSize: sizes.body, color: colors.text, fontWeight: '700' },
  note: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 4 },
  range: { fontSize: sizes.small, color: colors.textMuted, marginBottom: 8, marginTop: -4 },
});

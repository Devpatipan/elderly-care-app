import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import Screen from '../components/Screen';
import { Card, SectionTitle } from '../components/ui';
import { colors, sizes, levelColor } from '../theme';
import { useApp } from '../store';
import { classifyBP, classifySugar, classifyHeartRate } from '../data';

// หน้าแสดงผลแบบกราฟ (ภาพที่ 12): กราฟ "เส้น" แนวโน้มย้อนหลังสูงสุด 30 วัน
// ตามที่เอกสารบทที่ 3 ระบุ — วาดด้วย react-native-svg รันได้ทั้งมือถือและเว็บ
const CHART_W = Math.min(Dimensions.get('window').width - 64, 520);
const CHART_H = 190;
const PAD = { l: 38, r: 14, t: 16, b: 26 };

function LineChart({ points, min, max, lineColor }) {
  const data = points.slice(-30); // สูงสุด 30 จุดล่าสุด
  if (data.length === 0) {
    return <Text style={{ color: colors.textMuted }}>ยังไม่มีข้อมูล</Text>;
  }
  const innerW = CHART_W - PAD.l - PAD.r;
  const innerH = CHART_H - PAD.t - PAD.b;
  const n = data.length;
  const x = (i) => PAD.l + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
  const y = (v) => {
    const clamped = Math.max(min, Math.min(max, v));
    return PAD.t + innerH - ((clamped - min) / (max - min)) * innerH;
  };
  const poly = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const ticks = [min, Math.round((min + max) / 2), max];
  const xIdx = [...new Set([0, Math.floor((n - 1) / 2), n - 1])];

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {ticks.map((t, idx) => (
        <React.Fragment key={'g' + idx}>
          <Line x1={PAD.l} y1={y(t)} x2={CHART_W - PAD.r} y2={y(t)} stroke="#E8EEF3" strokeWidth="1" />
          <SvgText x={PAD.l - 6} y={y(t) + 4} fontSize="10" fill={colors.textMuted} textAnchor="end">{t}</SvgText>
        </React.Fragment>
      ))}
      <Polyline points={poly} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <Circle key={'c' + i} cx={x(i)} cy={y(d.value)} r="3.5" fill={levelColor[d.level] || lineColor} />
      ))}
      {xIdx.map((i) => (
        <SvgText key={'x' + i} x={x(i)} y={CHART_H - 8} fontSize="10" fill={colors.textMuted} textAnchor="middle">
          {data[i].label}
        </SvgText>
      ))}
    </Svg>
  );
}

function shortDate(iso) {
  const parts = String(iso).split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : iso;
}

export default function GraphScreen() {
  const { data } = useApp();

  const bpPoints = data.blood_pressure_logs.map((b) => ({
    value: b.systolic,
    label: shortDate(b.created_at),
    level: classifyBP(b.systolic, b.diastolic).level,
  }));
  const sugarPoints = data.blood_sugar_logs.map((s) => ({
    value: s.sugar_level,
    label: shortDate(s.created_at),
    level: classifySugar(s.sugar_level).level,
  }));
  const hrPoints = data.heart_rate_logs.map((h) => ({
    value: h.bpm,
    label: shortDate(h.created_at),
    level: classifyHeartRate(h.bpm).level,
  }));

  return (
    <Screen title="กราฟแสดงผล (ย้อนหลัง 30 วัน)">
      <SectionTitle hint="เส้นแนวโน้มความดันตัวบน (mmHg)">ความดันโลหิต</SectionTitle>
      <Card>
        <LineChart points={bpPoints} min={80} max={200} lineColor={colors.primary} />
        <Text style={styles.caption}>เกณฑ์: ปกติ &lt; 120 · เริ่มสูง 130–139 · สูง ≥ 140</Text>
      </Card>

      <SectionTitle hint="เส้นแนวโน้มระดับน้ำตาล (mg/dL)">ระดับน้ำตาลในเลือด</SectionTitle>
      <Card>
        <LineChart points={sugarPoints} min={60} max={220} lineColor={colors.accent} />
        <Text style={styles.caption}>เกณฑ์: ปกติ 70–100 · เสี่ยง 100–125 · เบาหวาน ≥ 126</Text>
      </Card>

      <SectionTitle hint="เส้นแนวโน้มอัตราการเต้นหัวใจ (bpm)">อัตราการเต้นของหัวใจ</SectionTitle>
      <Card>
        <LineChart points={hrPoints} min={40} max={160} lineColor={colors.danger} />
        <Text style={styles.caption}>เกณฑ์ขณะพัก: ปกติ 60–100 · เร็ว &gt; 100 · ช้า &lt; 60</Text>
      </Card>

      <Text style={styles.note}>
        จุดบนเส้นมีสีตามระดับความเสี่ยง: เขียว = ปกติ, ส้ม = เฝ้าระวัง, แดง = ผิดปกติ —
        ใช้ประกอบการพูดคุยอาการกับแพทย์ได้
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  note: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, SectionTitle, Badge, ProgressBar, IconCircle, PressScale } from '../components/ui';
import { colors, sizes, shadow } from '../theme';
import { useApp } from '../store';
import { classifyBP, classifySugar, classifyHeartRate, localDay } from '../data';

// หน้าหลักแบบ dashboard (ภาพที่ 5): ทักทาย + ความคืบหน้ายาวันนี้ + การ์ดค่าสุขภาพ + เมนู + นัดหมาย
export default function HomeScreen() {
  const { data, navigate, reset, takeMed, user } = useApp();
  const { patient } = data;
  const caregiverName = (user && user.name) || 'ผู้ดูแล';

  // กันแอปล่มถ้ายังไม่มีข้อมูลผู้ป่วย (เช่น โหลด DB ไม่สำเร็จ / ยังไม่ได้รัน migration)
  if (!patient) {
    return (
      <Screen title="หน้าหลัก" showBack={true} onBack={() => reset('CaregiverHome')}>
        <Card>
          <Text style={{ fontSize: sizes.body, color: colors.textMuted, textAlign: 'center' }}>
            ยังไม่พบข้อมูลผู้ป่วย — ดึงหน้าจอลงเพื่อรีเฟรช หรือเพิ่มข้อมูลผู้ป่วย
          </Text>
        </Card>
      </Screen>
    );
  }

  const today = localDay();
  const totalMeds = data.medication_records.length;
  // นับ "ชนิดยา" ที่ทานแล้ววันนี้แบบไม่ซ้ำ (กดซ้ำยาเดิมไม่ทำให้เกิน 100%)
  const takenNamesToday = new Set(
    data.medication_log
      .filter((l) => String(l.taken_at).startsWith(today))
      .map((l) => l.medication_name)
  );
  const takenToday = Math.min(takenNamesToday.size, totalMeds);
  const remaining = Math.max(0, totalMeds - takenToday);
  const pct = totalMeds ? Math.round((takenToday / totalMeds) * 100) : 0;

  const lastBP = data.blood_pressure_logs[data.blood_pressure_logs.length - 1];
  const lastSugar = data.blood_sugar_logs[data.blood_sugar_logs.length - 1];
  const lastHR = data.heart_rate_logs[data.heart_rate_logs.length - 1];
  const bpC = lastBP ? classifyBP(lastBP.systolic, lastBP.diastolic) : null;
  const sgC = lastSugar ? classifySugar(lastSugar.sugar_level) : null;
  const hrC = lastHR ? classifyHeartRate(lastHR.bpm) : null;

  const alerts = [];
  if (bpC && bpC.level !== 'success') alerts.push(`ความดัน ${lastBP.systolic}/${lastBP.diastolic} → ${bpC.label}`);
  if (sgC && sgC.level !== 'success') alerts.push(`น้ำตาล ${lastSugar.sugar_level} → ${sgC.label}`);
  if (hrC && hrC.level !== 'success') alerts.push(`หัวใจ ${lastHR.bpm} bpm → ${hrC.label}`);

  const nextAppt = data.appointments[0];

  return (
    <Screen title="หน้าหลัก" showBack={true} onBack={() => reset('CaregiverHome')}>
      {/* Greeting / profile mini */}
      <Card style={styles.profile}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account-heart" size={34} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>สวัสดีค่ะ {caregiverName}</Text>
          <Text style={styles.pName}>{patient.name}</Text>
          <Text style={styles.pSub}>อายุ {patient.age} ปี · {patient.congenital_disease || '-'}</Text>
        </View>
        <TouchableOpacity style={styles.switchBtn} onPress={() => navigate('PatientList')} activeOpacity={0.8}>
          <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.primaryDark} />
          <Text style={styles.switchText}>เลือก</Text>
        </TouchableOpacity>
      </Card>

      {/* Today's medication progress */}
      <Card style={styles.heroCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.heroEyebrow}>สุขภาพดี เริ่มจากการดูแลสม่ำเสมอ</Text>
            <Text style={styles.cardTitle}>การทานยาวันนี้</Text>
          </View>
          <Text style={styles.progressPct}>{takenToday}/{totalMeds}</Text>
        </View>
        <ProgressBar value={pct} color={pct === 100 ? colors.success : colors.primary} />
        <Text style={styles.progressHint}>
          {pct === 100 ? 'ครบแล้ววันนี้' : `เหลืออีก ${remaining} รายการ`}
        </Text>
      </Card>

      {/* Health stat cards */}
      <View style={styles.statRow}>
        <TouchableOpacity style={[styles.stat, shadow.card]} activeOpacity={0.85} onPress={() => navigate('Health')}>
          <IconCircle icon="heart-pulse" color={colors.primary} soft={colors.primarySoft} size={42} />
          <Text style={styles.statLabel}>ความดัน</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{lastBP ? `${lastBP.systolic}/${lastBP.diastolic}` : '-'}</Text>
          {bpC && <Badge text={bpC.label} level={bpC.level} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stat, shadow.card]} activeOpacity={0.85} onPress={() => navigate('Health')}>
          <IconCircle icon="water" color={colors.accent} soft={colors.accentSoft} size={42} />
          <Text style={styles.statLabel}>น้ำตาล</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{lastSugar ? `${lastSugar.sugar_level}` : '-'}</Text>
          {sgC && <Badge text={sgC.label} level={sgC.level} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stat, shadow.card]} activeOpacity={0.85} onPress={() => navigate('Health')}>
          <IconCircle icon="heart" color={colors.danger} soft={colors.dangerSoft} size={42} />
          <Text style={styles.statLabel}>หัวใจ</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{lastHR ? `${lastHR.bpm}` : '-'}</Text>
          {hrC && <Badge text={hrC.label} level={hrC.level} />}
        </TouchableOpacity>
      </View>

      {/* Auto alert */}
      {alerts.length > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHead}>
            <MaterialCommunityIcons name="alert" size={20} color="#9A5B00" />
            <Text style={styles.alertTitle}>ค่าสุขภาพควรเฝ้าระวัง</Text>
          </View>
          {alerts.map((a, i) => <Text key={i} style={styles.alertText}>• {a}</Text>)}
        </Card>
      )}

      {/* Menu */}
      <SectionTitle>เมนูดูแลหลัก</SectionTitle>
      <View style={styles.grid}>
        <Tile icon="heart-pulse" label="บันทึกค่าสุขภาพ" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('Health')} />
        <Tile icon="pill" label="การรักษาด้วยยา" c={colors.accent} s={colors.accentSoft} onPress={() => navigate('Medication')} />
        <Tile icon="calendar-clock" label="นัดหมายแพทย์" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('Appointment')} />
        <Tile icon="bell-ring" label="แจ้งเตือน" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('NotificationInbox')} />
        <Tile icon="chart-line" label="กราฟสุขภาพ" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('Graph')} />
        <Tile icon="account" label="ข้อมูลผู้ป่วย" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('PatientInfo')} />
        <Tile icon="account-arrow-left" label="หน้าผู้ดูแล" c={colors.primary} s={colors.primarySoft} onPress={() => navigate('CaregiverHome')} />
      </View>

      {/* Today's meds */}
      <SectionTitle hint="กดยืนยันเมื่อให้ทานยาแล้ว">ยาที่ต้องทานวันนี้</SectionTitle>
      {data.medication_records.map((m) => {
        const taken = takenNamesToday.has(m.medication_name);
        return (
          <Card key={m.id} style={styles.medRow}>
            <IconCircle icon="pill" color={taken ? colors.textTertiary : colors.primary} soft={taken ? colors.border : colors.primarySoft} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.medName}>{m.medication_name}</Text>
              <Text style={styles.medSub}>{m.dosage} · {m.time_of_day}</Text>
            </View>
            <TouchableOpacity
              style={[styles.takeBtn, taken && styles.takeBtnDone]}
              onPress={() => !taken && takeMed(m)}
              activeOpacity={taken ? 1 : 0.85}
              disabled={taken}
            >
              <Text style={[styles.takeText, taken && styles.takeTextDone]}>{taken ? 'ทานแล้ว' : 'กดยืนยัน'}</Text>
            </TouchableOpacity>
          </Card>
        );
      })}

      {/* Next appointment */}
      <SectionTitle>นัดหมายถัดไป</SectionTitle>
      <Card style={styles.apCard}>
        <IconCircle icon="calendar-clock" color={colors.primary} soft={colors.primarySoft} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          {nextAppt ? (
            <>
              <Text style={styles.apTitle}>{nextAppt.datetime}</Text>
              <Text style={styles.apText}>{nextAppt.doctor_name} · {nextAppt.hospital_name}</Text>
            </>
          ) : (
            <Text style={styles.apText}>ยังไม่มีนัดหมาย</Text>
          )}
        </View>
      </Card>
    </Screen>
  );
}

function Tile({ icon, label, onPress, c, s }) {
  return (
    <PressScale onPress={onPress} style={styles.tileWrap}>
      <View style={[styles.tile, shadow.card]}>
        <IconCircle icon={icon} color={c} soft={s} />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  avatar: {
    width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  hello: { fontSize: sizes.tiny, color: colors.textMuted },
  pName: { fontSize: sizes.title, fontWeight: '900', color: colors.text },
  pSub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primarySoft, borderRadius: 999,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  switchText: { fontSize: sizes.tiny, color: colors.primaryDark, fontWeight: '800' },

  heroCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primaryTint2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heroEyebrow: { fontSize: sizes.tiny, color: colors.primaryDark, fontWeight: '700', marginBottom: 3 },
  cardTitle: { fontSize: sizes.body, fontWeight: '800', color: colors.text },
  progressPct: { fontSize: sizes.body, fontWeight: '900', color: colors.primary },
  progressHint: { fontSize: sizes.small, color: colors.textMuted, marginTop: 8 },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'stretch' },
  stat: {
    flex: 1, backgroundColor: colors.card, borderRadius: sizes.radiusSm, padding: 12,
    alignItems: 'flex-start', minHeight: 158,
    borderWidth: 1, borderColor: colors.border,
  },
  statLabel: { fontSize: sizes.small, color: colors.textMuted, marginTop: 10 },
  statValue: { fontSize: sizes.h2, fontWeight: '900', color: colors.text, marginVertical: 4, alignSelf: 'stretch' },

  alertCard: { backgroundColor: colors.warningSoft },
  alertHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  alertTitle: { fontSize: sizes.body, fontWeight: '800', color: '#9A5B00', marginLeft: 6 },
  alertText: { fontSize: sizes.small, color: '#9A5B00', marginTop: 2 },

  medRow: { flexDirection: 'row', alignItems: 'center' },
  medName: { fontSize: sizes.body, fontWeight: '800', color: colors.text },
  medSub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 3 },
  takeBtn: { backgroundColor: colors.success, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  takeText: { color: colors.white, fontWeight: '800', fontSize: sizes.small },
  takeBtnDone: { backgroundColor: colors.border, borderWidth: 1, borderColor: '#D7DDD9' },
  takeTextDone: { color: colors.textMuted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tileWrap: { width: '48%', marginBottom: 12 },
  tile: {
    backgroundColor: colors.card, borderRadius: sizes.radiusSm,
    paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, minHeight: 104,
  },
  tileLabel: { fontSize: sizes.small, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: 8 },

  apCard: { flexDirection: 'row', alignItems: 'center' },
  apTitle: { fontSize: sizes.body, fontWeight: '800', color: colors.primaryDark },
  apText: { fontSize: sizes.small, color: colors.textMuted, marginTop: 3 },
});

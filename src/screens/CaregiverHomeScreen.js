import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, BigButton } from '../components/ui';
import { colors, sizes, levelColor, levelSoft } from '../theme';
import { useApp } from '../store';
import { classifyBP, classifySugar, classifyHeartRate } from '../data';

export default function CaregiverHomeScreen() {
  const { user, patients, patientSummaries, activePatientId, selectPatient, navigate, reset, signOut, showToast } = useApp();
  const patientCount = patients.length;

  const openPatientHome = (id) => {
    selectPatient(id);
    reset('Home');
  };

  const logout = () => {
    signOut();
    showToast('ออกจากระบบแล้ว', 'success');
  };

  return (
    <Screen title="โปรไฟล์ผู้ดูแล" showBack={false} showTabs={false}>
      <Card style={styles.profile}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account-heart" size={34} color={colors.primary} />
        </View>
        <Text style={styles.role}>ผู้ดูแล</Text>
        <Text style={styles.name}>{(user && user.name) || 'ผู้ดูแล'}</Text>
        <Text style={styles.email}>{user && user.email ? user.email : 'พร้อมดูแลผู้ป่วย'}</Text>
        <View style={styles.countPill}>
          <MaterialCommunityIcons name="account-group" size={16} color={colors.primary} />
          <Text style={styles.countText}>ดูแลผู้ป่วย {patientCount} คน</Text>
        </View>
      </Card>

      <View style={styles.board}>
        <Text style={styles.boardTitle}>ผู้ป่วยที่ดูแล</Text>
        <Text style={styles.boardHint}>แตะการ์ดเพื่อไปหน้าหลักของผู้ป่วยคนนั้น</Text>

        {patients.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.empty}>ยังไม่มีผู้ป่วยในความดูแล</Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {patients.map((patient) => (
              <PatientSummaryCard
                key={patient.id}
                patient={patient}
                summary={patientSummaries[patient.id]}
                active={patient.id === activePatientId}
                onPress={() => openPatientHome(patient.id)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addCard} activeOpacity={0.84} onPress={() => navigate('AddPatient', { mode: 'new' })}>
          <MaterialCommunityIcons name="account-plus" size={22} color={colors.primary} />
          <Text style={styles.addText}>เพิ่มผู้ป่วยใหม่</Text>
        </TouchableOpacity>
      </View>

      <BigButton label="ออกจากระบบ" icon="logout" light color={colors.danger} onPress={logout} />
    </Screen>
  );
}

function PatientSummaryCard({ patient, summary, active, onPress }) {
  const bp = summary && summary.bp;
  const sugar = summary && summary.sugar;
  const hr = summary && summary.hr;
  const bpValue = bp ? `${bp.systolic}/${bp.diastolic}` : '-';
  const sugarValue = sugar ? String(sugar.sugar_level) : '-';
  const hrValue = hr ? String(hr.bpm) : '-';
  const bpLevel = bp ? classifyBP(bp.systolic, bp.diastolic) : null;
  const sugarLevel = sugar ? classifySugar(sugar.sugar_level) : null;
  const hrLevel = hr ? classifyHeartRate(hr.bpm) : null;

  return (
    <TouchableOpacity
      style={[styles.patientTile, active && styles.patientTileActive]}
      activeOpacity={0.86}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`ไปหน้าหลักของ ${patient.name}`}
    >
      <View style={styles.tileTop}>
        <View style={styles.patientIcon}>
          <MaterialCommunityIcons name="account-heart" size={24} color={colors.primary} />
        </View>
        {active ? <Text style={styles.activeText}>กำลังดูแล</Text> : null}
      </View>

      <Text style={styles.patientName} numberOfLines={2}>{patient.name}</Text>
      <Text style={styles.patientMeta} numberOfLines={1}>
        อายุ {patient.age || '-'} ปี{patient.blood_type ? ` · กรุ๊ป ${patient.blood_type}` : ''}
      </Text>
      <Text style={styles.disease} numberOfLines={2}>{patient.congenital_disease || 'ยังไม่ระบุโรคประจำตัว'}</Text>

      <View style={styles.vitals}>
        <Vital icon="heart-pulse" label="ความดัน" value={bpValue} level={bpLevel} />
        <Vital icon="water" label="น้ำตาล" value={sugarValue} level={sugarLevel} />
        <Vital icon="heart" label="หัวใจ" value={hrValue} level={hrLevel} />
      </View>
    </TouchableOpacity>
  );
}

function Vital({ icon, label, value, level }) {
  const tone = level ? level.level : 'success';
  return (
    <View style={styles.vitalRow}>
      <View style={[styles.vitalIcon, { backgroundColor: levelSoft[tone] || colors.primarySoft }]}>
        <MaterialCommunityIcons name={icon} size={15} color={levelColor[tone] || colors.primary} />
      </View>
      <View style={styles.vitalTextWrap}>
        <Text style={styles.vitalLabel}>{label}</Text>
        <Text style={styles.vitalValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', paddingVertical: 22 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  role: { fontSize: sizes.small, color: colors.textMuted },
  name: { fontSize: sizes.title, fontWeight: '900', color: colors.text, marginTop: 2 },
  email: { fontSize: sizes.small, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  countPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 14,
    paddingVertical: 8, marginTop: 12,
  },
  countText: { fontSize: sizes.small, fontWeight: '900', color: colors.primary },
  board: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: sizes.radius,
    padding: 14, marginBottom: 14, backgroundColor: colors.card,
  },
  boardTitle: { fontSize: sizes.h2, fontWeight: '900', color: colors.text, textAlign: 'center' },
  boardHint: { fontSize: sizes.tiny, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  patientTile: {
    width: '48%', minHeight: 230, borderWidth: 1, borderColor: colors.border,
    borderRadius: sizes.radiusSm, backgroundColor: colors.bg, padding: 12,
  },
  patientTileActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 34 },
  patientIcon: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  activeText: { fontSize: sizes.tiny, fontWeight: '900', color: colors.success },
  patientName: { fontSize: sizes.body, fontWeight: '900', color: colors.text, marginTop: 10, lineHeight: 23 },
  patientMeta: { fontSize: sizes.tiny, color: colors.textMuted, marginTop: 4 },
  disease: { fontSize: sizes.tiny, color: colors.primaryDark, fontWeight: '800', marginTop: 6, lineHeight: 18, minHeight: 36 },
  vitals: { marginTop: 10, gap: 7 },
  vitalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vitalIcon: {
    width: 26, height: 26, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  vitalTextWrap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 },
  vitalLabel: { fontSize: 11, color: colors.textMuted },
  vitalValue: { fontSize: sizes.tiny, fontWeight: '900', color: colors.text },
  addCard: {
    marginTop: 12, minHeight: 52, borderRadius: sizes.radiusSm, borderWidth: 1.5,
    borderColor: colors.primary, backgroundColor: colors.card, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addText: { fontSize: sizes.small, fontWeight: '900', color: colors.primary },
  emptyCard: { alignItems: 'center' },
  empty: { fontSize: sizes.small, color: colors.textMuted },
});

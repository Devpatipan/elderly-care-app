import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card, SectionTitle, Field, BigButton } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// หน้า SOS ฉุกเฉิน — โทรหาผู้ติดต่อฉุกเฉิน + เพิ่ม/ลบรายชื่อได้ (เอกสาร 1.3.1.5)
export default function SOSScreen() {
  const { data, addEmergencyContact, removeItem, showToast } = useApp();
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const call = (number) => {
    const url = `tel:${String(number).replace(/[^0-9+]/g, '')}`;
    Linking.openURL(url).catch(() =>
      showToast(`ไม่สามารถโทรออกได้บนอุปกรณ์นี้ (เบอร์: ${number})`, 'info')
    );
  };

  const add = () => {
    if (!name || !phone) return showToast('กรุณากรอกชื่อและเบอร์โทร', 'warning');
    addEmergencyContact({ contact_name: name, relationship: rel, phone_number: phone, note });
    setName(''); setRel(''); setPhone(''); setNote('');
  };

  return (
    <Screen title="SOS ฉุกเฉิน">
      <Text style={styles.lead}>กดเพื่อโทรหาผู้ติดต่อฉุกเฉินทันที</Text>

      <SectionTitle>ผู้ติดต่อฉุกเฉิน</SectionTitle>
      {data.emergency_contacts.map((c) => (
        <View key={c.id} style={styles.contactRow}>
          <TouchableOpacity style={styles.callBtn} onPress={() => call(c.phone_number)} activeOpacity={0.85}>
            <View style={styles.callIcon}>
              <MaterialCommunityIcons name="phone" size={26} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.callName}>{c.contact_name}</Text>
              <Text style={styles.callSub}>{c.relationship} · {c.phone_number}</Text>
              {!!c.note && <Text style={styles.callSub}>{c.note}</Text>}
            </View>
            <Text style={styles.callAction}>โทร</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.del}
            onPress={() => removeItem('emergency_contacts', c.id, 'emergency_contacts')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ))}

      <SectionTitle>เพิ่มผู้ติดต่อฉุกเฉิน</SectionTitle>
      <Card>
        <Field label="ชื่อ-สกุล" value={name} onChangeText={setName} placeholder="เช่น สมชาย ใจดี" />
        <Field label="ความสัมพันธ์" value={rel} onChangeText={setRel} placeholder="เช่น บุตร" />
        <Field label="เบอร์ฉุกเฉิน" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="เช่น 0899991234" />
        <Field label="หมายเหตุ" value={note} onChangeText={setNote} placeholder="เช่น โทรได้ตลอด 24 ชม." />
      </Card>
      <BigButton label="เพิ่มผู้ติดต่อ" icon="account-plus" onPress={add} />

      <Text style={styles.note}>
        เบอร์ 1669 คือสายด่วนการแพทย์ฉุกเฉินแห่งชาติ (โทรฟรีทั่วประเทศ)
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: sizes.body, color: colors.text, marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: sizes.radius,
    padding: 18,
  },
  callIcon: { marginRight: 14 },
  callName: { fontSize: sizes.h2, fontWeight: '800', color: colors.white },
  callSub: { fontSize: sizes.small, color: '#FFE3E0', marginTop: 2 },
  callAction: { fontSize: sizes.body, fontWeight: '900', color: colors.white },
  del: { padding: 8, marginLeft: 6 },
  note: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
});

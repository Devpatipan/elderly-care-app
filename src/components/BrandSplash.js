import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Logo from './Logo';
import { colors, sizes } from '../theme';

// หน้าเปิดแอป (splash ในแอป) — โลโก้ + ชื่อแอป บนพื้น teal
export default function BrandSplash() {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Logo size={132} rounded={false} />
      </View>
      <Text style={styles.title}>ดูแลผู้สูงอายุ</Text>
      <Text style={styles.subtitle}>ผู้ช่วยสำหรับผู้ดูแลผู้สูงอายุที่มีโรคประจำตัว</Text>
      <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingHorizontal: 32 },
  badge: {
    width: 168, height: 168, borderRadius: 84,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 22,
  },
  title: { fontSize: sizes.display, fontWeight: '900', color: colors.white },
  subtitle: { fontSize: sizes.small, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'center' },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, shadow } from '../theme';
import { useApp } from '../store';
import Logo from '../components/Logo';

// หน้าสมัครสมาชิก / เข้าสู่ระบบ (ภาพที่ 6) — การยืนยันตัวตนเป็นแบบจำลอง
export default function LoginScreen() {
  const { reset, setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    setUser({ email: email || 'caregiver@demo.app' });
    reset('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* teal hero top */}
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Logo size={96} rounded={false} />
        </View>
        <Text style={styles.appName}>ดูแลผู้สูงอายุ</Text>
        <Text style={styles.subtitle}>ผู้ช่วยสำหรับผู้ดูแลผู้สูงอายุที่มีโรคประจำตัว</Text>
      </View>

      {/* white card */}
      <View style={styles.sheet}>
        <TouchableOpacity style={styles.googleBtn} onPress={login} activeOpacity={0.85}>
          <MaterialCommunityIcons name="google" size={22} color="#4285F4" style={{ marginRight: 10 }} />
          <Text style={styles.googleText}>เข้าสู่ระบบด้วย Google</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.line} /><Text style={styles.or}>หรือ</Text><View style={styles.line} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={login} activeOpacity={0.85}>
          <Text style={styles.primaryText}>เข้าสู่ระบบ / สร้างบัญชี</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>ต้นแบบสาธิต — กดปุ่มใดก็เข้าใช้งานได้ทันที</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  hero: {
    paddingTop: Platform.OS === 'android' ? 70 : 90,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  appName: { fontSize: sizes.display, fontWeight: '900', color: colors.white },
  subtitle: { fontSize: sizes.small, color: 'rgba(255,255,255,0.9)', marginTop: 6, textAlign: 'center', paddingHorizontal: 30 },

  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 26,
    paddingTop: 32,
  },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white, borderRadius: 999, paddingVertical: 16, ...shadow.soft,
  },
  googleG: { fontSize: 20, fontWeight: '900', color: '#4285F4', marginRight: 10 },
  googleText: { fontSize: sizes.body, fontWeight: '700', color: colors.text },

  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { marginHorizontal: 12, color: colors.textMuted },

  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: sizes.radiusSm, paddingHorizontal: 16, paddingVertical: 15,
    fontSize: sizes.body, color: colors.text, marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: sizes.radiusSm, paddingVertical: 17,
    alignItems: 'center', marginTop: 4, ...shadow.soft,
  },
  primaryText: { color: colors.white, fontSize: sizes.body, fontWeight: '800' },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: sizes.tiny, marginTop: 18 },
});

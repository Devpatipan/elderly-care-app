import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, shadow } from '../theme';
import { useApp } from '../store';
import { supabase } from '../supabase';
import Logo from '../components/Logo';

// หน้าเข้าสู่ระบบ / สมัครสมาชิก — ยืนยันตัวตนจริงกับฐานข้อมูล (RPC + bcrypt)
export default function LoginScreen() {
  const { reset, setUser, showToast } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail || !password) return showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'warning');
    if (isRegister && password.length < 6) return showToast('รหัสผ่านอย่างน้อย 6 ตัวอักษร', 'warning');

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.rpc('register_user', {
          p_email: mail,
          p_password: password,
          p_name: name.trim() || null,
        });
        if (error) throw error;
        const u = data && data[0];
        setUser({ id: u.id, email: u.email, name: u.name });
        showToast('สมัครสมาชิกสำเร็จ', 'success');
        reset('PatientList', { entry: true });
      } else {
        const { data, error } = await supabase.rpc('login_user', {
          p_email: mail,
          p_password: password,
        });
        if (error) throw error;
        const u = data && data[0];
        if (!u) return showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'danger');
        setUser({ id: u.id, email: u.email, name: u.name });
        reset('PatientList', { entry: true });
      }
    } catch (e) {
      showToast(
        (isRegister ? 'สมัครไม่สำเร็จ: ' : 'เข้าสู่ระบบไม่สำเร็จ: ') + (e.message || String(e)),
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const googleUnsupported = () =>
    showToast('ยังไม่รองรับการเข้าสู่ระบบด้วย Google', 'warning');

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
        <TouchableOpacity style={styles.googleBtn} onPress={googleUnsupported} activeOpacity={0.85}>
          <MaterialCommunityIcons name="google" size={22} color="#4285F4" style={{ marginRight: 10 }} />
          <Text style={styles.googleText}>เข้าสู่ระบบด้วย Google</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.line} /><Text style={styles.or}>หรือ</Text><View style={styles.line} />
        </View>

        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="ชื่อ-นามสกุล"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        )}
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

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
          onPress={submit}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryText}>{isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(isRegister ? 'login' : 'register')} activeOpacity={0.7}>
          <Text style={styles.hint}>
            {isRegister ? 'มีบัญชีอยู่แล้ว? ' : 'ยังไม่มีบัญชี? '}
            <Text style={styles.link}>{isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Text>
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center', marginTop: 4, minHeight: 56, justifyContent: 'center', ...shadow.soft,
  },
  primaryText: { color: colors.white, fontSize: sizes.body, fontWeight: '800' },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: sizes.small, marginTop: 18 },
  link: { color: colors.primary, fontWeight: '800' },
});

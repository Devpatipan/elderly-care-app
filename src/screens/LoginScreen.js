import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { colors, sizes, shadow } from '../theme';
import { useApp } from '../store';
import { supabase } from '../supabase';
import Logo from '../components/Logo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

const authUserToAppUser = (authUser) => {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: meta.name || meta.full_name || authUser.email,
    age: meta.age ?? null,
    phone: meta.phone || null,
  };
};

const getUrlParam = (url, key) => {
  const match = url.match(new RegExp(`[?#&]${key}=([^&#]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// หน้าเข้าสู่ระบบ / สมัครสมาชิก — ใช้ Supabase Auth จริง
export default function LoginScreen() {
  const { reset, signIn, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail || !password) return showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'warning');
    if (isRegister && password.length < 6) return showToast('รหัสผ่านอย่างน้อย 6 ตัวอักษร', 'warning');
    if (isRegister && age && isNaN(Number(age))) return showToast('อายุต้องเป็นตัวเลข', 'warning');

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: {
            data: {
              name: name.trim() || null,
              age: age ? Number(age) : null,
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          showToast('สมัครสำเร็จ กรุณาตรวจอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ', 'success');
          setMode('login');
          return;
        }
        signIn(authUserToAppUser(data.user));
        showToast('สมัครสมาชิกสำเร็จ', 'success');
        reset('CaregiverHome');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (error) throw error;
        const u = authUserToAppUser(data.user);
        if (!u) return showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'danger');
        signIn(u);
        reset('CaregiverHome');
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

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('ไม่พบ URL สำหรับเข้าสู่ระบบด้วย Google');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) {
        showToast('ยกเลิกการเข้าสู่ระบบด้วย Google', 'warning');
        return;
      }

      const code = getUrlParam(result.url, 'code');
      if (code) {
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        signIn(authUserToAppUser(sessionData.user));
        reset('CaregiverHome');
        return;
      }

      const accessToken = getUrlParam(result.url, 'access_token');
      const refreshToken = getUrlParam(result.url, 'refresh_token');
      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        signIn(authUserToAppUser(sessionData.user));
        reset('CaregiverHome');
        return;
      }

      throw new Error('Google ไม่ส่ง session กลับเข้าแอป');
    } catch (e) {
      showToast('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + (e.message || String(e)), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail) return showToast('กรุณากรอกอีเมลก่อน', 'warning');
    const { error } = await supabase.auth.resetPasswordForEmail(mail);
    if (error) return showToast('ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ: ' + error.message, 'danger');
    showToast('ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจกล่องจดหมาย', 'success');
  };

  return (
    <View style={styles.safe}>
      {/* teal hero top */}
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <View style={styles.logo}>
          <Logo size={96} rounded={false} />
        </View>
        <Text style={styles.appName}>ดูแลผู้สูงอายุ</Text>
        <Text style={styles.subtitle}>ผู้ช่วยสำหรับผู้ดูแลผู้สูงอายุที่มีโรคประจำตัว</Text>
      </View>

      {/* white card */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} activeOpacity={0.85} disabled={loading}>
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
        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="อายุ (ปี)"
            placeholderTextColor={colors.textMuted}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
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

        {!isRegister && (
          <TouchableOpacity onPress={resetPassword} activeOpacity={0.7}>
            <Text style={styles.forgot}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  forgot: { textAlign: 'center', color: colors.primaryDark, fontSize: sizes.small, fontWeight: '800', marginTop: 12 },
  link: { color: colors.primary, fontWeight: '800' },
});

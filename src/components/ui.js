import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, shadow, levelColor, levelSoft } from '../theme';

// native driver ใช้ได้เฉพาะบนมือถือ — บนเว็บต้องเป็น false ไม่งั้น Console เตือน
const NATIVE = Platform.OS !== 'web';

// --- Motion helpers (core Animated, no external dependency) ---

// Press feedback: gentle scale-down on touch (motion-first feel)
export function PressScale({ children, onPress, style }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: NATIVE, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.96)}
      onPressOut={() => animate(1)}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

// Entrance: fade + slide up (used to transition between pages)
export function FadeIn({ children, style }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(14)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: NATIVE }),
      Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: NATIVE }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// --- UI primitives ---

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, hint }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {!!hint && <Text style={styles.sectionHint}>{hint}</Text>}
    </View>
  );
}

export function IconCircle({ icon, color = colors.primary, soft = colors.primarySoft, size = 48 }) {
  return (
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: soft, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.54} color={color} />
    </View>
  );
}

export function BigButton({ label, onPress, color = colors.primary, light = false, icon }) {
  return (
    <PressScale onPress={onPress} style={{ marginVertical: 6 }}>
      <View
        style={[
          styles.bigBtn,
          light
            ? { backgroundColor: colors.white, borderColor: color, borderWidth: 2 }
            : { backgroundColor: color, ...shadow.soft },
        ]}
      >
        {!!icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={light ? color : colors.white}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={[styles.bigBtnText, { color: light ? color : colors.white }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

export function Badge({ text, level = 'success' }) {
  const c = levelColor[level] || colors.success;
  const bg = levelSoft[level] || colors.successSoft;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text style={[styles.badgeText, { color: c }]}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ value = 0, color = colors.primary, height = 14 }) {
  const pct = Math.max(0, Math.min(100, value));
  const w = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(w, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);
  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={{ width, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: sizes.radius,
    padding: 16,
    marginBottom: 16,
    ...shadow.card,
  },
  sectionWrap: { marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: sizes.h2, fontWeight: '800', color: colors.text },
  sectionHint: { fontSize: sizes.tiny, color: colors.textMuted, marginTop: 4 },

  iconCircle: { alignItems: 'center', justifyContent: 'center' },

  bigBtn: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBtnIcon: { fontSize: 20, marginRight: 8 },
  bigBtnText: { fontSize: sizes.body, fontWeight: '800' },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: sizes.small, color: colors.textMuted, marginBottom: 8, fontWeight: '700' },
  input: {
    borderWidth: 1.6,
    borderColor: colors.border,
    borderRadius: sizes.radiusSm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: sizes.body,
    color: colors.text,
    backgroundColor: colors.card,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontWeight: '800', fontSize: sizes.small },

  track: { width: '100%', backgroundColor: colors.primarySoft, overflow: 'hidden' },
});

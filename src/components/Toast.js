import React from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, shadow, levelColor, levelSoft } from '../theme';

const NATIVE = Platform.OS !== 'web';

const ICONS = {
  success: 'check-circle',
  warning: 'alert',
  danger: 'close-circle',
  info: 'information',
};

// Professional in-app toast: rounded card slides down from the top, colored
// icon by level, auto-dismisses. Replaces the browser's window.alert box.
export default function Toast({ data, onHide }) {
  const translateY = React.useRef(new Animated.Value(-140)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!data) return;
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: NATIVE, bounciness: 8, speed: 13 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: NATIVE }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -140, duration: 240, useNativeDriver: NATIVE }),
        Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: NATIVE }),
      ]).start(() => onHide && onHide());
    }, 2600);

    return () => clearTimeout(timer);
    // re-run each time a new toast is shown
  }, [data && data.key]);

  if (!data) return null;

  const level = data.level || 'success';
  const c = levelColor[level] || colors.primary;
  const soft = levelSoft[level] || colors.primarySoft;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.card, shadow.card]}>
        <View style={[styles.iconWrap, { backgroundColor: soft }]}>
          <MaterialCommunityIcons name={ICONS[level] || 'information'} size={22} color={c} />
        </View>
        <Text style={styles.msg} numberOfLines={3}>{data.message}</Text>
        <View style={[styles.accent, { backgroundColor: c }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // ขยับลงมาให้พ้นแถบหัวสีเขียว (web ไม่มีแถบหัวเลยตั้งไว้สูงได้)
    top: Platform.OS === 'web' ? 16 : 104,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 24,   // Android: วาดทับแถบหัว/การ์ด (ที่มี elevation 2-3) ไม่ให้โดนบัง
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 460,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  msg: { flex: 1, fontSize: sizes.small, fontWeight: '700', color: colors.text },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
});

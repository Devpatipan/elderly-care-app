// Elderly-friendly "warm medical" theme: calm teal, soft surfaces, large type.
export const colors = {
  primary: '#0EA5A4',       // teal
  primaryDark: '#0F766E',
  primarySoft: '#E6F7F6',
  accent: '#FF7A59',        // warm coral highlight
  accentSoft: '#FFE9E2',

  bg: '#F1F5F8',
  card: '#FFFFFF',
  text: '#13212E',
  textMuted: '#64748B',
  border: '#E6EBF1',

  danger: '#E11D48',
  dangerSoft: '#FCE7EC',
  warning: '#F59E0B',
  warningSoft: '#FEF3E2',
  success: '#16A34A',
  successSoft: '#E4F7EC',

  white: '#FFFFFF',
};

export const sizes = {
  display: 30,
  title: 26,
  h2: 21,
  body: 18,
  small: 15,
  tiny: 13,
  radius: 20,
  radiusSm: 14,
};

// Cross-platform soft shadow presets
// - เว็บ: ใช้ boxShadow (เลี่ยง warning "shadow* deprecated" ของ react-native-web)
// - iOS: shadow* / Android: elevation
import { Platform } from 'react-native';

const makeShadow = (y, blur, alpha, elevation) =>
  Platform.OS === 'web'
    ? { boxShadow: `0px ${y}px ${blur}px rgba(15,23,42,${alpha})` }
    : {
        shadowColor: '#0F172A',
        shadowOpacity: alpha,
        shadowRadius: blur,
        shadowOffset: { width: 0, height: y },
        elevation,
      };

export const shadow = {
  card: makeShadow(6, 14, 0.08, 3),
  soft: makeShadow(3, 8, 0.06, 2),
};

// 8-point spacing grid
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const levelColor = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export const levelSoft = {
  success: colors.successSoft,
  warning: colors.warningSoft,
  danger: colors.dangerSoft,
};

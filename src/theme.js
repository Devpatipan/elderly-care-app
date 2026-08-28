// Modern "warm sage-teal" care theme — redesign 2026
// โทนเขียวใบไม้เข้ม (deep sage-teal) อบอุ่น น่าเชื่อถือระดับการแพทย์
// สีสถานะชัดตามหลัก WCAG AA — success/warning/danger
import { Platform } from 'react-native';

export const colors = {
  primary: '#2F6F5E',        // deep sage-teal
  primaryDark: '#1E4C40',
  primarySoft: '#E6F2EC',    // primary tint
  primaryTint2: '#CCE6DA',
  accent: '#F2A65A',         // warm apricot
  accentSoft: '#FBEBD8',

  bg: '#FAF9F5',             // warm off-white canvas
  card: '#FFFFFF',
  text: '#1B2A26',
  textMuted: '#5C6E68',      // text secondary
  textTertiary: '#93A29C',
  border: '#E6EAE7',

  danger: '#D6473D',
  dangerSoft: '#FBE7E5',
  warning: '#D98F2B',
  warningSoft: '#FCF0DC',
  success: '#2F9E6E',
  successSoft: '#E4F5EC',
  info: '#3E7BC4',

  white: '#FFFFFF',
};

export const sizes = {
  display: 30,
  title: 26,
  h2: 21,
  body: 18,
  small: 15,
  tiny: 13,
  radius: 22,
  radiusSm: 14,
};

// Cross-platform soft shadow presets
// - เว็บ: ใช้ boxShadow (เลี่ยง warning "shadow* deprecated" ของ react-native-web)
// - iOS: shadow* / Android: elevation
const makeShadow = (y, blur, alpha, elevation) =>
  Platform.OS === 'web'
    ? { boxShadow: `0px ${y}px ${blur}px rgba(27,42,38,${alpha})` }
    : {
        shadowColor: '#1B2A26',
        shadowOpacity: alpha,
        shadowRadius: blur,
        shadowOffset: { width: 0, height: y },
        elevation,
      };

export const shadow = {
  card: makeShadow(10, 22, 0.08, 3),
  soft: makeShadow(4, 12, 0.05, 2),
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

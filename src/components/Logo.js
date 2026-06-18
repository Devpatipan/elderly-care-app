import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, G, Path, Polyline } from 'react-native-svg';

// โลโก้แอป (เวกเตอร์) — หัวใจสีขาว + เส้นชีพจรสีส้ม บนพื้น teal
// ใช้ได้ทั้งเป็นไอคอนในการ์ด (rounded) และวางบนพื้น teal ตรง ๆ (rounded=false)
export default function Logo({ size = 120, rounded = true }) {
  const heart =
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="logobg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#14B8B6" />
          <Stop offset="1" stopColor="#0F766E" />
        </LinearGradient>
      </Defs>

      {rounded && <Rect x="0" y="0" width="120" height="120" rx="28" fill="url(#logobg)" />}

      {/* หัวใจสีขาว */}
      <G transform="translate(27.6,22) scale(2.7)">
        <Path d={heart} fill="#FFFFFF" />
      </G>

      {/* เส้นชีพจร (heartbeat) สีส้มพาดกลางหัวใจ */}
      <Polyline
        points="37,57 49,57 55,45 61,69 67,50 72,57 83,57"
        fill="none"
        stroke="#FF7A59"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

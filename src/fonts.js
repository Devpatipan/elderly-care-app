import React from 'react';
import { Text, TextInput, Platform, StyleSheet } from 'react-native';

const FAMILY = 'THSarabun';      // regular -> assets/fonts/THSarabunPSK.ttf
const BOLD = 'THSarabunBold';    // bold    -> assets/fonts/THSarabunPSK-Bold.ttf

// --- WEB: register BOTH files under the same family name with different
// font-weight, so headings (fontWeight 700/800) pick the real bold file. ---
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  try {
    const { Asset } = require('expo-asset');
    const regUri = Asset.fromModule(require('../assets/fonts/THSarabunPSK.ttf')).uri;
    const boldUri = Asset.fromModule(require('../assets/fonts/THSarabunPSK-Bold.ttf')).uri;
    const style = document.createElement('style');
    style.textContent =
      "@font-face{font-family:'" + FAMILY + "';src:url('" + regUri + "') format('truetype');font-weight:100 500;font-style:normal;font-display:swap;}" +
      "@font-face{font-family:'" + FAMILY + "';src:url('" + boldUri + "') format('truetype');font-weight:600 900;font-style:normal;font-display:swap;}";
    document.head.appendChild(style);
    if (document.fonts && document.fonts.load) {
      document.fonts.load("400 16px '" + FAMILY + "'").then(() => console.log('[THSarabun] regular OK'));
      document.fonts.load("700 16px '" + FAMILY + "'").then(() => console.log('[THSarabun] bold OK'))
        .catch((e) => console.log('[THSarabun] bold FAILED:', e));
    }
  } catch (e) {
    console.log('[THSarabun] inject error:', e);
  }
}

// Default family for every Text / TextInput (fontWeight in styles stays intact,
// so on web the browser auto-selects regular vs bold @font-face by weight).
[Text, TextInput].forEach((Comp) => {
  if (!Comp) return;
  Comp.defaultProps = Comp.defaultProps || {};
  Comp.defaultProps.style = [{ fontFamily: FAMILY }, Comp.defaultProps.style];
});

// --- NATIVE only: pick the bold family file by weight (no CSS weight-matching
// on native). On web this is skipped because the @font-face above handles it. ---
if (Platform.OS !== 'web') {
  const isBold = (w) => {
    const s = String(w || '400');
    return s === '600' || s === '700' || s === '800' || s === '900' || s === 'bold';
  };
  [Text, TextInput].forEach((Comp) => {
    if (!Comp) return;
    const original = Comp.render;
    if (typeof original === 'function' && !Comp.__sarabun) {
      Comp.render = function (...args) {
        const el = original.apply(this, args);
        if (!el || !el.props) return el;
        const flat = StyleSheet.flatten(el.props.style) || {};
        const fam = isBold(flat.fontWeight) ? BOLD : FAMILY;
        return React.cloneElement(el, { style: [el.props.style, { fontFamily: fam }] });
      };
      Comp.__sarabun = true;
    }
  });
}

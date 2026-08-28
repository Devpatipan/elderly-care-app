import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, shadow } from '../theme';
import { FadeIn } from './ui';
import { useApp } from '../store';

// Shared page chrome: rounded teal header + floating bottom tab bar.
export default function Screen({ title, children, showBack = true, showTabs = true }) {
  const { goBack, navigate, route, reloadAll } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    if (!reloadAll) return;
    setRefreshing(true);
    try {
      await reloadAll();
    } finally {
      setRefreshing(false);
    }
  }, [reloadAll]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        <FadeIn>{children}</FadeIn>
        <View style={{ height: 28 }} />
      </ScrollView>

      {showTabs && (
        <View style={styles.tabbar}>
          <Tab icon="home-variant" label="หน้าหลัก" active={route.name === 'Home'} onPress={() => navigate('Home')} />
          <Tab icon="account" label="ข้อมูล" active={route.name === 'PatientInfo'} onPress={() => navigate('PatientInfo')} />
          <Tab icon="phone" label="SOS" danger active={route.name === 'SOS'} onPress={() => navigate('SOS')} />
        </View>
      )}
    </SafeAreaView>
  );
}

function Tab({ icon, label, active, danger, onPress }) {
  const activeColor = danger ? colors.danger : colors.primary;
  const activeBg = danger ? colors.dangerSoft : colors.primarySoft;
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.tabPill, active && { backgroundColor: activeBg }]}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={active ? activeColor : colors.textMuted}
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          { color: active ? activeColor : colors.textMuted, fontWeight: active ? '800' : '600' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? 38 : 14,
    paddingBottom: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  backArrow: { color: colors.text, fontSize: 34, lineHeight: 34, marginTop: -3 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: sizes.h2,
    fontWeight: '800',
  },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingTop: 18 },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 12, marginTop: 3 },
});

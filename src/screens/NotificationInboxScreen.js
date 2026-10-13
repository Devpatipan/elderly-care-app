import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Card } from '../components/ui';
import { colors, sizes } from '../theme';
import { useApp } from '../store';

// กล่องแจ้งเตือนยา — รวมแจ้งเตือนของผู้ป่วยทุกคน เผื่อผู้ดูแลดูไม่ทัน/พลาด (ข้อ 9)
export default function NotificationInboxScreen() {
  const { getAllReminders } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await getAllReminders();
      if (alive) {
        setItems(r);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getAllReminders]);

  return (
    <Screen title="กล่องแจ้งเตือนยา">
      <Card style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons name="bell-ring" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>แจ้งเตือนการทานยา</Text>
          <Text style={styles.summarySub}>รวมการแจ้งเตือนยาของผู้ป่วยทุกคน เผื่อดูไม่ทัน</Text>
        </View>
      </Card>
      {loading ? (
        <Card><Text style={styles.empty}>กำลังโหลด...</Text></Card>
      ) : items.length === 0 ? (
        <Card><Text style={styles.empty}>ยังไม่มีการแจ้งเตือน</Text></Card>
      ) : (
        items.map((n) => (
          <Card key={n.id} style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="bell-ring" size={22} color={colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.msg}>{n.message}</Text>
              <Text style={styles.sub}>เวลา {n.time} · {n.repeat}</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint2 },
  summaryIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  summaryTitle: { fontSize: sizes.body, fontWeight: '900', color: colors.text },
  summarySub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 2, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.warningSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  msg: { fontSize: sizes.body, fontWeight: '700', color: colors.text },
  sub: { fontSize: sizes.small, color: colors.textMuted, marginTop: 3 },
  empty: { color: colors.textMuted, fontSize: sizes.small },
});

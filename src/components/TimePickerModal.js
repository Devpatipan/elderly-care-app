import React from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes } from '../theme';

const pad2 = (n) => String(n).padStart(2, '0');

export default function TimePickerModal({ visible, value = '09:00', onSelect, onClose }) {
  const [hour = '09', minute = '00'] = String(value).split(':');
  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 12 }, (_, i) => pad2(i * 5));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>เลือกเวลา</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerColumns}>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnTitle}>ชั่วโมง</Text>
              <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                {hours.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.timeOption, h === hour && styles.timeOptionActive]}
                    onPress={() => onSelect(`${h}:${minute}`)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.timeOptionText, h === hour && styles.timeOptionTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnTitle}>นาที</Text>
              <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                {minutes.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.timeOption, m === minute && styles.timeOptionActive]}
                    onPress={() => onSelect(`${hour}:${m}`)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.timeOptionText, m === minute && styles.timeOptionTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,42,38,0.38)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '72%',
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: sizes.h2, color: colors.text, fontWeight: '900' },
  pickerColumns: { flexDirection: 'row', gap: 12 },
  pickerColumn: { flex: 1 },
  columnTitle: { fontSize: sizes.small, color: colors.textMuted, fontWeight: '800', marginBottom: 8 },
  timeList: { maxHeight: 300 },
  timeOption: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  timeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeOptionText: { fontSize: sizes.body, color: colors.textMuted, fontWeight: '900' },
  timeOptionTextActive: { color: colors.white },
});

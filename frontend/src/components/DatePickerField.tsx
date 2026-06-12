import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

export function DatePickerField({ label, value, onChange }: Props) {
  const { darkMode, theme } = useAppSettings();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const isoValue = toIsoLocal(value);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
        {createElement('input', {
          type: 'date',
          value: isoValue,
          onChange: (event: { target: { value: string } }) => {
            onChange(parseIsoDate(event.target.value));
          },
          style: {
            minHeight: 48,
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.border,
            backgroundColor: theme.surface,
            color: theme.text,
            padding: '12px 14px',
            fontSize: 16,
            fontFamily: fontFamily.regular,
            outlineColor: theme.primary,
          },
        })}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Pressable
        style={[
          styles.select,
          {
            backgroundColor: theme.surface,
            borderColor: open ? theme.primary : theme.border,
          },
        ]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectText, { color: theme.text }]}>{formatDisplayDate(toIsoLocal(value))}</Text>
        <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
      </Pressable>

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="calendar"
          onChange={(event, selected) => {
            setOpen(false);
            if (event.type !== 'dismissed' && selected) onChange(selected);
          }}
        />
      ) : null}

      <Modal visible={Platform.OS === 'ios' && open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.backdrop, { backgroundColor: theme.overlaySoft }]} onPress={close} />
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              {...(Platform.OS === 'ios' ? { themeVariant: darkMode ? 'dark' as const : 'light' as const } : {})}
              onChange={(_, selected) => {
                if (selected) onChange(selected);
              }}
            />
            <Pressable
              style={({ pressed }) => [
                styles.done,
                { borderTopColor: theme.border },
                pressed && { backgroundColor: theme.bg },
              ]}
              onPress={close}
            >
              <Text style={[styles.doneText, { color: theme.primary }]}>Listo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string | null | undefined): Date {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-');
  const year = y ? Number(y) : new Date().getFullYear();
  const month = m ? Number(m) - 1 : new Date().getMonth();
  const day = d ? Number(d) : new Date().getDate();
  return new Date(year, month, day);
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  select: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: light.overlaySoft,
  },
  sheet: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 8px 24px ${light.shadowMedium}` }
      : {
          elevation: 8,
          shadowColor: light.navy,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }),
  },
  done: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});

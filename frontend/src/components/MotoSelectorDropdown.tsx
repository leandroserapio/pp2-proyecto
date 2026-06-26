import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { useMoto } from '../context/MotoContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';
import type { Moto } from '../types/models';
import { AddMotoSheet } from './AddMotoSheet';

function formatMotoName(moto: Moto): string {
  return `${moto.marca} ${moto.modelo}`.trim();
}

export function MotoSelectorDropdown() {
  const { theme } = useAppSettings();
  const { motos, selectedMoto, selectedMotoId, setSelectedMotoId } = useMoto();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const kmLabel = selectedMoto?.kilometrajeActual != null
    ? `${selectedMoto.kilometrajeActual.toLocaleString('es-AR')} Km`
    : '0 Km';

  const closeDropdown = () => setOpen(false);

  const selectMoto = async (id: number) => {
    await setSelectedMotoId(id);
    closeDropdown();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        style={[
          styles.trigger,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: theme.border,
          },
        ]}
        onPress={() => setOpen(true)}
      >
        <View style={styles.triggerTextWrap}>
          <Text style={[styles.triggerTitle, { color: theme.text }]} numberOfLines={1}>
            {selectedMoto ? formatMotoName(selectedMoto) : 'Sin moto'}
          </Text>
          <Text style={[styles.triggerSub, { color: theme.textMuted }]} numberOfLines={1}>
            {kmLabel}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeDropdown}>
        <View style={styles.overlay}>
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={closeDropdown}
          />
          <View
            style={[
              styles.menu,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {motos.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    No tenés motos registradas
                  </Text>
                </View>
              ) : (
                motos.map((moto, index) => {
                  const isSelected = moto.idMoto === selectedMotoId;
                  return (
                    <Pressable
                      key={moto.idMoto}
                      style={({ pressed }) => [
                        styles.row,
                        index > 0 && styles.rowBorder,
                        index > 0 && { borderTopColor: theme.border },
                        pressed && { backgroundColor: theme.bg },
                      ]}
                      onPress={() => moto.idMoto != null && void selectMoto(moto.idMoto)}
                    >
                      <View style={styles.rowCopy}>
                        <Text style={[styles.rowTitle, { color: theme.text }]}>
                          {formatMotoName(moto)}
                        </Text>
                        <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                          {(moto.kilometrajeActual ?? 0).toLocaleString('es-AR')} Km
                          {moto.patente ? ` · ${moto.patente}` : ''}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.rowAction,
                          { color: isSelected ? theme.textMuted : theme.primary },
                        ]}
                      >
                        {isSelected ? 'Seleccionada' : 'Seleccionar'}
                      </Text>
                    </Pressable>
                  );
                })
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.addRow,
                  { borderTopColor: theme.border },
                  pressed && { backgroundColor: theme.primarySoft },
                ]}
                onPress={() => {
                  closeDropdown();
                  setAddOpen(true);
                }}
              >
                <Text style={[styles.addText, { color: theme.primary }]}>+ Agregar Moto</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AddMotoSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: 140,
    maxWidth: 210,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerTextWrap: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  triggerSub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 64 : 56,
    paddingRight: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    width: 300,
    maxWidth: '92%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }
      : {
          elevation: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }),
  },
  emptyWrap: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  rowSub: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  rowAction: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  addRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
});

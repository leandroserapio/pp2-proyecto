import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import { AppHeader } from '../../components/AppHeader';
import { AppTextInput } from '../../components/AppTextInput';
import { DatePickerField, toIsoLocal } from '../../components/DatePickerField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { crearViaje, eliminarViaje, listarViajesPorMoto } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { formatDisplayDate } from '../../gastos/format';
import type { Viaje } from '../../types/models';

export function ViajesTabScreen() {
  const { selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState(() => new Date());
  const [kmEst, setKmEst] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!selectedMotoId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listarViajesPorMoto(selectedMotoId);
      list.sort((a, b) => String(b.fechaSalida).localeCompare(String(a.fechaSalida)));
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [selectedMotoId]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const resetForm = () => {
    setDestino('');
    setFechaSalida(new Date());
    setKmEst('');
    setPresupuesto('');
    setNotas('');
  };

  const onSave = async () => {
    if (!selectedMotoId) return;
    if (!destino.trim()) {
      Alert.alert('Datos incompletos', 'El destino es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await crearViaje(selectedMotoId, {
        destino: destino.trim(),
        fechaSalida: toIsoLocal(fechaSalida),
        kilometrosEstimados: kmEst ? Number(kmEst) : null,
        presupuestoEstimado: presupuesto ? Number(presupuesto.replace(',', '.')) : null,
        notas: notas.trim() || null,
        estado: 'Programado',
      });
      resetForm();
      setAddOpen(false);
      await reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (v: Viaje) => {
    Alert.alert('Eliminar viaje', `¿Eliminar viaje a ${v.destino}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (v.idViaje != null) {
            try {
              await eliminarViaje(v.idViaje);
              await reload();
            } catch (e) {
              const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
              Alert.alert('Error', msg);
            }
          }
        },
      },
    ]);
  };

  const estadoColor = (estado: string | null | undefined) => {
    if (!estado) return theme.textMuted;
    const e = estado.toLowerCase();
    if (e === 'programado') return theme.primary;
    if (e === 'completado' || e === 'realizado') return theme.success;
    if (e === 'cancelado') return theme.danger;
    return theme.textMuted;
  };

  if (!selectedMoto) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
        {!addOpen ? <AppHeader /> : null}
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin moto seleccionada</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>Seleccioná una moto desde Garage.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {!addOpen ? <AppHeader /> : null}

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Viajes</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{selectedMoto.marca} {selectedMoto.modelo}</Text>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="map-outline" size={64} color={theme.border} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin viajes programados</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>Planificá tus salidas indicando destino, km estimados y presupuesto.</Text>
          <PrimaryButton title="Agregar viaje" variant="blue" onPress={() => setAddOpen(true)} style={styles.emptyBtn} />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            data={items}
            keyExtractor={(v) => String(v.idViaje)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            renderItem={({ item }) => (
              <Pressable style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} onLongPress={() => confirmDelete(item)}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.destino}</Text>
                  <Text style={[styles.cardEstado, { color: estadoColor(item.estado) }]}>
                    {item.estado ?? 'Programado'}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatDisplayDate(item.fechaSalida)}</Text>
                  {item.kilometrosEstimados ? <Text style={[styles.cardKm, { color: theme.textMuted }]}>{item.kilometrosEstimados} km</Text> : null}
                  {item.presupuestoEstimado ? (
                    <Text style={[styles.cardBudget, { color: theme.textMuted }]}>${Number(item.presupuestoEstimado).toLocaleString('es-AR')}</Text>
                  ) : null}
                </View>
                {item.notas ? <Text style={[styles.cardNotas, { color: theme.textMuted }]}>{item.notas}</Text> : null}
              </Pressable>
            )}
          />
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom, backgroundColor: theme.primary }]}
            onPress={() => setAddOpen(true)}
          >
            <Ionicons name="add" size={30} color={theme.onPrimary} />
          </Pressable>
        </View>
      )}

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={() => setAddOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: theme.text }]}>Agregar viaje</Text>
              <AppTextInput label="Destino *" variant="light" placeholder="Ej: Chascomús" value={destino} onChangeText={setDestino} />
              <DatePickerField label="Fecha de salida" value={fechaSalida} onChange={setFechaSalida} />
              <AppTextInput label="Km estimados" variant="light" placeholder="Ej: 220" keyboardType="number-pad" value={kmEst} onChangeText={setKmEst} />
              <AppTextInput label="Presupuesto estimado" variant="light" placeholder="Ej: 30000" keyboardType="decimal-pad" value={presupuesto} onChangeText={setPresupuesto} />
              <AppTextInput label="Notas" variant="light" placeholder="Revisiones, paradas, etc." value={notas} onChangeText={setNotas} multiline />
              <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onSave} style={styles.saveBtn} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  header: { paddingHorizontal: 18, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text },
  subtitle: { fontSize: 14, fontFamily: fontFamily.regular, color: light.textMuted, marginTop: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, fontFamily: fontFamily.regular, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 18, alignSelf: 'stretch' },
  listWrap: { flex: 1 },
  card: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: light.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: light.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text },
  cardEstado: { fontSize: 13, fontFamily: fontFamily.bold, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cardDate: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, marginRight: 16 },
  cardKm: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, marginRight: 16 },
  cardBudget: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted },
  cardNotas: { marginTop: 8, fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: light.navy,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: light.overlay },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: light.border,
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, marginBottom: 14 },
  saveBtn: { marginTop: 4 },
});

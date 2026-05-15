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
import { useMoto } from '../../context/MotoContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { crearViaje, eliminarViaje, listarViajesPorMoto } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { formatDisplayDate } from '../../gastos/format';
import type { Viaje } from '../../types/models';

export function ViajesTabScreen() {
  const { selectedMoto, selectedMotoId } = useMoto();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
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

  const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const resetForm = () => {
    setDestino('');
    setFechaSalida('');
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
        fechaSalida: fechaSalida.trim() || todayIso(),
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
    if (!estado) return light.textMuted;
    const e = estado.toLowerCase();
    if (e === 'programado') return light.primary;
    if (e === 'completado' || e === 'realizado') return '#16a34a';
    if (e === 'cancelado') return '#dc2626';
    return light.textMuted;
  };

  if (!selectedMoto) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Sin moto seleccionada</Text>
          <Text style={styles.emptySub}>Seleccioná una moto desde Garage.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Viajes</Text>
        <Text style={styles.subtitle}>{selectedMoto.marca} {selectedMoto.modelo}</Text>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="map-outline" size={64} color={light.border} />
          <Text style={styles.emptyTitle}>Sin viajes programados</Text>
          <Text style={styles.emptySub}>Planificá tus salidas indicando destino, km estimados y presupuesto.</Text>
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
              <Pressable style={styles.card} onLongPress={() => confirmDelete(item)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.destino}</Text>
                  <Text style={[styles.cardEstado, { color: estadoColor(item.estado) }]}>
                    {item.estado ?? 'Programado'}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>{formatDisplayDate(item.fechaSalida)}</Text>
                  {item.kilometrosEstimados ? <Text style={styles.cardKm}>{item.kilometrosEstimados} km</Text> : null}
                  {item.presupuestoEstimado ? (
                    <Text style={styles.cardBudget}>${Number(item.presupuestoEstimado).toLocaleString('es-AR')}</Text>
                  ) : null}
                </View>
                {item.notas ? <Text style={styles.cardNotas}>{item.notas}</Text> : null}
              </Pressable>
            )}
          />
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom }]}
            onPress={() => setAddOpen(true)}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Pressable>
        </View>
      )}

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setAddOpen(false)} />
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Agregar viaje</Text>
              <AppTextInput label="Destino *" variant="light" placeholder="Ej: Chascomús" value={destino} onChangeText={setDestino} />
              <AppTextInput label="Fecha salida (AAAA-MM-DD)" variant="light" placeholder={todayIso()} value={fechaSalida} onChangeText={setFechaSalida} />
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
  title: { fontSize: 24, fontWeight: '800', color: light.text },
  subtitle: { fontSize: 14, color: light.textMuted, marginTop: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontWeight: '800', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, textAlign: 'center', lineHeight: 22 },
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
  cardTitle: { fontSize: 16, fontWeight: '800', color: light.text },
  cardEstado: { fontSize: 13, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cardDate: { fontSize: 13, color: light.textMuted, marginRight: 16 },
  cardKm: { fontSize: 13, color: light.textMuted, marginRight: 16 },
  cardBudget: { fontSize: 13, color: light.textMuted },
  cardNotas: { marginTop: 8, fontSize: 13, color: light.textMuted, fontStyle: 'italic' },
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.35)' },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: light.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: light.text, marginBottom: 14 },
  saveBtn: { marginTop: 4 },
});

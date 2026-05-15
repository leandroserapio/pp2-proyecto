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
import { crearMantenimiento, eliminarMantenimiento, listarMantenimientosPorMoto } from '../../api/mantenimientos';
import { ApiError } from '../../api/client';
import { formatDisplayDate } from '../../gastos/format';
import type { Mantenimiento } from '../../types/models';

export function MantenimientoTabScreen() {
  const { selectedMoto, selectedMotoId } = useMoto();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [km, setKm] = useState('');
  const [costo, setCosto] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!selectedMotoId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listarMantenimientosPorMoto(selectedMotoId);
      list.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
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
    setTipo('');
    setDescripcion('');
    setFecha('');
    setKm('');
    setCosto('');
  };

  const onSave = async () => {
    if (!selectedMotoId) return;
    if (!tipo.trim()) {
      Alert.alert('Datos incompletos', 'El tipo es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await crearMantenimiento(selectedMotoId, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: fecha.trim() || todayIso(),
        kilometraje: km ? Number(km) : null,
        costo: costo ? Number(costo.replace(',', '.')) : null,
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

  const confirmDelete = (m: Mantenimiento) => {
    Alert.alert('Eliminar', `¿Eliminar ${m.tipo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (m.idMantenimiento != null) {
            try {
              await eliminarMantenimiento(m.idMantenimiento);
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
        <Text style={styles.title}>Mantenimiento</Text>
        <Text style={styles.subtitle}>{selectedMoto.marca} {selectedMoto.modelo}</Text>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="construct-outline" size={64} color={light.border} />
          <Text style={styles.emptyTitle}>Sin mantenimientos</Text>
          <Text style={styles.emptySub}>Registrá services, cambios de aceite, frenos y más.</Text>
          <PrimaryButton title="Agregar" variant="blue" onPress={() => setAddOpen(true)} style={styles.emptyBtn} />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            data={items}
            keyExtractor={(m) => String(m.idMantenimiento)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            renderItem={({ item }) => (
              <Pressable style={styles.card} onLongPress={() => confirmDelete(item)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.tipo}</Text>
                  {item.costo ? <Text style={styles.cardCosto}>${Number(item.costo).toLocaleString('es-AR')}</Text> : null}
                </View>
                {item.descripcion ? <Text style={styles.cardDesc}>{item.descripcion}</Text> : null}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>{formatDisplayDate(item.fecha)}</Text>
                  {item.kilometraje ? <Text style={styles.cardKm}>{item.kilometraje} km</Text> : null}
                </View>
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
              <Text style={styles.modalTitle}>Agregar mantenimiento</Text>
              <AppTextInput label="Tipo *" variant="light" placeholder="Ej: Aceite, Service, Frenos" value={tipo} onChangeText={setTipo} />
              <AppTextInput label="Descripción" variant="light" placeholder="Ej: Cambio de aceite 20W50" value={descripcion} onChangeText={setDescripcion} />
              <AppTextInput label="Fecha (AAAA-MM-DD)" variant="light" placeholder={todayIso()} value={fecha} onChangeText={setFecha} />
              <AppTextInput label="Kilometraje" variant="light" placeholder="Ej: 5000" keyboardType="number-pad" value={km} onChangeText={setKm} />
              <AppTextInput label="Costo" variant="light" placeholder="Ej: 12000" keyboardType="decimal-pad" value={costo} onChangeText={setCosto} />
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
  cardCosto: { fontSize: 15, fontWeight: '900', color: light.primary },
  cardDesc: { marginTop: 6, fontSize: 14, color: light.textMuted },
  cardFooter: { flexDirection: 'row', gap: 16, marginTop: 8 },
  cardDate: { fontSize: 13, color: light.textMuted },
  cardKm: { fontSize: 13, color: light.textMuted },
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

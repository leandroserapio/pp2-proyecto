import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
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
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  crearMantenimiento,
  editarMantenimiento,
  eliminarMantenimiento,
  listarMantenimientosPorMoto,
} from '../../api/mantenimientos';
import { ApiError } from '../../api/client';
import { formatDisplayDate } from '../../gastos/format';
import type { Mantenimiento } from '../../types/models';

export function MantenimientoTabScreen() {
  const { selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Mantenimiento | null>(null);
  const [actionsItem, setActionsItem] = useState<Mantenimiento | null>(null);

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

  const openAdd = () => {
    setEditingItem(null);
    resetForm();
    setAddOpen(true);
  };

  const openEdit = (m: Mantenimiento) => {
    setEditingItem(m);
    setTipo(m.tipo ?? '');
    setDescripcion(m.descripcion ?? '');
    setFecha(m.fecha ?? '');
    setKm(m.kilometraje != null ? String(m.kilometraje) : '');
    setCosto(m.costo != null ? String(m.costo) : '');
    setAddOpen(true);
  };

  const closeEditor = () => {
    setAddOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const onSave = async () => {
    if (!selectedMotoId) return;
    if (!tipo.trim()) {
      Alert.alert('Datos incompletos', 'El tipo es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: fecha.trim() || todayIso(),
        kilometraje: km ? Number(km) : null,
        costo: costo ? Number(costo.replace(',', '.')) : null,
      };

      if (editingItem?.idMantenimiento != null) {
        await editarMantenimiento(editingItem.idMantenimiento, payload);
      } else {
        await crearMantenimiento(selectedMotoId, payload);
      }

      closeEditor();
      await reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (m: Mantenimiento) => {
    setActionsItem(null);

    const remove = async () => {
      if (m.idMantenimiento == null) return;
      try {
        await eliminarMantenimiento(m.idMantenimiento);
        await reload();
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
        Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm(`Eliminar ${m.tipo}?`)
          : true;
      if (confirmed) void remove();
      return;
    }

    Alert.alert('Eliminar servicio', `Eliminar ${m.tipo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void remove() },
    ]);
  };

  if (!selectedMoto) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
        {!addOpen ? <AppHeader /> : null}
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin moto seleccionada</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>Selecciona una moto desde Garage.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {!addOpen ? <AppHeader /> : null}

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mantenimiento</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{selectedMoto.marca} {selectedMoto.modelo}</Text>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="construct-outline" size={64} color={theme.border} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin mantenimientos</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>Registra services, cambios de aceite, frenos y mas.</Text>
          <PrimaryButton title="Agregar" variant="blue" onPress={openAdd} style={styles.emptyBtn} />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            data={items}
            keyExtractor={(m) => String(m.idMantenimiento)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onLongPress={() => setActionsItem(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.tipo}</Text>
                  <View style={styles.cardActions}>
                    {item.costo ? (
                      <Text style={[styles.cardCosto, { color: theme.primary }]}>
                        ${Number(item.costo).toLocaleString('es-AR')}
                      </Text>
                    ) : null}
                    <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setActionsItem(item)}>
                      <Ionicons name="ellipsis-vertical" size={18} color={theme.textMuted} />
                    </Pressable>
                  </View>
                </View>
                {item.descripcion ? <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{item.descripcion}</Text> : null}
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatDisplayDate(item.fecha)}</Text>
                  {item.kilometraje ? <Text style={[styles.cardKm, { color: theme.textMuted }]}>{item.kilometraje} km</Text> : null}
                </View>
              </Pressable>
            )}
          />
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom, backgroundColor: theme.primary }]}
            onPress={openAdd}
          >
            <Ionicons name="add" size={30} color={theme.onPrimary} />
          </Pressable>
        </View>
      )}

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={closeEditor}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={closeEditor} />
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingItem ? 'Editar mantenimiento' : 'Agregar mantenimiento'}
              </Text>
              <AppTextInput label="Tipo *" variant="light" placeholder="Ej: Aceite, Service, Frenos" value={tipo} onChangeText={setTipo} />
              <AppTextInput label="Descripcion" variant="light" placeholder="Ej: Cambio de aceite 20W50" value={descripcion} onChangeText={setDescripcion} />
              <AppTextInput label="Fecha (AAAA-MM-DD)" variant="light" placeholder={todayIso()} value={fecha} onChangeText={setFecha} />
              <AppTextInput label="Kilometraje" variant="light" placeholder="Ej: 5000" keyboardType="number-pad" value={km} onChangeText={setKm} />
              <AppTextInput label="Costo" variant="light" placeholder="Ej: 12000" keyboardType="decimal-pad" value={costo} onChangeText={setCosto} />
              <PrimaryButton title={editingItem ? 'Guardar cambios' : 'Guardar'} variant="blue" loading={saving} onPress={onSave} style={styles.saveBtn} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(actionsItem)} transparent animationType="fade" onRequestClose={() => setActionsItem(null)}>
        <Pressable
          style={[styles.actionOverlay, { backgroundColor: theme.overlaySoft }]}
          onPress={() => setActionsItem(null)}
        >
          <View style={[styles.actionMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && { backgroundColor: theme.bg }]}
              onPress={() => {
                if (actionsItem) openEdit(actionsItem);
                setActionsItem(null);
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Editar servicio</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && { backgroundColor: theme.bg }]}
              onPress={() => {
                if (actionsItem) confirmDelete(actionsItem);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
              <Text style={[styles.actionText, { color: theme.danger }]}>Eliminar servicio</Text>
            </Pressable>
          </View>
        </Pressable>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text },
  cardCosto: { fontSize: 15, fontFamily: fontFamily.bold, fontWeight: '700', color: light.primary },
  cardDesc: { marginTop: 6, fontSize: 14, fontFamily: fontFamily.regular, color: light.textMuted },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cardDate: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, marginRight: 16 },
  cardKm: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, marginRight: 16 },
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
  actionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  actionMenu: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});

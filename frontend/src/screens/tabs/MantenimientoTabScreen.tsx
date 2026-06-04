import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { motoLabel } from '../../gastos/gastosLoader';
import { ApiError } from '../../api/client';
import { formatDisplayDate } from '../../gastos/format';
import type { Mantenimiento } from '../../types/models';

export function MantenimientoTabScreen() {
  const { motos, selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
  const [allItems, setAllItems] = useState<(Mantenimiento & { idMoto: number })[]>([]);
  const [filtro, setFiltro] = useState<number | 'todas'>('todas');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMenuRect, setFilterMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const filterSelectWrapRef = useRef<View>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [km, setKm] = useState('');
  const [costo, setCosto] = useState('');
  const [saving, setSaving] = useState(false);
  const [motoIdForm, setMotoIdForm] = useState<number | null>(null);
  const [motoSelectorOpen, setMotoSelectorOpen] = useState(false);
  const [editItem, setEditItem] = useState<(Mantenimiento & { idMoto: number }) | null>(null);

  const reload = useCallback(async () => {
    if (motos.length === 0) { setAllItems([]); return; }
    setLoading(true);
    try {
      const results = await Promise.all(
        motos
          .filter((m) => m.idMoto != null)
          .map(async (m) => {
            const list = await listarMantenimientosPorMoto(m.idMoto!);
            return list.map((item) => ({ ...item, idMoto: m.idMoto! }));
          }),
      );
      const flat = results.flat();
      flat.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
      setAllItems(flat);
    } finally {
      setLoading(false);
    }
  }, [motos]);

  const items = useMemo(() => {
    if (filtro === 'todas') return allItems;
    return allItems.filter((m) => m.idMoto === filtro);
  }, [allItems, filtro]);

  const filtroDisplay = useMemo(() => {
    if (filtro === 'todas') return 'Todas las motos';
    const m = motos.find((x) => x.idMoto === filtro);
    return m ? motoLabel(m) : 'Todas las motos';
  }, [filtro, motos]);

  const motoIdParaGuardar = motoIdForm ?? selectedMotoId;

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
    setMotoIdForm(selectedMotoId ?? null);
  };

  const openEdit = (item: Mantenimiento & { idMoto: number }) => {
    setEditItem(item);
    setTipo(item.tipo);
    setDescripcion(item.descripcion ?? '');
    setFecha(String(item.fecha));
    setKm(item.kilometraje ? String(item.kilometraje) : '');
    setCosto(item.costo ? String(item.costo) : '');
    setMotoIdForm(item.idMoto);
    setAddOpen(true);
  };

const onSave = async () => {
  if (!motoIdParaGuardar) {
    Alert.alert('Sin moto', 'Seleccioná una moto.');
    return;
  }
  if (!tipo.trim()) {
    Alert.alert('Datos incompletos', 'El tipo es obligatorio.');
    return;
  }
  setSaving(true);
  try {
    if (editItem) {
      await editarMantenimiento(editItem.idMantenimiento!, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: fecha.trim() || todayIso(),
        kilometraje: km ? Number(km) : null,
        costo: costo ? Number(costo.replace(',', '.')) : null,
      });
    } else {
      await crearMantenimiento(motoIdParaGuardar, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: fecha.trim() || todayIso(),
        kilometraje: km ? Number(km) : null,
        costo: costo ? Number(costo.replace(',', '.')) : null,
      });
    }
    resetForm();
    setEditItem(null);
    setAddOpen(false);
    await reload();
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
    Alert.alert('Error', msg);
  } finally {
    setSaving(false);
  }
  };

const confirmDelete = async (m: Mantenimiento) => {
  const confirmed = Platform.OS === 'web'
    ? window.confirm(`¿Eliminar ${m.tipo}?`)
    : await new Promise<boolean>((resolve) => {
        Alert.alert('Eliminar', `¿Eliminar ${m.tipo}?`, [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
        ]);
      });

    if (!confirmed) return;

    if (m.idMantenimiento != null) {
      try {
        await eliminarMantenimiento(m.idMantenimiento);
        await reload();
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      }
    }
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
        <Text style={styles.filterLabel}>Filtrar por moto</Text>
        <Pressable
          ref={filterSelectWrapRef}
          style={[styles.filterRow, filterOpen && styles.filterRowOpen]}
          onPress={() => {
            if (filterOpen) { setFilterOpen(false); setFilterMenuRect(null); return; }
            filterSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
              setFilterMenuRect({ x, y, width, height });
              setFilterOpen(true);
            });
          }}
        >
          <Text style={styles.filterText}>{filtroDisplay}</Text>
          <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
        </Pressable>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="construct-outline" size={64} color={theme.border} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin mantenimientos</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>Registra services, cambios de aceite, frenos y mas.</Text>
          <PrimaryButton title="Agregar" variant="blue" onPress={() => { resetForm(); setAddOpen(true); }} style={styles.emptyBtn} />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            data={items}
            keyExtractor={(m) => String(m.idMantenimiento)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.tipo}</Text>
                <View style={styles.cardIconActions}>
                  <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                    <Ionicons name="create-outline" size={17} color={light.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
              {item.descripcion ? <Text style={styles.cardDesc}>{item.descripcion}</Text> : null}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterLeft}>
                  <Text style={styles.cardDate}>{formatDisplayDate(item.fecha)}</Text>
                  {item.kilometraje ? (
                    <Text style={styles.cardKm}>{item.kilometraje.toLocaleString('es-AR')} Km</Text>
                  ) : null}
                </View>
                {item.costo ? (
                  <Text style={styles.cardCosto}>$ {Number(item.costo).toLocaleString('es-AR')}</Text>
                ) : null}
              </View>
            </View>
          )}
          />
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom, backgroundColor: theme.primary }]}
            onPress={() => { resetForm(); setAddOpen(true); }}
          >
            <Ionicons name="add" size={30} color={theme.onPrimary} />
          </Pressable>
        </View>
      )}

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => { setAddOpen(false); setEditItem(null); resetForm(); }}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => { setAddOpen(false); setEditItem(null); resetForm(); }} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editItem ? 'Editar Mantenimiento' : 'Agregar Mantenimiento'}</Text>
            <AppTextInput label="Tipo *" variant="light" placeholder="Ej: Aceite, Service, Frenos" value={tipo} onChangeText={setTipo} />

            <Text style={styles.formLabel}>Moto</Text>
            <Pressable
              style={[styles.formMotoSelector, motoSelectorOpen && styles.filterRowOpen]}
              onPress={() => setMotoSelectorOpen((v) => !v)}
            >
              <Text style={styles.formMotoSelectorText}>
                {motoIdParaGuardar
                  ? motoLabel(motos.find((m) => m.idMoto === motoIdParaGuardar)!)
                  : 'Seleccioná una moto'}
              </Text>
              <Ionicons name={motoSelectorOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
            </Pressable>

            {motoSelectorOpen && (
              <View style={styles.inlineDropdown}>
                {motos.map((m, i) => (
                  <Pressable
                    key={m.idMoto}
                    style={({ pressed }) => [
                      styles.filterMenuRow,
                      i > 0 && styles.filterMenuRowBorder,
                      pressed && styles.filterMenuRowPressed,
                    ]}
                    onPress={() => {
                      if (m.idMoto != null) setMotoIdForm(m.idMoto);
                      setMotoSelectorOpen(false);
                    }}
                  >
                    <Text style={styles.filterMenuRowText}>{motoLabel(m)}</Text>
                    {motoIdForm === m.idMoto ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
                  </Pressable>
                ))}
              </View>
            )}

            <AppTextInput
              label="Descripción"
              variant="light"
              placeholder="Ej: Cambio de aceite sintético 10w40 y filtro original."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <View style={styles.formRow}>
              <View style={styles.formRowItem}>
                <AppTextInput label="Fecha" variant="light" placeholder={todayIso()} value={fecha} onChangeText={setFecha} />
              </View>
              <View style={styles.formRowItem}>
                <AppTextInput label="Kilometraje (km)" variant="light" placeholder="0.00" keyboardType="decimal-pad" value={km} onChangeText={setKm} />
              </View>
            </View>

            <Text style={styles.formLabel}>Costo</Text>
            <View style={styles.costoRow}>
              <Text style={styles.costoPrefixText}>$</Text>
              <TextInput
                style={styles.costoTextInput}
                placeholder="15.000,00"
                keyboardType="decimal-pad"
                value={costo}
                onChangeText={setCosto}
                placeholderTextColor={light.textMuted}
                onStartShouldSetResponder={() => true}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={light.primary} style={{ marginRight: 8 }} />
              <Text style={styles.infoBoxText}>Se registrará un gasto también</Text>
            </View>

            <PrimaryButton title="Guardar Mantenimiento" variant="blue" loading={saving} onPress={onSave} style={styles.saveBtn} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setFilterOpen(false);
          setFilterMenuRect(null);
        }}
      >
      <View style={styles.filterMenuOverlay}>
        <Pressable
          style={styles.filterMenuBackdrop}
          onPress={() => {
            setFilterOpen(false);
            setFilterMenuRect(null);
          }}
        />
        {filterMenuRect ? (
          <View
            style={[
              styles.filterMenuDropdown,
              {
                left: filterMenuRect.x,
                top: filterMenuRect.y + filterMenuRect.height + 4,
                width: filterMenuRect.width,
                maxHeight: Math.max(
                  160,
                  Dimensions.get('window').height - (filterMenuRect.y + filterMenuRect.height) - 24,
                ),
              },
            ]}
          >
            <Text style={styles.filterMenuTitle}>Filtrar por moto</Text>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.filterMenuScroll} bounces={false}>
              <Pressable
                style={({ pressed }) => [styles.filterMenuRow, pressed && styles.filterMenuRowPressed]}
                onPress={() => { setFiltro('todas'); setFilterOpen(false); setFilterMenuRect(null); }}
              >
                <Text style={styles.filterMenuRowText}>Todas las motos</Text>
                {filtro === 'todas' ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
              </Pressable>
              {motos.map((m) => (
                <Pressable
                  key={m.idMoto}
                  style={({ pressed }) => [styles.filterMenuRow, styles.filterMenuRowBorder, pressed && styles.filterMenuRowPressed]}
                  onPress={() => {
                    if (m.idMoto != null) setFiltro(m.idMoto);
                    setFilterOpen(false);
                    setFilterMenuRect(null);
                  }}
                >
                  <Text style={styles.filterMenuRowText}>{motoLabel(m)}</Text>
                  {filtro !== 'todas' && filtro === m.idMoto ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  header: { paddingHorizontal: 18, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: fontFamily.bold, fontWeight: '800', color: light.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: light.textMuted, marginTop: 4 },
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
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 },
  cardIconActions: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  cardTitle: { fontSize: 17, fontFamily: fontFamily.bold, fontWeight: '700', color: light.navy, flex: 1 },
  cardDesc: { fontSize: 14, fontFamily: fontFamily.regular, color: light.textMuted, marginBottom: 6, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: light.border, paddingTop: 8 },
  cardFooterLeft: { flexDirection: 'column', gap: 2 },
  cardDate: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted },
  cardKm: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.navy },
  cardCosto: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.primary },
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
  modalTitle: { fontSize: 18, fontWeight: '800', color: light.text, marginBottom: 14, fontFamily: fontFamily.bold },
  saveBtn: { marginTop: 4 },
  filterLabel: { fontSize: 13, fontFamily: fontFamily.medium, fontWeight: '500', color: light.textMuted, marginBottom: 6, marginTop: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: light.surface, borderRadius: 12, borderWidth: 1, borderColor: light.border, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  filterRowOpen: { borderColor: light.primary },
  filterText: { fontSize: 15, fontFamily: fontFamily.medium, fontWeight: '500', color: light.textMuted },
  filterMenuOverlay: { flex: 1 },
  filterMenuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.25)' },
  filterMenuDropdown: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }
      : { elevation: 8, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 }),
  },
  filterMenuTitle: { fontSize: 13, fontFamily: fontFamily.bold, fontWeight: '700', color: light.textMuted, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, letterSpacing: 0.4 },
  filterMenuScroll: { flexGrow: 0 },
  filterMenuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14 },
  filterMenuRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: light.border },
  filterMenuRowPressed: { backgroundColor: light.bg },
  filterMenuRowText: { fontSize: 15, color: light.text, fontFamily: fontFamily.medium, fontWeight: '500', flex: 1, marginRight: 8 },
  formLabel: { fontSize: 13, fontFamily: fontFamily.medium, fontWeight: '500', color: light.text, marginBottom: 6, marginTop: 12 },
  formMotoSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: light.bg, borderRadius: 10, borderWidth: 1, borderColor: light.border, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  formMotoSelectorText: { fontSize: 15, fontFamily: fontFamily.medium, color: light.text, flex: 1 },
  inlineDropdown: { borderWidth: 1, borderTopWidth: 0, borderColor: light.primary, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: light.surface, marginBottom: 4, overflow: 'hidden' },
  formRow: { flexDirection: 'row', gap: 10 },
  formRowItem: { flex: 1 },
  costoRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: light.border, backgroundColor: light.surface, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  costoPrefixText: { fontSize: 15, fontFamily: fontFamily.bold, color: light.textMuted, marginRight: 8 },
  costoTextInput: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: light.text, padding: 0 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: light.primarySoft ?? '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 16 },
  infoBoxText: { fontSize: 13, fontFamily: fontFamily.regular, color: light.primary, flex: 1 },
});

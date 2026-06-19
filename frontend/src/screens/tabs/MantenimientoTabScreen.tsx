import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import { AppHeader } from '../../components/AppHeader';
import { BottomSheet, type BottomSheetRef } from '../../components/BottomSheet';
import { FAB_SCROLL_PADDING, ScreenFab, ScreenRoot } from '../../components/ScreenFab';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { sectionStyles } from '../../theme/sectionStyles';
import { AppTextInput } from '../../components/AppTextInput';
import { DatePickerField, parseIsoDate, toIsoLocal } from '../../components/DatePickerField';
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
import type { Mantenimiento, Moto } from '../../types/models';
import type { MainTabParamList } from '../../navigation/types';
import {
<<<<<<< HEAD
  consumeMantenimientoAddRequest,
} from '../../navigation/pendingActions';
=======
  CONTENT_MAX_WIDTH,
  FORM_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsiveFabRight,
  getResponsivePadding,
} from '../../theme/responsive';
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7

type Nav = BottomTabNavigationProp<MainTabParamList, 'Mantenimiento'>;

function formatMotoDisplayName(moto: Moto): string {
  return motoLabel(moto)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      if (/[a-zA-Z]\d|\d[a-zA-Z]/.test(word)) return word.toUpperCase();
      const lower = word.toLocaleLowerCase('es-AR');
      return lower.charAt(0).toLocaleUpperCase('es-AR') + lower.slice(1);
    })
    .join(' ');
}

export function MantenimientoTabScreen() {
  const navigation = useNavigation<Nav>();
  const { motos, selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
<<<<<<< HEAD
  const sheetRef = useRef<BottomSheetRef>(null);
=======
  const { width } = useWindowDimensions();
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const modalFrame = getCenteredContentStyle(width, FORM_MAX_WIDTH);
  const pagePadding = getResponsivePadding(width);
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
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
  const [fecha, setFecha] = useState(() => new Date());
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
    return m ? formatMotoDisplayName(m) : 'Todas las motos';
  }, [filtro, motos]);

  const motoIdParaGuardar = motoIdForm ?? selectedMotoId;
  const empty = items.length === 0 && !loading;
  const dropdownBottomGap = 112 + insets.bottom;
  const fabBottom = 36 + insets.bottom;
  const fabRight = getResponsiveFabRight(width, CONTENT_MAX_WIDTH);

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
    setTipo('');
    setDescripcion('');
    setFecha(new Date());
    setKm('');
    setCosto('');
    setMotoIdForm(selectedMotoId ?? null);
  };

  const selectedMotoIdRef = useRef(selectedMotoId);
  selectedMotoIdRef.current = selectedMotoId;

  useFocusEffect(
    useCallback(() => {
      if (!consumeMantenimientoAddRequest()) return;

      setTipo('');
      setDescripcion('');
      setFecha(new Date());
      setKm('');
      setCosto('');
      setMotoIdForm(selectedMotoIdRef.current ?? null);
      setEditItem(null);
      setAddOpen(true);
    }, []),
  );

  useEffect(() => {
    navigation.setParams({ hideTabBar: addOpen });
    return () => {
      navigation.setParams({ hideTabBar: false });
    };
  }, [addOpen, navigation]);

  const handleSheetClosed = useCallback(() => {
    setAddOpen(false);
    setEditItem(null);
    setMotoSelectorOpen(false);
    resetForm();
  }, [selectedMotoId]);

  const openEdit = (item: Mantenimiento & { idMoto: number }) => {
    setEditItem(item);
    setTipo(item.tipo);
    setDescripcion(item.descripcion ?? '');
    setFecha(parseIsoDate(item.fecha));
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
  const parsedKm = km ? Number(km.replace(',', '.')) : null;
  const parsedCosto = costo ? Number(costo.replace(',', '.')) : null;
  if (parsedKm != null && (!Number.isFinite(parsedKm) || parsedKm < 0)) {
    Alert.alert('Dato invalido', 'Ingresa un kilometraje valido.');
    return;
  }
  if (parsedCosto != null && (!Number.isFinite(parsedCosto) || parsedCosto < 0)) {
    Alert.alert('Dato invalido', 'Ingresa un costo valido.');
    return;
  }
  setSaving(true);
  try {
    if (editItem) {
      await editarMantenimiento(editItem.idMantenimiento!, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: toIsoLocal(fecha),
        kilometraje: parsedKm,
        costo: parsedCosto,
      });
    } else {
      await crearMantenimiento(motoIdParaGuardar, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: toIsoLocal(fecha),
        kilometraje: parsedKm,
        costo: parsedCosto,
      });
    }
    await reload();
    sheetRef.current?.close();
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
<<<<<<< HEAD
        <AppHeader />
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <ScreenSectionHeader
            title="Mantenimiento"
            subtitle="Registrá services, cambios de aceite, frenos y más."
          />
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin moto seleccionada</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Selecciona una moto desde Garage.</Text>
          </View>
        </ScrollView>
=======
        {!addOpen ? <AppHeader title="Servicios" /> : null}
        <View style={[styles.emptyWrap, contentFrame, { paddingHorizontal: pagePadding, paddingBottom: 28 + insets.bottom }]}>
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.bg }]}>
              <Ionicons name="bicycle-outline" size={40} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin moto seleccionada</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Selecciona una moto desde Garage.</Text>
          </View>
        </View>
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
      </SafeAreaView>
    );
  }

<<<<<<< HEAD
  const topBlock = (
    <>
      <ScreenSectionHeader
        title="Mantenimiento"
        subtitle="Registrá services, cambios de aceite, frenos y más."
      />
      <Pressable
        ref={filterSelectWrapRef}
        style={[
          sectionStyles.filterRow,
          filterOpen && styles.filterRowOpen,
          { backgroundColor: theme.surface, borderColor: filterOpen ? theme.primary : theme.border },
        ]}
        onPress={() => {
          if (filterOpen) { setFilterOpen(false); setFilterMenuRect(null); return; }
          filterSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
            setFilterMenuRect({ x, y, width, height });
            setFilterOpen(true);
          });
        }}
      >
        <Text style={[sectionStyles.filterInlineLabel, { color: theme.textMuted }]}>
          Filtrar por moto
        </Text>
        <View style={sectionStyles.filterValueRow}>
          <Text style={[styles.filterText, { color: theme.text }]} numberOfLines={1}>
            {filtroDisplay}
          </Text>
          <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
        </View>
      </Pressable>
    </>
  );

  return (
    <ScreenRoot>
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <AppHeader />

      {items.length === 0 && !loading ? (
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          {topBlock}
          <View style={styles.emptyWrap}>
            <Ionicons name="construct-outline" size={64} color={theme.border} />
=======
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {!addOpen ? <AppHeader title="Servicios" /> : null}

      <View style={contentFrame}>
        <View style={[styles.sectionHead, { paddingHorizontal: pagePadding }]}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Mantenimiento</Text>
        </View>
        <Text style={[styles.filterLabel, { color: theme.textMuted, marginHorizontal: pagePadding }]}>Filtrar por moto</Text>
        <Pressable
          ref={filterSelectWrapRef}
          style={[
            styles.filterRow,
            {
              backgroundColor: theme.surface,
              borderColor: filterOpen ? theme.primary : theme.border,
              marginHorizontal: pagePadding,
            },
          ]}
          onPress={() => {
            if (filterOpen) { setFilterOpen(false); setFilterMenuRect(null); return; }
            filterSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
              setFilterMenuRect({ x, y, width, height });
              setFilterOpen(true);
            });
          }}
        >
          <Text style={[styles.filterText, { color: theme.text }]} numberOfLines={1}>{filtroDisplay}</Text>
          <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
        </Pressable>
      </View>

      {empty ? (
        <View style={[styles.emptyWrap, contentFrame, { paddingHorizontal: pagePadding, paddingBottom: 28 + insets.bottom }]}>
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.bg }]}>
              <Ionicons name="construct-outline" size={40} color={theme.textMuted} />
            </View>
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin mantenimientos</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Registra services, cambios de aceite, frenos y mas.</Text>
            <PrimaryButton title="Agregar" variant="blue" onPress={() => { resetForm(); setAddOpen(true); }} style={styles.emptyBtn} />
          </View>
<<<<<<< HEAD
        </ScrollView>
=======
        </View>
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            data={items}
            keyExtractor={(m) => String(m.idMantenimiento)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
<<<<<<< HEAD
            contentContainerStyle={{ paddingBottom: FAB_SCROLL_PADDING }}
            ListHeaderComponent={topBlock}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardTopRow}>
                <Text style={[sectionStyles.listCardTitle, { color: theme.text, flex: 1 }]}>{item.tipo}</Text>
=======
            contentContainerStyle={[contentFrame, { paddingBottom: 136 + insets.bottom, paddingTop: 2 }]}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{item.tipo}</Text>
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
                <View style={styles.cardIconActions}>
                  <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                    <Ionicons name="create-outline" size={17} color={theme.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </Pressable>
                </View>
              </View>
              {item.descripcion ? <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{item.descripcion}</Text> : null}
              <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <View style={styles.cardFooterLeft}>
                  <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatDisplayDate(item.fecha)}</Text>
                  {item.kilometraje ? (
                    <Text style={[styles.cardKm, { color: theme.text }]}>{item.kilometraje.toLocaleString('es-AR')} Km</Text>
                  ) : null}
                </View>
                {item.costo ? (
                  <Text style={[styles.cardCosto, { color: theme.primary }]}>$ {Number(item.costo).toLocaleString('es-AR')}</Text>
                ) : null}
              </View>
            </View>
          )}
          />
<<<<<<< HEAD
        </View>
      )}

      <BottomSheet
        ref={sheetRef}
        visible={addOpen}
        title={editItem ? 'Editar Mantenimiento' : 'Agregar Mantenimiento'}
        onClose={handleSheetClosed}
      >
=======
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: fabBottom, right: fabRight, backgroundColor: theme.primary }]}
            onPress={() => { resetForm(); setAddOpen(true); }}
          >
            <Ionicons name="add" size={30} color={theme.onPrimary} />
          </Pressable>
        </View>
      )}

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => { setAddOpen(false); setEditItem(null); resetForm(); }}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={() => { setAddOpen(false); setEditItem(null); resetForm(); }} />
          <View style={[styles.modalSheet, modalFrame, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{editItem ? 'Editar Mantenimiento' : 'Agregar Mantenimiento'}</Text>
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
            <AppTextInput label="Tipo *" variant="light" placeholder="Ej: Aceite, Service, Frenos" value={tipo} onChangeText={setTipo} />

            <Text style={[styles.formLabel, { color: theme.text }]}>Moto</Text>
            <Pressable
              style={[
                styles.formMotoSelector,
                {
                  backgroundColor: theme.bg,
                  borderColor: motoSelectorOpen ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setMotoSelectorOpen((v) => !v)}
            >
              <Text style={[styles.formMotoSelectorText, { color: theme.text }]}>
                {motoIdParaGuardar
                  ? formatMotoDisplayName(motos.find((m) => m.idMoto === motoIdParaGuardar)!)
                  : 'Seleccioná una moto'}
              </Text>
              <Ionicons name={motoSelectorOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
            </Pressable>

            {motoSelectorOpen && (
              <View style={[styles.inlineDropdown, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                {motos.map((m, i) => (
                  <Pressable
                    key={m.idMoto}
                    style={({ pressed }) => [
                      styles.filterMenuRow,
                      i > 0 && styles.filterMenuRowBorder,
                      i > 0 && { borderTopColor: theme.border },
                      pressed && { backgroundColor: theme.bg },
                    ]}
                    onPress={() => {
                      if (m.idMoto != null) setMotoIdForm(m.idMoto);
                      setMotoSelectorOpen(false);
                    }}
                  >
                    <Text style={[styles.filterMenuRowText, { color: theme.text }]}>{formatMotoDisplayName(m)}</Text>
                    {motoIdForm === m.idMoto ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
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
                <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
              </View>
              <View style={styles.formRowItem}>
                <AppTextInput label="Kilometraje (km)" variant="light" placeholder="0.00" keyboardType="decimal-pad" value={km} onChangeText={setKm} />
              </View>
            </View>

            <Text style={[styles.formLabel, { color: theme.text }]}>Costo</Text>
            <View style={[styles.costoRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.costoPrefixText, { color: theme.textMuted }]}>$</Text>
              <TextInput
                style={[styles.costoTextInput, { color: theme.text }]}
                placeholder="15.000,00"
                keyboardType="decimal-pad"
                value={costo}
                onChangeText={setCosto}
                placeholderTextColor={theme.textMuted}
                onStartShouldSetResponder={() => true}
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="information-circle-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.infoBoxText, { color: theme.primary }]}>Se registrará un gasto también</Text>
            </View>

            <PrimaryButton title="Guardar Mantenimiento" variant="blue" loading={saving} onPress={onSave} style={styles.saveBtn} />
      </BottomSheet>

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
          style={[styles.filterMenuBackdrop, { backgroundColor: theme.overlaySoft }]}
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
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              {
                left: filterMenuRect.x,
                top: filterMenuRect.y + filterMenuRect.height + 4,
                width: filterMenuRect.width,
                maxHeight: Math.max(
                  160,
                  Dimensions.get('window').height - (filterMenuRect.y + filterMenuRect.height) - dropdownBottomGap,
                ),
              },
            ]}
          >
            <Text style={[styles.filterMenuTitle, { color: theme.textMuted }]}>Filtrar por moto</Text>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.filterMenuScroll} bounces={false}>
              <Pressable
                style={({ pressed }) => [styles.filterMenuRow, pressed && { backgroundColor: theme.bg }]}
                onPress={() => { setFiltro('todas'); setFilterOpen(false); setFilterMenuRect(null); }}
              >
                <Text style={[styles.filterMenuRowText, { color: theme.text }]}>Todas las motos</Text>
                {filtro === 'todas' ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
              </Pressable>
              {motos.map((m) => (
                <Pressable
                  key={m.idMoto}
                  style={({ pressed }) => [
                    styles.filterMenuRow,
                    styles.filterMenuRowBorder,
                    { borderTopColor: theme.border },
                    pressed && { backgroundColor: theme.bg },
                  ]}
                  onPress={() => {
                    if (m.idMoto != null) setFiltro(m.idMoto);
                    setFilterOpen(false);
                    setFilterMenuRect(null);
                  }}
                >
                  <Text style={[styles.filterMenuRowText, { color: theme.text }]}>{formatMotoDisplayName(m)}</Text>
                  {filtro !== 'todas' && filtro === m.idMoto ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
      </Modal>
    </SafeAreaView>

    <ScreenFab
      visible={items.length > 0 && !addOpen}
      onPress={() => { resetForm(); setAddOpen(true); }}
      backgroundColor={theme.primary}
      iconColor={theme.onPrimary}
    />
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
<<<<<<< HEAD
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyScroll: { flexGrow: 1 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, fontFamily: fontFamily.regular, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 18, alignSelf: 'stretch' },
=======
  header: { paddingHorizontal: 18, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: fontFamily.bold, fontWeight: '800', color: light.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: light.textMuted, marginTop: 4 },
  sectionHead: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  emptyCard: {
    flex: 1,
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: light.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 20, fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, fontFamily: fontFamily.regular, textAlign: 'center', lineHeight: 22, marginBottom: 22, fontSize: 15 },
  emptyBtn: { alignSelf: 'stretch', marginHorizontal: 18 },
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
  listWrap: { flex: 1 },
  card: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: light.border,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 },
  cardIconActions: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  cardDesc: { fontSize: 14, fontFamily: fontFamily.regular, color: light.textMuted, marginBottom: 6, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: light.border, paddingTop: 8 },
  cardFooterLeft: { flexDirection: 'column', gap: 2 },
  cardDate: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted },
  cardKm: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.navy },
  cardCosto: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.primary },
  saveBtn: { marginTop: 4 },
<<<<<<< HEAD
=======
  filterLabel: { fontSize: 13, fontFamily: fontFamily.medium, fontWeight: '500', color: light.textMuted, marginHorizontal: 18, marginBottom: 8, marginTop: 14 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: light.surface, borderRadius: 12, borderWidth: 1, borderColor: light.border, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 18, marginBottom: 14 },
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
  filterRowOpen: { borderColor: light.primary },
  filterText: { flex: 1, fontSize: 15, fontFamily: fontFamily.medium, fontWeight: '500', color: light.textMuted },
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

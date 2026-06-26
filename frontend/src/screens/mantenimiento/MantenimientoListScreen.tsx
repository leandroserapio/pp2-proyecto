import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  crearMantenimiento,
  eliminarMantenimiento,
  listarMantenimientosPorMoto,
} from '../../api/mantenimientos';
import { ApiError } from '../../api/client';
import { AppHeader } from '../../components/AppHeader';
import { AppTextInput } from '../../components/AppTextInput';
import { BottomSheet, type BottomSheetRef } from '../../components/BottomSheet';
import { DatePickerField, toIsoLocal } from '../../components/DatePickerField';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FAB_SCROLL_PADDING, ScreenFab, ScreenRoot } from '../../components/ScreenFab';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import { formatDisplayDate } from '../../gastos/format';
import { motoLabel } from '../../gastos/gastosLoader';
import { consumeMantenimientoAddRequest } from '../../navigation/pendingActions';
import type { MantenimientoListNavItem, MantenimientoStackParamList } from '../../navigation/types';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';
import {
  CONTENT_MAX_WIDTH,
  getCenteredContentStyle,
} from '../../theme/responsive';
import { sectionStyles } from '../../theme/sectionStyles';
import type { Mantenimiento, Moto } from '../../types/models';

type Nav = NativeStackNavigationProp<MantenimientoStackParamList, 'MantenimientoHome'>;

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

export function MantenimientoListScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { motos, selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const sheetRef = useRef<BottomSheetRef>(null);
  const tabNavigation = navigation.getParent();

  const [allItems, setAllItems] = useState<MantenimientoListNavItem[]>([]);
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

  const reload = useCallback(async () => {
    if (!selectedMotoId) {
      setAllItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listarMantenimientosPorMoto(selectedMotoId);
      const mapped = list.map((item) => ({ ...item, idMoto: selectedMotoId }));
      mapped.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
      setAllItems(mapped);
    } finally {
      setLoading(false);
    }
  }, [selectedMotoId]);

  const items = allItems;
  const motoIdParaGuardar = motoIdForm ?? selectedMotoId;
  const empty = items.length === 0 && !loading;

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

  const resetForm = useCallback(() => {
    setTipo('');
    setDescripcion('');
    setFecha(new Date());
    setKm('');
    setCosto('');
    setMotoIdForm(selectedMotoId ?? null);
    setMotoSelectorOpen(false);
  }, [selectedMotoId]);

  const openAddSheet = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const selectedMotoIdRef = useRef(selectedMotoId);
  selectedMotoIdRef.current = selectedMotoId;

  useFocusEffect(
    useCallback(() => {
      if (!consumeMantenimientoAddRequest()) return;
      resetForm();
      setAddOpen(true);
    }, [resetForm]),
  );

  useEffect(() => {
    tabNavigation?.setParams({ hideTabBar: addOpen });
    return () => {
      tabNavigation?.setParams({ hideTabBar: false });
    };
  }, [addOpen, tabNavigation]);

  const handleSheetClosed = useCallback(() => {
    setAddOpen(false);
    setMotoSelectorOpen(false);
    resetForm();
  }, [resetForm]);

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
      Alert.alert('Dato inválido', 'Ingresá un kilometraje válido.');
      return;
    }
    if (parsedCosto != null && (!Number.isFinite(parsedCosto) || parsedCosto < 0)) {
      Alert.alert('Dato inválido', 'Ingresá un costo válido.');
      return;
    }
    setSaving(true);
    try {
      await crearMantenimiento(motoIdParaGuardar, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: toIsoLocal(fecha),
        kilometraje: parsedKm,
        costo: parsedCosto,
      });
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
        <AppHeader />
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <ScreenSectionHeader
            title="Mantenimiento"
            subtitle="Registrá services, cambios de aceite, frenos y más."
          />
          <EmptyState
            variant="plain"
            title="Sin moto seleccionada"
            subtitle="Seleccioná una moto desde el menú superior."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const topBlock = (
    <ScreenSectionHeader
      title="Mantenimiento"
      subtitle="Registrá services, cambios de aceite, frenos y más."
    />
  );

  return (
    <ScreenRoot>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
        <AppHeader />

        {empty ? (
          <ScrollView contentContainerStyle={styles.emptyScroll}>
            {topBlock}
            <EmptyState
              frameStyle={contentFrame}
              icon={<MaterialCommunityIcons name="wrench-outline" size={40} color={theme.textMuted} />}
              title="No hay servicios registrados"
              subtitle="Registrá services, cambios de aceite, frenos y más."
              actionLabel="Agregar Servicio"
              onAction={openAddSheet}
            />
          </ScrollView>
        ) : (
          <View style={styles.listWrap}>
            <FlatList
              data={items}
              keyExtractor={(m) => String(m.idMantenimiento)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{ paddingBottom: FAB_SCROLL_PADDING }}
              ListHeaderComponent={topBlock}
              renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.cardTopRow}>
                    <Text style={[sectionStyles.listCardTitle, { color: theme.text, flex: 1 }]}>{item.tipo}</Text>
                    <View style={styles.cardIconActions}>
                      <Pressable
                        onPress={() => navigation.navigate('MantenimientoEdit', { item })}
                        hitSlop={8}
                      >
                        <Ionicons name="create-outline" size={17} color={theme.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={theme.danger} />
                      </Pressable>
                    </View>
                  </View>
                  {item.descripcion ? (
                    <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{item.descripcion}</Text>
                  ) : null}
                  <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    <View style={styles.cardFooterLeft}>
                      <Text style={[styles.cardDate, { color: theme.textMuted }]}>
                        {formatDisplayDate(item.fecha)}
                      </Text>
                      {item.kilometraje ? (
                        <Text style={[styles.cardKm, { color: theme.text }]}>
                          {item.kilometraje.toLocaleString('es-AR')} Km
                        </Text>
                      ) : null}
                    </View>
                    {item.costo ? (
                      <Text style={[styles.cardCosto, { color: theme.primary }]}>
                        $ {Number(item.costo).toLocaleString('es-AR')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              )}
            />
          </View>
        )}

        <BottomSheet
          ref={sheetRef}
          visible={addOpen}
          title="Agregar Mantenimiento"
          onClose={handleSheetClosed}
        >
          <AppTextInput
            label="Tipo *"
            variant="light"
            placeholder="Ej: Aceite, Service, Frenos"
            value={tipo}
            onChangeText={setTipo}
          />

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
            <Ionicons
              name={motoSelectorOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textMuted}
            />
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
                  <Text style={[styles.filterMenuRowText, { color: theme.text }]}>
                    {formatMotoDisplayName(m)}
                  </Text>
                  {motoIdForm === m.idMoto ? (
                    <Ionicons name="checkmark" color={theme.primary} size={20} />
                  ) : null}
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
              <AppTextInput
                label="Kilometraje (km)"
                variant="light"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={km}
                onChangeText={setKm}
              />
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

          <PrimaryButton
            title="Guardar Mantenimiento"
            variant="blue"
            loading={saving}
            onPress={onSave}
            style={styles.saveBtn}
          />
        </BottomSheet>
      </SafeAreaView>

      <ScreenFab
        visible={items.length > 0 && !addOpen}
        onPress={openAddSheet}
        backgroundColor={theme.primary}
        iconColor={theme.onPrimary}
      />
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  emptyScroll: { flexGrow: 1 },
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
    paddingTop: 8,
  },
  cardFooterLeft: { flexDirection: 'column', gap: 2 },
  cardDate: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted },
  cardKm: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.navy },
  cardCosto: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: '700', color: light.primary },
  saveBtn: { marginTop: 4 },
  filterMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  filterMenuRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: light.border },
  filterMenuRowText: {
    fontSize: 15,
    color: light.text,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.text,
    marginBottom: 6,
    marginTop: 12,
  },
  formMotoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: light.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  formMotoSelectorText: { fontSize: 15, fontFamily: fontFamily.medium, color: light.text, flex: 1 },
  inlineDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: light.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: light.surface,
    marginBottom: 4,
    overflow: 'hidden',
  },
  formRow: { flexDirection: 'row', gap: 10 },
  formRowItem: { flex: 1 },
  costoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  costoPrefixText: { fontSize: 15, fontFamily: fontFamily.bold, color: light.textMuted, marginRight: 8 },
  costoTextInput: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: light.text, padding: 0 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: light.primarySoft ?? '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxText: { fontSize: 13, fontFamily: fontFamily.regular, color: light.primary, flex: 1 },
});

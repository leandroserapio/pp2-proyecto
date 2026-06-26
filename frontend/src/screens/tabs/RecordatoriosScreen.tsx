import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  actualizarRecordatorio,
  inicializarRecordatorios,
  listarRecordatoriosPorMoto,
  toggleRecordatorio,
} from '../../api/recordatorios';
import { ApiError } from '../../api/client';
import { AppHeader } from '../../components/AppHeader';
import { BottomSheet, type BottomSheetRef } from '../../components/BottomSheet';
import { DatePickerField, parseIsoDate } from '../../components/DatePickerField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { AppTextInput } from '../../components/AppTextInput';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import {
  RECORDATORIO_PRESETS,
  UNIDADES_TIEMPO,
  calcularProximaAlerta,
  diasToUnidad,
  formatIntervaloTiempo,
  getPresetMeta,
  toIsoDateOnly,
  unidadToDias,
} from '../../recordatorios/recordatorioPresets';
import type { UnidadTiempo } from '../../recordatorios/recordatorioPresets';
import {
  sincronizarNotificacionesRecordatorios,
} from '../../services/notificationsService';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';
import type { ModoAlerta, Recordatorio } from '../../types/models';

export function RecordatoriosScreen() {
  const { theme } = useAppSettings();
  const { selectedMoto, selectedMotoId, refreshMotos } = useMoto();
  const [items, setItems] = useState<Recordatorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editItem, setEditItem] = useState<Recordatorio | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [modoAlerta, setModoAlerta] = useState<ModoAlerta>('TIEMPO');
  const [intervaloKm, setIntervaloKm] = useState('');
  const [intervaloValor, setIntervaloValor] = useState('');
  const [unidadTiempo, setUnidadTiempo] = useState<UnidadTiempo>('DIAS');
  const [fechaInicio, setFechaInicio] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const sheetRef = useRef<BottomSheetRef>(null);

  const sortedItems = useMemo(() => {
    const order = RECORDATORIO_PRESETS.map((p) => p.tipo);
    return [...items].sort(
      (a, b) => order.indexOf(a.tipoRecordatorio) - order.indexOf(b.tipoRecordatorio),
    );
  }, [items]);

  const load = useCallback(async () => {
    if (!selectedMotoId) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const motos = await refreshMotos();
      const moto = motos.find((m) => m.idMoto === selectedMotoId) ?? selectedMoto;

      let list = await listarRecordatoriosPorMoto(selectedMotoId);
      if (list.length === 0) {
        list = await inicializarRecordatorios(selectedMotoId);
      }
      setItems(list);
      if (moto) {
        await sincronizarNotificacionesRecordatorios(list, moto);
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudieron cargar los recordatorios';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, [refreshMotos, selectedMoto, selectedMotoId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openEdit = async (item: Recordatorio) => {
    await refreshMotos();
    const preset = getPresetMeta(item.tipoRecordatorio);

    setEditItem(item);
    setModoAlerta(item.modoAlerta);
    setIntervaloKm(
      item.intervaloKm != null
        ? String(item.intervaloKm)
        : String(preset?.intervaloKmDefault ?? 500),
    );

    const dias = item.intervaloDias ?? preset?.intervaloDiasDefault ?? 7;
    const { valor, unidad } = diasToUnidad(dias);
    setIntervaloValor(String(valor));
    setUnidadTiempo(unidad);

    setFechaInicio(item.fechaInicio ? parseIsoDate(item.fechaInicio) : new Date());
    setEditOpen(true);
  };

  const handleModoChange = (modo: ModoAlerta) => {
    setModoAlerta(modo);
    if (!editItem) return;
    const preset = getPresetMeta(editItem.tipoRecordatorio);
    if (modo === 'TIEMPO' && !intervaloValor) {
      const dias = preset?.intervaloDiasDefault ?? 7;
      const { valor, unidad } = diasToUnidad(dias);
      setIntervaloValor(String(valor));
      setUnidadTiempo(unidad);
    }
    if (modo === 'KILOMETRAJE' && !intervaloKm) {
      setIntervaloKm(String(preset?.intervaloKmDefault ?? 500));
    }
  };

  const handleToggle = async (item: Recordatorio) => {
    if (item.idRecordatorio == null) return;
    try {
      const updated = await toggleRecordatorio(item.idRecordatorio);
      const next = items.map((r) => (r.idRecordatorio === updated.idRecordatorio ? updated : r));
      setItems(next);
      if (selectedMoto) {
        await sincronizarNotificacionesRecordatorios(next, selectedMoto);
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo cambiar el estado';
      Alert.alert('Error', msg);
    }
  };

  const onSave = async () => {
    if (!editItem?.idRecordatorio) return;

    const parsedKm = intervaloKm ? Number(intervaloKm) : null;
    const parsedValor = intervaloValor ? Number(intervaloValor) : null;
    const parsedDias =
      parsedValor != null ? unidadToDias(parsedValor, unidadTiempo) : null;
    const kmInicio = selectedMoto?.kilometrajeActual ?? 0;

    if (modoAlerta === 'KILOMETRAJE' && (parsedKm == null || parsedKm <= 0)) {
      Alert.alert('Dato inválido', 'Ingresá un intervalo de kilometraje válido.');
      return;
    }
    if (modoAlerta === 'TIEMPO' && (parsedDias == null || parsedDias <= 0)) {
      Alert.alert('Dato inválido', 'Ingresá un intervalo de tiempo válido.');
      return;
    }

    setSaving(true);
    try {
      const updated = await actualizarRecordatorio(editItem.idRecordatorio, {
        modoAlerta,
        intervaloKm: modoAlerta === 'KILOMETRAJE' ? parsedKm : null,
        intervaloDias: modoAlerta === 'TIEMPO' ? parsedDias : null,
        fechaInicio: toIsoDateOnly(fechaInicio),
        kmInicio,
      });
      const next = items.map((r) => (r.idRecordatorio === updated.idRecordatorio ? updated : r));
      setItems(next);
      if (selectedMoto) {
        await sincronizarNotificacionesRecordatorios(next, selectedMoto);
      }
      sheetRef.current?.close();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const preset = editItem ? getPresetMeta(editItem.tipoRecordatorio) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <AppHeader />

      {!selectedMoto ? (
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <ScreenSectionHeader
            title="Recordatorios"
            subtitle="Configurá alertas de mantenimiento por tiempo o kilometraje."
          />
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-outline" size={64} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin moto seleccionada</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Seleccioná o agregá una moto desde el menú superior.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
        >
          <ScreenSectionHeader
            title="Recordatorios"
            subtitle="Configurá alertas de mantenimiento por tiempo o kilometraje."
          />

          {sortedItems.map((item) => {
            const meta = getPresetMeta(item.tipoRecordatorio);
            const proxima = calcularProximaAlerta(item, selectedMoto.kilometrajeActual ?? 0);
            return (
              <View
                key={item.idRecordatorio ?? item.tipoRecordatorio}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: proxima.vencido && item.activo ? theme.danger : theme.border,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <Pressable style={styles.cardPressable} onPress={() => void openEdit(item)}>
                    <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
                      <Ionicons
                        name={meta?.icon ?? 'notifications-outline'}
                        size={22}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>
                        {meta?.titulo ?? item.tipoRecordatorio}
                      </Text>
                      <Text style={[styles.cardSub, { color: theme.textMuted }]}>
                        {item.modoAlerta === 'TIEMPO'
                          ? formatIntervaloTiempo(item.intervaloDias)
                          : `Cada ${(item.intervaloKm ?? 0).toLocaleString('es-AR')} km`}
                      </Text>
                      <Text
                        style={[
                          styles.cardAlert,
                          { color: proxima.vencido ? theme.danger : theme.primary },
                        ]}
                      >
                        {proxima.label}
                      </Text>
                    </View>
                  </Pressable>
                  <Switch
                    value={item.activo ?? true}
                    onValueChange={() => void handleToggle(item)}
                    trackColor={{ false: theme.border, true: theme.primarySoft }}
                    thumbColor={item.activo ? theme.primary : theme.surfaceMuted}
                  />
                </View>
              </View>
            );
          })}

          {loading && items.length === 0 ? (
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando...</Text>
          ) : null}
        </ScrollView>
      )}

      <BottomSheet
        ref={sheetRef}
        visible={editOpen}
        title={preset?.titulo ?? 'Configurar recordatorio'}
        onClose={() => {
          setEditOpen(false);
          setEditItem(null);
        }}
      >
        {preset ? (
          <>
            <Text style={[styles.sheetDesc, { color: theme.textMuted }]}>{preset.descripcion}</Text>

            <Text style={[styles.formLabel, { color: theme.text }]}>Modo de alerta</Text>
            <View style={styles.modeRow}>
              {(['TIEMPO', 'KILOMETRAJE'] as ModoAlerta[]).map((modo) => (
                <Pressable
                  key={modo}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: modoAlerta === modo ? theme.primary : theme.bg,
                      borderColor: modoAlerta === modo ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleModoChange(modo)}
                >
                  <Text
                    style={[
                      styles.modeChipText,
                      { color: modoAlerta === modo ? theme.onPrimary : theme.text },
                    ]}
                  >
                    {modo === 'TIEMPO' ? 'Tiempo' : 'Kilometraje'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {modoAlerta === 'TIEMPO' ? (
              <>
                <Text style={[styles.formLabel, { color: theme.text }]}>Repetir cada</Text>
                <View style={styles.intervalRow}>
                  <View style={styles.intervalInputWrap}>
                    <AppTextInput
                      variant="light"
                      keyboardType="number-pad"
                      value={intervaloValor}
                      onChangeText={setIntervaloValor}
                      placeholder="1"
                    />
                  </View>
                  <View style={styles.unitWrap}>
                    {UNIDADES_TIEMPO.map(({ unidad, label }) => (
                      <Pressable
                        key={unidad}
                        style={[
                          styles.unitChip,
                          {
                            borderColor: unidadTiempo === unidad ? theme.primary : theme.border,
                            backgroundColor:
                              unidadTiempo === unidad ? theme.primarySoft : theme.surface,
                          },
                        ]}
                        onPress={() => setUnidadTiempo(unidad)}
                      >
                        <Text style={[styles.unitChipText, { color: theme.text }]}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <DatePickerField
                  label="Fecha de inicio"
                  value={fechaInicio}
                  onChange={setFechaInicio}
                />
              </>
            ) : (
              <>
                <AppTextInput
                  label="Repetir cada (km)"
                  variant="light"
                  keyboardType="number-pad"
                  value={intervaloKm}
                  onChangeText={setIntervaloKm}
                  placeholder={String(preset.intervaloKmDefault ?? 500)}
                />
                <View style={[styles.kmInfo, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="speedometer-outline" size={18} color={theme.primary} />
                  <Text style={[styles.kmInfoText, { color: theme.text }]}>
                    Kilometraje actual:{' '}
                    <Text style={styles.kmInfoValue}>
                      {(selectedMoto?.kilometrajeActual ?? 0).toLocaleString('es-AR')} km
                    </Text>
                  </Text>
                </View>
                <Text style={[styles.kmHint, { color: theme.textMuted }]}>
                  El contador arranca desde el kilometraje actual de la moto.
                </Text>
              </>
            )}

            <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onSave} />
          </>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  list: { paddingBottom: 30 },
  emptyScroll: { flexGrow: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    minHeight: 320,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fontFamily.regular,
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  cardSub: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fontFamily.regular,
  },
  cardAlert: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: fontFamily.regular,
  },
  sheetDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: fontFamily.regular,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  intervalRow: {
    gap: 10,
    marginBottom: 4,
  },
  intervalInputWrap: {
    marginBottom: -8,
  },
  unitWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  unitChipText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  kmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  kmInfoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  kmInfoValue: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  kmHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 4,
    fontFamily: fontFamily.regular,
  },
});

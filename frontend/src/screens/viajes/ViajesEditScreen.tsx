import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { ViajesStackParamList } from '../../navigation/types';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { editarViaje } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { parseAmountInput } from '../../gastos/format';
import { motoLabel } from '../../viajes/viajesLoader';
import { mergeViajeNotas, splitViajeNotas } from '../../viajes/viajeNotas';
import { VIAJE_ESTADOS, normalizeViajeEstado } from '../../viajes/viajeEstado';
import { formatDisplayDate } from '../../viajes/format';
import { parseIsoDate, toIsoLocal, VIAJE_BANNER_URI } from '../../viajes/viajeFormUtils';
import { estimateRoute, RouteEstimateError } from '../../viajes/routeEstimation';
import { estimateFuelBudget, parsePositiveNumber } from '../../viajes/fuelCost';

type Nav = NativeStackNavigationProp<ViajesStackParamList, 'ViajesEdit'>;
type R = RouteProp<ViajesStackParamList, 'ViajesEdit'>;

export function ViajesEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const { motos } = useMoto();
  const { darkMode, theme } = useAppSettings();
  const { item } = route.params;

  const {
    salida: existingSalida,
    tiempoEstimado: existingTiempo,
    consumoLitros100: existingConsumo,
    precioNafta: existingPrecio,
    notas: existingNotas,
  } = splitViajeNotas(item.notas ?? '');

  const [titulo, setTitulo] = useState(item.destino ?? '');
  const [estado, setEstado] = useState(normalizeViajeEstado(item.estado));
  const [idMoto] = useState(item.idMoto);
  const [salida, setSalida] = useState(existingSalida);
  const [tiempoEstimado, setTiempoEstimado] = useState(existingTiempo);
  const [consumoLitros100, setConsumoLitros100] = useState(existingConsumo || '28');
  const [precioNafta, setPrecioNafta] = useState(existingPrecio);
  const [kmEst, setKmEst] = useState(
    item.kilometrosEstimados != null ? String(item.kilometrosEstimados) : '',
  );
  const [presupuestoStr, setPresupuestoStr] = useState(
    item.presupuestoEstimado != null ? String(item.presupuestoEstimado) : '',
  );
  const [notas, setNotas] = useState(existingNotas);
  const [date, setDate] = useState(() => parseIsoDate(item.fechaSalida));
  const [saving, setSaving] = useState(false);
  const [estimatingRoute, setEstimatingRoute] = useState(false);

  const [estadoMenuOpen, setEstadoMenuOpen] = useState(false);
  const [estadoMenuRect, setEstadoMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const estadoSelectRef = useRef<View>(null);

  const [showDate, setShowDate] = useState(false);
  const [dateMenuRect, setDateMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const dateSelectRef = useRef<View>(null);

  const selectedMoto = motos.find((m) => m.idMoto === idMoto);

  const motoDisplay = useMemo(
    () => (selectedMoto ? motoLabel(selectedMoto) : item.motoLabel),
    [selectedMoto, item.motoLabel],
  );

  const dropdownMaxHeight = (rect: { y: number; height: number } | null, cap = 220) => {
    if (!rect) return cap;
    return Math.min(cap, Math.max(120, Dimensions.get('window').height - (rect.y + rect.height) - 96 - insets.bottom));
  };

  const onSave = async () => {
    if (!item.idViaje) {
      Alert.alert('Error', 'No se pudo identificar el viaje.');
      return;
    }
    if (!titulo.trim()) {
      Alert.alert('Datos incompletos', 'El título del viaje es obligatorio.');
      return;
    }
    const presupuesto = parseAmountInput(presupuestoStr);
    const km = kmEst.trim() ? Number(kmEst.replace(/\D/g, '')) : null;
    if (km != null && (!Number.isFinite(km) || km < 0)) {
      Alert.alert('Datos incompletos', 'Ingresá kilómetros estimados válidos.');
      return;
    }
    if (presupuestoStr.trim() && (presupuesto == null || presupuesto < 0)) {
      Alert.alert('Datos incompletos', 'Ingresa un presupuesto valido.');
      return;
    }

    setSaving(true);
    try {
      await editarViaje(item.idViaje, {
        destino: titulo.trim(),
        fechaSalida: toIsoLocal(date),
        kilometrosEstimados: km,
        presupuestoEstimado: presupuesto,
        notas: mergeViajeNotas(salida, notas, tiempoEstimado, consumoLitros100, precioNafta),
        estado,
      });
      navigation.navigate('ViajesHome');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const calculateRouteEstimate = async () => {
    if (!salida.trim() || !titulo.trim()) {
      Alert.alert('Ruta incompleta', 'Carga ubicacion de salida y destino.');
      return;
    }

    setEstimatingRoute(true);
    try {
      const kilometersPerLiter = parsePositiveNumber(consumoLitros100);
      if (kilometersPerLiter == null) {
        Alert.alert('Rendimiento inválido', 'Ingresá cuántos kilómetros hace la moto por litro.');
        return;
      }

      const estimate = await estimateRoute(salida, titulo, kilometersPerLiter);
      setKmEst(String(estimate.kilometers));
      setTiempoEstimado(estimate.durationLabel);
      if (estimate.pricePerLiter != null) setPrecioNafta(String(estimate.pricePerLiter));
      if (estimate.estimatedCost != null) setPresupuestoStr(String(estimate.estimatedCost));
      Alert.alert(
        'Ruta estimada',
        estimate.estimatedCost != null
          ? `${estimate.kilometers} km - ${estimate.durationLabel}\n${
              estimate.fuelType && estimate.pricePerLiter != null ? `${estimate.fuelType}: $${estimate.pricePerLiter}/L\n` : ''
            }Costo estimado: $${estimate.estimatedCost}`
          : `${estimate.kilometers} km - ${estimate.durationLabel}`,
      );
    } catch (e) {
      const msg = e instanceof RouteEstimateError ? e.message : 'No se pudo estimar la ruta.';
      Alert.alert('Ruta no disponible', msg);
    } finally {
      setEstimatingRoute(false);
    }
  };

  const estimateFuelCost = () => {
    const km = Number(kmEst.replace(',', '.'));
    const budget = estimateFuelBudget(km, consumoLitros100, precioNafta);
    if (budget == null) {
      Alert.alert('Estimacion', 'Completa kilometros, KM/L y precio por litro.');
      return;
    }
    setPresupuestoStr(String(budget));
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: theme.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bannerWrap}>
          <ImageBackground source={{ uri: VIAJE_BANNER_URI }} style={styles.banner} imageStyle={styles.bannerImage}>
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerEyebrow}>Título de Viaje</Text>
              <TextInput
                placeholder="Nombra tu viaje"
                placeholderTextColor={light.onPrimarySubtle}
                value={titulo}
                onChangeText={setTitulo}
                style={styles.bannerInput}
              />
              <View style={styles.bannerUnderline} />
            </View>
          </ImageBackground>
        </View>

        <Text style={[styles.fieldEyebrow, { color: theme.textMuted }]}>ESTADO DE VIAJE</Text>
        <Pressable
          ref={estadoSelectRef}
          style={[
            styles.select,
            {
              backgroundColor: theme.surface,
              borderColor: estadoMenuOpen ? theme.primary : theme.border,
            },
          ]}
          onPress={() => {
            if (estadoMenuOpen) {
              setEstadoMenuOpen(false);
              setEstadoMenuRect(null);
              return;
            }
            estadoSelectRef.current?.measureInWindow((x, y, width, height) => {
              setEstadoMenuRect({ x, y, width, height });
              setEstadoMenuOpen(true);
            });
          }}
        >
          <Text style={[styles.selectText, { color: theme.text }]}>{estado}</Text>
          <Ionicons name={estadoMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
        </Pressable>

        <Text style={[styles.fieldEyebrow, { color: theme.textMuted }]}>MOTO</Text>
        <View style={[styles.selectDisabled, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text style={[styles.selectText, { color: theme.text }]}>{motoDisplay}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Destinos</Text>
          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>SALIDA</Text>
          <View style={[styles.inputWithIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="location-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Ej: Córdoba"
              placeholderTextColor={theme.textMuted}
              value={salida}
              onChangeText={setSalida}
              style={[styles.iconInput, { color: theme.text }]}
            />
          </View>
          <PrimaryButton
            title="Calcular ruta gratis"
            variant="blue"
            loading={estimatingRoute}
            onPress={calculateRouteEstimate}
            style={styles.mapsButton}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Detalles del Viaje</Text>

          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>KILÓMETROS ESTIMADOS</Text>
          <TextInput
            placeholder="Km. 0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            value={kmEst}
            onChangeText={setKmEst}
            style={[styles.inlineInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          />

          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>TIEMPO ESTIMADO</Text>
          <TextInput
            placeholder="Ej: 1 h 25 min"
            placeholderTextColor={theme.textMuted}
            value={tiempoEstimado}
            onChangeText={setTiempoEstimado}
            style={[styles.inlineInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          />

          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>FECHA DE SALIDA</Text>
          <Pressable
            ref={dateSelectRef}
            style={[
              styles.select,
              {
                backgroundColor: theme.surface,
                borderColor: showDate ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              if (showDate) {
                setShowDate(false);
                setDateMenuRect(null);
                return;
              }
              dateSelectRef.current?.measureInWindow((x, y, width, height) => {
                setDateMenuRect({ x, y, width, height });
                setShowDate(true);
              });
            }}
          >
            <Text style={[styles.selectText, { color: theme.text }]}>{formatDisplayDate(toIsoLocal(date))}</Text>
            <Ionicons name={showDate ? 'chevron-up' : 'calendar-outline'} size={18} color={theme.textMuted} />
          </Pressable>

          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>PRESUPUESTO</Text>
          <View style={[styles.inputWithIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.currencyPrefix, { color: theme.textMuted }]}>$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={presupuestoStr}
              onChangeText={setPresupuestoStr}
              style={[styles.iconInput, styles.currencyInput, { color: theme.text }]}
            />
          </View>

          <View style={styles.estimateGrid}>
            <View style={styles.estimateCol}>
              <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>KM/L</Text>
              <TextInput
                placeholder="Ej: 28"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={consumoLitros100}
                onChangeText={setConsumoLitros100}
                style={[styles.inlineInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              />
            </View>
            <View style={styles.estimateCol}>
              <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>$/LITRO</Text>
              <TextInput
                placeholder="Ej: 1200"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={precioNafta}
                onChangeText={setPrecioNafta}
                style={[styles.inlineInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              />
            </View>
          </View>
          <View style={styles.estimateActions}>
            <Pressable style={[styles.secondaryAction, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={estimateFuelCost}>
              <Ionicons name="calculator-outline" size={18} color={theme.primary} />
              <Text style={[styles.secondaryActionText, { color: theme.primary }]}>Calcular costo</Text>
            </Pressable>
          </View>

          <Text style={[styles.fieldEyebrowInCard, { color: theme.textMuted }]}>NOTAS</Text>
          <TextInput
            placeholder="Notas del viaje..."
            placeholderTextColor={theme.textMuted}
            value={notas}
            onChangeText={setNotas}
            multiline
            textAlignVertical="top"
            style={[styles.inlineInput, styles.notesInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <PrimaryButton title="Guardar cambios" variant="blue" loading={saving} onPress={onSave} />
      </View>

      <Modal
        visible={estadoMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEstadoMenuOpen(false);
          setEstadoMenuRect(null);
        }}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            style={[styles.menuBackdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={() => {
              setEstadoMenuOpen(false);
              setEstadoMenuRect(null);
            }}
          />
          {estadoMenuRect ? (
            <View
              style={[
                styles.menuDropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                {
                  left: estadoMenuRect.x,
                  top: estadoMenuRect.y + estadoMenuRect.height + 4,
                  width: estadoMenuRect.width,
                  maxHeight: dropdownMaxHeight(estadoMenuRect),
                },
              ]}
            >
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled bounces={false}>
                {VIAJE_ESTADOS.map((e, i) => (
                  <Pressable
                    key={e}
                    style={({ pressed }) => [
                      styles.menuRow,
                      i > 0 && styles.menuRowBorder,
                      i > 0 && { borderTopColor: theme.border },
                      pressed && { backgroundColor: theme.bg },
                    ]}
                    onPress={() => {
                      setEstado(e);
                      setEstadoMenuOpen(false);
                      setEstadoMenuRect(null);
                    }}
                  >
                    <Text style={[styles.menuRowText, { color: theme.text }]}>{e}</Text>
                    {estado === e ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={showDate}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDate(false);
          setDateMenuRect(null);
        }}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            style={[styles.menuBackdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={() => {
              setShowDate(false);
              setDateMenuRect(null);
            }}
          />
          {dateMenuRect ? (
            <View
              style={[
                styles.menuDropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                {
                  left: dateMenuRect.x,
                  top: dateMenuRect.y + dateMenuRect.height + 4,
                  width: dateMenuRect.width,
                  maxHeight: dropdownMaxHeight(dateMenuRect, 280),
                },
              ]}
            >
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : Platform.OS === 'android' ? 'calendar' : 'spinner'}
                {...(Platform.OS === 'ios' ? { themeVariant: darkMode ? 'dark' as const : 'light' as const } : {})}
                onChange={(_, selected) => {
                  if (selected) setDate(selected);
                }}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.dateDone,
                  { borderTopColor: theme.border },
                  pressed && { backgroundColor: theme.bg },
                ]}
                onPress={() => {
                  setShowDate(false);
                  setDateMenuRect(null);
                }}
              >
                <Text style={[styles.dateDoneText, { color: theme.primary }]}>Listo</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 18, paddingTop: 12 },
  bannerWrap: { marginBottom: 18 },
  banner: { height: 160, borderRadius: 12, overflow: 'hidden' },
  bannerImage: { borderRadius: 12 },
  bannerOverlay: {
    flex: 1,
    backgroundColor: light.overlayStrong,
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: light.onPrimaryMuted,
  },
  bannerInput: {
    marginTop: 6,
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.onPrimary,
    padding: 0,
  },
  bannerUnderline: {
    marginTop: 8,
    height: 1,
    backgroundColor: light.onPrimarySubtle,
    alignSelf: 'stretch',
  },
  fieldEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fieldEyebrowInCard: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  selectDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: light.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    opacity: 0.85,
  },
  selectOpen: { borderColor: light.primary },
  selectText: {
    fontSize: 16,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  card: {
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
    marginBottom: 12,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: light.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: light.surface,
  },
  inputIcon: { marginRight: 8 },
  iconInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: light.navy,
    paddingVertical: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: light.textMuted,
    marginRight: 6,
  },
  currencyInput: { paddingLeft: 0 },
  inlineInput: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: light.navy,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  notesInput: { minHeight: 96 },
  mapsButton: { marginTop: 10 },
  estimateGrid: { flexDirection: 'row', gap: 10 },
  estimateCol: { flex: 1 },
  estimateActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  secondaryAction: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: light.surface,
  },
  secondaryActionText: {
    color: light.primary,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: light.border,
    backgroundColor: light.surface,
  },
  menuOverlay: { flex: 1 },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: light.overlaySoft },
  menuDropdown: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: light.border },
  menuRowPressed: { backgroundColor: light.bg },
  menuRowText: {
    fontSize: 15,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  dateDone: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
  },
  dateDoneText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.primary,
  },
});

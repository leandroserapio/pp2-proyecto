import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { PrimaryButton } from '../../components/PrimaryButton';
import { crearViaje } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { parseAmountInput } from '../../gastos/format';
import { motoLabel } from '../../viajes/viajesLoader';
import { mergeViajeNotas } from '../../viajes/viajeNotas';
import { VIAJE_ESTADOS } from '../../viajes/viajeEstado';
import { formatDisplayDate } from '../../viajes/format';
import { parseIsoDate, toIsoLocal, VIAJE_BANNER_URI } from '../../viajes/viajeFormUtils';

type Nav = NativeStackNavigationProp<ViajesStackParamList, 'ViajesAdd'>;
type R = RouteProp<ViajesStackParamList, 'ViajesAdd'>;

export function ViajesAddScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const { motos, selectedMotoId } = useMoto();

  const defaultMotoId = useMemo(() => {
    if (route.params?.idMoto != null) return route.params.idMoto;
    if (selectedMotoId != null) return selectedMotoId;
    return motos[0]?.idMoto ?? null;
  }, [route.params?.idMoto, selectedMotoId, motos]);

  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState<string>('Programado');
  const [idMoto, setIdMoto] = useState<number | null>(null);
  const [salida, setSalida] = useState('');
  const [kmEst, setKmEst] = useState('');
  const [presupuestoStr, setPresupuestoStr] = useState('');
  const [notas, setNotas] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  const [estadoMenuOpen, setEstadoMenuOpen] = useState(false);
  const [estadoMenuRect, setEstadoMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const estadoSelectRef = useRef<View>(null);

  const [motoMenuOpen, setMotoMenuOpen] = useState(false);
  const [motoMenuRect, setMotoMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const motoSelectRef = useRef<View>(null);

  const [showDate, setShowDate] = useState(false);
  const [dateMenuRect, setDateMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const dateSelectRef = useRef<View>(null);

  useEffect(() => {
    if (defaultMotoId != null) setIdMoto((prev) => prev ?? defaultMotoId);
  }, [defaultMotoId]);

  const selectedMoto = motos.find((m) => m.idMoto === idMoto);

  const dropdownMaxHeight = (rect: { y: number; height: number } | null, cap = 220) => {
    if (!rect) return cap;
    return Math.min(cap, Math.max(120, Dimensions.get('window').height - (rect.y + rect.height) - 24));
  };

  const onSave = async () => {
    if (!idMoto) {
      Alert.alert('Falta la moto', 'Seleccioná una moto para el viaje.');
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

    setSaving(true);
    try {
      await crearViaje(idMoto, {
        destino: titulo.trim(),
        fechaSalida: toIsoLocal(date),
        kilometrosEstimados: km,
        presupuestoEstimado: presupuesto,
        notas: mergeViajeNotas(salida, notas),
        estado,
      });
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                placeholderTextColor="rgba(255,255,255,0.75)"
                value={titulo}
                onChangeText={setTitulo}
                style={styles.bannerInput}
              />
              <View style={styles.bannerUnderline} />
            </View>
          </ImageBackground>
        </View>

        <Text style={styles.fieldEyebrow}>ESTADO DE VIAJE</Text>
        <Pressable
          ref={estadoSelectRef}
          style={[styles.select, estadoMenuOpen && styles.selectOpen]}
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
          <Text style={styles.selectText}>{estado}</Text>
          <Ionicons name={estadoMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
        </Pressable>

        <Text style={styles.fieldEyebrow}>SELECCIONAR MOTO</Text>
        <Pressable
          ref={motoSelectRef}
          style={[styles.select, motoMenuOpen && styles.selectOpen]}
          onPress={() => {
            if (motoMenuOpen) {
              setMotoMenuOpen(false);
              setMotoMenuRect(null);
              return;
            }
            motoSelectRef.current?.measureInWindow((x, y, width, height) => {
              setMotoMenuRect({ x, y, width, height });
              setMotoMenuOpen(true);
            });
          }}
        >
          <Text style={styles.selectText}>{selectedMoto ? motoLabel(selectedMoto) : 'Seleccionar moto'}</Text>
          <Ionicons name={motoMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destinos</Text>
          <Text style={styles.fieldEyebrowInCard}>SALIDA</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="location-outline" size={20} color={light.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Ej: Córdoba"
              placeholderTextColor={light.textMuted}
              value={salida}
              onChangeText={setSalida}
              style={styles.iconInput}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles del Viaje</Text>

          <Text style={styles.fieldEyebrowInCard}>KILÓMETROS ESTIMADOS</Text>
          <TextInput
            placeholder="Km. 0.00"
            placeholderTextColor={light.textMuted}
            keyboardType="number-pad"
            value={kmEst}
            onChangeText={setKmEst}
            style={styles.inlineInput}
          />

          <Text style={styles.fieldEyebrowInCard}>FECHA DE SALIDA</Text>
          <Pressable
            ref={dateSelectRef}
            style={[styles.select, showDate && styles.selectOpen]}
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
            <Text style={styles.selectText}>{formatDisplayDate(toIsoLocal(date))}</Text>
            <Ionicons name={showDate ? 'chevron-up' : 'calendar-outline'} size={18} color={light.textMuted} />
          </Pressable>

          <Text style={styles.fieldEyebrowInCard}>PRESUPUESTO</Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={light.textMuted}
              keyboardType="decimal-pad"
              value={presupuestoStr}
              onChangeText={setPresupuestoStr}
              style={[styles.iconInput, styles.currencyInput]}
            />
          </View>

          <Text style={styles.fieldEyebrowInCard}>NOTAS</Text>
          <TextInput
            placeholder="Notas del viaje..."
            placeholderTextColor={light.textMuted}
            value={notas}
            onChangeText={setNotas}
            multiline
            textAlignVertical="top"
            style={[styles.inlineInput, styles.notesInput]}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PrimaryButton title="Agregar Viaje" variant="blue" loading={saving} onPress={onSave} />
      </View>

      <DropdownModal
        visible={estadoMenuOpen}
        rect={estadoMenuRect}
        maxHeight={dropdownMaxHeight(estadoMenuRect)}
        onClose={() => {
          setEstadoMenuOpen(false);
          setEstadoMenuRect(null);
        }}
      >
        {VIAJE_ESTADOS.map((e, i) => (
          <Pressable
            key={e}
            style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuRowBorder, pressed && styles.menuRowPressed]}
            onPress={() => {
              setEstado(e);
              setEstadoMenuOpen(false);
              setEstadoMenuRect(null);
            }}
          >
            <Text style={styles.menuRowText}>{e}</Text>
            {estado === e ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
          </Pressable>
        ))}
      </DropdownModal>

      <DropdownModal
        visible={motoMenuOpen}
        rect={motoMenuRect}
        maxHeight={dropdownMaxHeight(motoMenuRect)}
        onClose={() => {
          setMotoMenuOpen(false);
          setMotoMenuRect(null);
        }}
      >
        {motos.map((m, i) => (
          <Pressable
            key={m.idMoto}
            style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuRowBorder, pressed && styles.menuRowPressed]}
            onPress={() => {
              if (m.idMoto != null) setIdMoto(m.idMoto);
              setMotoMenuOpen(false);
              setMotoMenuRect(null);
            }}
          >
            <Text style={styles.menuRowText}>{motoLabel(m)}</Text>
            {idMoto === m.idMoto ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
          </Pressable>
        ))}
      </DropdownModal>

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
            style={styles.menuBackdrop}
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
                {...(Platform.OS === 'ios' ? { themeVariant: 'light' as const } : {})}
                onChange={(_, selected) => {
                  if (selected) setDate(selected);
                }}
              />
              <Pressable
                style={({ pressed }) => [styles.dateDone, pressed && styles.menuRowPressed]}
                onPress={() => {
                  setShowDate(false);
                  setDateMenuRect(null);
                }}
              >
                <Text style={styles.dateDoneText}>Listo</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function DropdownModal({
  visible,
  rect,
  maxHeight,
  onClose,
  children,
}: {
  visible: boolean;
  rect: { x: number; y: number; width: number; height: number } | null;
  maxHeight: number;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <Pressable style={styles.menuBackdrop} onPress={onClose} />
        {rect ? (
          <View
            style={[
              styles.menuDropdown,
              { left: rect.x, top: rect.y + rect.height + 4, width: rect.width, maxHeight },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled bounces={false}>
              {children}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  bannerInput: {
    marginTop: 6,
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: '#fff',
    padding: 0,
  },
  bannerUnderline: {
    marginTop: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
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
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: light.border,
    backgroundColor: light.surface,
  },
  menuOverlay: { flex: 1 },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.25)' },
  menuDropdown: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
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

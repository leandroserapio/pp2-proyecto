import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { GastosStackParamList } from '../../navigation/types';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { editarGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';
import { mergeGastoDescripcion, splitGastoDescripcion } from '../../gastos/gastoKm';
import { formatDisplayDate, parseAmountInput } from '../../gastos/format';
import { motoLabel } from '../../gastos/gastosLoader';

type Nav = NativeStackNavigationProp<GastosStackParamList, 'GastosEdit'>;
type R = RouteProp<GastosStackParamList, 'GastosEdit'>;

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(iso: string): Date {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-');
  const year = y ? Number(y) : new Date().getFullYear();
  const month = m ? Number(m) - 1 : new Date().getMonth();
  const day = d ? Number(d) : new Date().getDate();
  return new Date(year, month, day);
}

export function GastosEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { motos } = useMoto();
  const { darkMode, theme } = useAppSettings();
  const { item } = route.params;

  const { descripcion: existingDesc, kilometraje: existingKm } = splitGastoDescripcion(item.descripcion ?? '');

  const defaultMotoId = useMemo(() => {
    return item.idMoto ?? null;
  }, [item.idMoto]);

  const [tipo, setTipo] = useState(item.tipo ?? '');
  const [montoStr, setMontoStr] = useState(typeof item.monto === 'number' ? String(item.monto) : String(item.monto ?? ''));
  const [idMoto, setIdMoto] = useState<number | null>(defaultMotoId);
  const [descripcion, setDescripcion] = useState(existingDesc);
  const [kilometraje, setKilometraje] = useState(existingKm);
  const [date, setDate] = useState(() => parseDate(item.fecha));
  const [showDate, setShowDate] = useState(false);
  const [dateMenuRect, setDateMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const dateSelectWrapRef = useRef<View>(null);
  const [motoMenuOpen, setMotoMenuOpen] = useState(false);
  const [motoMenuRect, setMotoMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const motoSelectWrapRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultMotoId != null) {
      setIdMoto((prev) => prev ?? defaultMotoId);
    }
  }, [defaultMotoId]);

  const selectedMoto = motos.find((m) => m.idMoto === idMoto);

  const motoMenuMaxHeight = useMemo(() => {
    if (!motoMenuRect) return 280;
    return Math.min(
      280,
      Math.max(160, Dimensions.get('window').height - (motoMenuRect.y + motoMenuRect.height) - 24),
    );
  }, [motoMenuRect]);

  const onSave = async () => {
    if (!idMoto) {
      Alert.alert('Falta la moto', 'No hay moto seleccionada.');
      return;
    }
    if (!item.idGasto) {
      Alert.alert('Error', 'No se pudo identificar el gasto a editar.');
      return;
    }
    const monto = parseAmountInput(montoStr);
    if (!tipo.trim()) {
      Alert.alert('Datos incompletos', 'El tipo de gasto es obligatorio.');
      return;
    }
    if (monto == null || monto <= 0) {
      Alert.alert('Datos incompletos', 'Ingresá un monto válido.');
      return;
    }
    setSaving(true);
    try {
      await editarGasto(item.idGasto, {
        tipo: tipo.trim(),
        descripcion: mergeGastoDescripcion(kilometraje, descripcion),
        monto,
        fecha: toIsoLocal(date),
      });
      navigation.navigate('GastosHome');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppTextInput
            label="Tipo de gasto"
            variant="light"
            placeholder="Ej: Seguro Mensual"
            value={tipo}
            onChangeText={setTipo}
          />

          <Text style={[styles.label, { color: theme.text }]}>Monto</Text>
          <View style={styles.montoRow}>
            <Text style={[styles.montoPrefix, { color: theme.textMuted }]}>$</Text>
            <View style={styles.montoInputWrap}>
              <TextInput
                placeholder="0,00"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={montoStr}
                onChangeText={setMontoStr}
                multiline={false}
                numberOfLines={1}
                style={[
                  styles.montoInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Moto</Text>
          <Pressable
            ref={motoSelectWrapRef}
            style={[
              styles.select,
              {
                backgroundColor: theme.surface,
                borderColor: motoMenuOpen ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              if (motoMenuOpen) {
                setMotoMenuOpen(false);
                setMotoMenuRect(null);
                return;
              }
              motoSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
                setMotoMenuRect({ x, y, width, height });
                setMotoMenuOpen(true);
              });
            }}
          >
            <Text style={[styles.selectText, { color: theme.text }]}>{selectedMoto ? motoLabel(selectedMoto) : 'Seleccionar moto'}</Text>
            <Ionicons name={motoMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
          </Pressable>

          <AppTextInput
            label="Descripción (Opcional)"
            variant="light"
            placeholder="Ej: Nafta Shell"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={[styles.label, { color: theme.text }]}>Kilometraje</Text>
          <TextInput
            placeholder="0.00 Km."
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
            value={kilometraje}
            onChangeText={setKilometraje}
            style={[
              styles.inlineInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />

          <Text style={[styles.label, { color: theme.text }]}>Fecha</Text>
          <Pressable
            ref={dateSelectWrapRef}
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
              dateSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
                setDateMenuRect({ x, y, width, height });
                setShowDate(true);
              });
            }}
          >
            <Text style={[styles.selectText, { color: theme.text }]}>{formatDisplayDate(toIsoLocal(date))}</Text>
            <Ionicons name={showDate ? 'chevron-up' : 'calendar-outline'} size={18} color={theme.textMuted} />
          </Pressable>
        </View>

        <PrimaryButton title="Actualizar" variant="blue" loading={saving} onPress={onSave} style={styles.save} />
      </ScrollView>

      <Modal
        visible={motoMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMotoMenuOpen(false);
          setMotoMenuRect(null);
        }}
      >
        <View style={styles.motoMenuOverlay}>
          <Pressable
            style={[styles.motoMenuBackdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={() => {
              setMotoMenuOpen(false);
              setMotoMenuRect(null);
            }}
          />
          {motoMenuRect ? (
            <View
              style={[
                styles.motoMenuDropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                {
                  left: motoMenuRect.x,
                  top: motoMenuRect.y + motoMenuRect.height + 4,
                  width: motoMenuRect.width,
                  maxHeight: motoMenuMaxHeight,
                },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={[styles.motoMenuScroll, { maxHeight: motoMenuMaxHeight }]}
                bounces={false}
              >
                {motos.map((m, i) => (
                  <Pressable
                    key={m.idMoto}
                    style={({ pressed }) => [
                      styles.motoMenuRow,
                      i > 0 && styles.motoMenuRowBorder,
                      i > 0 && { borderTopColor: theme.border },
                      pressed && { backgroundColor: theme.bg },
                    ]}
                    onPress={() => {
                      if (m.idMoto != null) setIdMoto(m.idMoto);
                      setMotoMenuOpen(false);
                      setMotoMenuRect(null);
                    }}
                  >
                    <Text style={[styles.motoMenuRowText, { color: theme.text }]}>{motoLabel(m)}</Text>
                    {idMoto === m.idMoto ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
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
        <View style={styles.dateMenuOverlay}>
          <Pressable
            style={[styles.dateMenuBackdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={() => {
              setShowDate(false);
              setDateMenuRect(null);
            }}
          />
          {dateMenuRect ? (
            <View
              style={[
                styles.dateMenuDropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                {
                  left: dateMenuRect.x,
                  top: dateMenuRect.y + dateMenuRect.height + 4,
                  width: dateMenuRect.width,
                  maxHeight: Math.max(
                    200,
                    Dimensions.get('window').height - (dateMenuRect.y + dateMenuRect.height) - 24,
                  ),
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
                  styles.dateMenuDone,
                  {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                  },
                  pressed && { backgroundColor: theme.bg },
                ]}
                onPress={() => {
                  setShowDate(false);
                  setDateMenuRect(null);
                }}
              >
                <Text style={[styles.dateMenuDoneText, { color: theme.primary }]}>Listo</Text>
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
  scroll: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.navy,
    marginBottom: 8,
    marginTop: 4,
  },
  montoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    minHeight: 56,
  },
  montoPrefix: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.textMuted,
    paddingBottom: 4,
    marginRight: 8,
  },
  montoInputWrap: {
    flex: 1,
    minWidth: 0,
    height: 56,
    justifyContent: 'center',
  },
  montoInput: {
    width: '100%',
    height: 56,
    fontSize: 24,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.navy,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 0 : 14,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : {}),
  },
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
    marginBottom: 14,
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
    marginBottom: 14,
  },
  selectMenuOpen: {
    borderColor: light.primary,
  },
  selectText: {
    fontSize: 16,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  save: { marginTop: 8 },
  motoMenuOverlay: { flex: 1 },
  motoMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: light.overlaySoft,
  },
  motoMenuDropdown: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    maxHeight: 280,
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
  motoMenuScroll: { flexGrow: 0 },
  motoMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  motoMenuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
  },
  motoMenuRowPressed: { backgroundColor: light.bg },
  motoMenuRowText: {
    fontSize: 15,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  dateMenuOverlay: { flex: 1 },
  dateMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: light.overlaySoft,
  },
  dateMenuDropdown: {
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
  dateMenuDone: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
    backgroundColor: light.surface,
  },
  dateMenuDonePressed: { backgroundColor: light.bg },
  dateMenuDoneText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.primary,
  },
});

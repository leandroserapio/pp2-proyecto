import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { crearGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';
import { mergeGastoDescripcion } from '../../gastos/gastoKm';
import { formatDisplayDate, parseAmountInput } from '../../gastos/format';
import { motoLabel } from '../../gastos/gastosLoader';

type Nav = NativeStackNavigationProp<GastosStackParamList, 'GastosAdd'>;
type R = RouteProp<GastosStackParamList, 'GastosAdd'>;

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function GastosAddScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { motos, selectedMotoId } = useMoto();

  const defaultMotoId = useMemo(() => {
    const fromRoute = route.params?.idMoto;
    if (fromRoute != null) return fromRoute;
    if (selectedMotoId != null) return selectedMotoId;
    return motos[0]?.idMoto ?? null;
  }, [route.params?.idMoto, selectedMotoId, motos]);

  const [tipo, setTipo] = useState('');
  const [montoStr, setMontoStr] = useState('');
  const [idMoto, setIdMoto] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [showDate, setShowDate] = useState(false);
  const [motoModal, setMotoModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (route.params?.idMoto != null) {
      setIdMoto(route.params.idMoto);
      return;
    }
    if (defaultMotoId != null) {
      setIdMoto((prev) => prev ?? defaultMotoId);
    }
  }, [route.params?.idMoto, defaultMotoId]);

  const selectedMoto = motos.find((m) => m.idMoto === idMoto);

  const onSave = async () => {
    if (!idMoto) {
      Alert.alert('Falta la moto', 'No hay moto seleccionada.');
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
      await crearGasto(idMoto, {
        tipo: tipo.trim(),
        descripcion: mergeGastoDescripcion(kilometraje, descripcion),
        monto,
        fecha: toIsoLocal(date),
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <AppTextInput
            label="Tipo de gasto"
            variant="light"
            placeholder="Ej: Seguro Mensual"
            value={tipo}
            onChangeText={setTipo}
          />

          <Text style={styles.label}>Monto</Text>
          <View style={styles.montoRow}>
            <Text style={styles.montoPrefix}>$</Text>
            <TextInput
              placeholder="0,00"
              placeholderTextColor={light.textMuted}
              keyboardType="decimal-pad"
              value={montoStr}
              onChangeText={setMontoStr}
              style={styles.montoInput}
            />
          </View>

          <Text style={styles.label}>Moto</Text>
          <Pressable style={styles.select} onPress={() => setMotoModal(true)}>
            <Text style={styles.selectText}>{selectedMoto ? motoLabel(selectedMoto) : 'Seleccionar moto'}</Text>
            <Ionicons name="chevron-down" size={18} color={light.textMuted} />
          </Pressable>

          <AppTextInput
            label="Descripción (Opcional)"
            variant="light"
            placeholder="Ej: Nafta Shell"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.label}>Kilometraje</Text>
          <TextInput
            placeholder="0.00 Km."
            placeholderTextColor={light.textMuted}
            keyboardType="decimal-pad"
            value={kilometraje}
            onChangeText={setKilometraje}
            style={styles.inlineInput}
          />

          <Text style={styles.label}>Fecha</Text>
          <Pressable style={styles.select} onPress={() => setShowDate(true)}>
            <Text style={styles.selectText}>{formatDisplayDate(toIsoLocal(date))}</Text>
            <Ionicons name="calendar-outline" size={18} color={light.textMuted} />
          </Pressable>
        </View>

        {showDate ? (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(ev, selected) => {
              if (Platform.OS === 'android') setShowDate(false);
              if (ev.type === 'dismissed' && Platform.OS === 'android') return;
              if (selected) {
                setDate(selected);
                setShowDate(false);
              }
            }}
          />
        ) : null}

        <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onSave} style={styles.save} />
      </ScrollView>

      <Modal visible={motoModal} transparent animationType="fade" onRequestClose={() => setMotoModal(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMotoModal(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Seleccionar moto</Text>
            {motos.map((m) => (
              <Pressable
                key={m.idMoto}
                style={styles.modalRow}
                onPress={() => {
                  if (m.idMoto != null) setIdMoto(m.idMoto);
                  setMotoModal(false);
                }}
              >
                <Text style={styles.modalRowText}>{motoLabel(m)}</Text>
                {idMoto === m.idMoto ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
              </Pressable>
            ))}
          </View>
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
    gap: 8,
    marginBottom: 14,
  },
  montoPrefix: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.textMuted,
    paddingBottom: 4,
  },
  montoInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.navy,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 56,
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
  selectText: {
    fontSize: 16,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  save: { marginTop: 8 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  modalSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: light.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: light.border,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
    padding: 10,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: light.border,
  },
  modalRowText: {
    fontSize: 15,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
});

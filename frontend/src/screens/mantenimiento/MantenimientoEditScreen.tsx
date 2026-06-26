import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { editarMantenimiento } from '../../api/mantenimientos';
import { ApiError } from '../../api/client';
import { AppTextInput } from '../../components/AppTextInput';
import { DatePickerField, parseIsoDate, toIsoLocal } from '../../components/DatePickerField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import { motoLabel } from '../../gastos/gastosLoader';
import type { MantenimientoStackParamList } from '../../navigation/types';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';
import {
  FORM_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsivePadding,
} from '../../theme/responsive';

type Nav = NativeStackNavigationProp<MantenimientoStackParamList, 'MantenimientoEdit'>;
type R = RouteProp<MantenimientoStackParamList, 'MantenimientoEdit'>;

export function MantenimientoEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { motos } = useMoto();
  const { theme } = useAppSettings();
  const { item } = route.params;
  const { width } = useWindowDimensions();
  const contentFrame = getCenteredContentStyle(width, FORM_MAX_WIDTH);
  const pagePadding = getResponsivePadding(width);

  const [tipo, setTipo] = useState(item.tipo ?? '');
  const [descripcion, setDescripcion] = useState(item.descripcion ?? '');
  const [fecha, setFecha] = useState(() => parseIsoDate(item.fecha));
  const [km, setKm] = useState(item.kilometraje ? String(item.kilometraje) : '');
  const [costo, setCosto] = useState(item.costo ? String(item.costo) : '');
  const [saving, setSaving] = useState(false);

  const motoDisplay = useMemo(() => {
    const moto = motos.find((m) => m.idMoto === item.idMoto);
    return moto ? motoLabel(moto) : 'Moto';
  }, [item.idMoto, motos]);

  const onSave = async () => {
    if (!item.idMantenimiento) {
      Alert.alert('Error', 'No se pudo identificar el mantenimiento a editar.');
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
      await editarMantenimiento(item.idMantenimiento, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        fecha: toIsoLocal(fecha),
        kilometraje: parsedKm,
        costo: parsedCosto,
      });
      navigation.navigate('MantenimientoHome');
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
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          contentFrame,
          { paddingHorizontal: pagePadding },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppTextInput
            label="Tipo *"
            variant="light"
            placeholder="Ej: Aceite, Service, Frenos"
            value={tipo}
            onChangeText={setTipo}
          />

          <Text style={[styles.label, { color: theme.text }]}>Moto</Text>
          <View style={[styles.motoReadonly, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[styles.motoReadonlyText, { color: theme.text }]} numberOfLines={1}>
              {motoDisplay}
            </Text>
          </View>

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

          <Text style={[styles.label, { color: theme.text }]}>Costo</Text>
          <View style={[styles.costoRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.costoPrefixText, { color: theme.textMuted }]}>$</Text>
            <TextInput
              style={[styles.costoTextInput, { color: theme.text }]}
              placeholder="15.000,00"
              keyboardType="decimal-pad"
              value={costo}
              onChangeText={setCosto}
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.infoBoxText, { color: theme.primary }]}>Se registrará un gasto también</Text>
          </View>
        </View>

        <PrimaryButton title="Actualizar" variant="blue" loading={saving} onPress={onSave} style={styles.save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg },
  scroll: { paddingTop: 18, paddingBottom: 56 },
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
    color: light.text,
    marginBottom: 8,
    marginTop: 4,
  },
  motoReadonly: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    opacity: 0.85,
  },
  motoReadonlyText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.text,
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
  costoPrefixText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: light.textMuted,
    marginRight: 8,
  },
  costoTextInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: light.text,
    padding: 0,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  infoBoxText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    flex: 1,
  },
  save: { marginTop: 8 },
});

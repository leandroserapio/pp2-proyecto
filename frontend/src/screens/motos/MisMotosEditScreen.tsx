import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { editarMoto } from '../../api/motos';
import { ApiError } from '../../api/client';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import type { MotosStackParamList } from '../../navigation/types';
import { light } from '../../theme/mototrackerLight';
import {
  FORM_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsivePadding,
} from '../../theme/responsive';

type Nav = NativeStackNavigationProp<MotosStackParamList, 'MisMotosEdit'>;
type R = RouteProp<MotosStackParamList, 'MisMotosEdit'>;

export function MisMotosEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { motos, refreshMotos } = useMoto();
  const { theme } = useAppSettings();
  const contentFrame = getCenteredContentStyle(width, FORM_MAX_WIDTH);
  const pagePadding = getResponsivePadding(width);

  const moto = useMemo(
    () => motos.find((m) => m.idMoto === route.params.idMoto) ?? null,
    [motos, route.params.idMoto],
  );

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [patente, setPatente] = useState('');
  const [km, setKm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!moto) return;
    setMarca(moto.marca ?? '');
    setModelo(moto.modelo ?? '');
    setAnio(moto.anio != null ? String(moto.anio) : '');
    setPatente(moto.patente ?? '');
    setKm(moto.kilometrajeActual != null ? String(moto.kilometrajeActual) : '0');
  }, [moto]);

  const onSave = async () => {
    if (!moto?.idMoto) {
      Alert.alert('Error', 'No se pudo identificar la moto.');
      return;
    }

    const parsedAnio = anio.trim() ? Number(anio) : undefined;
    const parsedKm = km.trim() ? Number(km.replace(/\D/g, '')) : 0;

    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Datos incompletos', 'Marca y modelo son obligatorios.');
      return;
    }
    if (
      parsedAnio != null &&
      (!Number.isInteger(parsedAnio) || parsedAnio < 1900 || parsedAnio > new Date().getFullYear() + 1)
    ) {
      Alert.alert('Dato inválido', 'Ingresá un año de moto válido.');
      return;
    }
    if (!Number.isFinite(parsedKm) || parsedKm < 0) {
      Alert.alert('Dato inválido', 'El kilometraje no puede ser negativo.');
      return;
    }

    setSaving(true);
    try {
      await editarMoto(moto.idMoto, {
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: parsedAnio,
        patente: patente.trim() || undefined,
        kilometrajeActual: parsedKm,
      });
      await refreshMotos();
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar la moto';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (!moto) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg, paddingBottom: insets.bottom }]}>
        <PrimaryButton title="Volver" variant="blue" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          contentFrame,
          {
            paddingHorizontal: pagePadding,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppTextInput
            label="Marca *"
            variant="light"
            placeholder="Ej: Honda"
            value={marca}
            onChangeText={setMarca}
          />
          <AppTextInput
            label="Modelo *"
            variant="light"
            placeholder="Ej: Wave 110"
            value={modelo}
            onChangeText={setModelo}
          />
          <AppTextInput
            label="Año"
            variant="light"
            placeholder="Ej: 2023"
            keyboardType="number-pad"
            value={anio}
            onChangeText={setAnio}
          />
          <AppTextInput
            label="Patente"
            variant="light"
            placeholder="Ej: A123BCD"
            value={patente}
            onChangeText={setPatente}
            autoCapitalize="characters"
          />
          <AppTextInput
            label="Kilometraje actual"
            variant="light"
            placeholder="0"
            keyboardType="number-pad"
            value={km}
            onChangeText={setKm}
          />
          <PrimaryButton
            title="Guardar cambios"
            variant="blue"
            loading={saving}
            onPress={onSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: light.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
    paddingTop: 16,
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  saveButton: {
    marginTop: 4,
  },
});

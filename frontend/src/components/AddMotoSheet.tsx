import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMoto } from '../context/MotoContext';
import { crearMoto } from '../api/motos';
import { ApiError } from '../api/client';
import { BottomSheet, type BottomSheetRef } from './BottomSheet';
import { AppTextInput } from './AppTextInput';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddMotoSheet({ visible, onClose }: Props) {
  const { user } = useAuth();
  const { refreshMotos } = useMoto();
  const sheetRef = useRef<BottomSheetRef>(null);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [patente, setPatente] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setMarca('');
    setModelo('');
    setAnio('');
    setPatente('');
    setKmInicial('');
  };

  const handleClosed = () => {
    resetForm();
    onClose();
  };

  const onSave = async () => {
    if (!user) return;
    const parsedAnio = anio ? Number(anio) : undefined;
    const parsedKm = kmInicial ? Number(kmInicial) : 0;

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
      await crearMoto(user.idUsuario, {
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: parsedAnio,
        patente: patente.trim() || undefined,
        kilometrajeActual: parsedKm,
      });
      await refreshMotos();
      sheetRef.current?.close();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo agregar la moto';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet ref={sheetRef} visible={visible} title="Agregar moto" onClose={handleClosed}>
      <AppTextInput label="Marca *" variant="light" placeholder="Ej: Honda" value={marca} onChangeText={setMarca} />
      <AppTextInput label="Modelo *" variant="light" placeholder="Ej: Wave 110" value={modelo} onChangeText={setModelo} />
      <AppTextInput label="Año" variant="light" placeholder="Ej: 2023" keyboardType="number-pad" value={anio} onChangeText={setAnio} />
      <AppTextInput label="Patente" variant="light" placeholder="Ej: A123BCD" value={patente} onChangeText={setPatente} />
      <AppTextInput
        label="Kilometraje actual"
        variant="light"
        placeholder="0"
        keyboardType="number-pad"
        value={kmInicial}
        onChangeText={setKmInicial}
      />
      <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onSave} style={{ marginTop: 4 }} />
    </BottomSheet>
  );
}

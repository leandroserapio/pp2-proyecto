import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import { useAuth } from '../../context/AuthContext';
import { useMoto } from '../../context/MotoContext';
import { crearMoto } from '../../api/motos';
import { AppHeader } from '../../components/AppHeader';
import { BottomSheet, type BottomSheetRef } from '../../components/BottomSheet';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';
import { useAppSettings } from '../../context/AppSettingsContext';
import type { MainTabParamList } from '../../navigation/types';
import type { Moto } from '../../types/models';

type GarageRoute = RouteProp<MainTabParamList, 'Garage'>;

export function GarageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<GarageRoute>();
  const { user } = useAuth();
  const { theme } = useAppSettings();
  const { motos, selectedMotoId, loading, refreshMotos, setSelectedMotoId, eliminarMoto } = useMoto();
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [patente, setPatente] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [saving, setSaving] = useState(false);
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (route.params?.openAdd) {
      setAddOpen(true);
      navigation.setParams({ openAdd: false });
    }
  }, [navigation, route.params?.openAdd]);

  useEffect(() => {
    navigation.setParams({ hideTabBar: addOpen });
    return () => {
      navigation.setParams({ hideTabBar: false });
    };
  }, [addOpen, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMotos();
    setRefreshing(false);
  }, [refreshMotos]);

  const resetForm = () => {
    setMarca('');
    setModelo('');
    setAnio('');
    setPatente('');
    setKmInicial('');
  };

  const openAddMotoSheet = () => {
    resetForm();
    setAddOpen(true);
  };

  const handleSheetClosed = () => {
    setAddOpen(false);
    resetForm();
  };

  const onAddMoto = async () => {
    if (!user) return;
    const parsedAnio = anio ? Number(anio) : undefined;
    const parsedKm = kmInicial ? Number(kmInicial) : 0;

    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Datos incompletos', 'Marca y modelo son obligatorios.');
      return;
    }
    if (parsedAnio != null && (!Number.isInteger(parsedAnio) || parsedAnio < 1900 || parsedAnio > new Date().getFullYear() + 1)) {
      Alert.alert('Dato invalido', 'Ingresa un anio de moto valido.');
      return;
    }
    if (!Number.isFinite(parsedKm) || parsedKm < 0) {
      Alert.alert('Dato invalido', 'El kilometraje no puede ser negativo.');
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

  const confirmDelete = (m: Moto) => {
    Alert.alert(
      'Eliminar moto',
      `Seguro que queres eliminar ${m.marca} ${m.modelo}? Se borran tambien sus gastos, mantenimientos y viajes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (m.idMoto != null) {
              try {
                await eliminarMoto(m.idMoto);
              } catch (e) {
                const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
                Alert.alert('Error', msg);
              }
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <AppHeader />

      {motos.length === 0 && !loading ? (
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <ScreenSectionHeader
            title="Mis motos"
            subtitle="Registrá, seleccioná y administrá tus motos."
            action={
              <Pressable
                accessibilityRole="button"
                style={[styles.addMotoButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={openAddMotoSheet}
              >
                <Ionicons name="add-circle" size={24} color={theme.primary} />
                <Text style={[styles.addMotoText, { color: theme.primary }]}>Agregar moto</Text>
              </Pressable>
            }
          />
          <View style={styles.emptyWrap}>
            <Ionicons name="bicycle-outline" size={64} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No tenes motos registradas</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Agrega tu primera moto para empezar a registrar gastos y mas.</Text>
            <PrimaryButton title="Agregar moto" variant="blue" onPress={openAddMotoSheet} style={styles.emptyBtn} />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={motos}
          keyExtractor={(m) => String(m.idMoto)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <ScreenSectionHeader
              title="Mis motos"
              subtitle="Registrá, seleccioná y administrá tus motos."
              action={
                <Pressable
                  accessibilityRole="button"
                  style={[styles.addMotoButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={openAddMotoSheet}
                >
                  <Ionicons name="add-circle" size={24} color={theme.primary} />
                  <Text style={[styles.addMotoText, { color: theme.primary }]}>Agregar moto</Text>
                </Pressable>
              }
            />
          }
          renderItem={({ item }) => {
            const isSelected = item.idMoto === selectedMotoId;
            return (
              <Pressable
                style={[
                  styles.motoCard,
                  {
                    backgroundColor: isSelected ? theme.primarySoft : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => item.idMoto != null && setSelectedMotoId(item.idMoto)}
                onLongPress={() => confirmDelete(item)}
              >
                <View style={styles.motoCardHeader}>
                  <View style={styles.motoTitleWrap}>
                    <Text style={[styles.motoCardTitle, { color: theme.text }]}>{item.marca} {item.modelo}</Text>
                    <Text style={[styles.motoCardSub, { color: theme.textMuted }]}>
                      {[item.anio, item.patente].filter(Boolean).join(' - ') || 'Sin patente cargada'}
                    </Text>
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={24} color={theme.primary} /> : null}
                </View>

                <View style={styles.motoInfoGrid}>
                  <View style={[styles.infoPill, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>KILOMETRAJE</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{item.kilometrajeActual ?? 0} km</Text>
                  </View>
                  <View style={[styles.infoPill, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>ESTADO</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{isSelected ? 'Seleccionada' : 'Disponible'}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <BottomSheet
        ref={sheetRef}
        visible={addOpen}
        title="Agregar moto"
        onClose={handleSheetClosed}
      >
        <AppTextInput label="Marca *" variant="light" placeholder="Ej: Honda" value={marca} onChangeText={setMarca} />
        <AppTextInput label="Modelo *" variant="light" placeholder="Ej: Wave 110" value={modelo} onChangeText={setModelo} />
        <AppTextInput label="Anio" variant="light" placeholder="Ej: 2023" keyboardType="number-pad" value={anio} onChangeText={setAnio} />
        <AppTextInput label="Patente" variant="light" placeholder="Ej: A123BCD" value={patente} onChangeText={setPatente} />
        <AppTextInput label="Kilometraje actual" variant="light" placeholder="0" keyboardType="number-pad" value={kmInicial} onChangeText={setKmInicial} />
        <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onAddMoto} style={styles.saveBtn} />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  addMotoButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.surface,
  },
  addMotoText: { color: light.primary, fontSize: 13, fontFamily: fontFamily.bold, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyScroll: { flexGrow: 1 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, fontFamily: fontFamily.regular, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 18, alignSelf: 'stretch' },
  list: { paddingBottom: 30 },
  motoCard: {
    marginHorizontal: 18,
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: light.border,
  },
  motoCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  motoTitleWrap: { flex: 1 },
  motoCardTitle: { fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text },
  motoCardSub: { fontSize: 13, fontFamily: fontFamily.regular, color: light.textMuted, marginTop: 4 },
  motoInfoGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  infoPill: { flex: 1, backgroundColor: light.bg, borderRadius: 10, padding: 10 },
  infoLabel: { fontSize: 10, fontFamily: fontFamily.bold, fontWeight: '700', color: light.textMuted },
  infoValue: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.bold, fontWeight: '700', color: light.navy },
  saveBtn: { marginTop: 4 },
});

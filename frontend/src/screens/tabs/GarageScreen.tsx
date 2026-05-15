import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { useAuth } from '../../context/AuthContext';
import { useMoto } from '../../context/MotoContext';
import { crearMoto, sumarKilometros } from '../../api/motos';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';
import type { Moto } from '../../types/models';

export function GarageScreen() {
  const { user, logout } = useAuth();
  const { motos, selectedMotoId, selectedMoto, loading, refreshMotos, setSelectedMotoId, eliminarMoto } = useMoto();
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [kmOpen, setKmOpen] = useState(false);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [patente, setPatente] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [saving, setSaving] = useState(false);

  const [kmAdd, setKmAdd] = useState('');
  const [savingKm, setSavingKm] = useState(false);

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

  const onAddMoto = async () => {
    if (!user) return;
    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Datos incompletos', 'Marca y modelo son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await crearMoto(user.idUsuario, {
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: anio ? Number(anio) : undefined,
        patente: patente.trim() || undefined,
        kilometrajeActual: kmInicial ? Number(kmInicial) : 0,
      });
      resetForm();
      setAddOpen(false);
      await refreshMotos();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo agregar la moto';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const onSumarKm = async () => {
    if (!selectedMotoId) return;
    const n = Number(kmAdd);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Valor inválido', 'Ingresá un número mayor a 0.');
      return;
    }
    setSavingKm(true);
    try {
      await sumarKilometros(selectedMotoId, n);
      setKmAdd('');
      setKmOpen(false);
      await refreshMotos();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudieron sumar km';
      Alert.alert('Error', msg);
    } finally {
      setSavingKm(false);
    }
  };

  const confirmDelete = (m: Moto) => {
    Alert.alert(
      'Eliminar moto',
      `¿Seguro que querés eliminar ${m.marca} ${m.modelo}? Se borran también sus gastos, mantenimientos y viajes.`,
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

  const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.brand}>MotoTracker</Text>
            <Text style={styles.welcome}>Hola, {user?.nombre ?? 'usuario'}</Text>
          </View>
        </View>
        <Pressable onPress={logout} hitSlop={10}>
          <Ionicons name="log-out-outline" size={24} color={light.textMuted} />
        </Pressable>
      </View>

      {selectedMoto ? (
        <View style={styles.motoCard}>
          <View style={styles.motoCardHeader}>
            <Text style={styles.motoCardTitle}>{selectedMoto.marca} {selectedMoto.modelo}</Text>
            {selectedMoto.anio ? <Text style={styles.motoCardAnio}>{selectedMoto.anio}</Text> : null}
          </View>
          {selectedMoto.patente ? (
            <Text style={styles.motoCardInfo}>Patente: {selectedMoto.patente}</Text>
          ) : null}
          <View style={styles.kmRow}>
            <View>
              <Text style={styles.kmLabel}>KILOMETRAJE</Text>
              <Text style={styles.kmValue}>{selectedMoto.kilometrajeActual ?? 0} km</Text>
            </View>
            <Pressable style={styles.kmBtn} onPress={() => setKmOpen(true)}>
              <Ionicons name="add" size={18} color="#fff" style={styles.kmBtnIcon} />
              <Text style={styles.kmBtnText}>Sumar km</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis motos</Text>
        <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Ionicons name="add-circle" size={26} color={light.primary} />
        </Pressable>
      </View>

      {motos.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="bicycle-outline" size={64} color={light.border} />
          <Text style={styles.emptyTitle}>No tenés motos registradas</Text>
          <Text style={styles.emptySub}>Agregá tu primera moto para empezar a registrar gastos y más.</Text>
          <PrimaryButton title="Agregar moto" variant="blue" onPress={() => setAddOpen(true)} style={styles.emptyBtn} />
        </View>
      ) : (
        <FlatList
          data={motos}
          keyExtractor={(m) => String(m.idMoto)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.idMoto === selectedMotoId;
            return (
              <Pressable
                style={[styles.motoRow, isSelected && styles.motoRowSelected]}
                onPress={() => item.idMoto != null && setSelectedMotoId(item.idMoto)}
                onLongPress={() => confirmDelete(item)}
              >
                <View style={styles.motoRowLeft}>
                  <View style={[styles.dot, isSelected && styles.dotActive]} />
                  <View>
                    <Text style={styles.motoRowTitle}>{item.marca} {item.modelo}</Text>
                    <Text style={styles.motoRowSub}>{item.kilometrajeActual ?? 0} km</Text>
                  </View>
                </View>
                {isSelected ? <Ionicons name="checkmark-circle" size={22} color={light.primary} /> : null}
              </Pressable>
            );
          }}
        />
      )}

      {/* Modal agregar moto */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setAddOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Agregar moto</Text>
            <AppTextInput label="Marca *" variant="light" placeholder="Ej: Honda" value={marca} onChangeText={setMarca} />
            <AppTextInput label="Modelo *" variant="light" placeholder="Ej: Wave 110" value={modelo} onChangeText={setModelo} />
            <AppTextInput label="Año" variant="light" placeholder="Ej: 2023" keyboardType="number-pad" value={anio} onChangeText={setAnio} />
            <AppTextInput label="Patente" variant="light" placeholder="Ej: A123BCD" value={patente} onChangeText={setPatente} />
            <AppTextInput label="Kilometraje actual" variant="light" placeholder="0" keyboardType="number-pad" value={kmInicial} onChangeText={setKmInicial} />
            <PrimaryButton title="Guardar" variant="blue" loading={saving} onPress={onAddMoto} style={styles.saveBtn} />
          </View>
        </View>
      </Modal>

      {/* Modal sumar km */}
      <Modal visible={kmOpen} transparent animationType="fade" onRequestClose={() => setKmOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setKmOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Sumar kilómetros</Text>
            <AppTextInput label="Kilómetros recorridos" variant="light" placeholder="Ej: 50" keyboardType="number-pad" value={kmAdd} onChangeText={setKmAdd} />
            <PrimaryButton title="Sumar" variant="blue" loading={savingKm} onPress={onSumarKm} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 14,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: light.border,
    marginRight: 12,
  },
  avatarText: { fontWeight: '800', color: light.primaryDark, fontSize: 16 },
  brand: { fontSize: 18, fontWeight: '800', color: light.text },
  welcome: { fontSize: 13, color: light.textMuted, marginTop: 2 },
  motoCard: {
    marginHorizontal: 18,
    backgroundColor: light.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: light.border,
    marginBottom: 14,
  },
  motoCardHeader: { flexDirection: 'row', alignItems: 'baseline' },
  motoCardTitle: { fontSize: 20, fontWeight: '900', color: light.text, marginRight: 8 },
  motoCardAnio: { fontSize: 14, color: light.textMuted, fontWeight: '600' },
  motoCardInfo: { marginTop: 6, fontSize: 14, color: light.textMuted },
  kmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  kmLabel: { fontSize: 11, fontWeight: '700', color: light.textMuted, letterSpacing: 0.6 },
  kmValue: { fontSize: 26, fontWeight: '900', color: light.primary, marginTop: 2 },
  kmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: light.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  kmBtnIcon: { marginRight: 6 },
  kmBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: light.text },
  addBtn: { padding: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontWeight: '800', color: light.text, textAlign: 'center' },
  emptySub: { marginTop: 8, color: light.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 18, alignSelf: 'stretch' },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  motoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: light.border,
  },
  motoRowSelected: { borderColor: light.primary, backgroundColor: light.primarySoft },
  motoRowLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: light.border, marginRight: 12 },
  dotActive: { backgroundColor: light.primary },
  motoRowTitle: { fontSize: 15, fontWeight: '700', color: light.text },
  motoRowSub: { fontSize: 13, color: light.textMuted, marginTop: 2 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.35)' },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: light.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: light.text, marginBottom: 14 },
  saveBtn: { marginTop: 4 },
});

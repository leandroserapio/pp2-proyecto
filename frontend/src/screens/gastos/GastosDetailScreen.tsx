import { useLayoutEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { GastosStackParamList } from '../../navigation/types';
import { eliminarGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';
import { useAppSettings } from '../../context/AppSettingsContext';
import { splitGastoDescripcion } from '../../gastos/gastoKm';
import { formatArs, formatDisplayDate, formatKmDisplay } from '../../gastos/format';

type Nav = NativeStackNavigationProp<GastosStackParamList, 'GastosDetail'>;
type R = RouteProp<GastosStackParamList, 'GastosDetail'>;

export function GastosDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { theme } = useAppSettings();
  const [actionsOpen, setActionsOpen] = useState(false);
  const { item } = route.params;

  const { descripcion, kilometraje } = splitGastoDescripcion(item.descripcion ?? '');

  const deleteGasto = async () => {
    if (!item.idGasto) return;
    try {
      await eliminarGasto(item.idGasto);
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
      Alert.alert('Error', msg);
    }
  };

  const confirmDelete = () => {
    setActionsOpen(false);

    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm('Eliminar este gasto?')
          : true;
      if (confirmed) void deleteGasto();
      return;
    }

    Alert.alert('Eliminar gasto', 'Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void deleteGasto() },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable accessibilityRole="button" onPress={() => setActionsOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.primary} />
        </Pressable>
      ),
    });
  }, [navigation, theme.primary]);

  return (
    <>
      <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{item.tipo}</Text>
          <Text style={[styles.amount, { color: theme.primary }]}>{formatArs(item.monto)}</Text>

          <View style={styles.field}>
            <Text style={[styles.k, { color: theme.textMuted }]}>Moto</Text>
            <Text style={[styles.v, { color: theme.text }]}>{item.motoLabel}</Text>
          </View>

          {descripcion ? (
            <View style={styles.field}>
              <Text style={[styles.k, { color: theme.textMuted }]}>Descripcion</Text>
              <Text style={[styles.v, { color: theme.text }]}>{descripcion}</Text>
            </View>
          ) : null}

          {kilometraje ? (
            <View style={styles.field}>
              <Text style={[styles.k, { color: theme.textMuted }]}>Kilometraje</Text>
              <Text style={[styles.v, { color: theme.text }]}>{formatKmDisplay(kilometraje)}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={[styles.k, { color: theme.textMuted }]}>Fecha</Text>
            <Text style={[styles.v, { color: theme.text }]}>{formatDisplayDate(item.fecha)}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={actionsOpen} transparent animationType="fade" onRequestClose={() => setActionsOpen(false)}>
        <Pressable
          style={[styles.menuOverlay, { backgroundColor: theme.overlaySoft }]}
          onPress={() => setActionsOpen(false)}
        >
          <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.bg }]}
              onPress={() => {
                setActionsOpen(false);
                navigation.navigate('GastosEdit', { item });
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Editar gasto</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.bg }]}
              onPress={confirmDelete}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
              <Text style={[styles.menuText, { color: theme.danger }]}>Eliminar gasto</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg },
  content: { padding: 18, paddingBottom: 32 },
  card: {
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: light.border,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  amount: {
    marginTop: 8,
    fontSize: 36,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
  field: { marginTop: 20 },
  k: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  v: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.navy,
    lineHeight: 22,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  menu: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});

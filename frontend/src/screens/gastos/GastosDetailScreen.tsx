import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { GastosStackParamList } from '../../navigation/types';
import { eliminarGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';
import { splitGastoDescripcion } from '../../gastos/gastoKm';
import { formatArs, formatDisplayDate, formatKmDisplay } from '../../gastos/format';

type Nav = NativeStackNavigationProp<GastosStackParamList, 'GastosDetail'>;
type R = RouteProp<GastosStackParamList, 'GastosDetail'>;

export function GastosDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { item } = route.params;

  const { descripcion, kilometraje } = splitGastoDescripcion(item.descripcion ?? '');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Alert.alert('Gasto', '¿Qué querés hacer?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                  if (!item.idGasto) return;
                  try {
                    await eliminarGasto(item.idGasto);
                    navigation.goBack();
                  } catch (e) {
                    const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
                    Alert.alert('Error', msg);
                  }
                },
              },
            ]);
          }}
          hitSlop={12}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={light.primary} />
        </Pressable>
      ),
    });
  }, [navigation, item.idGasto]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.tipo}</Text>
        <Text style={styles.amount}>{formatArs(item.monto)}</Text>

        <View style={styles.field}>
          <Text style={styles.k}>Moto</Text>
          <Text style={styles.v}>{item.motoLabel}</Text>
        </View>

        {descripcion ? (
          <View style={styles.field}>
            <Text style={styles.k}>Descripción</Text>
            <Text style={styles.v}>{descripcion}</Text>
          </View>
        ) : null}

        {kilometraje ? (
          <View style={styles.field}>
            <Text style={styles.k}>Kilometraje</Text>
            <Text style={styles.v}>{formatKmDisplay(kilometraje)}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.k}>Fecha</Text>
          <Text style={styles.v}>{formatDisplayDate(item.fecha)}</Text>
        </View>
      </View>
    </ScrollView>
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
});

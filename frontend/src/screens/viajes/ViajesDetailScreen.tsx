import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { ViajesStackParamList } from '../../navigation/types';
import { eliminarViaje } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { splitViajeNotas } from '../../viajes/viajeNotas';
import { formatArs, formatDisplayDate, formatKmViaje } from '../../viajes/format';
import { getViajeEstadoBadge, normalizeViajeEstado } from '../../viajes/viajeEstado';

type Nav = NativeStackNavigationProp<ViajesStackParamList, 'ViajesDetail'>;
type R = RouteProp<ViajesStackParamList, 'ViajesDetail'>;

export function ViajesDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { item } = route.params;
  const { salida, tiempoEstimado, consumoLitros100, precioNafta, notas } = splitViajeNotas(item.notas ?? '');
  const badge = getViajeEstadoBadge(item.estado);
  const estadoLabel = normalizeViajeEstado(item.estado);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Alert.alert('Viaje', '¿Qué querés hacer?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Editar',
                onPress: () => navigation.navigate('ViajesEdit', { item }),
              },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                  if (!item.idViaje) return;
                  try {
                    await eliminarViaje(item.idViaje);
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
  }, [navigation, item, item.idViaje]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.section}>
          <View style={[styles.iconBox, styles.iconBoxGreen]}>
            <MaterialCommunityIcons name="pine-tree" size={22} color="#16a34a" />
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.tripTitle}>{item.destino}</Text>
            <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: badge.textColor }]}>{badge.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={[styles.iconBox, styles.iconBoxBlue]}>
            <MaterialCommunityIcons name="motorbike" size={22} color={light.primary} />
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.fieldLabel}>Vehículo</Text>
            <Text style={styles.fieldValue}>{item.motoLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Fecha de salida</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="calendar-outline" size={16} color={light.textMuted} />
              <Text style={styles.gridValue}>{formatDisplayDate(item.fechaSalida)}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Km estimados</Text>
            <View style={styles.gridValueRow}>
              <MaterialCommunityIcons name="map-marker-path" size={16} color={light.textMuted} />
              <Text style={styles.gridValue}>{formatKmViaje(item.kilometrosEstimados ?? null)}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Presupuesto</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="cash-outline" size={16} color={light.textMuted} />
              <Text style={styles.gridValue}>
                {item.presupuestoEstimado != null ? formatArs(item.presupuestoEstimado) : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Estado</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="time-outline" size={16} color={light.primary} />
              <Text style={styles.gridValue}>{estadoLabel}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Tiempo estimado</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="timer-outline" size={16} color={light.textMuted} />
              <Text style={styles.gridValue}>{tiempoEstimado || '-'}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Combustible</Text>
            <View style={styles.gridValueRow}>
              <MaterialCommunityIcons name="gas-station-outline" size={16} color={light.textMuted} />
              <Text style={styles.gridValue}>
                {consumoLitros100 || precioNafta ? `${consumoLitros100 || '-'} km/L - $${precioNafta || '-'}/L` : '-'}
              </Text>
            </View>
          </View>
        </View>

        {salida ? (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <Ionicons name="location-outline" size={20} color={light.primary} />
              </View>
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>Salida</Text>
                <Text style={styles.fieldValue}>{salida}</Text>
              </View>
            </View>
          </>
        ) : null}

        {notas ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>Notas</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>"{notas}"</Text>
            </View>
          </>
        ) : null}
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
  section: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxGreen: { backgroundColor: '#DCFCE7' },
  iconBoxBlue: { backgroundColor: light.primarySoft },
  sectionBody: { flex: 1 },
  tripTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: light.border,
    marginVertical: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  fieldValue: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.navy,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
    marginBottom: 6,
  },
  gridValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gridValue: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.navy,
    flexShrink: 1,
  },
  notesBox: {
    marginTop: 10,
    backgroundColor: light.primarySoft,
    borderRadius: 12,
    padding: 14,
  },
  notesText: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    fontStyle: 'italic',
    color: light.navy,
    lineHeight: 22,
  },
});

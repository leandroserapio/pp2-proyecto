import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { ViajeListNavItem, ViajesStackParamList } from '../../navigation/types';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { FAB_SCROLL_PADDING, ScreenFab, ScreenRoot } from '../../components/ScreenFab';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { sectionStyles } from '../../theme/sectionStyles';
import { eliminarViaje } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { formatArs, formatKmViaje, formatViajeListDate } from '../../viajes/format';
import { getViajeEstadoBadge } from '../../viajes/viajeEstado';
import { loadViajesItems } from '../../viajes/viajesLoader';
import {
  CONTENT_MAX_WIDTH,
  getCenteredContentStyle,
} from '../../theme/responsive';

type Nav = NativeStackNavigationProp<ViajesStackParamList>;

export function ViajesListScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { motos, loading: motosLoading, selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const [items, setItems] = useState<ViajeListNavItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    if (!selectedMotoId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await loadViajesItems(motos, selectedMotoId));
    } finally {
      setLoading(false);
    }
  }, [motos, selectedMotoId]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    void reload();
  }, [selectedMotoId, motos, reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems(await loadViajesItems(motos, selectedMotoId!));
    } finally {
      setRefreshing(false);
    }
  }, [motos, selectedMotoId]);

  const empty = !loading && !motosLoading && items.length === 0;
  const showFab = !motosLoading && !loading && selectedMoto != null && !empty;

  const confirmDeleteViaje = async (item: ViajeListNavItem) => {
    if (!item.idViaje) return;
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`¿Eliminar viaje a ${item.destino}?`)
      : await new Promise<boolean>((resolve) => {
          Alert.alert('Eliminar', `¿Eliminar viaje a ${item.destino}?`, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
          ]);
        });

    if (!confirmed) return;

    try {
      await eliminarViaje(item.idViaje);
      await reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    }
  };

  const topBlock = (
    <ScreenSectionHeader
      title="Viajes"
      subtitle="Planificá salidas con destino, km estimados y presupuesto."
    />
  );

  return (
    <ScreenRoot>
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <AppHeader />

      {motosLoading || loading ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.centerGrow}>
            <ActivityIndicator color={theme.primary} />
          </View>
        </View>
      ) : !selectedMoto ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <EmptyState
            variant="plain"
            title="Sin moto seleccionada"
            subtitle="Seleccioná una moto desde el menú superior para planificar viajes."
          />
        </View>
      ) : empty ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <EmptyState
            frameStyle={contentFrame}
            icon={<MaterialCommunityIcons name="map-marker-path" size={40} color={theme.textMuted} />}
            title="No hay viajes registrados"
            subtitle="Planificá tu primer viaje con destino, km estimados y presupuesto."
            actionLabel="Agregar Viaje"
            onAction={() => navigation.navigate('ViajesAdd', {})}
          />
        </View>
      ) : (
        <View style={styles.listRoot}>
          <FlatList
            data={items}
            keyExtractor={(v) => `${v.idViaje}-${v.idMoto}`}
            ListHeaderComponent={topBlock}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: FAB_SCROLL_PADDING }}
            renderItem={({ item }) => {
              const badge = getViajeEstadoBadge(item.estado, theme);
              return (
                <Pressable
                  style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('ViajesDetail', { item })}
                  onLongPress={() => {
                    Alert.alert(item.destino, '¿Qué querés hacer?', [
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
                            await reload();
                          } catch (e) {
                            const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
                            Alert.alert('Error', msg);
                          }
                        },
                      },
                    ]);
                  }}
                >
                  <View style={styles.cardTitleRow}>
                    <Text style={[sectionStyles.listCardTitle, { color: theme.text, flex: 1, marginRight: 10 }]} numberOfLines={2}>
                      {item.destino}
                    </Text>
                    <View style={styles.cardTopRight}>
                      <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
                        <Text style={[styles.badgeText, { color: badge.textColor }]}>{badge.label}</Text>
                      </View>
                      <View style={styles.cardIconActions}>
                        <Pressable onPress={() => navigation.navigate('ViajesEdit', { item })} hitSlop={8}>
                          <Ionicons name="create-outline" size={17} color={theme.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => confirmDeleteViaje(item)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={18} color={theme.danger} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatViajeListDate(item.fechaSalida)}</Text>
                  <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.cardStats}>
                    <View style={styles.statsGrid}>
                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>DISTANCIA</Text>
                        <Text style={[styles.statKm, { color: theme.primary }]}>{formatKmViaje(item.kilometrosEstimados ?? null)}</Text>
                      </View>
                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>PRESUPUESTO</Text>
                        <Text style={[styles.statBudget, { color: theme.text }]}>
                          {item.presupuestoEstimado != null ? formatArs(item.presupuestoEstimado) : '—'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={
              <View style={styles.footerNote}>
                <Ionicons name="map-outline" size={16} color={theme.textMuted} style={styles.footerIcon} />
                <Text style={[styles.footerText, { color: theme.textMuted }]}>Hasta acá llegaron los viajes</Text>
              </View>
            }
          />
        </View>
      )}

    </SafeAreaView>

    <ScreenFab
      visible={showFab}
      onPress={() => navigation.navigate('ViajesAdd', {})}
      backgroundColor={theme.primary}
      iconColor={theme.onPrimary}
    />
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  filterText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  flexCenter: { flex: 1 },
  listRoot: { flex: 1 },
  list: { flex: 1 },
  card: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: light.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardDate: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: light.border,
    marginTop: 12,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 8,
  },
  statCol: {
    flex: 1,
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statKm: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.primary,
  },
  statBudget: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  footerIcon: { marginRight: 8 },
  footerText: {
    color: light.textMuted,
    fontSize: 13,
    fontFamily: fontFamily.regular,
  },
  filterMenuOverlay: { flex: 1 },
  filterMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: light.overlaySoft,
  },
  filterMenuDropdown: {
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
  filterMenuTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.textMuted,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    letterSpacing: 0.4,
  },
  filterMenuScroll: { flexGrow: 0 },
  filterMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  filterMenuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
  },
  filterMenuRowPressed: { backgroundColor: light.bg },
  filterMenuRowText: {
    fontSize: 15,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cardTopRight: {
  alignItems: 'flex-end',
  gap: 8,
  marginLeft: 8,
  },
  cardIconActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

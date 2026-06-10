import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { ViajeListNavItem, ViajesStackParamList } from '../../navigation/types';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppHeader } from '../../components/AppHeader';
import { eliminarViaje } from '../../api/viajes';
import { ApiError } from '../../api/client';
import { formatArs, formatKmViaje, formatViajeListDate } from '../../viajes/format';
import { getViajeEstadoBadge } from '../../viajes/viajeEstado';
import { loadViajesItems, motoLabel } from '../../viajes/viajesLoader';

type Nav = NativeStackNavigationProp<ViajesStackParamList>;

export function ViajesListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { motos, loading: motosLoading } = useMoto();
  const { theme } = useAppSettings();
  const [filtro, setFiltro] = useState<number | 'todas'>('todas');
  const [items, setItems] = useState<ViajeListNavItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMenuRect, setFilterMenuRect] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const filterSelectWrapRef = useRef<View>(null);

  const reload = useCallback(async () => {
    if (motos.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await loadViajesItems(motos, filtro));
    } finally {
      setLoading(false);
    }
  }, [motos, filtro]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    void reload();
  }, [filtro, motos, reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems(await loadViajesItems(motos, filtro));
    } finally {
      setRefreshing(false);
    }
  }, [motos, filtro]);

  const filtroDisplay = useMemo(() => {
    if (filtro === 'todas') return 'Todas las motos';
    const m = motos.find((x) => x.idMoto === filtro);
    return m ? motoLabel(m) : 'Todas las motos';
  }, [filtro, motos]);

  const empty = !loading && !motosLoading && items.length === 0;
  const dropdownBottomGap = 96 + insets.bottom;

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
    <>
      <View style={styles.sectionHead}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Viajes</Text>
      </View>
      <Text style={[styles.filterLabel, { color: theme.textMuted }]}>Filtrar por moto</Text>
      <Pressable
        ref={filterSelectWrapRef}
        style={[
          styles.filterRow,
          {
            backgroundColor: theme.surface,
            borderColor: filterOpen ? theme.primary : theme.border,
          },
        ]}
        onPress={() => {
          if (filterOpen) {
            setFilterOpen(false);
            setFilterMenuRect(null);
            return;
          }
          filterSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
            setFilterMenuRect({ x, y, width, height });
            setFilterOpen(true);
          });
        }}
      >
        <Text style={[styles.filterText, { color: theme.text }]}>{filtroDisplay}</Text>
        <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
      </Pressable>
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <AppHeader title="Viajes" />

      {motosLoading || loading ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.centerGrow}>
            <ActivityIndicator color={theme.primary} />
          </View>
        </View>
      ) : motos.length === 0 ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.centerGrow}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Necesitás una moto</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Registrá al menos una moto desde Garage para planificar viajes.
            </Text>
          </View>
        </View>
      ) : empty ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.bg }]}>
              <MaterialCommunityIcons name="map-marker-path" size={40} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay viajes registrados</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Planificá tu primer viaje</Text>
            <PrimaryButton
              title="Agregar Viaje"
              variant="blue"
              onPress={() => navigation.navigate('ViajesAdd', {})}
              style={styles.cta}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listRoot}>
          {topBlock}
          <FlatList
            data={items}
            keyExtractor={(v) => `${v.idViaje}-${v.idMoto}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
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
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
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
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom, backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('ViajesAdd', {})}
          >
            <Ionicons name="add" size={30} color={theme.onPrimary} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setFilterOpen(false);
          setFilterMenuRect(null);
        }}
      >
        <View style={styles.filterMenuOverlay}>
          <Pressable
            style={[styles.filterMenuBackdrop, { backgroundColor: theme.overlaySoft }]}
            onPress={() => {
              setFilterOpen(false);
              setFilterMenuRect(null);
            }}
          />
          {filterMenuRect ? (
            <View
              style={[
                styles.filterMenuDropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                {
                  left: filterMenuRect.x,
                  top: filterMenuRect.y + filterMenuRect.height + 4,
                  width: filterMenuRect.width,
                  maxHeight: Math.max(
                    160,
                    Dimensions.get('window').height
                      - (filterMenuRect.y + filterMenuRect.height)
                      - dropdownBottomGap,
                  ),
                },
              ]}
            >
              <Text style={[styles.filterMenuTitle, { color: theme.textMuted }]}>Filtrar por moto</Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={styles.filterMenuScroll}
                bounces={false}
              >
                <Pressable
                  style={({ pressed }) => [styles.filterMenuRow, pressed && { backgroundColor: theme.bg }]}
                  onPress={() => {
                    setFiltro('todas');
                    setFilterOpen(false);
                    setFilterMenuRect(null);
                  }}
                >
                  <Text style={[styles.filterMenuRowText, { color: theme.text }]}>Todas las motos</Text>
                  {filtro === 'todas' ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
                </Pressable>
                {motos.map((m) => (
                  <Pressable
                    key={m.idMoto}
                    style={({ pressed }) => [
                      styles.filterMenuRow,
                      styles.filterMenuRowBorder,
                      { borderTopColor: theme.border },
                      pressed && { backgroundColor: theme.bg },
                    ]}
                    onPress={() => {
                      if (m.idMoto != null) setFiltro(m.idMoto);
                      setFilterOpen(false);
                      setFilterMenuRect(null);
                    }}
                  >
                    <Text style={[styles.filterMenuRowText, { color: theme.text }]}>{motoLabel(m)}</Text>
                    {filtro !== 'todas' && filtro === m.idMoto ? (
                      <Ionicons name="checkmark" color={theme.primary} size={20} />
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  sectionHead: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  filterLabel: {
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  filterRow: {
    marginHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterRowOpen: { borderColor: light.primary },
  filterText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  flexCenter: { flex: 1 },
  centerGrow: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyCard: {
    flex: 1,
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: light.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
    fontSize: 15,
  },
  cta: { alignSelf: 'stretch', marginHorizontal: 18 },
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
  cardTitle: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
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
  fab: {
    position: 'absolute',
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: light.navy,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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

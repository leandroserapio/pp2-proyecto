import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { GastoListNavItem, GastosStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useMoto } from '../../context/MotoContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { formatArs, formatDisplayDate } from '../../gastos/format';
import { getGastoCategoryVisual, type GastoCategoryVisual } from '../../gastos/gastoCategory';
import { loadGastosItems, sumMontos } from '../../gastos/gastosLoader';
import { motoLabel } from '../../gastos/gastosLoader';

type Nav = NativeStackNavigationProp<GastosStackParamList>;

function CategoryGlyph({ cat }: { cat: GastoCategoryVisual }) {
  if (cat.name === 'flash') {
    return <MaterialCommunityIcons name="gas-station" size={20} color={cat.color} />;
  }
  return <Ionicons name={cat.name} size={20} color={cat.color} />;
}

export function GastosListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { motos, loading: motosLoading } = useMoto();
  const [filtro, setFiltro] = useState<number | 'todas'>('todas');
  const [items, setItems] = useState<GastoListNavItem[]>([]);
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
      setItems(await loadGastosItems(motos, filtro));
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
      setItems(await loadGastosItems(motos, filtro));
    } finally {
      setRefreshing(false);
    }
  }, [motos, filtro]);

  const total = useMemo(() => sumMontos(items), [items]);

  const filtroDisplay = useMemo(() => {
    if (filtro === 'todas') return 'Todas las motos';
    const m = motos.find((x) => x.idMoto === filtro);
    return m ? motoLabel(m) : 'Todas las motos';
  }, [filtro, motos]);

  const empty = !loading && !motosLoading && items.length === 0;

  const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M';

  const topBlock = (
    <>
      <View style={styles.sectionHead}>
        <Text style={styles.summaryEyebrow}>RESUMEN DE GASTOS</Text>
        <Text style={styles.summaryTitle}>Gastos</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalAmount}>{formatArs(total)}</Text>
      </View>

      <Pressable
        ref={filterSelectWrapRef}
        style={[styles.filterRow, filterOpen && styles.filterRowOpen]}
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
        <Text style={styles.filterText}>{filtroDisplay}</Text>
        <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={light.textMuted} />
      </Pressable>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.brand}>MotoTracker</Text>
      </View>

      {motosLoading || loading ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.centerGrow}>
            <ActivityIndicator color={light.primary} />
          </View>
        </View>
      ) : motos.length === 0 ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.centerGrow}>
            <Text style={styles.emptyTitle}>Necesitás una moto</Text>
            <Text style={styles.emptySub}>
              Registrá al menos una moto desde el backend o próximamente desde Garage para cargar gastos.
            </Text>
          </View>
        </View>
      ) : empty ? (
        <View style={styles.flexCenter}>
          {topBlock}
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="gas-station-outline" size={40} color={light.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
            <Text style={styles.emptySub}>
              Registrá tus primeros gastos de moto para llevar un control detallado.
            </Text>
            <PrimaryButton
              title="Agregar Gasto"
              variant="blue"
              onPress={() => navigation.navigate('GastosAdd', {})}
              style={styles.cta}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listRoot}>
          {topBlock}
          <Text style={styles.sectionEyebrow}>RECIENTES</Text>
          <FlatList
            data={items}
            keyExtractor={(g) => `${g.idGasto}-${g.idMoto}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
            renderItem={({ item }) => {
              const cat = getGastoCategoryVisual(item.tipo);
              return (
                <Pressable
                  style={styles.card}
                  onPress={() => navigation.navigate('GastosDetail', { item })}
                >
                  <View style={styles.cardMain}>
                    <Text style={styles.cardTitle}>{item.tipo}</Text>
                    <Text style={styles.cardSub}>
                      {item.motoLabel} - {formatDisplayDate(item.fecha)}
                    </Text>
                    <Text style={styles.cardAmount}>{formatArs(item.monto)}</Text>
                  </View>
                  <View style={[styles.catIcon, { backgroundColor: `${cat.color}22` }]}>
                    <CategoryGlyph cat={cat} />
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={
              <View style={styles.footerNote}>
                <Ionicons name="time-outline" size={16} color={light.textMuted} style={styles.footerIcon} />
                <Text style={styles.footerText}>Hasta acá llegaron los gastos</Text>
              </View>
            }
          />
          <Pressable
            accessibilityRole="button"
            style={[styles.fab, { bottom: 24 + insets.bottom }]}
            onPress={() => navigation.navigate('GastosAdd', {})}
          >
            <Ionicons name="add" size={30} color="#fff" />
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
            style={styles.filterMenuBackdrop}
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
                  left: filterMenuRect.x,
                  top: filterMenuRect.y + filterMenuRect.height + 4,
                  width: filterMenuRect.width,
                  maxHeight: Math.max(
                    160,
                    Dimensions.get('window').height - (filterMenuRect.y + filterMenuRect.height) - 24,
                  ),
                },
              ]}
            >
              <Text style={styles.filterMenuTitle}>Filtrar por moto</Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={styles.filterMenuScroll}
                bounces={false}
              >
                <Pressable
                  style={({ pressed }) => [styles.filterMenuRow, pressed && styles.filterMenuRowPressed]}
                  onPress={() => {
                    setFiltro('todas');
                    setFilterOpen(false);
                    setFilterMenuRect(null);
                  }}
                >
                  <Text style={styles.filterMenuRowText}>Todas las motos</Text>
                  {filtro === 'todas' ? <Ionicons name="checkmark" color={light.primary} size={20} /> : null}
                </Pressable>
                {motos.map((m) => (
                  <Pressable
                    key={m.idMoto}
                    style={({ pressed }) => [
                      styles.filterMenuRow,
                      styles.filterMenuRowBorder,
                      pressed && styles.filterMenuRowPressed,
                    ]}
                    onPress={() => {
                      if (m.idMoto != null) setFiltro(m.idMoto);
                      setFilterOpen(false);
                      setFilterMenuRect(null);
                    }}
                  >
                    <Text style={styles.filterMenuRowText}>{motoLabel(m)}</Text>
                    {filtro !== 'todas' && filtro === m.idMoto ? (
                      <Ionicons name="checkmark" color={light.primary} size={20} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: light.surface,
    borderBottomWidth: 1,
    borderBottomColor: light.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: light.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: light.border,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    color: light.primary,
  },
  brand: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 20,
    color: light.primary,
  },
  sectionHead: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  summaryEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.textMuted,
    letterSpacing: 0.8,
  },
  summaryTitle: {
    marginTop: 6,
    fontSize: 28,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  totalCard: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: light.primarySoft,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
    letterSpacing: 0.6,
  },
  totalAmount: {
    marginTop: 8,
    fontSize: 30,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  filterRow: {
    marginHorizontal: 18,
    marginTop: 14,
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
  filterRowOpen: {
    borderColor: light.primary,
  },
  filterText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  flexCenter: { flex: 1 },
  centerGrow: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#EEF0F4',
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
  sectionEyebrow: {
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 10,
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.textMuted,
    letterSpacing: 0.8,
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMain: { flex: 1, marginRight: 12 },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  cardSub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
  },
  cardAmount: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  filterMenuOverlay: { flex: 1 },
  filterMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.25)',
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
      ? { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }
      : {
          elevation: 8,
          shadowColor: '#0f172a',
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
});

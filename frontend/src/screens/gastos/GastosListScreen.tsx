// src/screens/gastos/GastosListScreen.tsx

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

import {
  useFocusEffect,
  useNavigation
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp
} from '@react-navigation/native-stack';

import {
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';

import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';

import { light } from '../../theme/mototrackerLight';

import { fontFamily } from '../../theme/fonts';

import type {
  GastoListNavItem,
  GastosStackParamList
} from '../../navigation/types';

import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AppHeader } from '../../components/AppHeader';
import { eliminarGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';

import {
  formatArs,
  formatDisplayDate
} from '../../gastos/format';

import {
  getGastoCategoryVisual,
  type GastoCategoryVisual
} from '../../gastos/gastoCategory';

import {
  loadGastosItems,
  motoLabel,
  sumMontos
} from '../../gastos/gastosLoader';

type Nav = NativeStackNavigationProp<GastosStackParamList>;

function CategoryGlyph({
  cat
}: {
  cat: GastoCategoryVisual
}) {

  if (cat.name === 'flash') {

    return (
      <MaterialCommunityIcons
        name="gas-station"
        size={20}
        color={cat.color}
      />
    );
  }

  return (
    <Ionicons
      name={cat.name}
      size={20}
      color={cat.color}
    />
  );
}

export function GastosListScreen() {

  const navigation = useNavigation<Nav>();

  const insets = useSafeAreaInsets();

  const { motos, loading: motosLoading } = useMoto();
  const { theme } = useAppSettings();

  const [filtro, setFiltro] = useState<number | 'todas'>('todas');

  const [items, setItems] = useState<GastoListNavItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const [filterMenuRect, setFilterMenuRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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
  }, [reload]);

  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    try {

      setItems(await loadGastosItems(motos, filtro));

    } finally {

      setRefreshing(false);

    }

  }, [motos, filtro]);

  const total = useMemo(() => sumMontos(items), [items]);

  const selectedMotoLabel = useMemo(() => {
    if (filtro === 'todas') return 'Todas las motos';

    const selected = motos.find((moto) => moto.idMoto === filtro);
    return selected ? motoLabel(selected) : 'Moto seleccionada';
  }, [filtro, motos]);

  const empty = !loading && !motosLoading && items.length === 0;

  const openFilter = useCallback(() => {
    filterSelectWrapRef.current?.measureInWindow((x, y, width, height) => {
      setFilterMenuRect({ x, y, width, height });
      setFilterOpen(true);
    });

    if (!filterSelectWrapRef.current) {
      const width = Dimensions.get('window').width - 36;
      setFilterMenuRect({ x: 18, y: 190, width, height: 48 });
      setFilterOpen(true);
    }
  }, []);

  const selectFilter = useCallback((next: number | 'todas') => {
    setFiltro(next);
    setFilterOpen(false);
  }, []);

  const topBlock = (

    <>

      <View style={styles.sectionHead}>

        <Text style={styles.summaryEyebrow}>
          RESUMEN DE GASTOS
        </Text>

        <Text style={styles.summaryTitle}>
          Gastos
        </Text>

      </View>

      <View style={styles.totalCard}>

        <Text style={styles.totalLabel}>
          TOTAL
        </Text>

        <Text style={styles.totalAmount}>
          {formatArs(total)}
        </Text>

      </View>

      <Pressable
        ref={filterSelectWrapRef}
        style={styles.filterRow}
        onPress={openFilter}
      >

        <Text style={styles.filterLabel}>
          Filtrar por moto
        </Text>

        <View style={styles.filterValueRow}>

          <Text
            style={styles.filterText}
            numberOfLines={1}
          >
            {selectedMotoLabel}
          </Text>

          <Ionicons
            name={filterOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={light.textMuted}
          />

        </View>

      </Pressable>

    </>

  );

  return (

    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: theme.bg
        }
      ]}
      edges={['top']}
    >

      <AppHeader />

      {/* CONTENT */}

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

            <Text style={styles.emptyTitle}>
              Necesitás una moto
            </Text>

            <Text style={styles.emptySub}>
              Registrá una moto para comenzar.
            </Text>

          </View>

        </View>

      ) : empty ? (

        <View style={styles.flexCenter}>

          {topBlock}

          <View style={styles.emptyWrap}>

            <View style={styles.emptyIconCircle}>

              <MaterialCommunityIcons
                name="gas-station-outline"
                size={40}
                color={light.textMuted}
              />

            </View>

            <Text style={styles.emptyTitle}>
              No hay gastos registrados
            </Text>

            <Text style={styles.emptySub}>
              Registrá tus primeros gastos.
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

          <FlatList
            data={items}
            keyExtractor={(g) => `${g.idGasto}-${g.idMoto}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            contentContainerStyle={{
              paddingBottom: 120 + insets.bottom
            }}
            renderItem={({ item }) => {

              const cat = getGastoCategoryVisual(item.tipo);

              return (

                <Pressable
                  style={styles.card}
                  onPress={() => navigation.navigate('GastosDetail', { item })}
                  onLongPress={() => {
                    Alert.alert(item.tipo, '¿Qué querés hacer?', [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Editar',
                        onPress: () => {
                          navigation.navigate('GastosEdit', { item });
                        },
                      },
                      {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                          if (!item.idGasto) return;
                          try {
                            await eliminarGasto(item.idGasto);
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

                  <View style={styles.cardMain}>

                    <Text style={styles.cardTitle}>
                      {item.tipo}
                    </Text>

                    <Text style={styles.cardSub}>
                      {item.motoLabel} - {formatDisplayDate(item.fecha)}
                    </Text>

                    <Text style={styles.cardAmount}>
                      {formatArs(item.monto)}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.catIcon,
                      {
                        backgroundColor: `${cat.color}22`
                      }
                    ]}
                  >

                    <CategoryGlyph cat={cat} />

                  </View>

                </Pressable>

              );
            }}
          />

          <Pressable
            style={[
              styles.fab,
              {
                bottom: 24 + insets.bottom
              }
            ]}
            onPress={() =>
              navigation.navigate('GastosAdd', {})
            }
          >

            <Ionicons
              name="add"
              size={30}
              color="#fff"
            />

          </Pressable>

        </View>

      )}

      {/* MENU HAMBURGUESA */}

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >

        <Pressable
          style={styles.filterBackdrop}
          onPress={() => setFilterOpen(false)}
        >

          <View
            style={[
              styles.filterMenu,
              filterMenuRect
                ? {
                    left: filterMenuRect.x,
                    top: filterMenuRect.y + filterMenuRect.height + 6,
                    width: filterMenuRect.width,
                    maxHeight: Dimensions.get('window').height
                      - filterMenuRect.y
                      - filterMenuRect.height
                      - 24,
                  }
                : null,
            ]}
          >

            <ScrollView>

              <Pressable
                style={[
                  styles.filterOption,
                  filtro === 'todas' && styles.filterOptionActive,
                ]}
                onPress={() => selectFilter('todas')}
              >

                <Text style={styles.filterOptionText}>
                  Todas las motos
                </Text>

                {filtro === 'todas' ? (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={light.primary}
                  />
                ) : null}

              </Pressable>

              {motos.map((moto) => (
                <Pressable
                  key={String(moto.idMoto)}
                  style={[
                    styles.filterOption,
                    filtro === moto.idMoto && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    if (moto.idMoto != null) selectFilter(moto.idMoto);
                  }}
                >

                  <Text
                    style={styles.filterOptionText}
                    numberOfLines={1}
                  >
                    {motoLabel(moto)}
                  </Text>

                  {filtro === moto.idMoto ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={light.primary}
                    />
                  ) : null}

                </Pressable>
              ))}

            </ScrollView>

          </View>

        </Pressable>

      </Modal>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: light.bg
  },

  sectionHead: {
    paddingHorizontal: 18,
    marginTop: 16,
  },

  summaryEyebrow: {
    fontSize: 11,
    color: light.textMuted,
  },

  summaryTitle: {
    marginTop: 6,
    fontSize: 28,
    color: light.navy,
    fontWeight: '700',
  },

  totalCard: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: light.primarySoft,
    borderRadius: 12,
    padding: 16,
  },

  totalLabel: {
    fontSize: 11,
    color: light.primary,
  },

  totalAmount: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '700',
    color: light.navy,
  },

  filterRow: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  filterLabel: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },

  filterValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  filterText: {
    flex: 1,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },

  filterBackdrop: {
    flex: 1,
  },

  filterMenu: {
    position: 'absolute',
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.14)',
        }
      : {
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.14,
          shadowRadius: 24,
        }),
  },

  filterOption: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  filterOptionActive: {
    backgroundColor: light.primarySoft,
  },

  filterOptionText: {
    flex: 1,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },

  flexCenter: {
    flex: 1,
  },

  centerGrow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#EEF0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: light.navy,
  },

  emptySub: {
    marginTop: 8,
    color: light.textMuted,
  },

  cta: {
    marginTop: 20,
  },

  listRoot: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardMain: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: light.navy,
  },

  cardSub: {
    marginTop: 6,
    fontSize: 13,
    color: light.textMuted,
  },

  cardAmount: {
    marginTop: 10,
    fontSize: 16,
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

  fab: {
    position: 'absolute',
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

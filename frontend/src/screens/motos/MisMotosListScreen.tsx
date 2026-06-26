import { useCallback, useState } from 'react';
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

import { AddMotoSheet } from '../../components/AddMotoSheet';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { FAB_SCROLL_PADDING, ScreenFab, ScreenRoot } from '../../components/ScreenFab';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { motoLabel } from '../../gastos/gastosLoader';
import type { MotosStackParamList } from '../../navigation/types';
import { useMoto } from '../../context/MotoContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';
import { sectionStyles } from '../../theme/sectionStyles';
import {
  CONTENT_MAX_WIDTH,
  getCenteredContentStyle,
} from '../../theme/responsive';
import type { Moto } from '../../types/models';

type Nav = NativeStackNavigationProp<MotosStackParamList>;

function formatKm(km?: number | null): string {
  if (km == null) return '0 km';
  return `${km.toLocaleString('es-AR')} km`;
}

function MotoMeta({ label, value, theme }: { label: string; value: string; theme: { text: string; textMuted: string } }) {
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function MisMotosListScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { motos, loading, refreshMotos, eliminarMoto } = useMoto();
  const { theme } = useAppSettings();
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshMotos();
    }, [refreshMotos]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMotos();
    } finally {
      setRefreshing(false);
    }
  }, [refreshMotos]);

  const confirmDelete = async (moto: Moto) => {
    if (!moto.idMoto) return;
    const name = motoLabel(moto);
    const confirmed =
      Platform.OS === 'web'
        ? globalThis.confirm?.(`¿Eliminar ${name}? Se borrarán también gastos, servicios, viajes y recordatorios asociados.`) ?? false
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Eliminar moto',
              `¿Eliminar ${name}? Se borrarán también gastos, servicios, viajes y recordatorios asociados.`,
              [
                { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
              ],
            );
          });

    if (!confirmed) return;

    try {
      await eliminarMoto(moto.idMoto);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo eliminar la moto';
      if (Platform.OS === 'web') {
        globalThis.alert?.(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const topBlock = (
    <ScreenSectionHeader
      title="Mis motos"
      subtitle="Administrá tus motos, kilometraje y datos del vehículo."
    />
  );

  const empty = !loading && motos.length === 0;

  return (
    <ScreenRoot>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
        <AppHeader />

        {loading && motos.length === 0 ? (
          <View style={styles.flexCenter}>
            {topBlock}
            <View style={styles.centerGrow}>
              <ActivityIndicator color={theme.primary} />
            </View>
          </View>
        ) : empty ? (
          <View style={styles.flexCenter}>
            {topBlock}
            <EmptyState
              frameStyle={contentFrame}
              icon={<MaterialCommunityIcons name="motorbike" size={40} color={theme.textMuted} />}
              title="No tenés motos registradas"
              subtitle="Agregá tu primera moto para empezar a registrar gastos, servicios y viajes."
              actionLabel="Agregar moto"
              onAction={() => setAddOpen(true)}
            />
          </View>
        ) : (
          <View style={styles.listRoot}>
            <FlatList
              data={motos}
              keyExtractor={(m) => String(m.idMoto)}
              ListHeaderComponent={topBlock}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: FAB_SCROLL_PADDING }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => {
                    if (item.idMoto != null) {
                      navigation.navigate('MisMotosEdit', { idMoto: item.idMoto });
                    }
                  }}
                >
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
                      <MaterialCommunityIcons name="motorbike" size={22} color={theme.primary} />
                    </View>
                    <View style={styles.cardTitleCopy}>
                      <Text style={[sectionStyles.listCardTitle, { color: theme.text }]} numberOfLines={2}>
                        {motoLabel(item)}
                      </Text>
                      {item.patente ? (
                        <Text style={[styles.patente, { color: theme.textMuted }]}>{item.patente}</Text>
                      ) : null}
                    </View>
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => {
                          if (item.idMoto != null) {
                            navigation.navigate('MisMotosEdit', { idMoto: item.idMoto });
                          }
                        }}
                        hitSlop={8}
                      >
                        <Ionicons name="create-outline" size={17} color={theme.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => void confirmDelete(item)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={theme.danger} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <MotoMeta
                      label="Año"
                      value={item.anio != null ? String(item.anio) : '—'}
                      theme={theme}
                    />
                    <MotoMeta label="Kilometraje" value={formatKm(item.kilometrajeActual)} theme={theme} />
                  </View>
                </Pressable>
              )}
            />

            <ScreenFab
              visible
              onPress={() => setAddOpen(true)}
              backgroundColor={theme.primary}
              iconColor={theme.onPrimary}
            />
          </View>
        )}
      </SafeAreaView>

      <AddMotoSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  flexCenter: {
    flex: 1,
  },
  centerGrow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRoot: {
    flex: 1,
    position: 'relative',
  },
  list: {
    flex: 1,
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  patente: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 2,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  metaValue: {
    marginTop: 2,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});

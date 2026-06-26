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
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
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
import { EmptyState } from '../../components/EmptyState';
import { AppTextInput } from '../../components/AppTextInput';
import { BottomSheet, type BottomSheetRef } from '../../components/BottomSheet';
import { DatePickerField, toIsoLocal } from '../../components/DatePickerField';
import { FAB_SCROLL_PADDING, ScreenFab, ScreenRoot } from '../../components/ScreenFab';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
import { sectionStyles } from '../../theme/sectionStyles';
import { crearGasto, eliminarGasto } from '../../api/gastos';
import { ApiError } from '../../api/client';

import {
  formatArs,
  formatDisplayDate,
  parseAmountInput,
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
import {
  CONTENT_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsiveFabRight,
} from '../../theme/responsive';

import {
  consumeGastosAddRequest,
} from '../../navigation/pendingActions';

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
  const { width } = useWindowDimensions();

  const { motos, loading: motosLoading, selectedMoto, selectedMotoId } = useMoto();
  const { theme } = useAppSettings();
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const fabRight = getResponsiveFabRight(width, CONTENT_MAX_WIDTH);


  const [items, setItems] = useState<GastoListNavItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [tipo, setTipo] = useState('');
  const [montoStr, setMontoStr] = useState('');
  const [idMoto, setIdMoto] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => new Date());
  const [motoSelectorOpen, setMotoSelectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);


  const tabNavigation = navigation.getParent();

  const resetForm = useCallback(() => {
    setTipo('');
    setMontoStr('');
    setDescripcion('');
    setFecha(new Date());
    setMotoSelectorOpen(false);
    setIdMoto(selectedMotoId ?? motos[0]?.idMoto ?? null);
  }, [motos, selectedMotoId]);

  const openAddSheet = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const handleSheetClosed = useCallback(() => {
    setAddOpen(false);
    setMotoSelectorOpen(false);
    resetForm();
  }, [resetForm]);

  const motosRef = useRef(motos);
  const selectedMotoIdRef = useRef(selectedMotoId);
  motosRef.current = motos;
  selectedMotoIdRef.current = selectedMotoId;

  useEffect(() => {
    tabNavigation?.setParams({ hideTabBar: addOpen });
    return () => {
      tabNavigation?.setParams({ hideTabBar: false });
    };
  }, [addOpen, tabNavigation]);

  useFocusEffect(
    useCallback(() => {
      const request = consumeGastosAddRequest();
      if (!request) return;

      setTipo('');
      setMontoStr('');
      setDescripcion('');
      setFecha(new Date());
      setMotoSelectorOpen(false);
      setIdMoto(
        request.idMoto ?? selectedMotoIdRef.current ?? motosRef.current[0]?.idMoto ?? null,
      );
      setAddOpen(true);
    }, []),
  );

  const reload = useCallback(async () => {

    if (!selectedMotoId) {
      setItems([]);
      return;
    }

    setLoading(true);

    try {

      setItems(await loadGastosItems(motos, selectedMotoId));

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
  }, [reload]);

  const onRefresh = useCallback(async () => {
    if (!selectedMotoId) return;
    setRefreshing(true);
    try {
      setItems(await loadGastosItems(motos, selectedMotoId));
    } finally {
      setRefreshing(false);
    }
  }, [motos, selectedMotoId]);

  const total = useMemo(() => sumMontos(items), [items]);

  const empty = !loading && !motosLoading && items.length === 0;
  const showFab = !motosLoading && !loading && selectedMoto != null && !empty && !addOpen;

  const onSaveGasto = async () => {
    if (!idMoto) {
      Alert.alert('Falta la moto', 'Seleccioná una moto.');
      return;
    }
    const monto = parseAmountInput(montoStr);
    if (!tipo.trim()) {
      Alert.alert('Datos incompletos', 'El tipo de gasto es obligatorio.');
      return;
    }
    if (monto == null || monto <= 0) {
      Alert.alert('Datos incompletos', 'Ingresá un monto válido.');
      return;
    }
    setSaving(true);
    try {
      await crearGasto(idMoto, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        monto,
        fecha: toIsoLocal(fecha),
      });
      await reload();
      sheetRef.current?.close();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteGasto = async (item: GastoListNavItem) => {
    if (!item.idGasto) return;
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`¿Eliminar ${item.tipo}?`)
      : await new Promise<boolean>((resolve) => {
          Alert.alert('Eliminar', `¿Eliminar ${item.tipo}?`, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
          ]);
        });

    if (!confirmed) return;

    try {
      await eliminarGasto(item.idGasto);
      await reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    }
  };

  const topBlock = (

    <View style={contentFrame}>

      <ScreenSectionHeader
        title="Gastos"
        subtitle="Controlá seguros, combustible y otros gastos de tu moto."
      />

      <View
        style={[
          styles.totalCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >

        <View style={styles.totalHeader}>
          <View style={[styles.totalIconWrap, { backgroundColor: theme.primarySoft }]}>
            <Ionicons
              name="wallet-outline"
              size={16}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.totalLabel, { color: theme.textMuted }]}>
            Total en gastos
          </Text>
        </View>

        <Text style={[styles.totalAmount, { color: theme.text }]}>
          {formatArs(total)}
        </Text>

      </View>

    </View>

  );

  return (

    <ScreenRoot>

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

        <ScrollView
          style={styles.flexCenter}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {topBlock}

          <View style={styles.centerGrow}>

            <ActivityIndicator color={theme.primary} />

          </View>

        </ScrollView>

      ) : !selectedMoto ? (

        <ScrollView
          style={styles.flexCenter}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {topBlock}

          <EmptyState
            variant="plain"
            title="Sin moto seleccionada"
            subtitle="Seleccioná una moto desde el menú superior."
          />

        </ScrollView>

      ) : empty ? (

        <ScrollView
          style={styles.flexCenter}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {topBlock}

          <EmptyState
            frameStyle={contentFrame}
            icon={
              <MaterialCommunityIcons
                name="gas-station-outline"
                size={40}
                color={theme.textMuted}
              />
            }
            title="No hay gastos registrados"
            subtitle="Registrá combustible, peajes, seguros y otros gastos de tu moto."
            actionLabel="Agregar Gasto"
            onAction={openAddSheet}
          />

        </ScrollView>

      ) : (

        <View style={styles.listRoot}>

          <FlatList
            data={items}
            keyExtractor={(g) => `${g.idGasto}-${g.idMoto}`}
            ListHeaderComponent={topBlock}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            contentContainerStyle={{
              paddingBottom: FAB_SCROLL_PADDING
            }}
            renderItem={({ item }) => {

              const cat = getGastoCategoryVisual(item.tipo);

              return (

                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Pressable style={styles.cardMain} onPress={() => navigation.navigate('GastosDetail', { item })}>
                    <Text style={[sectionStyles.listCardTitle, { color: theme.text }]}>{item.tipo}</Text>
                    <Text style={[styles.cardSub, { color: theme.textMuted }]}>
                      {item.motoLabel} - {formatDisplayDate(item.fecha)}
                    </Text>
                    <Text style={[styles.cardAmount, { color: theme.text }]}>{formatArs(item.monto)}</Text>
                  </Pressable>
                  <View style={styles.cardRight}>
                    <View style={[styles.catIcon, { backgroundColor: `${cat.color}22` }]}>
                      <CategoryGlyph cat={cat} />
                    </View>
                    <View style={styles.cardIconActions}>
                      <Pressable onPress={() => navigation.navigate('GastosEdit', { item })} hitSlop={8}>
                        <Ionicons name="create-outline" size={17} color={theme.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => confirmDeleteGasto(item)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={theme.danger} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          />

        </View>

      )}

      <BottomSheet
        ref={sheetRef}
        visible={addOpen}
        title="Agregar Gasto"
        onClose={handleSheetClosed}
      >
        <AppTextInput
          label="Tipo *"
          variant="light"
          placeholder="Ej: Seguro Mensual, Nafta"
          value={tipo}
          onChangeText={setTipo}
        />

        <Text style={[styles.formLabel, { color: theme.text }]}>Monto</Text>
        <View style={[styles.costoRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.costoPrefixText, { color: theme.textMuted }]}>$</Text>
          <TextInput
            style={[styles.costoTextInput, { color: theme.text }]}
            placeholder="15.000,00"
            keyboardType="decimal-pad"
            value={montoStr}
            onChangeText={setMontoStr}
            placeholderTextColor={theme.textMuted}
            onStartShouldSetResponder={() => true}
          />
        </View>

        <Text style={[styles.formLabel, { color: theme.text }]}>Moto</Text>
        <Pressable
          style={[
            styles.formMotoSelector,
            {
              backgroundColor: theme.bg,
              borderColor: motoSelectorOpen ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setMotoSelectorOpen((v) => !v)}
        >
          <Text style={[styles.formMotoSelectorText, { color: theme.text }]}>
            {idMoto
              ? motoLabel(motos.find((m) => m.idMoto === idMoto)!)
              : 'Seleccioná una moto'}
          </Text>
          <Ionicons name={motoSelectorOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
        </Pressable>

        {motoSelectorOpen ? (
          <View style={[styles.inlineDropdown, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            {motos.map((m, i) => (
              <Pressable
                key={m.idMoto}
                style={({ pressed }) => [
                  styles.filterMenuRow,
                  i > 0 && styles.filterMenuRowBorder,
                  i > 0 && { borderTopColor: theme.border },
                  pressed && { backgroundColor: theme.bg },
                ]}
                onPress={() => {
                  if (m.idMoto != null) setIdMoto(m.idMoto);
                  setMotoSelectorOpen(false);
                }}
              >
                <Text style={[styles.filterMenuRowText, { color: theme.text }]}>{motoLabel(m)}</Text>
                {idMoto === m.idMoto ? <Ionicons name="checkmark" color={theme.primary} size={20} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        <AppTextInput
          label="Descripción"
          variant="light"
          placeholder="Ej: Nafta Shell, Service anual"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />

        <PrimaryButton
          title="Guardar Gasto"
          variant="blue"
          loading={saving}
          onPress={onSaveGasto}
          style={styles.saveBtn}
        />
      </BottomSheet>

    </SafeAreaView>

    <ScreenFab
      visible={showFab}
      onPress={openAddSheet}
      backgroundColor={theme.primary}
      iconColor={theme.onPrimary}
    />

    </ScreenRoot>

  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: light.bg
  },

  totalCard: {
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  totalIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: light.textMuted,
  },

  totalAmount: {
    marginTop: 6,
    fontSize: 34,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
  },

  filterRowAfterTotal: {
    marginTop: 14,
  },

  filterText: {
    flex: 1,
    fontSize: 15,
    color: light.text,
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
          boxShadow: `0 12px 24px ${light.shadowStrong}`,
        }
      : {
          elevation: 8,
          shadowColor: light.navy,
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

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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

  saveBtn: { marginTop: 4 },
  formLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.text,
    marginBottom: 6,
    marginTop: 12,
  },
  formMotoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: light.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  formMotoSelectorText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: light.text,
    flex: 1,
  },
  inlineDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: light.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: light.surface,
    marginBottom: 4,
    overflow: 'hidden',
  },
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
  filterMenuRowText: {
    fontSize: 15,
    color: light.text,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  costoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  costoPrefixText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: light.textMuted,
    marginRight: 8,
  },
  costoTextInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: light.text,
    padding: 0,
  },
  cardRight: {
  alignItems: 'center',
  gap: 8,
  marginLeft: 12,
  },
  cardIconActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

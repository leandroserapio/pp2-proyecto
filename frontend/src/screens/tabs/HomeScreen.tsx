// src/screens/tabs/HomeScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError } from "../../api/client";
import { listarGastosPorMoto } from "../../api/gastos";
import { listarMantenimientosPorMoto } from "../../api/mantenimientos";
import { actualizarKilometraje } from "../../api/motos";
import { AppHeader } from "../../components/AppHeader";
import { ScreenSectionHeader } from "../../components/ScreenSectionHeader";
import { AppTextInput } from "../../components/AppTextInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useMoto } from "../../context/MotoContext";
import { formatArs, formatDisplayDate } from "../../gastos/format";
import {
  requestGastosAdd,
  requestMantenimientoAdd,
} from "../../navigation/pendingActions";
import type { MainTabParamList } from "../../navigation/types";
import { fontFamily } from "../../theme/fonts";
import { light } from "../../theme/mototrackerLight";
<<<<<<< HEAD
import { sectionStyles } from "../../theme/sectionStyles";
=======
import {
  CONTENT_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsivePadding,
} from "../../theme/responsive";
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
import type { Gasto, Mantenimiento } from "../../types/models";

const LAST_KM_STORAGE_PREFIX = "@mototracker/lastKmDelta/";

type HomeStatus = {
  lastService: Mantenimiento | null;
  lastInsurance: Gasto | null;
};

type Nav = BottomTabNavigationProp<MainTabParamList, "Inicio">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { selectedMoto, selectedMotoId, refreshMotos } = useMoto();
  const { theme } = useAppSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentFrame = getCenteredContentStyle(width, CONTENT_MAX_WIDTH);
  const pagePadding = getResponsivePadding(width);
  const [kmOpen, setKmOpen] = useState(false);
  const [kmAdd, setKmAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<HomeStatus>({
    lastService: null,
    lastInsurance: null,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastKmDelta, setLastKmDelta] = useState<number | null>(null);

  const loadStatus = useCallback(async () => {
    if (!selectedMotoId) {
      setStatus({ lastService: null, lastInsurance: null });
      setLastKmDelta(null);
      return;
    }

    setStatusLoading(true);
    setStatusError(null);

    try {
      const [mantenimientos, gastos, storedKmDelta] = await Promise.all([
        listarMantenimientosPorMoto(selectedMotoId),
        listarGastosPorMoto(selectedMotoId),
        AsyncStorage.getItem(`${LAST_KM_STORAGE_PREFIX}${selectedMotoId}`),
      ]);

      setStatus({
        lastService: findLatestService(mantenimientos),
        lastInsurance: findLatestInsurance(gastos),
      });

      const parsedKmDelta = storedKmDelta == null ? null : Number(storedKmDelta);
      setLastKmDelta(Number.isFinite(parsedKmDelta) ? parsedKmDelta : null);
    } catch (e) {
      setStatusError(
        e instanceof ApiError
          ? e.message
          : "No pudimos cargar el estado de tu moto.",
      );
    } finally {
      setStatusLoading(false);
    }
  }, [selectedMotoId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const lastKmUpdateLabel = useMemo(
    () => formatDateTime(selectedMoto?.fechaUltimaActualizacionKm ?? null),
    [selectedMoto?.fechaUltimaActualizacionKm],
  );

  const openAddService = () => {
    requestMantenimientoAdd();
    navigation.navigate("Mantenimiento");
  };

  const openAddInsurance = () => {
    requestGastosAdd(selectedMotoId ?? undefined);
    navigation.navigate("GastosStack", { screen: "GastosHome" });
  };

  const onActualizarKm = async () => {
    if (!selectedMotoId) return;

    const kilometrajeActual = Number(kmAdd);

    if (!Number.isFinite(kilometrajeActual) || kilometrajeActual <= 0) {
      Alert.alert("Revisá el dato", "Ingresá el kilometraje actual de la moto.");
      return;
    }
    if (selectedMoto?.kilometrajeActual != null && kilometrajeActual < selectedMoto.kilometrajeActual) {
      Alert.alert(
        "Revisá el dato",
        `El kilometraje no puede ser menor al actual (${selectedMoto.kilometrajeActual} km).`,
      );
      return;
    }

    setSaving(true);

    try {
      const response = await actualizarKilometraje(
        selectedMotoId,
        kilometrajeActual,
      );

      setKmAdd("");
      setKmOpen(false);

      await AsyncStorage.setItem(
        `${LAST_KM_STORAGE_PREFIX}${selectedMotoId}`,
        String(response.kilometrosRecorridos),
      );
      setLastKmDelta(response.kilometrosRecorridos);

      await refreshMotos();

      Alert.alert(
        "Kilometraje actualizado",
        `Recorriste ${response.kilometrosRecorridos} km desde la última actualización.`,
      );
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "No pudimos actualizar el kilometraje.";

      Alert.alert("No se pudo guardar", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {!kmOpen ? <AppHeader /> : null}

<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.content}>
        {!kmOpen ? (
          <ScreenSectionHeader
            title="Inicio"
            subtitle="Consultá el estado de tu moto, services, seguro y kilometraje."
          />
        ) : null}

=======
      <ScrollView
        contentContainerStyle={[
          styles.content,
          contentFrame,
          {
            paddingHorizontal: pagePadding,
            paddingBottom: 96 + insets.bottom,
          },
        ]}
      >
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
        {selectedMoto ? (
          <>
            <View
              style={[
                styles.statusPanel,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.statusPanelHead}>
                <View style={styles.statusHeaderCopy}>
                  <Text style={[sectionStyles.panelTitle, { color: theme.text }]}>
                    {selectedMoto.marca} {selectedMoto.modelo}
                    {selectedMoto.patente ? ` · ${selectedMoto.patente}` : ''}
                  </Text>
                  <Text style={[sectionStyles.panelSubtitle, { color: theme.textMuted }]}>
                    Revisá el último service, pago de seguro y kilómetros recorridos.
                  </Text>
                </View>

                {statusLoading ? (
                  <ActivityIndicator color={theme.primary} size="small" />
                ) : null}
              </View>

              {statusError ? (
                <Text style={[styles.statusError, { color: theme.danger }]}>
                  {statusError}
                </Text>
              ) : null}

              <StatusCard
                icon="construct-outline"
                title="Service más reciente"
                value={
                  status.lastService
                    ? formatDisplayDate(status.lastService.fecha)
                    : "Sin service registrado"
                }
                detail={buildServiceDetail(status.lastService)}
                onAdd={openAddService}
              />

              <StatusCard
                icon="shield-checkmark-outline"
                title="Último pago del seguro"
                value={
                  status.lastInsurance
                    ? formatDisplayDate(status.lastInsurance.fecha)
                    : "Sin pagos registrados"
                }
                detail={buildInsuranceDetail(status.lastInsurance)}
                onAdd={openAddInsurance}
              />

              <StatusCard
                icon="refresh-outline"
                title="Kilómetros desde el último registro"
                value={
                  lastKmDelta == null
                    ? "Sin datos aún"
                    : `${lastKmDelta.toLocaleString("es-AR")} km`
                }
                detail={
                  lastKmDelta == null
                    ? "Actualizá el kilometraje para ver cuánto recorriste."
                    : "Calculado con tu última actualización de kilometraje."
                }
              />
            </View>

            <View
              style={[
                styles.kmPanel,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[sectionStyles.panelTitle, { color: theme.text }]}>
                Kilometraje
              </Text>
              <Text style={[sectionStyles.panelSubtitle, { color: theme.textMuted }]}>
                Actualizá el odómetro y seguí cuánto recorrés desde el último registro.
              </Text>

              <View style={styles.infoGrid}>
                <InfoTile
                  label="Kilometraje actual"
                  value={`${selectedMoto.kilometrajeActual ?? 0} km`}
                />
                <InfoTile
                  label="Última actualización"
                  value={lastKmUpdateLabel}
                />
              </View>

              {kmOpen ? (
                <View style={styles.kmForm}>
                  <AppTextInput
                    label="Kilometraje actual"
                    variant="light"
                    placeholder="Ej: 50000"
                    keyboardType="number-pad"
                    value={kmAdd}
                    onChangeText={setKmAdd}
                  />

                  <View style={styles.formActions}>
                    <Pressable
                      style={[
                        styles.secondaryButton,
                        {
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        setKmAdd("");
                        setKmOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          {
                            color: theme.text,
                          },
                        ]}
                      >
                        Cancelar
                      </Text>
                    </Pressable>

                    <PrimaryButton
                      title="Guardar"
                      variant="blue"
                      loading={saving}
                      onPress={onActualizarKm}
                      style={styles.primaryAction}
                    />
                  </View>
                </View>
              ) : (
                <PrimaryButton
                  title="Actualizar kilometraje"
                  variant="blue"
                  onPress={() => setKmOpen(true)}
                  style={styles.cta}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name="bicycle-outline"
              size={64}
              color={theme.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Todavía no hay una moto activa
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Registrá o seleccioná una moto desde Garage para ver su estado.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function findLatestService(items: Mantenimiento[]): Mantenimiento | null {
  return latestByDate(
    items.filter((item) => {
      const haystack = `${item.tipo ?? ""} ${item.descripcion ?? ""}`.toLowerCase();
      return /(service|servicio)/.test(haystack);
    }),
  );
}

function findLatestInsurance(items: Gasto[]): Gasto | null {
  return latestByDate(
    items.filter((item) => {
      const haystack = `${item.tipo ?? ""} ${item.descripcion ?? ""}`.toLowerCase();
      return /seguro/.test(haystack);
    }),
  );
}

function latestByDate<T extends { fecha: string }>(items: T[]): T | null {
  if (items.length === 0) return null;

  return [...items].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))[0];
}

function buildServiceDetail(item: Mantenimiento | null): string {
  if (!item) return "Cuando cargues un service, lo vas a ver acá.";

  const details = [
    item.tipo,
    item.kilometraje ? `${item.kilometraje.toLocaleString("es-AR")} km` : null,
    item.costo ? formatArs(item.costo) : null,
  ].filter(Boolean);

  return details.join(" - ");
}

function buildInsuranceDetail(item: Gasto | null): string {
  if (!item) return "Cuando registres el seguro, lo vas a ver acá.";

  const details = [item.tipo, formatArs(item.monto)].filter(Boolean);

  return details.join(" - ");
}

function formatDateTime(value: string | null): string {
  if (!value) return "Sin actualizaciones";

  const [date] = value.split("T");
  return formatDisplayDate(date);
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const { theme } = useAppSettings();

  return (
    <View
      style={[
        styles.infoTile,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

function StatusCard({
  icon,
  title,
  value,
  detail,
  onAdd,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  detail: string;
  onAdd?: () => void;
}) {
  const { theme } = useAppSettings();

  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.statusIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={[styles.statusTitle, { color: theme.textMuted }]}>
          {title}
        </Text>
        <Text style={[styles.statusValue, { color: theme.text }]}>
          {value}
        </Text>
        <Text style={[styles.statusDetail, { color: theme.textMuted }]}>
          {detail}
        </Text>
      </View>

      {onAdd ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${title}`}
          hitSlop={8}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={18} color={theme.onPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
<<<<<<< HEAD
    paddingBottom: 32,
=======
    paddingVertical: 18,
>>>>>>> 3cccd4841c4b236e5c91fdfaa79d5f36ddc538c7
  },
  kmPanel: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.surface,
    padding: 18,
  },
  infoGrid: {
    marginTop: 18,
    gap: 10,
  },
  infoTile: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  infoLabel: {
    color: light.textMuted,
    fontSize: 12,
  },
  infoValue: {
    marginTop: 6,
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: "700",
    fontSize: 18,
  },
  cta: {
    marginTop: 18,
  },
  kmForm: {
    marginTop: 18,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: fontFamily.semiBold,
    fontWeight: "600",
  },
  primaryAction: {
    flex: 1,
  },
  statusPanel: {
    marginHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  statusPanelHead: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusHeaderCopy: {
    flex: 1,
  },
  statusError: {
    color: light.danger,
    fontSize: 13,
  },
  statusCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    color: light.textMuted,
    fontSize: 12,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusValue: {
    marginTop: 4,
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: "700",
    fontSize: 17,
  },
  statusDetail: {
    marginTop: 4,
    color: light.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontFamily: fontFamily.bold,
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  emptySub: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
});

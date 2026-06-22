import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { light } from '../../theme/mototrackerLight';
import { sectionStyles } from '../../theme/sectionStyles';
import { fontFamily } from '../../theme/fonts';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { listarMotosPorUsuario } from '../../api/motos';
import { listarGastosPorMoto } from '../../api/gastos';
import { listarMantenimientosPorMoto } from '../../api/mantenimientos';
import {
  DETAIL_MAX_WIDTH,
  getCenteredContentStyle,
  getResponsivePadding,
} from '../../theme/responsive';

type ProfileSummary = {
  motos: number;
  mantenimientos: number;
  totalGastos: number;
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { theme } = useAppSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentFrame = getCenteredContentStyle(width, DETAIL_MAX_WIDTH);
  const pagePadding = getResponsivePadding(width);
  const [summary, setSummary] = useState<ProfileSummary>({
    motos: 0,
    mantenimientos: 0,
    totalGastos: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const displayName = user?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const displayEmail = user?.email || 'Sin email registrado';

  const formattedTotalGastos = useMemo(
    () =>
      summary.totalGastos.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }),
    [summary.totalGastos],
  );

  useEffect(() => {
    if (!user?.idUsuario) return;

    let cancelled = false;
    setLoadingSummary(true);
    setSummaryError(null);

    (async () => {
      try {
        const motos = await listarMotosPorUsuario(user.idUsuario);
        const motoIds = motos.map((moto) => moto.idMoto).filter((id): id is number => id != null);

        const [gastosPorMoto, mantenimientosPorMoto] = await Promise.all([
          Promise.all(motoIds.map((idMoto) => listarGastosPorMoto(idMoto))),
          Promise.all(motoIds.map((idMoto) => listarMantenimientosPorMoto(idMoto))),
        ]);

        const totalGastos = gastosPorMoto
          .flat()
          .reduce((total, gasto) => total + Number(gasto.monto || 0), 0);

        if (!cancelled) {
          setSummary({
            motos: motos.length,
            mantenimientos: mantenimientosPorMoto.flat().length,
            totalGastos,
          });
        }
      } catch {
        if (!cancelled) {
          setSummaryError('No se pudo cargar el resumen.');
        }
      } finally {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.idUsuario]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={[
        styles.content,
        contentFrame,
        {
          paddingHorizontal: pagePadding,
          paddingBottom: 96 + insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="person-outline" size={42} color={theme.primary} />
        </View>

        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
        <Text style={[styles.email, { color: theme.textMuted }]}>{displayEmail}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[sectionStyles.panelTitle, { color: theme.text }]}>Resumen</Text>

        {loadingSummary ? <Text style={[styles.summaryState, { color: theme.textMuted }]}>Cargando resumen...</Text> : null}
        {summaryError ? <Text style={[styles.errorText, { color: theme.danger }]}>{summaryError}</Text> : null}
        {!loadingSummary && !summaryError ? (
          <>
            <View style={[styles.statRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Motos registradas</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{summary.motos}</Text>
            </View>

            <View style={[styles.statRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Servicios cargados</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{summary.mantenimientos}</Text>
            </View>

            <View style={[styles.statRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Gastos registrados</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{formattedTotalGastos}</Text>
            </View>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.dangerSoft }]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        <Text style={[styles.logoutText, { color: theme.danger }]}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
  },
  card: {
    backgroundColor: light.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: light.border,
  },
  summaryState: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.danger,
    paddingVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: light.border,
  },
  statLabel: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
  },
  statValue: {
    flexShrink: 0,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
  },
  logoutButton: {
    marginTop: 4,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.dangerSoft,
    backgroundColor: light.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.danger,
  },
});

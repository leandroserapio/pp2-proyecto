import { light } from '../theme/mototrackerLight';
import type { AppTheme } from '../context/AppSettingsContext';

export const VIAJE_ESTADOS = ['Programado', 'En curso', 'Finalizado', 'Cancelado'] as const;

export type ViajeEstado = (typeof VIAJE_ESTADOS)[number];

export function normalizeViajeEstado(estado: string | null | undefined): string {
  if (!estado?.trim()) return 'Programado';
  return estado.trim();
}

export function getViajeEstadoBadge(estado: string | null | undefined, theme: AppTheme = light): {
  label: string;
  backgroundColor: string;
  textColor: string;
} {
  const e = normalizeViajeEstado(estado).toLowerCase();
  if (e === 'finalizado' || e === 'completado' || e === 'realizado') {
    return { label: 'Finalizado', backgroundColor: theme.successSoft, textColor: theme.success };
  }
  if (e === 'cancelado') {
    return { label: 'Cancelado', backgroundColor: theme.dangerSoft, textColor: theme.danger };
  }
  if (e === 'en curso') {
    return { label: 'En curso', backgroundColor: theme.primarySoft, textColor: theme.primary };
  }
  return { label: 'Programado', backgroundColor: theme.warningSoft, textColor: theme.warning };
}

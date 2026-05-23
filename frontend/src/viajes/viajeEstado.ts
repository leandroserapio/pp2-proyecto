import { light } from '../theme/mototrackerLight';

export const VIAJE_ESTADOS = ['Programado', 'En curso', 'Finalizado', 'Cancelado'] as const;

export type ViajeEstado = (typeof VIAJE_ESTADOS)[number];

export function normalizeViajeEstado(estado: string | null | undefined): string {
  if (!estado?.trim()) return 'Programado';
  return estado.trim();
}

export function getViajeEstadoBadge(estado: string | null | undefined): {
  label: string;
  backgroundColor: string;
  textColor: string;
} {
  const e = normalizeViajeEstado(estado).toLowerCase();
  if (e === 'finalizado' || e === 'completado' || e === 'realizado') {
    return { label: 'Finalizado', backgroundColor: '#20BC7E', textColor: '#FFFFFF' };
  }
  if (e === 'cancelado') {
    return { label: 'Cancelado', backgroundColor: '#FEE2E2', textColor: '#DC2626' };
  }
  if (e === 'en curso') {
    return { label: 'En curso', backgroundColor: light.primarySoft, textColor: light.primary };
  }
  return { label: 'Programado', backgroundColor: '#FEF3C7', textColor: '#92400E' };
}

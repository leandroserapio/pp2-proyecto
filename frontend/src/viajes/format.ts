import { formatArs, formatDisplayDate } from '../gastos/format';

export { formatArs, formatDisplayDate };

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatViajeListDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return formatDisplayDate(iso);
  const mes = MESES[m - 1] ?? String(m);
  return `${d} ${mes}, ${y}`;
}

export function formatKmViaje(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km)) return '—';
  return `${km.toLocaleString('es-AR')} km`;
}

export function formatArs(value: number | string): string {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
  if (!Number.isFinite(n)) return '$0,00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(n);
}

export function parseAmountInput(raw: string): number | null {
  const cleaned = raw.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Ej.: `12500` → `12.500 Km.` (formato mock). */
export function formatKmDisplay(kmRaw: string): string {
  const digits = kmRaw.replace(/\D/g, '');
  if (!digits) return kmRaw.trim() || '';
  const n = Number(digits);
  if (!Number.isFinite(n)) return kmRaw;
  return `${n.toLocaleString('es-AR')} Km.`;
}

export function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-');
  const year = y ? Number(y) : new Date().getFullYear();
  const month = m ? Number(m) - 1 : new Date().getMonth();
  const day = d ? Number(d) : new Date().getDate();
  return new Date(year, month, day);
}

export const VIAJE_BANNER_URI =
  'https://images.unsplash.com/photo-1558981403-c5f9899a4962?auto=format&fit=crop&w=800&q=80';

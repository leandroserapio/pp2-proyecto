const KM_TOKEN = /\[\[KM:([\d.,]+)\]\]\s*$/;

export function mergeGastoDescripcion(kilometraje: string, descripcion: string): string {
  const km = kilometraje.trim().replace(',', '.');
  const desc = descripcion.trim();
  const parts: string[] = [];
  if (desc) parts.push(desc);
  if (km) parts.push(`[[KM:${km}]]`);
  return parts.join('\n\n');
}

export function splitGastoDescripcion(stored: string | null | undefined): {
  descripcion: string;
  kilometraje: string;
} {
  if (!stored) return { descripcion: '', kilometraje: '' };
  const m = stored.match(KM_TOKEN);
  if (!m) return { descripcion: stored.trim(), kilometraje: '' };
  const kilometraje = m[1]?.replace('.', ',') ?? '';
  const descripcion = stored.replace(KM_TOKEN, '').trim();
  return { descripcion, kilometraje };
}

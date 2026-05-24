const SALIDA_TOKEN = /^\[\[SALIDA:([^\]]+)\]\]\s*/;
const TIEMPO_TOKEN = /^\[\[TIEMPO:([^\]]+)\]\]\s*/;
const CONSUMO_TOKEN = /^\[\[CONSUMO:([^\]]+)\]\]\s*/;
const PRECIO_TOKEN = /^\[\[PRECIO_NAFTA:([^\]]+)\]\]\s*/;

export function mergeViajeNotas(
  salida: string,
  notas: string,
  tiempoEstimado = '',
  consumoLitros100 = '',
  precioNafta = '',
): string | null {
  const s = salida.trim();
  const t = tiempoEstimado.trim();
  const c = consumoLitros100.trim();
  const p = precioNafta.trim();
  const n = notas.trim();
  const parts: string[] = [];
  if (s) parts.push(`[[SALIDA:${s}]]`);
  if (t) parts.push(`[[TIEMPO:${t}]]`);
  if (c) parts.push(`[[CONSUMO:${c}]]`);
  if (p) parts.push(`[[PRECIO_NAFTA:${p}]]`);
  if (n) parts.push(n);
  if (parts.length === 0) return null;
  return parts.join('\n');
}

export function splitViajeNotas(stored: string | null | undefined): {
  salida: string;
  tiempoEstimado: string;
  consumoLitros100: string;
  precioNafta: string;
  notas: string;
} {
  if (!stored) return { salida: '', tiempoEstimado: '', consumoLitros100: '', precioNafta: '', notas: '' };
  let rest = stored.trim();
  const readToken = (token: RegExp) => {
    const m = rest.match(token);
    if (!m) return '';
    rest = rest.replace(token, '').trim();
    return m[1]?.trim() ?? '';
  };
  const salida = readToken(SALIDA_TOKEN);
  const tiempoEstimado = readToken(TIEMPO_TOKEN);
  const consumoLitros100 = readToken(CONSUMO_TOKEN);
  const precioNafta = readToken(PRECIO_TOKEN);
  return { salida, tiempoEstimado, consumoLitros100, precioNafta, notas: rest.trim() };
}

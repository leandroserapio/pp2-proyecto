const SALIDA_TOKEN = /^\[\[SALIDA:([^\]]+)\]\]\s*/;

export function mergeViajeNotas(salida: string, notas: string): string | null {
  const s = salida.trim();
  const n = notas.trim();
  const parts: string[] = [];
  if (s) parts.push(`[[SALIDA:${s}]]`);
  if (n) parts.push(n);
  if (parts.length === 0) return null;
  return parts.join('\n');
}

export function splitViajeNotas(stored: string | null | undefined): {
  salida: string;
  notas: string;
} {
  if (!stored) return { salida: '', notas: '' };
  const m = stored.match(SALIDA_TOKEN);
  if (!m) return { salida: '', notas: stored.trim() };
  const salida = m[1]?.trim() ?? '';
  const notas = stored.replace(SALIDA_TOKEN, '').trim();
  return { salida, notas };
}

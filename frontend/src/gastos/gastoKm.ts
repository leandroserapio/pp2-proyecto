const KM_TOKEN = /\[\[KM:([\d.,]+)\]\]\s*$/;

export function cleanGastoDescripcion(stored: string | null | undefined): string {
  if (!stored) return '';
  return stored.replace(KM_TOKEN, '').trim();
}

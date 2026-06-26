import type { Ionicons } from '@expo/vector-icons';
import type { ModoAlerta, Moto, Recordatorio, TipoRecordatorio } from '../types/models';

export type UnidadTiempo = 'DIAS' | 'SEMANAS' | 'MESES';

export type RecordatorioPresetMeta = {
  tipo: TipoRecordatorio;
  titulo: string;
  descripcion: string;
  accionNotificacion: string;
  icon: keyof typeof Ionicons.glyphMap;
  modoDefault: ModoAlerta;
  intervaloKmDefault?: number;
  intervaloDiasDefault?: number;
};

export const UNIDADES_TIEMPO: { unidad: UnidadTiempo; label: string }[] = [
  { unidad: 'DIAS', label: 'Días' },
  { unidad: 'SEMANAS', label: 'Semanas' },
  { unidad: 'MESES', label: 'Meses' },
];

export const RECORDATORIO_PRESETS: RecordatorioPresetMeta[] = [
  {
    tipo: 'PRESION_NEUMATICOS',
    titulo: 'Presión de neumáticos',
    descripcion: 'Controlá la presión por tiempo o kilometraje',
    accionNotificacion: 'Recuerda controlar la presión de los neumáticos',
    icon: 'speedometer-outline',
    modoDefault: 'TIEMPO',
    intervaloDiasDefault: 7,
    intervaloKmDefault: 500,
  },
  {
    tipo: 'NIVEL_ACEITE',
    titulo: 'Nivel de aceite',
    descripcion: 'Revisá el nivel por tiempo o kilometraje',
    accionNotificacion: 'Recuerda revisar el nivel de aceite',
    icon: 'water-outline',
    modoDefault: 'KILOMETRAJE',
    intervaloKmDefault: 500,
    intervaloDiasDefault: 7,
  },
  {
    tipo: 'LUBRICACION_CADENA',
    titulo: 'Lubricación de cadena',
    descripcion: 'Mantené la cadena por tiempo o kilometraje',
    accionNotificacion: 'Recuerda lubricar la cadena',
    icon: 'link-outline',
    modoDefault: 'KILOMETRAJE',
    intervaloKmDefault: 750,
    intervaloDiasDefault: 14,
  },
  {
    tipo: 'TENSION_CADENA',
    titulo: 'Ajuste de tensión de cadena',
    descripcion: 'Ajustá la tensión por tiempo o kilometraje',
    accionNotificacion: 'Recuerda ajustar la tensión de la cadena',
    icon: 'git-commit-outline',
    modoDefault: 'KILOMETRAJE',
    intervaloKmDefault: 1000,
    intervaloDiasDefault: 30,
  },
  {
    tipo: 'CAMBIO_ACEITE',
    titulo: 'Cambio de aceite',
    descripcion: 'Programá el cambio por tiempo o kilometraje',
    accionNotificacion: 'Recuerda cambiar el aceite',
    icon: 'beaker-outline',
    modoDefault: 'KILOMETRAJE',
    intervaloKmDefault: 4000,
    intervaloDiasDefault: 90,
  },
  {
    tipo: 'FILTRO_AIRE',
    titulo: 'Limpieza del filtro de aire',
    descripcion: 'Limpiá el filtro por tiempo o kilometraje',
    accionNotificacion: 'Recuerda limpiar el filtro de aire',
    icon: 'funnel-outline',
    modoDefault: 'KILOMETRAJE',
    intervaloKmDefault: 5000,
    intervaloDiasDefault: 180,
  },
];

export function getPresetMeta(tipo: TipoRecordatorio): RecordatorioPresetMeta | undefined {
  return RECORDATORIO_PRESETS.find((p) => p.tipo === tipo);
}

function motoDisplayName(moto: Moto): string {
  return `${moto.marca} ${moto.modelo}`.trim();
}

function formatTiempoTranscurrido(dias: number): string {
  if (dias <= 0) return 'Es momento de revisarlo';
  if (dias === 1) return 'Ha pasado 1 día';
  if (dias % 30 === 0 && dias >= 30) {
    const meses = dias / 30;
    return meses === 1 ? 'Ha pasado 1 mes' : `Han pasado ${meses} meses`;
  }
  if (dias % 7 === 0 && dias >= 7) {
    const semanas = dias / 7;
    return semanas === 1 ? 'Ha pasado 1 semana' : `Han pasado ${semanas} semanas`;
  }
  return `Han pasado ${dias} días`;
}

function formatKmTranscurrido(km: number): string {
  if (km <= 0) return 'Es momento de revisarlo';
  const fmt = km.toLocaleString('es-AR');
  return km === 1 ? 'Ha pasado 1 km' : `Han pasado ${fmt} km`;
}

export function buildMensajeNotificacionRecordatorio(
  recordatorio: Pick<Recordatorio, 'tipoRecordatorio' | 'modoAlerta' | 'intervaloKm' | 'intervaloDias'>,
  moto: Moto,
): { title: string; body: string } {
  const preset = getPresetMeta(recordatorio.tipoRecordatorio);
  const accion = preset?.accionNotificacion ?? 'Recuerda revisar el mantenimiento';
  const motoNombre = motoDisplayName(moto);

  if (recordatorio.modoAlerta === 'KILOMETRAJE') {
    const km = recordatorio.intervaloKm ?? preset?.intervaloKmDefault ?? 500;
    return {
      title: preset?.titulo ?? 'Recordatorio',
      body: `${accion}. ${formatKmTranscurrido(km)} desde el último control${motoNombre ? ` · ${motoNombre}` : ''}.`,
    };
  }

  const dias = recordatorio.intervaloDias ?? preset?.intervaloDiasDefault ?? 7;
  return {
    title: preset?.titulo ?? 'Recordatorio',
    body: `${accion}. ${formatTiempoTranscurrido(dias)} desde el último control${motoNombre ? ` · ${motoNombre}` : ''}.`,
  };
}

export function diasToUnidad(dias: number): { valor: number; unidad: UnidadTiempo } {
  if (dias >= 30 && dias % 30 === 0) {
    return { valor: dias / 30, unidad: 'MESES' };
  }
  if (dias >= 7 && dias % 7 === 0) {
    return { valor: dias / 7, unidad: 'SEMANAS' };
  }
  return { valor: dias, unidad: 'DIAS' };
}

export function unidadToDias(valor: number, unidad: UnidadTiempo): number {
  if (unidad === 'SEMANAS') return valor * 7;
  if (unidad === 'MESES') return valor * 30;
  return valor;
}

export function formatIntervaloTiempo(dias: number | null | undefined): string {
  if (!dias || dias <= 0) return '-';
  if (dias % 30 === 0 && dias >= 30) {
    const meses = dias / 30;
    return meses === 1 ? 'Cada mes' : `Cada ${meses} meses`;
  }
  if (dias % 7 === 0 && dias >= 7) {
    const semanas = dias / 7;
    return semanas === 1 ? 'Cada semana' : `Cada ${semanas} semanas`;
  }
  return dias === 1 ? 'Cada día' : `Cada ${dias} días`;
}

export function parseIsoDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toIsoDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calcularProximaAlerta(
  recordatorio: {
    modoAlerta: ModoAlerta;
    intervaloDias?: number | null;
    intervaloKm?: number | null;
    fechaInicio?: string | null;
    kmInicio?: number | null;
    activo?: boolean;
  },
  kmActual: number,
): { label: string; vencido: boolean } {
  if (!recordatorio.activo) {
    return { label: 'Desactivado', vencido: false };
  }

  if (recordatorio.modoAlerta === 'TIEMPO') {
    const inicio = parseIsoDateOnly(recordatorio.fechaInicio);
    const intervalo = recordatorio.intervaloDias ?? 7;
    if (!inicio) return { label: 'Sin fecha de inicio', vencido: false };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = hoy.getTime() - inicio.getTime();
    const diasTranscurridos = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const ciclos = Math.floor(diasTranscurridos / intervalo);
    const proximoDia = ciclos * intervalo + intervalo;
    const proximaFecha = new Date(inicio);
    proximaFecha.setDate(proximaFecha.getDate() + proximoDia);

    const vencido = diasTranscurridos >= proximoDia;
    const fmt = proximaFecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    return { label: vencido ? `Vencido · ${fmt}` : `Próximo: ${fmt}`, vencido };
  }

  const kmInicio = recordatorio.kmInicio ?? 0;
  const intervalo = recordatorio.intervaloKm ?? 500;
  const kmRecorridos = Math.max(0, kmActual - kmInicio);
  const ciclos = Math.floor(kmRecorridos / intervalo);
  const proximoKm = kmInicio + (ciclos + 1) * intervalo;
  const vencido = kmActual >= proximoKm;
  return {
    label: vencido
      ? `Vencido · ${proximoKm.toLocaleString('es-AR')} km`
      : `Próximo: ${proximoKm.toLocaleString('es-AR')} km`,
    vencido,
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombre: string;
  email: string;
}

export interface UsuarioInput {
  nombre: string;
  email: string;
  password: string;
  preguntaSecreta: string;
  respuestaSecreta: string;
  marcaMoto: string;
  modeloMoto: string;
  anioMoto?: number | null;
  patenteMoto?: string | null;
  kilometrajeActualMoto?: number | null;
}

/** Respuesta del backend al registrar (puede incluir password; no la usamos en UI). */
export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  password?: string;
  preguntaSecreta?: string;
}

export interface Moto {
  idMoto?: number;
  marca: string;
  modelo: string;
  anio?: number | null;
  patente?: string | null;
  kilometrajeActual?: number | null;
  fechaUltimaActualizacionKm?: string | null;
  usuario?: unknown;
}

export interface Gasto {
  idGasto?: number;
  tipo: string;
  descripcion?: string | null;
  monto: number | string;
  fecha: string;
  moto?: unknown;
}

export interface Mantenimiento {
  idMantenimiento?: number;
  tipo: string;
  descripcion?: string | null;
  fecha: string;
  kilometraje?: number | null;
  costo?: number | string | null;
  moto?: unknown;
}

export interface Viaje {
  idViaje?: number;
  destino: string;
  fechaSalida: string;
  kilometrosEstimados?: number | null;
  presupuestoEstimado?: number | string | null;
  notas?: string | null;
  estado?: string | null;
  moto?: unknown;
}

export type TipoRecordatorio =
  | 'PRESION_NEUMATICOS'
  | 'NIVEL_ACEITE'
  | 'LUBRICACION_CADENA'
  | 'TENSION_CADENA'
  | 'CAMBIO_ACEITE'
  | 'FILTRO_AIRE';

export type ModoAlerta = 'TIEMPO' | 'KILOMETRAJE';

export interface Recordatorio {
  idRecordatorio?: number;
  tipoRecordatorio: TipoRecordatorio;
  modoAlerta: ModoAlerta;
  intervaloKm?: number | null;
  intervaloDias?: number | null;
  fechaInicio?: string | null;
  kmInicio?: number | null;
  activo?: boolean;
  moto?: unknown;
}

export interface RecordatorioUpdate {
  modoAlerta?: ModoAlerta;
  intervaloKm?: number | null;
  intervaloDias?: number | null;
  fechaInicio?: string | null;
  kmInicio?: number | null;
  activo?: boolean;
}

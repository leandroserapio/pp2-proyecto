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
}

/** Respuesta del backend al registrar (puede incluir password; no la usamos en UI). */
export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  password?: string;
}

export interface Moto {
  idMoto?: number;
  marca: string;
  modelo: string;
  anio?: number | null;
  patente?: string | null;
  kilometrajeActual?: number | null;
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

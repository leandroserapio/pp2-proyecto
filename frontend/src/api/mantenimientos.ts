import type { Mantenimiento } from '../types/models';
import { apiRequest } from './client';

export function listarMantenimientosPorMoto(idMoto: number): Promise<Mantenimiento[]> {
  return apiRequest<Mantenimiento[]>(`/api/mantenimientos/moto/${idMoto}`);
}

export function crearMantenimiento(
  idMoto: number,
  body: Omit<Mantenimiento, 'idMantenimiento' | 'moto'>,
): Promise<Mantenimiento> {
  return apiRequest<Mantenimiento>(`/api/mantenimientos/moto/${idMoto}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function editarMantenimiento(
  idMantenimiento: number,
  body: Omit<Mantenimiento, 'idMantenimiento' | 'moto'>,
): Promise<Mantenimiento> {
  return apiRequest<Mantenimiento>(`/api/mantenimientos/${idMantenimiento}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function eliminarMantenimiento(idMantenimiento: number): Promise<string> {
  return apiRequest<string>(`/api/mantenimientos/${idMantenimiento}`, { method: 'DELETE' });
}

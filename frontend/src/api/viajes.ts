import type { Viaje } from '../types/models';
import { apiRequest } from './client';

export function listarViajes(): Promise<Viaje[]> {
  return apiRequest<Viaje[]>('/api/viajes');
}

export function listarViajesPorMoto(idMoto: number): Promise<Viaje[]> {
  return apiRequest<Viaje[]>(`/api/viajes/moto/${idMoto}`);
}

export function crearViaje(idMoto: number, body: Omit<Viaje, 'idViaje' | 'moto'>): Promise<Viaje> {
  return apiRequest<Viaje>(`/api/viajes/moto/${idMoto}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function editarViaje(idViaje: number, body: Omit<Viaje, 'idViaje' | 'moto'>): Promise<Viaje> {
  return apiRequest<Viaje>(`/api/viajes/${idViaje}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function eliminarViaje(idViaje: number): Promise<string> {
  return apiRequest<string>(`/api/viajes/${idViaje}`, { method: 'DELETE' });
}

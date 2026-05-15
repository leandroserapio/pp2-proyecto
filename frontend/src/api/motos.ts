import type { Moto } from '../types/models';
import { apiRequest } from './client';

export function listarMotosPorUsuario(idUsuario: number): Promise<Moto[]> {
  return apiRequest<Moto[]>(`/api/motos/usuario/${idUsuario}`);
}

export function crearMoto(idUsuario: number, body: Omit<Moto, 'idMoto' | 'usuario'>): Promise<Moto> {
  return apiRequest<Moto>(`/api/motos/usuario/${idUsuario}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function editarMoto(idMoto: number, body: Omit<Moto, 'idMoto' | 'usuario'>): Promise<Moto> {
  return apiRequest<Moto>(`/api/motos/${idMoto}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function sumarKilometros(idMoto: number, kilometros: number): Promise<Moto> {
  return apiRequest<Moto>(`/api/motos/${idMoto}/sumar-kilometros`, {
    method: 'PATCH',
    body: JSON.stringify({ kilometros }),
  });
}

export function eliminarMoto(idMoto: number): Promise<string> {
  return apiRequest<string>(`/api/motos/${idMoto}`, { method: 'DELETE' });
}

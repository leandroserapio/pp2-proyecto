import type { Gasto } from '../types/models';
import { apiRequest } from './client';

export function listarGastosPorMoto(idMoto: number): Promise<Gasto[]> {
  return apiRequest<Gasto[]>(`/api/gastos/moto/${idMoto}`);
}

export function crearGasto(idMoto: number, body: Omit<Gasto, 'idGasto' | 'moto'>): Promise<Gasto> {
  return apiRequest<Gasto>(`/api/gastos/moto/${idMoto}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function editarGasto(idGasto: number, body: Omit<Gasto, 'idGasto' | 'moto'>): Promise<Gasto> {
  return apiRequest<Gasto>(`/api/gastos/${idGasto}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function eliminarGasto(idGasto: number): Promise<string> {
  return apiRequest<string>(`/api/gastos/${idGasto}`, { method: 'DELETE' });
}

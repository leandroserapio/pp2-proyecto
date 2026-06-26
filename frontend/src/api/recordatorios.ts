import type { Recordatorio, RecordatorioUpdate } from '../types/models';
import { apiRequest } from './client';

export function listarRecordatoriosPorMoto(idMoto: number): Promise<Recordatorio[]> {
  return apiRequest<Recordatorio[]>(`/api/recordatorios/moto/${idMoto}`);
}

export function inicializarRecordatorios(idMoto: number): Promise<Recordatorio[]> {
  return apiRequest<Recordatorio[]>(`/api/recordatorios/moto/${idMoto}/inicializar`, {
    method: 'POST',
  });
}

export function actualizarRecordatorio(
  idRecordatorio: number,
  body: RecordatorioUpdate,
): Promise<Recordatorio> {
  return apiRequest<Recordatorio>(`/api/recordatorios/${idRecordatorio}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function toggleRecordatorio(idRecordatorio: number): Promise<Recordatorio> {
  return apiRequest<Recordatorio>(`/api/recordatorios/${idRecordatorio}/toggle`, {
    method: 'PATCH',
  });
}

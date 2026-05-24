import type { LoginRequest, LoginResponse, Usuario, UsuarioInput } from '../types/models';
import { apiRequest } from './client';

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/usuarios/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function registrarUsuario(body: UsuarioInput): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function obtenerUsuario(idUsuario: number): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(`/api/usuarios/${idUsuario}`);
}

export function obtenerPreguntaSecreta(email: string): Promise<{ email: string; preguntaSecreta: string }> {
  return apiRequest<{ email: string; preguntaSecreta: string }>(
    `/api/usuarios/recuperacion/pregunta?email=${encodeURIComponent(email)}`,
  );
}

export function recuperarPassword(body: {
  email: string;
  respuestaSecreta: string;
  nuevaPassword: string;
}): Promise<string> {
  return apiRequest<string>('/api/usuarios/recuperacion/reset', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

import type { LoginRequest, LoginResponse, Usuario, UsuarioInput } from '../types/models';
import { apiRequest } from './client';

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/usuarios/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function registrarUsuario(body: UsuarioInput): Promise<Usuario> {
  return apiRequest<Usuario>('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

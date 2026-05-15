import { Platform } from 'react-native';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * URL base del backend Spring Boot.
 * - Emulador Android: 10.0.2.2 apunta al host (localhost de tu PC).
 * - iOS simulador / web: localhost.
 * - Dispositivo físico: definí EXPO_PUBLIC_API_URL con la IP de tu PC (ej. http://192.168.0.10:8080).
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return trimTrailingSlash(fromEnv.trim());
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
}

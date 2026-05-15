import { getApiBaseUrl } from '../config/apiBase';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface SpringErrorBody {
  message?: string;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  const merged = new Headers(baseHeaders);
  if (options.headers) {
    const h = new Headers(options.headers as HeadersInit);
    h.forEach((value, key) => merged.set(key, value));
  }
  if (options.body && !merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers: merged });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let msg = res.statusText;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      msg = String((data as SpringErrorBody).message ?? msg);
    } else if (typeof data === 'string' && data.length > 0) {
      msg = data;
    }
    throw new ApiError(msg || 'Error al comunicarse con el servidor', res.status);
  }

  return data as T;
}

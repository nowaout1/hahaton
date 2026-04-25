import { BASE_URL } from '@/shared/config';

let token: string | null = null;

export const setToken = (t: string | null) => {
  token = t;
  if (typeof window === 'undefined') return;
  if (t) {
    localStorage.setItem('access_token', t);
  } else {
    localStorage.removeItem('access_token');
  }
};

export const getToken = (): string | null => {
  if (token) return token;
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('access_token');
  if (stored) token = stored;
  return token;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const t = getToken();
  if (t) {
    headers.set('Authorization', `Bearer ${t}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Ошибка ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return (await res.blob()) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => apiRequest<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: BodyInit | object, init: RequestInit = {}) => {
    const payload = body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)
      ? JSON.stringify(body)
      : (body as BodyInit | undefined);
    return apiRequest<T>(path, { ...init, method: 'POST', body: payload });
  },
  put: <T>(path: string, body?: BodyInit | object, init: RequestInit = {}) => {
    const payload = body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)
      ? JSON.stringify(body)
      : (body as BodyInit | undefined);
    return apiRequest<T>(path, { ...init, method: 'PUT', body: payload });
  },
  delete: <T>(path: string, init?: RequestInit) => apiRequest<T>(path, { ...init, method: 'DELETE' }),
};

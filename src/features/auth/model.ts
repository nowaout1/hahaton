import { api, getToken, setToken } from '@/shared/api-client';
import type { AuthCredentials, RegisterPayload, TokenResponse, User } from '@/shared/types';

export async function login(credentials: AuthCredentials): Promise<User> {
  const form = new URLSearchParams({ username: credentials.username, password: credentials.password });
  const token = await api.post<TokenResponse>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  setToken(token.access_token);
  return fetchCurrentUser();
}

export async function register(payload: RegisterPayload): Promise<User> {
  return api.post<User>('/auth/register', payload);
}

export async function verify(token: string): Promise<User> {
  return api.post<User>('/auth/verify', { token });
}

export async function fetchCurrentUser(): Promise<User> {
  return api.get<User>('/auth/me');
}

export function logout(): void {
  setToken(null);
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

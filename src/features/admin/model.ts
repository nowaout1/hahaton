import { api } from '@/shared/api-client';
import type { User, UserRole } from '@/shared/types';

export interface UserFilter {
  verified?: boolean;
  alliance?: string;
  role?: UserRole;
}

export async function fetchUsers(params: UserFilter = {}): Promise<User[]> {
  const search = new URLSearchParams();
  if (params.verified !== undefined) search.set('verified', String(params.verified));
  if (params.alliance) search.set('alliance', params.alliance);
  if (params.role) search.set('role', params.role);
  const query = search.toString();
  return api.get<User[]>(`/admin/users${query ? `?${query}` : ''}`);
}

export async function verifyUser(userId: number): Promise<User> {
  return api.put<User>(`/admin/users/${userId}/verify`);
}

export async function deleteUser(userId: number): Promise<void> {
  return api.delete<void>(`/admin/users/${userId}`);
}

export async function changeRole(userId: number, role: UserRole): Promise<User> {
  return api.put<User>(`/admin/users/${userId}/role?new_role=${role}`);
}

export async function changeAlliance(userId: number, alliance: string): Promise<User> {
  return api.put<User>(`/admin/users/${userId}/alliance?new_alliance=${encodeURIComponent(alliance)}`);
}

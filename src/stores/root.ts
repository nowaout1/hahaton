import type { User } from '@/shared/types';

export interface AppSession {
  currentUser: User | null;
}

export const initialSession: AppSession = {
  currentUser: null,
};

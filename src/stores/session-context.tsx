"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { User } from '@/shared/types';
import { fetchCurrentUser, hasToken, logout as logoutApi } from '@/features/auth/model';

interface SessionContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  hydrateUser: () => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const hydrateUser = useCallback(async () => {
    if (!hasToken()) return;
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      logoutApi();
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, hydrateUser, logout }),
    [hydrateUser, logout, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return value;
}

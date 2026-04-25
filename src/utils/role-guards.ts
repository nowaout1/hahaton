import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User, UserRole } from '@/shared/types';

export function useRequireRole(user: User | null, required: UserRole | UserRole[]) {
  const router = useRouter();

  useEffect(() => {
    const roles = Array.isArray(required) ? required : [required];
    if (user && !roles.includes(user.role)) {
      router.replace('/403');
    }
  }, [user, required, router]);

  return user;
}

'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './useAuth';

type Options = {
  redirectTo?: string;
  allowWhileBootstrapping?: boolean;
};

export function useAuthGuard(options: Options = {}) {
  const { redirectTo = '/login', allowWhileBootstrapping = false } = options;
  const { user, isBootstrapped, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const nextUrl = useMemo(() => {
    const s = search?.toString();
    return s ? `${pathname}?${s}` : pathname;
  }, [pathname, search]);

  const checking = useMemo(() => !isBootstrapped, [isBootstrapped]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isLoggedIn) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(nextUrl)}`);
    }
  }, [isBootstrapped, isLoggedIn, redirectTo, nextUrl, router]);

  const canRender = allowWhileBootstrapping ? true : isBootstrapped && isLoggedIn;

  return {
    user,
    checking,
    canRender,
  };
}

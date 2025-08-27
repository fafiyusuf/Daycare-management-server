"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsAuthReady(true);
      } else {
        // Fallback if hydration takes time
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          setIsAuthReady(true);
          unsub();
        });
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      if (!isAuthenticated || user?.role !== 'admin') {
        toast.error("Access denied. You must be an administrator.");
        router.push('/public');
      }
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}

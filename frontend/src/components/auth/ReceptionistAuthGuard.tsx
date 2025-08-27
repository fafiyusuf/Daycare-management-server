"use client";

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ReceptionistAuthGuardProps {
  children: React.ReactNode;
}

export function ReceptionistAuthGuard({ children }: ReceptionistAuthGuardProps) {
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
      if (!isAuthenticated || user?.role !== 'receptionist') {
        toast.error("Access denied. You must be a receptionist.");
        router.push('/public');
      }
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user?.role === 'receptionist') {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
} 
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, only users with one of these roles can access */
  roles?: UserRole[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (roles && !userProfile) {
      router.push('/login');
      return;
    }

    // Role-based check (only after profile is loaded)
    if (roles && userProfile && !roles.includes(userProfile.role)) {
      router.push('/dashboard');
    }
  }, [user, userProfile, loading, router, roles]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
          <p className='text-gray-600'>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Profile required but null after loading completed — fetch failed. Redirect handled in useEffect above.
  if (roles && !userProfile) {
    return null;
  }

  // If roles required and user doesn't have one, block (redirect handled in useEffect)
  if (roles && userProfile && !roles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
};

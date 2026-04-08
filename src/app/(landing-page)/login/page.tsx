'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';

import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect after Firebase login using token claims, without waiting for /auth/me.
  useEffect(() => {
    if (loading || !user) return;

    let isCancelled = false;

    const redirectByClaim = async () => {
      try {
        await user.getIdToken(true);
        const tokenResult = await user.getIdTokenResult();
        const roleClaim = tokenResult.claims.role;
        const isAdmin = typeof roleClaim === 'string' && roleClaim === 'admin';

        if (!isCancelled) {
          router.replace(isAdmin ? '/admin/course' : '/dashboard');
        }
      } catch {
        if (!isCancelled) {
          router.replace('/dashboard');
        }
      }
    };

    redirectByClaim();

    return () => {
      isCancelled = true;
    };
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-sm text-slate-600'>Memuat...</p>
      </div>
    );
  }

  // Show login form only if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // While redirecting, show placeholder.
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-sm text-slate-600'>Mengalihkan...</p>
    </div>
  );
}

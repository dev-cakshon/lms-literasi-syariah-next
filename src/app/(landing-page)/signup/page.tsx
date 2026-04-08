'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SignupForm } from '@/components/auth/SignupForm';

import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user && userProfile) {
      router.replace(isAdmin ? '/admin/course' : '/dashboard');
    }
  }, [loading, user, userProfile, isAdmin, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-sm text-slate-600'>Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <SignupForm />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-sm text-slate-600'>Mengalihkan...</p>
    </div>
  );
}

'use client';

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Logo } from '@/components/Logo';

import { useAuth } from '@/contexts/AuthContext';

import SidebarRoutes from './SidebarRoutes';

export const Sidebar = () => {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className='h-full shadow-sm border-r flex flex-col overflow-y-auto bg-white '>
      <div className='p-6'>
        <Logo />
      </div>
      <div className='flex flex-col flex-1 w-full'>
        <SidebarRoutes />
      </div>
      {/* User Info & Sign Out */}
      <div className='border-t p-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
            <User className='w-4 h-4 text-primary-600' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-slate-700 truncate'>
              {userProfile?.name || user?.email || 'User'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className='w-full flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition'
        >
          <LogOut className='w-4 h-4' />
          Keluar
        </button>
      </div>
    </div>
  );
};

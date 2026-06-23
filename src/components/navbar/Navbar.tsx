'use client';

import { LogOut, Menu, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/Logo';

import { useAuth } from '@/contexts/AuthContext';

import { NavbarRoutes } from './NavbarRoutes';

export const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className='sticky top-0 z-50 w-full bg-white border-b border-slate-200'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='grid h-16 grid-cols-3 items-center'>
          {/* Logo */}
          <div className='shrink-0'>
            <Logo logotype='textless' theme='light' size='sm' />
          </div>

          {/* Desktop Navigation — always truly centered */}
          <div className='hidden md:flex md:items-center md:gap-1 justify-center'>
            <NavbarRoutes />
          </div>

          {/* Right side: desktop user area + mobile menu button */}
          <div className='flex items-center justify-end gap-2'>
            <div className='hidden md:flex md:items-center md:gap-2'>
              <div className='flex items-center gap-2 px-3 py-2 rounded-md'>
                <div className='w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center'>
                  <User className='w-4 h-4 text-primary-600' />
                </div>
                <span className='text-sm font-semibold text-slate-800 max-w-32 truncate'>
                  {userProfile?.name || user?.email || 'Student'}
                </span>
              </div>
              <button
                type='button'
                onClick={handleSignOut}
                aria-label='Keluar'
                title='Keluar'
                className='p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer'
              >
                <LogOut className='w-5 h-5' />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type='button'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t bg-white'>
          <div className='px-4 py-3 space-y-1'>
            <NavbarRoutes onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <div className='border-t px-4 py-3'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-primary-600' />
              </div>
              <span className='text-sm font-semibold text-slate-800'>
                {userProfile?.name || user?.email || 'Student'}
              </span>
            </div>
            <button
              type='button'
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className='w-full flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition'
            >
              <LogOut className='w-4 h-4' />
              Keluar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

'use client';

import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/sidebar/Logo';

import { useAuth } from '@/contexts/AuthContext';

import { NavbarRoutes } from './NavbarRoutes';

export const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className='sticky top-0 z-50 w-full bg-white shadow-sm'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <div className='shrink-0'>
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex md:items-center md:gap-1'>
            <NavbarRoutes />
          </div>

          {/* User Dropdown (Desktop) */}
          <div className='hidden md:block relative' ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className='flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition cursor-pointer'
            >
              <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-primary-600' />
              </div>
              <span className='text-sm font-medium text-slate-700 max-w-30 truncate'>
                {userProfile?.displayName || user?.email || 'Student'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  userDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {userDropdownOpen && (
              <div className='absolute right-0 mt-1 w-48 bg-white rounded-md border shadow-lg py-1'>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleSignOut();
                  }}
                  className='w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer'
                >
                  <LogOut className='w-4 h-4' />
                  Keluar
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t bg-white'>
          <div className='px-4 py-3 space-y-1'>
            <NavbarRoutes onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <div className='border-t px-4 py-3'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-primary-600' />
              </div>
              <span className='text-sm font-medium text-slate-700'>
                {userProfile?.displayName || user?.email || 'Student'}
              </span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className='w-full flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition'
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

'use client';

import { Library, LogOut, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  type Crumb,
  AdminBreadcrumb,
} from '@/components/admin/AdminBreadcrumb';
import { Logo } from '@/components/Logo';

import { useAuth } from '@/contexts/AuthContext';

const adminNav = [
  { icon: Library, label: 'Kursus', href: '/admin/course' },
  { icon: Users, label: 'Pengguna', href: '/admin/user' },
];

/**
 * Light admin shell: a calm top bar (brand + section nav + account) and a
 * breadcrumb row, applied to top-level admin pages.
 *
 * Pathname-aware on purpose: the course-editor sub-tree
 * (/admin/course/:courseId/*) keeps its own bespoke layout, so this shell
 * passes those routes through untouched and renders chrome everywhere else.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();

  const isCourseEditor = /^\/admin\/course\/[^/]+/.test(pathname);
  if (isCourseEditor) return <>{children}</>;

  const activeNav = adminNav.find((item) => pathname.startsWith(item.href));
  const crumbs: Crumb[] = activeNav ? [{ label: activeNav.label }] : [];

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className='min-h-screen bg-ivory'>
      {/* Top bar */}
      <header className='sticky top-0 z-50 border-b border-slate-200 bg-white'>
        <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Logo
                logotype='textless'
                theme='light'
                size='sm'
                showText={false}
              />
              <span className='rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-700'>
                Admin
              </span>
            </div>
            <nav className='flex items-center gap-1'>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                      'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      isActive &&
                        'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-700',
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'text-slate-500',
                        isActive && 'text-primary-600',
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2 rounded-md px-2 py-1.5'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-50'>
                <User className='h-4 w-4 text-primary-600' />
              </div>
              <span className='max-w-40 truncate text-sm font-semibold text-slate-800'>
                {userProfile?.name || user?.email || 'Admin'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              aria-label='Keluar'
              title='Keluar'
              className='rounded-md p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600'
            >
              <LogOut className='h-5 w-5' />
            </button>
          </div>
        </div>
      </header>

      {crumbs.length > 0 && <AdminBreadcrumb items={crumbs} />}

      <main>{children}</main>
    </div>
  );
}

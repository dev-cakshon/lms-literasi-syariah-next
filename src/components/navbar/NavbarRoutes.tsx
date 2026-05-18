'use client';

import {
  BotMessageSquare,
  Compass,
  Layout,
  Library,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';

const userRoutes = [
  {
    icon: Layout,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Compass,
    label: 'Kursus Saya',
    href: '/my-courses',
  },
  {
    icon: BotMessageSquare,
    label: 'Chatbot',
    href: '/chatbot',
  },
];

const adminRoutes = [
  {
    icon: Users,
    label: 'User',
    href: '/admin/user',
  },
  {
    icon: Library,
    label: 'Course',
    href: '/admin/course',
  },
];

interface NavbarRoutesProps {
  onNavigate?: () => void;
}

export const NavbarRoutes = ({ onNavigate }: NavbarRoutesProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const isAdminPage = pathname?.includes('/admin');
  const routes = isAdmin && isAdminPage ? adminRoutes : userRoutes;

  return (
    <>
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive =
          (pathname === '/' && route.href === '/') ||
          pathname === route.href ||
          pathname.startsWith(`${route.href}/`);

        return (
          <button
            key={route.href}
            onClick={() => {
              router.push(route.href);
              onNavigate?.();
            }}
            type='button'
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer',
              'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
              isActive &&
                'text-primary-600 bg-primary-50 hover:bg-primary-100 hover:text-primary-700',
            )}
          >
            <Icon
              size={18}
              className={cn('text-slate-500', isActive && 'text-primary-500')}
            />
            {route.label}
          </button>
        );
      })}
    </>
  );
};

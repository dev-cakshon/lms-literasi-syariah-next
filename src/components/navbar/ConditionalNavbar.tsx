'use client';

import { usePathname } from 'next/navigation';

import { Navbar } from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  // Admin routes render their own chrome via AdminShell — suppress the
  // student navbar so the two don't double-stack.
  const isAdminPage = /^\/admin(\/|$)/.test(pathname);
  const isStudentCoursePage = /^\/course\//.test(pathname);
  if (isAdminPage || isStudentCoursePage) return null;
  return <Navbar />;
}

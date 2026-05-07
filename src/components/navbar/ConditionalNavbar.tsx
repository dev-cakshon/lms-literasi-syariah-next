'use client';

import { usePathname } from 'next/navigation';

import { Navbar } from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isAdminCoursePage = /^\/admin\/course\/[^/]+/.test(pathname);
  if (isAdminCoursePage) return null;
  return <Navbar />;
}

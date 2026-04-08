'use client';

import { usePathname } from 'next/navigation';

import { Navbar } from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isEditPage = /^\/admin\/course\/[^/]+\/edit$/.test(pathname);
  if (isEditPage) return null;
  return <Navbar />;
}

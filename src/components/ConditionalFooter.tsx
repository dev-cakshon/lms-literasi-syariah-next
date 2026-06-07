'use client';

import { usePathname } from 'next/navigation';

import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (/^\/admin(\/|$)/.test(pathname)) return null;
  if (/^\/course\//.test(pathname)) return null;
  if (/^\/chatbot/.test(pathname)) return null;
  return <Footer />;
}

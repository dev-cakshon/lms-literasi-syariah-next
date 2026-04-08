import * as React from 'react';

import ConditionalNavbar from '@/components/navbar/ConditionalNavbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className='min-h-screen flex flex-col'>
        <ConditionalNavbar />
        <main className='flex-1'>{children}</main>
      </div>
    </ProtectedRoute>
  );
}

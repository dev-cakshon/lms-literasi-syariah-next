import * as React from 'react';

import ConditionalFooter from '@/components/ConditionalFooter';
import { FirstLoginNamePrompt } from '@/components/FirstLoginNamePrompt';
import ConditionalNavbar from '@/components/navbar/ConditionalNavbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <FirstLoginNamePrompt />
      <div className='min-h-screen flex flex-col'>
        <ConditionalNavbar />
        <main className='flex-1 flex flex-col'>{children}</main>
        <ConditionalFooter />
      </div>
    </ProtectedRoute>
  );
}

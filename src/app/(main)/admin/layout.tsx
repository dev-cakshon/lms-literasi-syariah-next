import * as React from 'react';

import { AdminShell } from '@/components/admin/AdminShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}

import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * A calm, centered empty/no-results state for admin lists and tables.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600'>
          <Icon className='h-6 w-6' />
        </div>
      )}
      <p className='text-base font-semibold text-slate-800'>{title}</p>
      {description && (
        <p className='mt-1 max-w-sm text-sm text-slate-500'>{description}</p>
      )}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  );
}

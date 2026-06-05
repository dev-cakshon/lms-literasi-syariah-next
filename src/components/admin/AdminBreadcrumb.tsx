'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Thin breadcrumb row for the admin light shell. The last crumb renders as
 * the current location (non-interactive); earlier crumbs link back.
 */
export function AdminBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label='Breadcrumb'
      className='flex h-11 items-center border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 lg:px-8'
    >
      <ol className='flex items-center gap-1 text-sm'>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${crumb.label}-${index}`}
              className='flex items-center gap-1'
            >
              {index > 0 && (
                <ChevronRight className='h-4 w-4 shrink-0 text-slate-300' />
              )}
              {isLast || !crumb.href ? (
                <span
                  className='font-medium text-slate-700'
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className='text-slate-500 transition-colors hover:text-primary-600'
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

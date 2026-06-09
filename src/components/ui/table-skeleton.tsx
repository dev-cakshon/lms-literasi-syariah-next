import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

/**
 * Renders shimmer placeholder rows inside a <Table> while data loads.
 * Use in place of <TableBody> during the loading state.
 */
export function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className='h-4 w-full max-w-[12rem]' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

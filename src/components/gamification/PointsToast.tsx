'use client';

import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PointsToastProps {
  points: number;
  isOpen: boolean;
  className?: string;
}

export const PointsToast = ({
  points,
  isOpen,
  className,
}: PointsToastProps) => {
  if (!isOpen || points <= 0) {
    return null;
  }

  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'fixed right-4 top-4 z-50 pointer-events-none',
        'flex items-center gap-2 rounded-lg border border-emerald-300',
        'bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg',
        'animate-in slide-in-from-top-3 fade-in duration-300',
        className
      )}
    >
      <Sparkles className='h-4 w-4' />
      <span>+{points} points</span>
    </div>
  );
};

export type { PointsToastProps };

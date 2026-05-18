'use client';

import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { BadgeDefinition } from './badgeDefinitions';

interface BadgeTileProps {
  definition: BadgeDefinition;
  unlocked: boolean;
}

export const BadgeTile = ({ definition, unlocked }: BadgeTileProps) => {
  const { Icon, label, tierGradient } = definition;
  const [from, to] = tierGradient;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 group',
        unlocked
          ? 'cursor-pointer transition-transform hover:-translate-y-2'
          : 'opacity-40 grayscale cursor-default',
      )}
      title={definition.description}
    >
      <div
        className='w-16 h-16 rounded-full p-[3px] shadow-lg shrink-0'
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <div className='w-full h-full bg-white rounded-full flex items-center justify-center relative'>
          <Icon className='size-7' style={{ color: to }} />
          {!unlocked && (
            <span className='absolute inset-0 flex items-center justify-center bg-black/10 rounded-full'>
              <Lock className='w-3 h-3 text-white' />
            </span>
          )}
        </div>
      </div>
      <p className='text-[11px] font-bold text-center text-[var(--color-on-surface)]'>
        {label}
      </p>
    </div>
  );
};

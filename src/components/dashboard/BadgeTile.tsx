'use client';

import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { BadgeDefinition, BadgeRarity } from './badgeDefinitions';

const rarityConfig: Record<
  BadgeRarity,
  {
    container: string;
    iconBg: string;
    iconColor: string;
    label: string;
    chip: string;
  }
> = {
  common: {
    container: 'border-slate-200 bg-white',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    label: 'Common',
    chip: 'text-slate-500 bg-slate-100 border-slate-200',
  },
  rare: {
    container:
      'border-primary-400 bg-primary-50 shadow-sm shadow-primary-200/60',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    label: 'Rare',
    chip: 'text-primary-700 bg-primary-100 border-primary-300',
  },
  legendary: {
    container:
      'border-amber-400 bg-amber-50 shadow-md shadow-amber-300/50 ring-1 ring-amber-300/40',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    label: 'Legendary',
    chip: 'text-amber-700 bg-amber-100 border-amber-300',
  },
};

interface BadgeTileProps {
  definition: BadgeDefinition;
  unlocked: boolean;
}

export const BadgeTile = ({ definition, unlocked }: BadgeTileProps) => {
  const { Icon, label, description, rarity, pointsToUnlock } = definition;
  const config = rarityConfig[rarity];

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        unlocked ? config.container : 'border-gray-200 bg-gray-50',
      )}
      title={description}
    >
      <div className='flex items-start justify-between gap-2'>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            unlocked ? config.iconBg : 'bg-gray-200 opacity-30',
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              unlocked ? config.iconColor : 'text-gray-500',
            )}
          />
        </div>
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full border',
            unlocked
              ? config.chip
              : 'text-gray-400 bg-gray-100 border-gray-200',
          )}
        >
          {config.label}
        </span>
      </div>

      <p
        className={cn(
          'mt-2 text-sm font-semibold',
          unlocked ? 'text-gray-800' : 'text-gray-400',
        )}
      >
        {label}
      </p>

      {unlocked ? (
        <p className='text-xs text-gray-500 mt-0.5'>{description}</p>
      ) : (
        <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-1'>
          <Lock className='w-3 h-3 shrink-0' />
          {pointsToUnlock > 0
            ? `${pointsToUnlock} pts to unlock`
            : 'Daftarkan akunmu'}
        </p>
      )}
    </div>
  );
};

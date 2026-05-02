'use client';

import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { BadgeDefinition, BadgeRarity } from './badgeDefinitions';

const rarityConfig: Record<
  BadgeRarity,
  {
    iconBg: string;
    iconColor: string;
    label: string;
    chip: string;
  }
> = {
  common: {
    iconBg: 'bg-white/10',
    iconColor: 'text-[#D9EDBF]',
    label: 'Common',
    chip: 'bg-[#D9EDBF]/20 text-[#D9EDBF]',
  },
  rare: {
    iconBg: 'bg-[#90D26D]/15',
    iconColor: 'text-[#90D26D]',
    label: 'Rare',
    chip: 'bg-[#90D26D]/25 text-[#90D26D]',
  },
  legendary: {
    iconBg: 'bg-[#FF9800]/15',
    iconColor: 'text-[#FF9800]',
    label: 'Legendary',
    chip: 'bg-[#FF9800]/20 text-[#FF9800]',
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
        unlocked
          ? 'bg-white/12 border-[#D9EDBF]/20'
          : 'bg-black/15 border-white/5 opacity-50',
      )}
      title={description}
    >
      <div className='flex items-start justify-between gap-2'>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            unlocked ? config.iconBg : 'bg-white/5',
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              unlocked ? config.iconColor : 'text-white/30',
            )}
          />
        </div>
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            unlocked ? config.chip : 'text-white/30 bg-white/5',
          )}
        >
          {config.label}
        </span>
      </div>

      <p className='mt-2 text-white text-xs font-bold'>{label}</p>

      {unlocked ? (
        <p className='text-[#D9EDBF]/65 text-[10px] mt-0.5'>{description}</p>
      ) : (
        <p className='text-[#D9EDBF]/65 text-[10px] mt-0.5 flex items-center gap-1'>
          <Lock className='w-3 h-3 shrink-0' />
          {pointsToUnlock > 0
            ? `${pointsToUnlock} pts to unlock`
            : 'Daftarkan akunmu'}
        </p>
      )}
    </div>
  );
};

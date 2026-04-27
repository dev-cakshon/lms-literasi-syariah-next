'use client';

import {
  BookOpenCheck,
  Lock,
  Medal,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';

import type { Badge } from '@/types';

type BadgeTier = 'common' | 'rare' | 'legendary';

interface BadgeTileProps {
  badge: Badge;
  label: string;
  description: string;
  tier: BadgeTier;
  unlocked: boolean;
  pointsToUnlock: number;
}

const getBadgeIcon = (badge: Badge, unlocked: boolean) => {
  const baseClass = 'h-5 w-5';
  const mutedClass = unlocked ? '' : ' opacity-30';

  switch (badge) {
    case 'newcomer':
      return <PartyPopper className={`${baseClass}${mutedClass}`} />;
    case 'first_step':
      return <BookOpenCheck className={`${baseClass}${mutedClass}`} />;
    case 'active_learner':
      return <Medal className={`${baseClass}${mutedClass}`} />;
    case 'perfect_score':
      return <ShieldCheck className={`${baseClass}${mutedClass}`} />;
    case 'number_1':
      return <Sparkles className={`${baseClass}${mutedClass}`} />;
    default:
      return <Trophy className={`${baseClass}${mutedClass}`} />;
  }
};

const getTierStyles = (tier: BadgeTier, unlocked: boolean) => {
  if (!unlocked) {
    return {
      tile: 'border-gray-200 bg-white/75 text-gray-500',
      iconWrap: 'bg-gray-100 text-gray-500',
      chip: 'bg-gray-100 text-gray-500',
    };
  }

  switch (tier) {
    case 'legendary':
      return {
        tile: 'border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-amber-900 shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_18px_36px_-20px_rgba(245,158,11,0.65)]',
        iconWrap: 'bg-amber-100 text-amber-700',
        chip: 'bg-amber-100 text-amber-700',
      };
    case 'rare':
      return {
        tile: 'border-sky-300 bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 text-sky-900 shadow-[0_0_0_1px_rgba(14,165,233,0.22),0_16px_32px_-22px_rgba(14,165,233,0.7)]',
        iconWrap: 'bg-sky-100 text-sky-700',
        chip: 'bg-sky-100 text-sky-700',
      };
    default:
      return {
        tile: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-primary-100 text-emerald-900 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_14px_30px_-20px_rgba(16,185,129,0.6)]',
        iconWrap: 'bg-primary-100 text-primary-700',
        chip: 'bg-primary-100 text-primary-700',
      };
  }
};

const getTierLabel = (tier: BadgeTier) => {
  switch (tier) {
    case 'legendary':
      return 'Legendary';
    case 'rare':
      return 'Rare';
    default:
      return 'Common';
  }
};

export const BadgeTile = ({
  badge,
  label,
  description,
  tier,
  unlocked,
  pointsToUnlock,
}: BadgeTileProps) => {
  const styles = getTierStyles(tier, unlocked);

  return (
    <article
      className={`rounded-2xl border px-4 py-4 transition-all duration-300 ${styles.tile}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className={`rounded-xl p-2.5 ${styles.iconWrap}`}>
          {unlocked ? (
            getBadgeIcon(badge, true)
          ) : (
            <Lock className='h-5 w-5 opacity-30' />
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${styles.chip}`}
        >
          {getTierLabel(tier)}
        </span>
      </div>

      <h4 className='mt-3 text-sm font-bold'>{label}</h4>
      <p className='mt-1 text-xs leading-5 text-gray-600'>{description}</p>

      {unlocked ? (
        <p className='mt-3 text-xs font-semibold text-primary-700'>Unlocked</p>
      ) : (
        <p className='mt-3 text-xs font-semibold text-gray-500'>
          {pointsToUnlock} points to unlock
        </p>
      )}
    </article>
  );
};

export type { BadgeTier, BadgeTileProps };

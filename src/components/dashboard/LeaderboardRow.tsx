import type { LucideIcon } from 'lucide-react';
import { Award, Star, User } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { LeaderboardUser } from '@/types';

export type LeaderboardRowVariant =
  | 'podium-gold'
  | 'podium-silver'
  | 'podium-bronze'
  | 'simplified'
  | 'me';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  rank: number;
  variant?: LeaderboardRowVariant;
  isCurrentUser?: boolean;
}

const PODIUM: Record<
  'podium-gold' | 'podium-silver' | 'podium-bronze',
  {
    outer: string;
    rankBadge: string;
    avatar: string;
    icon: LucideIcon;
    iconColor: string;
  }
> = {
  'podium-gold': {
    outer:
      'flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFF9C4] to-white border-2 border-[#FBC02D] shadow-[0_0_20px_rgba(251,192,45,0.2)]',
    rankBadge:
      'w-10 h-10 flex items-center justify-center rounded-full bg-[#FBC02D] text-white font-bold text-lg shadow-md shrink-0',
    avatar:
      'w-12 h-12 rounded-full border-2 border-[#FBC02D] shrink-0 bg-[var(--color-surface-container-high)] flex items-center justify-center',
    icon: Award,
    iconColor: 'text-[#FBC02D]',
  },
  'podium-silver': {
    outer:
      'flex items-center gap-4 p-4 rounded-2xl bg-[#f5f5f5] border-2 border-[#bdbdbd]',
    rankBadge:
      'w-10 h-10 flex items-center justify-center rounded-full bg-[#bdbdbd] text-white font-bold text-lg shrink-0',
    avatar:
      'w-12 h-12 rounded-full border-2 border-[#bdbdbd] shrink-0 bg-[var(--color-surface-container-high)] flex items-center justify-center',
    icon: Award,
    iconColor: 'text-[#9e9e9e]',
  },
  'podium-bronze': {
    outer:
      'flex items-center gap-4 p-4 rounded-2xl bg-[#fff7f2] border-2 border-[#d2691e]',
    rankBadge:
      'w-10 h-10 flex items-center justify-center rounded-full bg-[#d2691e] text-white font-bold text-lg shrink-0',
    avatar:
      'w-12 h-12 rounded-full border-2 border-[#d2691e] shrink-0 bg-[var(--color-surface-container-high)] flex items-center justify-center',
    icon: Award,
    iconColor: 'text-[#8b4513]',
  },
};

function AvatarCircle({
  user,
  className,
}: {
  user: LeaderboardUser;
  className: string;
}) {
  const photoURL = (user as LeaderboardUser & { photoURL?: string }).photoURL;
  return (
    <div className={cn('relative', className)}>
      {photoURL ? (
        <Image
          src={photoURL}
          alt={user.name}
          fill
          sizes='64px'
          className='rounded-full object-cover'
        />
      ) : (
        <User className='w-6 h-6 text-[var(--color-outline-variant)]' />
      )}
    </div>
  );
}

export const LeaderboardRow = ({
  user,
  rank,
  variant = 'simplified',
  isCurrentUser = false,
}: LeaderboardRowProps) => {
  if (variant === 'me') {
    return (
      <div className='flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-[var(--color-accent-lime)] shadow-lg relative overflow-hidden'>
        <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-accent-lime)]' />
        <span className='w-10 font-bold text-center text-[var(--color-emerald-deep)] text-lg shrink-0'>
          {rank}
        </span>
        <AvatarCircle
          user={user}
          className='w-12 h-12 rounded-full border-2 border-[var(--color-emerald-deep)] shrink-0 bg-[var(--color-surface-container-high)] flex items-center justify-center overflow-hidden'
        />
        <div className='flex-grow min-w-0'>
          <p className='font-bold text-[var(--color-on-surface)] text-base truncate'>
            {user.name}{' '}
            <span className='text-[10px] bg-[var(--color-accent-lime)] text-[var(--color-accent-lime-ink)] px-2 py-0.5 rounded ml-1 font-bold'>
              Kamu
            </span>
          </p>
          <p className='text-sm text-[var(--color-emerald-deep)] font-bold'>
            {user.totalPoints.toLocaleString()} pts
          </p>
        </div>
        <Star className='w-7 h-7 fill-current text-[var(--color-emerald-deep)]' />
      </div>
    );
  }

  if (variant in PODIUM) {
    const cfg = PODIUM[variant as keyof typeof PODIUM];
    const PodiumIcon = cfg.icon;
    return (
      <div className={cfg.outer}>
        <div className={cfg.rankBadge}>{rank}</div>
        <AvatarCircle
          user={user}
          className={cn(cfg.avatar, 'overflow-hidden')}
        />
        <div className='flex-grow min-w-0'>
          <p className='font-bold text-[var(--color-on-surface)] text-base truncate'>
            {user.name}
            {isCurrentUser && (
              <span className='ml-2 text-[10px] bg-[var(--color-accent-lime)] text-[var(--color-accent-lime-ink)] px-2 py-0.5 rounded font-bold'>
                Kamu
              </span>
            )}
          </p>
          <p className='text-xs text-[var(--color-on-surface-soft)] font-semibold'>
            {user.totalPoints.toLocaleString()} pts
          </p>
        </div>
        {variant === 'podium-gold' && (
          <div className='relative shrink-0'>
            <div className='absolute inset-0 bg-[#FBC02D] blur-md opacity-40 rounded-full' />
            <PodiumIcon
              className={cn('w-7 h-7 fill-current relative', cfg.iconColor)}
            />
          </div>
        )}
        {variant !== 'podium-gold' && (
          <PodiumIcon
            className={cn('w-7 h-7 fill-current shrink-0', cfg.iconColor)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-colors',
        isCurrentUser &&
          'border border-[var(--color-accent-lime)] bg-[var(--color-accent-lime)]/10',
      )}
    >
      <span className='w-10 text-center font-semibold text-[var(--color-on-surface-soft)] shrink-0'>
        {rank}
      </span>
      <AvatarCircle
        user={user}
        className='w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] shrink-0 flex items-center justify-center overflow-hidden'
      />
      <span
        className={cn(
          'flex-grow text-sm font-semibold truncate',
          isCurrentUser
            ? 'text-[var(--color-emerald-deep)]'
            : 'text-[var(--color-on-surface)]',
        )}
      >
        {user.name}
        {isCurrentUser && (
          <span className='ml-2 text-[10px] bg-[var(--color-accent-lime)] text-[var(--color-accent-lime-ink)] px-2 py-0.5 rounded font-bold'>
            Kamu
          </span>
        )}
      </span>
      <span className='text-xs font-bold text-[var(--color-on-surface-soft)] shrink-0'>
        {user.totalPoints.toLocaleString()} pts
      </span>
    </div>
  );
};

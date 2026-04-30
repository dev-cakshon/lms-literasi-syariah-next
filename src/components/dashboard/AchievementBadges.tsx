'use client';

import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';

import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { BadgeTile } from './BadgeTile';

export const AchievementBadges = () => {
  const { userProfile: profile, loading } = useAuth();

  if (loading || profile === null) {
    return (
      <div className='bg-white/12 backdrop-blur-md border border-[#D9EDBF]/25 rounded-2xl p-4 flex flex-col min-w-0'>
        <h2 className='text-white font-bold text-xl flex-shrink-0 mb-3'>
          🏅 Badges
        </h2>
        <div className='grid grid-cols-2 gap-1.5'>
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white/12 backdrop-blur-md border border-[#D9EDBF]/25 rounded-2xl p-4 flex flex-col min-w-0'>
      <h2 className='text-white font-bold text-xl flex-shrink-0 mb-3'>
        🏅 Badges
      </h2>
      <div className='grid grid-cols-2 gap-1.5 overflow-y-auto max-h-[172px] badges-scroll'>
        {BADGE_DEFINITIONS.map((def) => (
          <BadgeTile
            key={def.id}
            definition={def}
            unlocked={profile.badges.some((b) => b === def.id)}
          />
        ))}
      </div>
    </div>
  );
};

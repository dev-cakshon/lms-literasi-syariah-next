'use client';

import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';

import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { BadgeTile } from './BadgeTile';

export const AchievementBadges = () => {
  const { userProfile: profile, loading } = useAuth();

  if (loading || profile === null) {
    return (
      <div className='flex flex-col justify-center h-full'>
        <h3 className='text-lg font-bold text-gray-800 mb-4'>Badges</h3>
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center h-full'>
      <h3 className='text-lg font-bold text-gray-800 mb-4'>Badges</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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

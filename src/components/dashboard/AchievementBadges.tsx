'use client';

import { BadgeTile } from '@/components/dashboard/BadgeTile';
import Skeleton from '@/components/Skeleton';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, UserProfile } from '@/types';

const ALL_BADGES = [
  {
    key: 'newcomer',
    label: 'Newcomer',
    description: 'Membuat akun pertama di platform',
    tier: 'common',
    unlockPoints: 0,
  },
  {
    key: 'first_step',
    label: 'First Step',
    description: 'Menyelesaikan chapter pertama',
    tier: 'common',
    unlockPoints: 10,
  },
  {
    key: 'active_learner',
    label: 'Active Learner',
    description: 'Menyelesaikan aktivitas belajar',
    tier: 'rare',
    unlockPoints: 40,
  },
  {
    key: 'perfect_score',
    label: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    tier: 'rare',
    unlockPoints: 60,
  },
  {
    key: 'top_3',
    label: 'Top 3',
    description: 'Ranked in the top 3 on the leaderboard',
    tier: 'legendary',
    unlockPoints: 120,
  },
  {
    key: 'number_1',
    label: 'Number 1',
    description: 'Menjadi peringkat 1 di leaderboard',
    tier: 'legendary',
    unlockPoints: 180,
  },
] as const;

const hasBadge = (profile: UserProfile, badgeKey: Badge): boolean => {
  return profile.badges.some((badge) => badge === badgeKey);
};

export const AchievementBadges = () => {
  const { userProfile: profile, loading } = useAuth();

  if (loading || profile === null) {
    return (
      <div className='flex flex-col justify-center h-full'>
        <h3 className='text-lg font-bold text-ink mb-4'>Badges</h3>
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-4 flex items-end justify-between'>
        <h3 className='text-lg font-bold text-ink'>Badges</h3>
        <p className='text-xs font-medium text-gray-500'>
          {profile.badges.length} unlocked
        </p>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {ALL_BADGES.map((badge) => {
          const unlocked = hasBadge(profile, badge.key);
          const pointsToUnlock = Math.max(
            badge.unlockPoints - profile.totalPoints,
            0,
          );

          return (
            <BadgeTile
              key={badge.key}
              badge={badge.key}
              label={badge.label}
              description={badge.description}
              tier={badge.tier}
              unlocked={unlocked}
              pointsToUnlock={pointsToUnlock}
            />
          );
        })}
      </div>
    </div>
  );
};

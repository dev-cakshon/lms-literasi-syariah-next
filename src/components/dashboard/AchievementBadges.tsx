'use client';

import {
  BookOpenCheck,
  Lock,
  Medal,
  PartyPopper,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

import type { UserProfile } from '@/types';

const ALL_BADGES = [
  {
    key: 'newcomer',
    label: 'Newcomer',
    description: 'Membuat akun pertama di platform',
  },
  {
    key: 'first_step',
    label: 'First Step',
    description: 'Menyelesaikan chapter pertama',
  },
  {
    key: 'active_learner',
    label: 'Active Learner',
    description: 'Menyelesaikan aktivitas belajar',
  },
  {
    key: 'perfect_score',
    label: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
  },
  {
    key: 'top_3',
    label: 'Top 3',
    description: 'Ranked in the top 3 on the leaderboard',
  },
  {
    key: 'number_1',
    label: 'Number 1',
    description: 'Menjadi peringkat 1 di leaderboard',
  },
] as const;

type BadgeKey = (typeof ALL_BADGES)[number]['key'];

const getBadgeIcon = (badgeKey: BadgeKey) => {
  switch (badgeKey) {
    case 'newcomer':
      return <PartyPopper className='w-6 h-6' />;
    case 'first_step':
      return <BookOpenCheck className='w-6 h-6' />;
    case 'active_learner':
      return <Medal className='w-6 h-6' />;
    case 'perfect_score':
      return <ShieldCheck className='w-6 h-6' />;
    default:
      return <Trophy className='w-6 h-6' />;
  }
};

const hasBadge = (profile: UserProfile, badgeKey: BadgeKey): boolean => {
  return profile.badges.some((badge) => badge === badgeKey);
};

export const AchievementBadges = () => {
  const { userProfile: profile, loading } = useAuth();

  if (loading || profile === null) {
    return (
      <div className='flex flex-col justify-center h-full'>
        <h3 className='text-lg font-bold text-gray-800 mb-4'>Badges</h3>
        <div className='grid grid-cols-2 gap-3 animate-pulse'>
          <div className='h-20 rounded-xl bg-gray-200' />
          <div className='h-20 rounded-xl bg-gray-200' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center h-full'>
      <h3 className='text-lg font-bold text-gray-800 mb-4'>Badges</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {ALL_BADGES.map((badge) => {
          const unlocked = hasBadge(profile, badge.key);

          return (
            <div
              key={badge.key}
              className={`rounded-xl border px-3 py-3 transition-all ${
                unlocked
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
              title={badge.description}
            >
              <div className='flex items-center justify-between'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    unlocked ? 'bg-primary-100' : 'bg-gray-200'
                  }`}
                >
                  {unlocked ? (
                    getBadgeIcon(badge.key)
                  ) : (
                    <Lock className='w-5 h-5' />
                  )}
                </div>
                <span className='text-xs font-semibold'>
                  {unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p className='mt-2 text-sm font-semibold'>{badge.label}</p>
              <p className='text-xs text-gray-500'>{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

'use client';

import { Flame, User } from 'lucide-react';

import { useLeaderboard } from '@/hooks/use-realtime';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { GeometricDivider } from '@/components/ornaments/GeometricDivider';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { data } = useLeaderboard();

  const totalPoints = userProfile?.totalPoints ?? 0;
  const streakDays = Math.max(Math.floor(totalPoints / 25), 0);
  const currentUserIndex = data.findIndex((entry) => entry.uid === user?.uid);
  const currentRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
  const ringProgress = Math.min((totalPoints / 200) * 100, 100);

  return (
    <div className='min-h-full bg-gradient-to-br from-ivory via-amber-50/70 to-emerald-50/40 p-6 lg:p-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        <section className='rounded-3xl border border-primary-200/80 bg-ivory/90 p-6 shadow-[0_24px_48px_-36px_rgba(5,150,105,0.5)] lg:p-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]'>
            <div className='flex justify-center md:justify-start'>
              <ProgressRing progress={ringProgress}>
                <div className='flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary-500 via-emerald-500 to-cyan-500 text-white shadow-xl'>
                  {userProfile?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.name}
                      className='h-full w-full rounded-full object-cover'
                    />
                  ) : (
                    <User className='h-12 w-12' />
                  )}
                </div>
              </ProgressRing>
            </div>

            <div className='rounded-2xl border-l-[3px] border-emerald-500 bg-white/70 p-5 md:p-6'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-gray-500'>
                Student Dashboard
              </p>
              <h1 className='mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl'>
                {userProfile?.name ?? 'Learner'}
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                {userProfile?.email ?? 'Your progress snapshot'}
              </p>

              <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <article className='rounded-xl border border-primary-200 bg-primary-50 px-4 py-3'>
                  <p className='text-xs font-medium text-gray-600'>
                    Total Points
                  </p>
                  <p className='mt-1 text-xl font-bold text-primary-700'>
                    {totalPoints.toLocaleString()}
                  </p>
                </article>
                <article className='rounded-xl border border-orange-200 bg-orange-50 px-4 py-3'>
                  <div className='flex items-center gap-2 text-orange-700'>
                    <Flame className='h-4 w-4' />
                    <p className='text-xs font-medium text-orange-700'>
                      Streak
                    </p>
                  </div>
                  <p className='mt-1 text-xl font-bold text-orange-800'>
                    {streakDays} days
                  </p>
                </article>
                <article className='rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3'>
                  <p className='text-xs font-medium text-emerald-700'>Rank</p>
                  <p className='mt-1 text-xl font-bold text-emerald-800'>
                    {currentRank !== null ? `#${currentRank}` : '--'}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <div className='flex justify-center'>
          <GeometricDivider className='h-12 w-12 text-primary-700' />
        </div>

        <section className='rounded-3xl border border-primary-200/70 bg-white/75 p-6 lg:p-8'>
          <AchievementBadges />
        </section>

        <div className='flex justify-center'>
          <GeometricDivider className='h-12 w-12 text-primary-700' />
        </div>

        <section>
          <Leaderboard />
        </section>
      </div>
    </div>
  );
}

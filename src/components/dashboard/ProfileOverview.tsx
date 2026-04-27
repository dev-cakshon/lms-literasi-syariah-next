'use client';

import { User } from 'lucide-react';
import { useMemo } from 'react';

import { useLeaderboard } from '@/hooks/use-realtime';

import { useAuth } from '@/contexts/AuthContext';

import { ProgressRing } from './ProgressRing';

import type { UserProfile } from '@/types';

const isProfileLoading = (
  loading: boolean,
  profile: UserProfile | null,
): profile is null => {
  return loading || profile === null;
};

export const ProfilePicture = () => {
  const { userProfile, loading } = useAuth();

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-40 h-40 rounded-full bg-gray-200 animate-pulse border-4 border-white' />
      </div>
    );
  }

  const ringPct = Math.min(userProfile.totalPoints ?? 0, 100);

  return (
    <div className='flex items-center justify-center h-full'>
      <ProgressRing percentage={ringPct} size={160} strokeWidth={6}>
        <div className='w-36 h-36 rounded-full bg-linear-to-br from-primary-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg border-4 border-white overflow-hidden'>
          {userProfile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userProfile.photoURL}
              alt={userProfile.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <User className='w-16 h-16' />
          )}
        </div>
      </ProgressRing>
    </div>
  );
};

export const ProfileInfo = () => {
  const { userProfile, loading } = useAuth();
  const { data: leaderboardData, loading: leaderboardLoading } =
    useLeaderboard();

  const userRank = useMemo(() => {
    if (!userProfile) return null;
    const idx = leaderboardData.findIndex((u) => u.uid === userProfile.uid);
    return idx !== -1 ? idx + 1 : null;
  }, [leaderboardData, userProfile]);

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex flex-col justify-center h-full space-y-4 animate-pulse bg-[#FAFAF7] border-l-4 border-emerald-500 rounded-xl p-5'>
        <div className='space-y-2'>
          <div className='h-7 w-44 rounded bg-gray-300' />
          <div className='h-4 w-56 rounded bg-gray-200' />
        </div>
        <div className='grid grid-cols-3 gap-3'>
          <div className='h-14 rounded-lg bg-gray-200' />
          <div className='h-14 rounded-lg bg-gray-200' />
          <div className='h-14 rounded-lg bg-gray-200' />
        </div>
      </div>
    );
  }

  const rankDisplay = leaderboardLoading
    ? '—'
    : userRank !== null
      ? `#${userRank}`
      : '>10';

  return (
    <div className='flex flex-col justify-center h-full space-y-4 bg-[#FAFAF7] border-l-4 border-emerald-500 rounded-xl p-5'>
      <div>
        <h3 className='font-display text-2xl font-semibold text-gray-900'>
          {userProfile.name}
        </h3>
        <p className='text-sm text-gray-500 mt-0.5'>{userProfile.email}</p>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-primary-100 rounded-lg px-3 py-3 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Total Poin</p>
          <p className='font-bold text-primary-700 text-lg leading-none'>
            {userProfile.totalPoints}
          </p>
        </div>
        <div className='bg-blue-100 rounded-lg px-3 py-3 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Lencana</p>
          <p className='font-bold text-blue-700 text-lg leading-none'>
            {userProfile.badges?.length ?? 0}
          </p>
        </div>
        <div className='bg-emerald-100 rounded-lg px-3 py-3 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Rank</p>
          <p className='font-bold text-emerald-700 text-lg leading-none'>
            {rankDisplay}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ProfileOverview = () => {
  return (
    <div className='flex items-center gap-6'>
      <ProfilePicture />
      <ProfileInfo />
    </div>
  );
};

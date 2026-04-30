'use client';

import { User } from 'lucide-react';
import { useMemo } from 'react';

import { useLeaderboard } from '@/hooks/use-realtime';

import { useAuth } from '@/contexts/AuthContext';

import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { ProgressRing } from './ProgressRing';

import type { UserProfile } from '@/types';

const isProfileLoading = (
  loading: boolean,
  profile: UserProfile | null,
): profile is null => {
  return loading || profile === null;
};

/**
 * Returns 0–100 representing progress toward the next badge tier.
 *
 * Thresholds come from BADGE_DEFINITIONS sorted by pointsToUnlock.
 * The ring shows how far the user has travelled between the last
 * unlocked threshold and the next one — not raw points capped at 100.
 *
 * Example: points=60, thresholds=[0,10,50,100,200,500]
 *   → bracket is [50, 100], progress = (60-50)/(100-50) = 20%
 *
 * Once all badges are unlocked (points ≥ max threshold), returns 100.
 */
function getBadgeProgressPct(totalPoints: number): number {
  const thresholds = BADGE_DEFINITIONS.map((b) => b.pointsToUnlock).sort(
    (a, b) => a - b,
  );

  const maxThreshold = thresholds[thresholds.length - 1] ?? 0;
  if (totalPoints >= maxThreshold) return 100;

  // Find the bracket: last threshold ≤ points, first threshold > points
  let lower = 0;
  let upper = maxThreshold;
  for (let i = 0; i < thresholds.length; i++) {
    if ((thresholds[i] ?? 0) <= totalPoints) {
      lower = thresholds[i] ?? 0;
    } else {
      upper = thresholds[i] ?? maxThreshold;
      break;
    }
  }

  if (upper === lower) return 100;
  return Math.round(((totalPoints - lower) / (upper - lower)) * 100);
}

export const ProfilePicture = () => {
  const { userProfile, loading } = useAuth();

  if (isProfileLoading(loading, userProfile)) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-40 h-40 rounded-full bg-gray-200 animate-pulse border-4 border-white' />
      </div>
    );
  }

  const ringPct = getBadgeProgressPct(userProfile.totalPoints ?? 0);

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
      <div className='flex flex-col justify-center h-full space-y-4 animate-pulse bg-white/12 backdrop-blur-md border border-[#D9EDBF]/25 rounded-2xl p-4'>
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
    <div className='flex flex-col justify-center h-full space-y-4 bg-white/12 backdrop-blur-md border border-[#D9EDBF]/25 rounded-2xl p-4'>
      <div>
        <h3 className='font-display text-2xl text-white'>{userProfile.name}</h3>
        <p className='text-[#D9EDBF]/75 text-sm mt-0.5'>{userProfile.email}</p>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-white/12 border border-[#D9EDBF]/18 rounded-xl px-3 py-3 text-center'>
          <p className='text-white text-[10px] uppercase tracking-wide mb-1'>
            Total Poin
          </p>
          <p className='font-bold text-[#FF9800] text-lg leading-none'>
            {userProfile.totalPoints}
          </p>
        </div>
        <div className='bg-white/12 border border-[#D9EDBF]/18 rounded-xl px-3 py-3 text-center'>
          <p className='text-white text-[10px] uppercase tracking-wide mb-1'>
            Lencana
          </p>
          <p className='font-bold text-[#90D26D] text-lg leading-none'>
            {userProfile.badges?.length ?? 0}
          </p>
        </div>
        <div className='bg-white/12 border border-[#D9EDBF]/18 rounded-xl px-3 py-3 text-center'>
          <p className='text-white text-[10px] uppercase tracking-wide mb-1'>
            Rank
          </p>
          <p className='font-bold text-white text-lg leading-none'>
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

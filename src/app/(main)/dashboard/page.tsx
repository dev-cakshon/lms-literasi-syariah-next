'use client';

import { useEffect, useState } from 'react';

import { subscribeToLeaderboard } from '@/lib/firestore';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  totalPoints: number;
}

export default function DashboardPage() {
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      const mappedUsers: LeaderboardUser[] = users.map((user) => ({
        uid: user.uid as string,
        displayName: user.displayName as string,
        totalPoints: user.totalPoints as number,
      }));
      setLeaderboardUsers(mappedUsers);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className='p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen'>
      <div className='mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Dashboard Pembelajaran
          </h1>
          <p className='text-gray-600'>
            Pantau progres belajar ekonomi syariah Anda dan berkompetisi dengan
            peserta lainnya
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Middle Section - Leaderboard (spans 2 columns on large screens) */}
          <div className='lg:col-span-2'>
            <Leaderboard users={leaderboardUsers} loading={loading} />
          </div>

          {/* Right Section - Profile & Badges */}
          <div className='space-y-6'>
            <ProfileOverview />
            <AchievementBadges />
          </div>
        </div>
      </div>
    </div>
  );
}

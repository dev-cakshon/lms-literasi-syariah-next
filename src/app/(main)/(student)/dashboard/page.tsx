'use client';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { DashboardCertificates } from '@/components/dashboard/DashboardCertificates';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview';

export default function DashboardPage() {
  return (
    <main className='bg-[var(--color-surface-soft)] min-h-screen'>
      <div className='max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 lg:gap-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
          <div className='lg:col-span-2'>
            <ProfileOverview />
          </div>
          <AchievementBadges />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
          <div className='lg:col-span-2'>
            <Leaderboard />
          </div>
          <DashboardCertificates />
        </div>
      </div>
    </main>
  );
}

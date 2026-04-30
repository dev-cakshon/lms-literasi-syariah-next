'use client';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { DashboardCertificates } from '@/components/dashboard/DashboardCertificates';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import {
  ProfileInfo,
  ProfilePicture,
} from '@/components/dashboard/ProfileOverview';
import { GeometricDivider } from '@/components/ornaments/GeometricDivider';

export default function DashboardPage() {
  return (
    <div className='p-6 lg:p-8 bg-linear-to-br from-slate-50 to-gray-100 min-h-full'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Outer Container - Profile Card */}
        <div className='bg-primary-200/40 rounded-2xl p-6 lg:p-8'>
          <div className='grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6 items-center'>
            {/* Inner 1 - Picture */}
            <div>
              <ProfilePicture />
            </div>

            {/* Inner 2 - Profile Info */}
            <div className='bg-gray-100/80 rounded-xl p-5'>
              <ProfileInfo />
            </div>

            {/* Inner 3 - Badges */}
            <div className='bg-gray-100/80 rounded-xl p-5'>
              <AchievementBadges />
            </div>
          </div>
        </div>

        <DashboardCertificates />

        {/* Panel divider */}
        <div className='flex justify-center py-1'>
          <GeometricDivider size={48} className='text-primary-400' />
        </div>

        {/* Second Container - Leaderboard */}
        <div>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

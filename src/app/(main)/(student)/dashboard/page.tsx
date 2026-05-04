'use client';

import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { DashboardCertificates } from '@/components/dashboard/DashboardCertificates';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import {
  ProfileInfo,
  ProfilePicture,
} from '@/components/dashboard/ProfileOverview';

const heroStyle = {
  background:
    'linear-gradient(135deg, #1e5548 0%, #2C7865 40%, #3a9478 70%, #90D26D 100%)',
  backgroundSize: '300% 300%',
  animation: 'gradShift 8s ease infinite',
};

export default function DashboardPage() {
  return (
    <main className='bg-[#f5f7f2] min-h-screen p-4 lg:px-24'>
      <div className='hero-card' style={heroStyle}>
        <ProfilePicture />
        <ProfileInfo />
        <AchievementBadges />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>
        <Leaderboard />
        <DashboardCertificates />
      </div>
    </main>
  );
}

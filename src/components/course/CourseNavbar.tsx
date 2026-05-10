'use client';

import { useContext } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import { CourseNavbarRoutes } from './CourseNavbarRoutes';

export const CourseNavbar = () => {
  const { contentItems } = useContext(CourseLayoutContext);
  const { userProfile } = useAuth();
  const completedCount = contentItems.filter((item) => item.completed).length;
  const totalCount = contentItems.length;

  return (
    <div
      className='px-4 h-full flex items-center justify-between'
      style={{ background: 'linear-gradient(160deg, #174339 0%, #1e5548 100%)' }}
    >
      <CourseNavbarRoutes />
      {totalCount > 0 && (
        <div className='flex items-center gap-2'>
          <div
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold'
            style={{
              background: 'rgba(144,210,109,0.2)',
              border: '1px solid rgba(144,210,109,0.35)',
              color: '#d9edbf',
            }}
          >
            ⚡ {userProfile?.totalPoints ?? 0} XP
          </div>
          <div
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold'
            style={{
              background: 'rgba(144,210,109,0.2)',
              border: '1px solid rgba(144,210,109,0.35)',
              color: '#d9edbf',
            }}
          >
            {completedCount} / {totalCount} selesai
          </div>
        </div>
      )}
    </div>
  );
};

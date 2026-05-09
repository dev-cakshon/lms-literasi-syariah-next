'use client';

import { useContext } from 'react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import { CourseNavbarRoutes } from './CourseNavbarRoutes';

export const CourseNavbar = () => {
  const { contentItems } = useContext(CourseLayoutContext);
  const completedCount = contentItems.filter((item) => item.completed).length;
  const totalCount = contentItems.length;

  return (
    <div className='p-4 border-b h-full flex items-center justify-between bg-white shadow-sm'>
      <CourseNavbarRoutes />
      {totalCount > 0 && (
        <span className='text-sm font-semibold text-slate-400'>
          {completedCount} / {totalCount} selesai
        </span>
      )}
    </div>
  );
};

'use client';

import { useParams } from 'next/navigation';

import { CourseNavbarRoutes } from './CourseNavbarRoutes';
import { MarkCompleteButton } from './MarkCompleteButton';

export const CourseNavbar = () => {
  const params = useParams();
  const courseId = params?.courseId as string | undefined;
  const chapterId = params?.chapterId as string | undefined;

  const showMarkComplete = courseId && chapterId;

  return (
    <div className='p-4 border-b h-full flex items-center justify-between bg-white shadow-sm'>
      <CourseNavbarRoutes />
      {showMarkComplete && (
        <MarkCompleteButton courseId={courseId} chapterId={chapterId} />
      )}
    </div>
  );
};

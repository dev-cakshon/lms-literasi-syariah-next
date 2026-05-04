'use client';

import { useState } from 'react';

import { resetCourseProgressApi } from '@/lib/api';

import { CourseSidebarItem } from './CourseSidebarItem';
import { CourseProgress } from '../course-list/CourseProgress';

import type { CourseContentItem } from '@/types';

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    price?: number;
  };
  contentItems: CourseContentItem[];
}

export const CourseSidebar = ({ course, contentItems }: CourseSidebarProps) => {
  const [isResetting, setIsResetting] = useState(false);

  const completedItems = contentItems.filter((item) => item.completed).length;
  const progressCount =
    contentItems.length > 0 ? (completedItems / contentItems.length) * 100 : 0;

  const handleResetProgress = async () => {
    const isConfirmed = window.confirm(
      'Reset all progress for this course? This is for dev/testing only.'
    );
    if (!isConfirmed) return;

    setIsResetting(true);
    try {
      await resetCourseProgressApi(course.id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset progress:', error);
      alert('Failed to reset progress');
      setIsResetting(false);
    }
  };

  return (
    <div className='h-full border-r flex flex-col overflow-y-auto shadow-sm'>
      <div className='p-8 flex flex-col border-b'>
        <h1 className='font-semibold'>{course.title}</h1>
        <div className='mt-10'>
          <CourseProgress variant='success' value={progressCount} />
        </div>
        {process.env.NEXT_PUBLIC_APP_ENV !== 'production' && (
          <button
            type='button'
            onClick={handleResetProgress}
            disabled={isResetting}
            className='mt-4 text-left text-xs text-red-600 hover:underline disabled:opacity-50'
          >
            {isResetting ? 'Mereset progress...' : 'Reset Progress (Dev)'}
          </button>
        )}
      </div>
      <div className='flex flex-col w-full'>
        {contentItems.map((item) =>
          item.itemType === 'chapter' ? (
            <CourseSidebarItem
              key={item.id}
              id={item.id}
              courseId={course.id}
              label={item.title}
              isCompleted={item.completed}
              isLocked={item.locked}
              type='chapter'
            />
          ) : (
            <CourseSidebarItem
              key={item.id}
              id={item.id}
              courseId={course.id}
              label={item.title}
              isCompleted={item.completed}
              isLocked={item.locked}
              type={item.type}
            />
          )
        )}
      </div>
    </div>
  );
};

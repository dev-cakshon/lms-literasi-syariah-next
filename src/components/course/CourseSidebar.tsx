'use client';

import { CourseSidebarItem } from './CourseSidebarItem';
import { CourseProgress } from '../course-list/CourseProgress';

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    price?: number;
  };
  chapters: {
    id: string;
    courseId: string;
    title: string;
    order: number;
  }[];
  completedChapterIds: Set<string>;
}

export const CourseSidebar = ({
  course,
  chapters,
  completedChapterIds,
}: CourseSidebarProps) => {
  const completedChapters = chapters.filter((chapter) =>
    completedChapterIds.has(chapter.id)
  ).length;
  const progressCount =
    chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

  return (
    <div className='h-full border-r flex flex-col overflow-y-auto shadow-sm'>
      <div className='p-8 flex flex-col border-b'>
        <h1 className='font-semibold'>{course.title}</h1>
        <div className='mt-10'>
          <CourseProgress variant='success' value={progressCount} />
        </div>
      </div>
      <div className='flex flex-col w-full'>
        {chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            courseId={chapter.courseId}
            label={chapter.title}
            isCompleted={completedChapterIds.has(chapter.id)}
            isLocked={false}
            type='chapter'
          />
        ))}
      </div>
    </div>
  );
};

import { useMemo } from 'react';

import CourseActivitiesEmptyState from '@/components/course/CourseActivitiesEmptyState';
import CourseContentItemRow from '@/components/course/CourseContentItemRow';

import type {
  CourseContentActivityItem,
  CourseContentChapterItem,
  CourseContentItem,
} from '@/types';

interface Props {
  items: CourseContentItem[];
  courseId: string;
  nextUpId: string | null;
}

export default function CourseContentList({
  items,
  courseId,
  nextUpId,
}: Props) {
  const chapters = useMemo(
    () =>
      items
        .filter((i): i is CourseContentChapterItem => i.itemType === 'chapter')
        .sort((a, b) => a.position - b.position),
    [items],
  );

  const activities = useMemo(
    () =>
      items
        .filter(
          (i): i is CourseContentActivityItem => i.itemType === 'activity',
        )
        .sort((a, b) => a.position - b.position),
    [items],
  );

  return (
    <section className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
      {/* Left: Bab */}
      <div className='lg:col-span-7 flex flex-col gap-5'>
        <div className='flex items-center justify-between'>
          <h2 className='font-display text-2xl font-bold text-on-surface'>
            Bab
          </h2>
          <span className='bg-surface-container-high text-on-surface-soft rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider'>
            {chapters.length} Bab
          </span>
        </div>
        {chapters.length === 0 ? (
          <p className='text-sm text-outline'>Belum ada bab yang tersedia.</p>
        ) : (
          <div className='flex flex-col gap-4'>
            {chapters.map((chapter, idx) => (
              <CourseContentItemRow
                key={chapter.id}
                item={chapter}
                displayIndex={idx + 1}
                isNextUp={chapter.id === nextUpId}
                courseId={courseId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Aktivitas */}
      <div className='lg:col-span-5 flex flex-col gap-5 mt-2 lg:mt-0'>
        <div className='flex items-center justify-between'>
          <h2 className='font-display text-2xl font-bold text-on-surface'>
            Aktivitas
          </h2>
          {activities.length > 0 && (
            <span className='bg-surface-container-high text-on-surface-soft rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider'>
              {activities.length} Aktivitas
            </span>
          )}
        </div>
        {activities.length === 0 ? (
          <CourseActivitiesEmptyState />
        ) : (
          <div className='flex flex-col gap-4 bg-surface-container-low rounded-3xl p-4 border border-surface-container-highest'>
            {activities.map((activity, idx) => (
              <CourseContentItemRow
                key={activity.id}
                item={activity}
                displayIndex={idx + 1}
                isNextUp={activity.id === nextUpId}
                courseId={courseId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

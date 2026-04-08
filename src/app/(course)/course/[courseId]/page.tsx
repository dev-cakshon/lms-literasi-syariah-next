'use client';

import { useMemo } from 'react';
import { useEffect, useState } from 'react';

import { getChapters, getCourse } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import { CourseSidebarItem } from '@/components/course/CourseSidebarItem';

import type { Chapter, Course } from '@/types';

export default function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { completedChapters } = useCourseProgress(courseId);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    const resolvedCourseId = courseId;

    async function loadOverviewData() {
      try {
        const [courseData, chaptersData] = await Promise.all([
          getCourse(resolvedCourseId),
          getChapters(resolvedCourseId),
        ]);

        setCourse(courseData);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Failed to load course overview:', err);
        setError('Gagal memuat kursus');
      } finally {
        setLoading(false);
      }
    }

    loadOverviewData();
  }, [courseId]);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.order - b.order),
    [chapters]
  );

  const completedChapterSet = useMemo(
    () => new Set(completedChapters),
    [completedChapters]
  );

  const completedCount = sortedChapters.filter((chapter) =>
    completedChapterSet.has(chapter.id)
  ).length;

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  if (!courseId || !course) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Kursus tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8'>
      <section className='rounded-lg border bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>
          {course.title}
        </h1>
        <p className='mt-3 text-sm text-slate-600 md:text-base'>
          {course.description || 'Deskripsi kursus belum tersedia.'}
        </p>
        <p className='mt-4 text-sm font-medium text-slate-700'>
          Progress: {completedCount}/{sortedChapters.length} bab selesai
        </p>
      </section>

      <section className='rounded-lg border bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-slate-900'>Daftar Bab</h2>
          <span className='text-sm text-slate-500'>
            Urut berdasarkan materi
          </span>
        </div>

        {sortedChapters.length === 0 ? (
          <p className='text-sm text-slate-500'>Belum ada bab yang tersedia.</p>
        ) : (
          <div className='overflow-hidden rounded-md border'>
            {sortedChapters.map((chapter) => (
              <CourseSidebarItem
                key={chapter.id}
                id={chapter.id}
                courseId={courseId}
                label={`${chapter.order}. ${chapter.title}`}
                isCompleted={completedChapterSet.has(chapter.id)}
                isLocked={false}
                type='chapter'
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

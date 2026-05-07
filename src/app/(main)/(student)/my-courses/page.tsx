'use client';

import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { ApiError, getCourseProgressApi, getCourses } from '@/lib/api';

import { CourseList } from '@/components/course-list/CourseList';

import type { Course } from '@/types';

const heroStyle: React.CSSProperties = {
  background:
    'linear-gradient(135deg, #1e5548 0%, #2C7865 40%, #3a9478 70%, #90D26D 100%)',
  backgroundSize: '300% 300%',
  animation: 'gradShift 9s ease infinite',
};

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMyCoursesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allCourses = await getCourses();

        if (!active) return;

        setCourses(allCourses);

        const results = await Promise.allSettled(
          allCourses.map((c) => getCourseProgressApi(c.id)),
        );

        if (!active) return;

        const map: Record<string, number> = {};
        results.forEach((result, i) => {
          map[allCourses[i].id] =
            result.status === 'fulfilled' ? (result.value.percentage ?? 0) : 0;
        });
        setProgressMap(map);
      } catch (err) {
        if (!active) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Gagal memuat data kursus Anda.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchMyCoursesData();

    return () => {
      active = false;
    };
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses
        .filter((course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.thumbnailUrl ?? course.imageUrl ?? null,
          chaptersLength: course.totalChapters ?? 0,
          isPublished: course.isPublished,
          progress: progressMap[course.id] ?? 0,
        })),
    [courses, searchQuery, progressMap],
  );

  return (
    <div className='min-h-full bg-[#f5f7f2]'>
      {/* Animated Hero */}
      <div className='relative overflow-hidden px-6 pt-10 pb-8' style={heroStyle}>
        {/* Blob 1 */}
        <div
          className='absolute top-4 right-8 w-48 h-48 rounded-full opacity-20 bg-[#90D26D]'
          style={{ animation: 'floatBlob 7s ease-in-out infinite' }}
        />
        {/* Blob 2 */}
        <div
          className='absolute bottom-2 left-12 w-32 h-32 rounded-full opacity-15 bg-[#3a9478]'
          style={{ animation: 'floatBlob 10s ease-in-out infinite reverse' }}
        />

        <div className='max-w-4xl mx-auto relative z-10'>
          <h1 className='font-display text-4xl font-bold tracking-tight text-white'>
            Kursus Saya
          </h1>
          <p className='mt-1 text-sm text-white/70'>
            Lanjutkan perjalanan belajar Anda
          </p>

          {/* Glassmorphism search */}
          <div className='mt-5 flex items-center gap-3'>
            <div className='flex-1 relative'>
              <input
                type='text'
                placeholder='Cari kursus'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-full px-5 py-3 text-sm text-white placeholder-white/60 focus:outline-none'
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(217,237,191,0.3)',
                }}
              />
            </div>
            <button className='bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer backdrop-blur-sm'>
              <Search className='w-4 h-4' />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {loading ? (
          <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className='h-80 rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-elevated-1)] animate-pulse'
              />
            ))}
          </div>
        ) : error ? (
          <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
            {error}
          </div>
        ) : (
          <CourseList items={filteredCourses} />
        )}
      </div>
    </div>
  );
}

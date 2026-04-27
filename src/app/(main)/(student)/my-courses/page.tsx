'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ApiError, getCourses } from '@/lib/api';

import { CourseList } from '@/components/course-list/CourseList';

import type { Course } from '@/types';

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMyCoursesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allCourses = await getCourses();

        if (!active) {
          return;
        }

        setCourses(allCourses);
      } catch (err) {
        if (!active) {
          return;
        }

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
        })),
    [courses, searchQuery],
  );

  return (
    <div className='min-h-full bg-linear-to-b from-primary-600 via-primary-50 to-ivory'>
      {/* Search Bar */}
      <div className='px-6 py-6'>
        <div className='max-w-4xl mx-auto flex items-center gap-3'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Cari kursus'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-full px-5 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300'
            />
          </div>
          <button className='bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer'>
            <Search className='w-4 h-4' />
            Cari
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {loading ? (
          <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className='h-64 rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-elevated-1)] animate-pulse'
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
